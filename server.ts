import express, { Request, Response } from "express";
import path from "path";
import dns from "dns";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { KNOWLEDGE_BASE } from "./src/data/knowledgeBase";

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = 3000;

// Enable JSON bodies with limit for image payloads
app.use(express.json({ limit: "20mb" }));

// Helper to extract clean base64 data and mime type
function parseBase64Image(dataUrl: string) {
  if (!dataUrl) return null;
  try {
    if (dataUrl.includes(";base64,")) {
      const parts = dataUrl.split(";base64,");
      const mimeType = parts[0].replace("data:", "");
      const data = parts[1];
      return { mimeType, data };
    }
    return { mimeType: "image/jpeg", data: dataUrl };
  } catch (err) {
    console.error("Error parsing base64 image:", err);
    return null;
  }
}

// 1. API: Fetch Knowledge Base Profiles
app.get("/api/knowledge-base", (req: Request, res: Response) => {
  res.json({ success: true, profiles: KNOWLEDGE_BASE });
});

// 2. API: Diagnose & Direct Technician (Primary Multimodal RAG Endpoint)
app.post("/api/diagnose", async (req: Request, res: Response) => {
  const { machineId, image, query } = req.body;

  if (!machineId) {
    return res.status(400).json({ success: false, error: "Machine ID is required." });
  }

  const profile = KNOWLEDGE_BASE[machineId];
  if (!profile) {
    return res.status(404).json({ success: false, error: `Machine profile ${machineId} not found.` });
  }

  // Check if API key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    console.log("GEMINI_API_KEY is not defined or is placeholder. Using robust fallback generation.");
    const fallbackResponse = generateLocalFallback(profile, query);
    return res.json({ success: true, apiUsed: false, data: fallbackResponse });
  }

  try {
    // 1. Setup @google/genai Client
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    // 2. Perform Technical RAG lookup for dynamic system prompt
    const retrievedSops = profile.sopReferences;
    const technicalSpecsJson = JSON.stringify(profile.specs, null, 2);
    const symptomsJson = JSON.stringify(profile.symptoms, null, 2);
    const safetyHazardsList = profile.safetyHazards.join(", ");
    const correctPpeList = profile.requiredPPE.join(", ");

    const systemInstruction = `You are Carbyn AI's AR Smart-Glasses Technical Co-Pilot overlaying real-time guidance directly into a technician's optical waveguide while they work hands-free on dangerous machinery.
You are assisting on: "${profile.name}" (Model: ${profile.modelNum}).
Manufacturer: ${profile.manufacturer}.

DYNAMIC RETRIEVED MANUALS & KNOWLEDGE:
- Specifications:
${technicalSpecsJson}
- Safety Hazards:
${safetyHazardsList}
- Mandatory PPE:
${correctPpeList}
- Dynamic Symptom Guides & SOPs:
${symptomsJson}
- SOP References:
${retrievedSops}

Your job is to examine the technician's photo/frame snapshot (if provided) and analyze their query: "${query || "Diagnose current state and draft repair steps."}".
Evaluate what part the technician is looking at, determine if damage or issues exist (swarf buildup, wire loosening, arc markings, thermal hotspots), select appropriate PPE, identify required insulated or specialized tools, and output a highly exact step-by-step troubleshooting checklist.

Output must be a structured JSON object conforming precisely to the requested schema. Ensure the instruction steps are active, short, actionable, and state clear measurements (e.g. electrical checks, torques) directly derived from the RAG manuals above.`;

    // 3. Compile multimodal payload
    const contentParts: any[] = [];
    
    // Add text prompt
    contentParts.push({
      text: query || "Scan mechanical components, verify alignment, checklist safety measures."
    });

    // Add image frame if uploaded
    const parsedImg = parseBase64Image(image);
    if (parsedImg) {
      contentParts.push({
        inlineData: {
          mimeType: parsedImg.mimeType,
          data: parsedImg.data
        }
      });
    }

    // 4. Query Gemini 3.5 Flash using the structured schema
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentParts,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identifiedPart: { 
              type: Type.STRING, 
              description: "The specific component, subassembly, switch, or terminal block identified in the visual feed or prompt." 
            },
            isDamageDetected: { 
              type: Type.BOOLEAN, 
              description: "True if physical wear, loose wires, tripped states, swarf buildup, carbon scoring, or corrosion is visible or inferred." 
            },
            stateSummary: { 
              type: Type.STRING, 
              description: "Short technical summary of the observed state of the machinery." 
            },
            safetyWarnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Critical safety warnings for this situation (e.g. High Voltage Shock Hazard, Kinetic entanglement). Max 3."
            },
            requiredPPE: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Subset of PPE relevant to this task from the machine profile."
            },
            suggestedTools: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Specific insulated or safety-certified tools needed."
            },
            steps: {
              type: Type.ARRAY,
              description: "Chronological, actionable walkthrough checklist steps.",
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING, description: "Short active action label, e.g. 'Disengage Feed Switch'." },
                  instruction: { type: Type.STRING, description: "Hands-free instructional guidance sentence written concisely." },
                  safetyNote: { type: Type.STRING, description: "Safety risk during this specific action, e.g. 'Check local cap residue charge'." },
                  targetMetric: { type: Type.STRING, description: "Exact test value or specification, e.g., 'Confirm zero-ohms resistance', 'Torque bolts to 31 lb-in'. Can be 'N/A'." },
                  estimateMinutes: { type: Type.INTEGER }
                },
                required: ["stepNumber", "title", "instruction", "safetyNote", "estimateMinutes"]
              }
            },
            overallResolutionPlan: { 
              type: Type.STRING, 
              description: "Concluding statement summarizing the goal path to bring the machine back online." 
            }
          },
          required: [
            "identifiedPart", 
            "isDamageDetected", 
            "stateSummary", 
            "safetyWarnings", 
            "requiredPPE", 
            "suggestedTools", 
            "steps", 
            "overallResolutionPlan"
          ]
        }
      }
    });

    const jsonText = response.text?.trim() || "";
    const parsedData = JSON.parse(jsonText);
    
    return res.json({ success: true, apiUsed: true, data: parsedData });

  } catch (error: any) {
    console.error("Gemini API Error. Falling back to knowledge-grounded local heuristics:", error);
    const fallbackResponse = generateLocalFallback(profile, query);
    return res.json({ 
      success: true, 
      apiUsed: false, 
      fallbackTriggered: true, 
      errorDetail: error.message,
      data: fallbackResponse 
    });
  }
});

