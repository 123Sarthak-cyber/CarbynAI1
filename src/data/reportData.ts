export interface ReportSection {
  id: string;
  title: string;
  subTitle?: string;
  paragraphs: string[];
}

export const TECHNICAL_REPORT = {
  title: "Carbyn AI - Technical Evaluation Report",
  subTitle: "AI-Powered Real-Time Assistant for Hands-Free Industrial Workers",
  candidateName: "Sarthak Mazumder",
  submittedTo: "Carbyn AI Hiring Team",
  dateSubmitted: "May 24, 2026",
  sections: [
    {
      id: "architecture",
      title: "1. Core System Architecture & Flow",
      paragraphs: [
        "Carbyn AI's real-time wearable companion represents a paradigm shift in industrial technician efficiency & safety. Hands-free workers operating on complex high-voltage HVAC systems, vertical CNC machinery, or Eaton power grids cannot toggle standard tablets or look away from heavy equipment. Our architecture binds a low-latency Heads-Up Display (HUD) client with an Express-backed RAG service. This system integrates real-time microphone voice stream inputs, dynamic visual frame inputs (snapshots from safety smart-glasses), and text inputs.",
        "The server utilizes an 'Execute-First Retrieval' or Metadata-Driven RAG pipeline. When the technician feeds a diagnostic query paired with a vision frame, the backend identifies the active machine context (Trane Voyager HVAC, Haas VF-2 CNC, or Eaton Pow-R-Line Panelboard) and pulls raw technical manuals, torque guides, safety bounds, and past repair steps directly from a structured Technical Knowledge Base. This grounded telemetry is injected into the system instruction set before being evaluated by the Gemini 3.5 Flash model.",
        "To reduce visual cognitive load, the assistant converts the dense model output into a strictly structured JSON response. Rather than verbalizing a paragraph of chat text, the system separates the identified component, safety warnings (e.g. '460V Active Grid' or 'Thermal Hazard'), required tools, and consecutive, checkbox-style action steps. Each step includes diagnostic parameters (e.g., target torque values or switch voltages). These actions are rendered as glowing, high-contrast overlay cues designed for semi-transparent optical waveguides (smart glasses margins), paired with clear Text-to-Speech (TTS) auditory feedback, ensuring true hands-free execution.",
      ],
      diagram: `
+---------------------------------------------------------------------------------+
|                    CARBYN AI MULTIMODAL ASSISTANT FLOW                          |
+---------------------------------------------------------------------------------+
|                                                                                 |
|   [ TECHNICIAN WEARABLE ]                                                       |
|   - Real-time Camera Frame  (Base64) ---+                                       |
|   - Speech Input (Web Speech API) -------+                                       |
|   - Selected Machine Context -----------+--[ POST /api/diagnose ]-+             |
|                                                                   |             |
|                                                                   v             |
|   [ INDUSTRIAL INFERENCE SERVER ]                             [ EXPRESS ]       |
|   - Identifies Machine Context                                    |             |
|   - Performs Document Retrieval (RAG) ----------------------------+             |
|   - Fetches SOPs, Safety Bounds, Schemas                          |             |
|                                                                   v             |
|   [ LLM ORCHESTRATION ] (gemini-3.5-flash)                   [ GEMINI API ]     |
|   - Blends Image, Query, and Technical Manuals                    |             |
|   - Evaluates Safety Barriers and Action Sequencing               |             |
|                                                                   v             |
|   [ STRUCTURED HUD OVERLAY ]                                  [ RESPOND ]       |
|   - Returns JSON: Identified Component, Thermal warnings          |             |
|   - Checkbox Action Steps, Recommended Insulated Tools            |<------------+
|   - Triggers Client-Side Zero-Latency Voice Playback (TTS)        |
+---------------------------------------------------------------------------------+
`
    },
    {
      id: "tech_stack",
      title: "2. Technology Stack & Design Decisions",
      paragraphs: [
        "The technology stack is carefully selected to balance edge capability, real-time performance, and developer velocity. The client is a single-page application built on React 19, styled using Tailwind CSS for a high-contrast dark spatial-computing design, with key transitions automated via motion/react. For hands-free auditory coordination, the client utilizes the HTML5 Web Speech Synthesis API, translating live task progressions into spoken words with zero server latency or outbound network costs.",
        "The serving layer is an Express.js router operating under Node's ESM runtime. This server-side architecture protects sensitive assets, including the Gemini API Key, from browser inspection. It acts as an orchestrator, receiving images and client payloads, fetching relevant SOP manual content from the Knowledge Base, and executing API calls using the modern @google/genai TypeScript SDK.",
        "The choice of gemini-3.5-flash is central to our RAG design. Because industrial field diagnostics depend on parsing highly specific, visually dense equipment details (e.g. wiring colors, diagnostic LEDs, mechanical wear), gemini-3.5-flash's native multi-modality provides exceptional visual interpretation. It easily processes context-rich images and returns a reliable, schema-enforced JSON structure, running with the lowest time-to-first-token in its class.",
      ]
    },
    {
      id: "tradeoffs",
      title: "3. Architectural Tradeoffs & Implementation Decisions",
      paragraphs: [
        "Our primary design decision centered on the Latency vs. Accuracy tradeoff in voice processing and visual inference. In noisy industrial plant floors (rotary compressors, hydraulic whistles), classic client-side speech recognition often suffers from high word error rates. To mitigate this without introducing massive system delays, our front-end employs a hybrid voice engine: we use localized voice recognition for continuous glass wakeups/controls (e.g. 'Next Step', 'Hear Specs'), while routing dense troubleshooting descriptions to Gemini's highly context-aware text/vision channels.",
        "Another tradeoff was our Build vs. Buy evaluation for a vector database. For a specialized field kit supporting a warehouse with 20 distinct machine models, hosting and querying a heavy, cloud-based vector DB (like pgvector or Pinecone) introduces unnecessary network handshakes, cost, and warm-up latency. We implemented a highly responsive, light-weight local data retrieval layer. The Express server performs direct indexing on key symptom-to-manual profiles, guaranteeing sub-millisecond retrieval of SOP texts and safety parameters before compiling the prompt.",
        "Finally, for text-to-speech output, we selected browser-native SpeechSynthesis over sending MP3 audio buffers from the server. Running TTS locally eliminates several megabytes of network download per action step, allowing the technician to get instruction reads instantly upon clicking 'Next Step' or using a voice gesture. It also allows the application to function perfectly in remote sites with spotty 4G coverage.",
      ]
    },
    {
      id: "improvements",
      title: "4. Future Optimization & Engineering Backlog",
      paragraphs: [
        "In a production release, we recognize several critical vectors for expansion. To support true offline operations inside insulated mechanical basements or concrete vaults where internet connection drops, the system should operate locally. We would implement a lightweight offline fallback utilizing Google's MediaPipe LLM Inference SDK or model quantization (such as GGUF/ONNX) running locally on on-premise technician mobile devices.",
        "Additionally, we plan to implement a dynamic multi-agent system. This would separate the assistant into three distinct specialists: first, a Safety Guardian agent that monitors the vision feed in the background for live occupational hazards (e.g., bare copper under voltage or lack of insulated gloves) and overrides the main HUD with flashing warnings; second, a Parts Lookup specialist backed by Google Shopping/PartSource APIs for instant supply order; third, a Maintenance Logger that auto-compiles the repair summary into Jira Service Desk.",
        "Finally, to enhance physical training and precision, we would integrate true stereoscopic SLAM (Simultaneous Localization and Mapping) frameworks. This would allow the spatial application to project 3D CAD blueprints and dynamic colored direction arrows directly onto the actual machine casings—guiding the technician's eyes and tools with millimeter-grade sub-millimeter visual anchors.",
      ]
    }
  ]
};
