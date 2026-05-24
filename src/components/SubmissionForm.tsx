import { useState, useEffect } from "react";
import { 
  FileText, 
  Download, 
  Play, 
  Pause, 
  Tv, 
  Bookmark, 
  Square,
  Volume2, 
  Cpu, 
  Flame,
  CheckCircle,
  Clock,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { TECHNICAL_REPORT } from "../data/reportData";
import { KNOWLEDGE_BASE } from "../data/knowledgeBase";
import { DiagnosticResult } from "../types";

interface SubmissionFormProps {
  onSimulateResult: (result: DiagnosticResult, profileId: string, query: string, image: string) => void;
  onClearSimulated: () => void;
}

export function SubmissionForm({ onSimulateResult, onClearSimulated }: SubmissionFormProps) {
  const [activeTab, setActiveTab] = useState<"report" | "walkthrough">("report");
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  const [demoStep, setDemoStep] = useState(0);
  const [demoLogs, setDemoLogs] = useState<string[]>([]);

  // Sound play helper for simulated audio voiceovers
  const speakNarrator = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = window.speechSynthesis.getVoices().find(v => v.lang.startsWith("en")) || null;
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Demo storyboard definitions
  const SIM_SCENES = [
    {
      title: "SCENE 1: Automatic Optical Proximity Bind",
      log: "Technician John approaches Eaton Group Panelboard. Optical glasses scan bar-code QR tag on enclosure.",
      narrator: "Activating Carbyn AI co-pilot. Eaton Panelboard PRL-one-A detected. Main current feeder is high-voltage four-eighty-volts. Arc flash boundaries locked at forty-eight inches. Put on arc flash protective suit before removing fasteners.",
      action: () => {
        // Trigger model result mockup in UI
        const eatonId = "eaton_electrical_panel";
        const eatonProfile = KNOWLEDGE_BASE[eatonId];
        const result: DiagnosticResult = {
          identifiedPart: "Thermal hotspot identified on primary Copper Phase L2 Lug",
          isDamageDetected: true,
          stateSummary: "FLIR Thermography indicates contact terminal block is operating at 112 degrees Celsius under nominal loads, indicating high friction resistance due to lug torque loosening.",
          safetyWarnings: [
            "Lethal Electrical Arc Flash Hazard (Flash Boundary: 48 inches)",
            "Hot Lug Contact surface burns exceeding hand shielding ratings"
          ],
          requiredPPE: [
            "Category 2 Arc Flash Hood/Visor setup (NFPA 70E)",
            "Insulated Safety Boot rating CAT-III",
            "1000V Dielectric High-voltage Safety Gloves"
          ],
          suggestedTools: [
            "Eaton Insulated torque socket driver",
            "Thermal infrared camera core",
            "Voltage probe meter"
          ],
          steps: [
            {
              stepNumber: 1,
              title: "Lockout Tagout (LOTO)",
              instruction: "Disconnect main source line upstream breakers. Secure dual lock rings on switch and clip target tags.",
              safetyNote: "Confirm LOTO status key is pocketed by the primary technician before tool contact.",
              targetMetric: "Verify 0.0VAC across all bus Phase L1-L2-L3 terminals",
              estimateMinutes: 8
            },
            {
              stepNumber: 2,
              title: "Calibrated Lug Torquing",
              instruction: "Leverage standard 1000V rated insulated handle tool, socket-tighten L2 clamp bolt precisely.",
              safetyNote: "Maintain perpendicular posture to avoid structural contact with secondary bus lines.",
              targetMetric: "Torque lug fasteners to exactly 31 lb-in",
              estimateMinutes: 5
            },
            {
              stepNumber: 3,
              title: "Post-maintenance Thermal Scan",
              instruction: "Re-energize primary frame under supervision. Scan Phase-2 lug connection visually using optical glasses FLIR mode.",
              safetyNote: "Do not cross 48-inch boundaries unless Arc Flash safety shields remain aligned.",
              targetMetric: "Target Operating Temp < 60 Celsius",
              estimateMinutes: 4
            }
          ],
          overallResolutionPlan: "Perform tightening sequence under full LOTO lock rules, verification of terminal clamp resistance parameters."
        };
        onSimulateResult(
          result, 
          eatonId, 
          "Tripped feeder contacts and extreme busbar thermal signature", 
          "https://images.unsplash.com/photo-1590412200988-a436bb705300?auto=format&fit=crop&q=80&w=600"
        );
      }
    },
    {
      title: "SCENE 2: Active Safety Shield PPE check",
      log: "AR Glass HUD flashes alert. AI model checks technician's body silhouette for LOTO compliance.",
      narrator: "Safety Scan triggered. Technician glove sleeve detected. Torque socket loaded. Arc PPE is standard-passing. Safe to proceed with Lockout tagout sequence step one.",
      action: () => {}
    },
    {
      title: "SCENE 3: Action Step 1 (LOTO Verification Check)",
      log: "Technician commands: 'Next Step.' Waveguide displays zero-voltage test metric indicator.",
      narrator: "Executing Step One. Lock-out tag-out. Disconnect main source line upstream breakers. Metric target check: Verify zero point zero Volts A C across terminal contacts.",
      action: () => {}
    },
    {
      title: "SCENE 4: Action Step 2 (Precision insulated hand torquing)",
      log: "Technician turns fastener block screw. Live specs projected: Torque lug to 31 lb-in.",
      narrator: "Executing Step Two. Torque specifications. Seat insulated socket wrench flush on phase two screw. Tighten to exactly thirty-one pound-inches. Verify snug seat with zero thread damage.",
      action: () => {}
    },
    {
      title: "SCENE 5: Successful Resolution Plan Logged",
      log: "Fastener snug. Thermography scan confirms operating temperatures lowered back to baseline.",
      narrator: "Thermal scan updated. Target temperature registered at forty-eight celsius. Torque parameters validated. Eaton Pow-R-line grid cabinet back online. Task complete. Logging incident report to master server.",
      action: () => {}
    }
  ];

  // Self playing demo control loop
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlayingDemo) {
      const scene = SIM_SCENES[demoStep];
      if (scene) {
        setDemoLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${scene.title}`, `-> ${scene.log}`]);
        scene.action();
        speakNarrator(scene.narrator);

        timer = setTimeout(() => {
          if (demoStep < SIM_SCENES.length - 1) {
            setDemoStep(prev => prev + 1);
          } else {
            setIsPlayingDemo(false);
            setDemoLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ✔ Interactive Demo Sequence Completed`]);
            speakNarrator("Walk-through complete. Thank you for testing Carbyn A I assistant.");
          }
        }, 12000); // 12 seconds per scene
      }
    }
    return () => clearTimeout(timer);
  }, [isPlayingDemo, demoStep]);

  // Start demolition
  const playDemo = () => {
    setDemoStep(0);
    setDemoLogs([]);
    setIsPlayingDemo(true);
  };

  // Stop demolition
  const stopDemo = () => {
    setIsPlayingDemo(false);
    window.speechSynthesis?.cancel();
    onClearSimulated();
  };

  // Helper: Trigger raw markdown file download
  const handleDownloadReport = () => {
    let md = `# ${TECHNICAL_REPORT.title}\n## ${TECHNICAL_REPORT.subTitle}\n\n`;
    md += `**Candidate:** ${TECHNICAL_REPORT.candidateName}\n`;
    md += `**Submitted To:** ${TECHNICAL_REPORT.submittedTo}\n`;
    md += `**Date:** ${TECHNICAL_REPORT.dateSubmitted}\n\n`;
    
    TECHNICAL_REPORT.sections.forEach(sec => {
      md += `### ${sec.title}\n\n`;
      sec.paragraphs.forEach(p => {
        md += `${p}\n\n`;
      });
      if (sec.id === "architecture") {
        md += `\`\`\`\n${sec.diagram}\n\`\`\`\n\n`;
      }
    });

    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "Carbyn_AI_Technical_Report_Sarthak_Mazumder.md";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="submission-hub-panel" className="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-slate-100 flex flex-col gap-6 shadow-2xl">
      
      {/* Header and tabs selection */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-900 pb-4 gap-3">
        <div className="flex items-center gap-2">
          <Tv className="w-5 h-5 text-amber-500 animate-pulse" />
          <div>
            <h2 className="font-sans font-bold text-base tracking-tight text-white uppercase">
              Carbyn AI Candidate Submission Hub
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              Class Grade Submission Materials: 2-Page Evaluation Report & Simulated Video Walkthrough.
            </p>
          </div>
        </div>

        <div className="flex bg-slate-900/60 p-1 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveTab("report")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
              activeTab === "report" 
                ? 'bg-slate-800 text-cyan-400' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5 inline mr-1" />
            <span>2-PAGE REPORT</span>
          </button>
          <button
            onClick={() => setActiveTab("walkthrough")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-mono font-bold transition-all ${
              activeTab === "walkthrough" 
                ? 'bg-slate-800 text-amber-400' 
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Play className="w-3.5 h-3.5 inline mr-1" />
            <span>VIDEO SIMULATOR</span>
          </button>
        </div>
      </div>

      {/* RENDER TAB 1: Detailed Technical Report */}
      {activeTab === "report" && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between bg-slate-900/30 p-4 rounded-xl border border-slate-900 gap-3">
            <div className="flex items-start gap-2 text-xs font-mono text-slate-400">
              <Bookmark className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <span>Document: </span>
                <span className="text-slate-200 font-bold">Carbyn_AI_Technical_Report.md</span>
                <p className="text-[10px] text-slate-500 mt-1">Exhaustive writeup of the core system pattern, visual RAG pipeline, and modular tradeoffs.</p>
              </div>
            </div>
            
            <button
              onClick={handleDownloadReport}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-3.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 self-stretch md:self-auto justify-center"
            >
              <Download className="w-4 h-4" />
              <span>DOWNLOAD MARKDOWN (.md)</span>
            </button>
          </div>

          {/* Paginated Paper Mockup */}
          <div className="bg-slate-900/80 p-6 md:p-8 rounded-xl border border-slate-900 font-sans leading-relaxed text-slate-300 flex flex-col gap-6 shadow-inner mx-auto max-w-4xl max-h-[500px] overflow-y-auto custom-scrollbar">
            
            {/* Report Header */}
            <div className="border-b-2 border-slate-800 pb-5 text-center">
              <h1 className="text-white text-lg md:text-xl font-bold tracking-tight uppercase">
                {TECHNICAL_REPORT.title}
              </h1>
              <p className="text-cyan-400 text-xs font-semibold tracking-wider uppercase mt-1">
                {TECHNICAL_REPORT.subTitle}
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-5 text-[11px] font-mono text-slate-400 border-t border-slate-900 pt-3 text-left">
                <div>CANDIDATE: <span className="text-slate-100 block font-sans font-semibold mt-0.5">{TECHNICAL_REPORT.candidateName}</span></div>
                <div>SUBMITTED TO: <span className="text-slate-100 block font-sans font-semibold mt-0.5">{TECHNICAL_REPORT.submittedTo}</span></div>
                <div>SUBMIT DATE: <span className="text-slate-100 block font-sans font-semibold mt-0.5">{TECHNICAL_REPORT.dateSubmitted}</span></div>
                <div>ASSIGNMENT: <span className="text-slate-100 block font-sans font-semibold mt-0.5">ROUND 1 TAKE-HOME</span></div>
              </div>
            </div>

            {/* Render Editorial Paragraphs */}
            {TECHNICAL_REPORT.sections.map((sec) => (
              <div key={sec.id} className="flex flex-col gap-3">
                <h3 className="text-base font-bold text-white tracking-tight border-l-2 border-cyan-400 pl-3">
                  {sec.title}
                </h3>
                {sec.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans text-justify">
                    {p}
                  </p>
                ))}
                {sec.diagram && (
                  <div className="bg-black/90 p-4 rounded-lg border border-slate-800/80 mt-1 overflow-x-auto">
                    <pre className="font-mono text-[9px] text-emerald-400 leading-tight">
                      {sec.diagram}
                    </pre>
                  </div>
                )}
              </div>
            ))}

            {/* Bottom Signature Sign-off */}
            <div className="border-t border-slate-800 pt-5 mt-4 text-center">
              <p className="text-xs text-slate-500 font-mono">
                Carbyn AI Smart-Glasses Assessment Submission. Validated inside Sandbox Cloud Run Module.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RENDER TAB 2: Automated Walkthrough Video Simulator */}
      {activeTab === "walkthrough" && (
        <div className="flex flex-col gap-5">
          <div className="bg-slate-900/40 p-4.5 rounded-xl border border-slate-900 flex flex-col gap-3">
            <h3 className="font-sans font-bold text-sm text-white">
              Interactive 3-Minute Walkthrough Video Assets Simulator
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Since you are evaluating this on a sandboxed browser workspace, this <b>Interactive Walkthrough Simulator</b> gives a fully storyboarded, audio-narrated preview demonstrating exactly how a field technician wears the smart glasses in an industrial setting. 
              It automatically loads the <b>Eaton Group Panelboard</b> profile, triggers high-voltage danger alarms, overlays step instructions, and reads everything out using humanized text-to-speech.
            </p>

            {/* Demo Controller tools */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              {!isPlayingDemo ? (
                <button
                  type="button"
                  onClick={playDemo}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-5 py-2 rounded-lg text-xs font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all"
                >
                  <Play className="w-4 h-4 fill-current text-slate-950" />
                  <span>PLAY WALKTHROUGH SIMULATOR</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopDemo}
                  className="bg-red-500 hover:bg-red-400 text-white font-bold px-5 py-2 rounded-lg text-xs font-mono tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(239,68,68,0.25)] transition-all"
                >
                  <Square className="w-4 h-4 text-white" />
                  <span>STOP SIMULATOR</span>
                </button>
              )}
              
              {isPlayingDemo && (
                <div className="flex items-center gap-2 text-xs font-mono text-amber-400 bg-amber-950/20 border border-amber-500/20 py-2 px-3.5 rounded-lg animate-pulse">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>SCENE {demoStep + 1} OF 5 RUNNING ON GLASSES...</span>
                </div>
              )}
            </div>
          </div>

          {/* Interactive Storyboard Console Outputs with Logs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Story Teller list */}
            <div className="lg:col-span-2 flex flex-col gap-2.5">
              <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                GLASSES CONSOLE EVENT CHRONICLE:
              </span>
              <div className="bg-black/80 font-mono text-xs p-4 rounded-xl border border-slate-950 h-[260px] overflow-y-auto flex flex-col gap-2 custom-scrollbar shadow-inner">
                {demoLogs.length === 0 ? (
                  <div className="text-slate-600 italic m-auto text-center flex flex-col items-center gap-1">
                    <Tv className="w-8 h-8 text-slate-800" />
                    <span>Inference engine idle. Push 'PLAY' above to log live execution frames...</span>
                  </div>
                ) : (
                  demoLogs.map((log, i) => {
                    const isStep = log.startsWith("[");
                    return (
                      <div 
                        key={i} 
                        className={`leading-relaxed border-b border-slate-950/50 pb-1.5 ${
                          isStep ? 'text-amber-400 font-bold' : 'text-slate-300 text-[11px] pl-3.5'
                        }`}
                      >
                        {log}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Summary overview of video narrative points */}
            <div className="bg-slate-900/40 border border-slate-900 p-4.5 rounded-xl flex flex-col gap-3.5 justify-center">
              <h4 className="text-xs font-mono font-bold text-slate-100 uppercase border-b border-slate-800 pb-1.5 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Video Assets Scoreboard</span>
              </h4>
              
              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-start gap-1 pb-2 border-b border-slate-900/50">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 font-bold block">1. Natural Interactions:</span>
                    <span className="text-slate-400">Emulates speech captures and local optical canvas scan.</span>
                  </div>
                </div>

                <div className="flex items-start gap-1 pb-2 border-b border-slate-900/50">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 font-bold block">2. Expert Co-Pilot RAG:</span>
                    <span className="text-slate-400">Pulls exact torque numbers (31 lb-in) from manual section 2.</span>
                  </div>
                </div>

                <div className="flex items-start gap-1">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-slate-200 font-bold block">3. Structured HUD Overlay:</span>
                    <span className="text-slate-400">Renders checkbox goals with high contrast.</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