// Heuristics Engine matching query terms to SOP symptoms to return dynamic simulated repairs
function generateLocalFallback(profile: any, query: string) {
  const normalizedQuery = (query || "").toLowerCase();
  
  // Find a matching symptom guide
  let match = profile.symptoms[0];
  for (const sym of profile.symptoms) {
    const symptomKw = sym.symptom.toLowerCase();
    if (symptomKw.split(" ").some((word: string) => word.length > 3 && normalizedQuery.includes(word))) {
      match = sym;
      break;
    }
  }

  // Construct structured result grounding from manual data
  const steps = match.initialSteps.map((stepText: string, idx: number) => {
    let metric = "N/A";
    let safety = "Verify local power isolators remain locked.";
    if (stepText.toLowerCase().includes("torque")) {
      metric = "Torque to " + (profile.id.includes("hvac") ? "15 lb-in" : profile.id.includes("eaton") ? "31 lb-in" : "25 lb-in");
      safety = "Ensure wrench sits flush to prevent stripping hex casing.";
    } else if (stepText.toLowerCase().includes("voltage") || stepText.toLowerCase().includes("multimeter")) {
      metric = profile.id.includes("hvac") ? "Check 460VAC and 24VAC control terminals" : "Calibrated Zero Voltage Readout";
      safety = "Ensure CAT-III rating is set correctly before contacting probe.";
    } else if (stepText.toLowerCase().includes("capacitor")) {
      metric = "Capacitance check (+/- 5% rating)";
      safety = "High-energy capacitor block! Bleed out residue charge using discharge resistor.";
    }

    return {
      stepNumber: idx + 1,
      title: stepText.split(".")[0] || `Procedure step ${idx + 1}`,
      instruction: stepText,
      safetyNote: safety,
      targetMetric: metric,
      estimateMinutes: 5 + (idx * 3)
    };
  });

  // Tools mapping
  let suggestedTools = ["ANSI safety kit", "CAT-III Multimeter"];
  if (profile.id.includes("hvac")) {
    suggestedTools.push("Insulated Nut-drivers", "Capacitor Discharge wand", "Manifold pressure gauge");
  } else if (profile.id.includes("cnc")) {
    suggestedTools.push("T-handle hex wrench set", "Anti-seize compound", "Swarf debris vacuum");
  } else if (profile.id.includes("eaton")) {
    suggestedTools.push("1000V Insulated torque wrench", "FLIR Infrared camera", "Thermal protective shield");
  }

  return {
    identifiedPart: match.symptom.split("/")[0].trim(),
    isDamageDetected: true,
    stateSummary: `Symptom matched dynamically from SOP Layer: ${match.symptom}. Technical indicator identified: ${match.indicator}.`,
    safetyWarnings: [
      `Active hazard: ${profile.safetyHazards[0]}`,
      `Critical hazard: ${profile.safetyHazards[1]}`
    ],
    requiredPPE: profile.requiredPPE.slice(0, 3),
    suggestedTools: suggestedTools,
    steps: steps,
    overallResolutionPlan: `Execute local symptom guide checklist to verify electrical and mechanical alignments according to ${profile.sopReferences.split(";")[0]}.`
  };
}

// Vite and static production assets pipeline setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Configuring development server with live Vite middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    // Mount Vite middleware
    app.use(vite.middlewares);
  } else {
    console.log("Configuring production server serving static assets from dist/");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Carbyn AI Assistant container running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
