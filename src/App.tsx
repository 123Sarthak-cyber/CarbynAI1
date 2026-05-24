import { useState, useEffect } from "react";
import { 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Database,
  FileCheck,
  Send,
  Wrench,
  AlertOctagon,
  User,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { KNOWLEDGE_BASE, MachineProfile } from "./data/knowledgeBase";
import { DiagnosticResult } from "./types";
import { SmartHUD } from "./components/SmartHUD";
import { SOPBrowser } from "./components/SOPBrowser";
import { SubmissionForm } from "./components/SubmissionForm";

export default function App() {
  const [selectedProfileId, setSelectedProfileId] = useState<string>("hvac_trane_voyager");
  const [result, setResult] = useState<DiagnosticResult | null>(null);
  const [query, setQuery] = useState<string>("");
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [apiUsed, setApiUsed] = useState<boolean>(false);
  const [fallbackTriggered, setFallbackTriggered] = useState<boolean>(false);
  const [errorString, setErrorString] = useState<string | null>(null);
  
  const activeProfile = KNOWLEDGE_BASE[selectedProfileId];

  // Load initial diagnosis on profile change to give technician instant feedback
  useEffect(() => {
    // Zero out old results to look neat
    setResult(null);
    setErrorString(null);
  }, [selectedProfileId]);

  // Primary post payload to API diagnose
  const handleDiagnose = async (imagePayload: string | null, customQueryText?: string) => {
    setLoading(true);
    setResult(null);
    setErrorString(null);
    setFallbackTriggered(false);
    
    // Grab correct user text
    const activeQuery = customQueryText || query || "Inspect and identify machine state.";

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          machineId: selectedProfileId,
          image: imagePayload,
          query: activeQuery
        })
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
        setApiUsed(data.apiUsed);
        setFallbackTriggered(data.fallbackTriggered || false);
      } else {
        throw new Error(data.error || "Failed key processing from Express backend router.");
      }
    } catch (err: any) {
      console.error("Diagnosis operation error:", err);
      setErrorString(err.message || "Network socket or API endpoint failed to respond.");
    } finally {
      setLoading(false);
    }
  };

  // Walkthrough Simulator callback triggers result
  const handleSimulateResult = (simulatedResult: DiagnosticResult, profileId: string, customQuery: string, imageUrl: string) => {
    setSelectedProfileId(profileId);
    setResult(simulatedResult);
    setQuery(customQuery);
    setImage(imageUrl);
    setApiUsed(false);
    setFallbackTriggered(true);
  };

  // Walkthrough clear
  const handleClearSimulated = () => {
    setResult(null);
    setQuery("");
    setImage(null);
    setFallbackTriggered(false);
    setApiUsed(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Professional Wearable Navigation Rail */}
      <header className="bg-slate-900/80 border-b border-slate-900 py-3.5 px-6 sticky top-0 z-50 backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* Core Brand visual identifiers */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-cyan-400 to-blue-500 p-2 rounded-lg shadow-md md:shadow-lg shadow-cyan-500/10">
            <Cpu className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans font-bold text-base text-white tracking-tight uppercase">Carbyn AI</span>
              <span className="text-[9px] font-mono font-bold bg-cyan-950 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded uppercase">
                CO-PILOT HUD V3
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono tracking-wide">
              AI-Powered Real-Time Assistant for Hands-Free Industrial Workers
            </p>
          </div>
        </div>

        {/* Live System Signal telemetry meters & Shareable URL */}
        <div className="flex flex-wrap items-center gap-3.5 text-xs font-mono">
          <a 
            href="https://ais-pre-qfalblzlfewv4qzf5yhib3-289528735090.asia-east1.run.app" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-cyan-950/90 text-cyan-400 border border-cyan-400/50 hover:bg-cyan-900 px-3 py-1.5 rounded-lg shadow-[0_0_10px_rgba(34,211,238,0.25)] transition-all font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5 animate-pulse" />
            <span>OPEN CO-PILOT HUD ON ANY DEVICE</span>
          </a>

          <div className="hidden md:flex items-center gap-1.5 bg-slate-950 border border-slate-900/60 p-1.5 px-3 rounded-lg text-slate-400">
            <Wifi className="w-3.5 h-3.5 text-green-400 animate-pulse" />
            <span className="text-[10px] text-slate-300">WAVEGUIDE LINK: INSTANT</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 bg-slate-950 border border-slate-900/60 p-1.5 px-3 rounded-lg text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] text-slate-300">LOTO ASSURANCE: COGNITIVE</span>
          </div>
        </div>

      </header>

      {/* Main content grid view */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 flex flex-col gap-6">
        
        {/* Alerts / Error bounds notification banner */}
        <AnimatePresence>
          {errorString && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-950/60 border border-red-500/50 p-4 rounded-xl flex items-start gap-2.5 text-xs font-mono"
            >
              <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-red-400 font-bold block pb-0.5">[!] NETWORK DISRUPTION REPORTED:</span>
                <span className="text-slate-300">{errorString}</span>
                <p className="text-[10px] text-slate-500 mt-1">
                  *Our smart server falls back to diagnostic heuristics safely to bypass outages offline. Check connection.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* BENTO ROW 1: Smart Glasses HUD Overlay Module + Physical Manual Library Index */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Smartglasses Optical Viewport & HUD (7 Cols) */}
          <section className="xl:col-span-8 flex flex-col gap-2">
            <div className="flex justify-between items-center px-1 font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              <span>Holographic Glass Layer</span>
              <span className="text-cyan-400">Active Profile: {activeProfile?.name}</span>
            </div>
            
            <SmartHUD 
              activeProfile={activeProfile} 
              result={result} 
              loading={loading}
              onDiagnose={handleDiagnose}
              onClear={() => handleClearSimulated()}
            />
          </section>

          {/* SOP Document Knowledge Hub & Specs Sheet (5 Cols) */}
          <section className="xl:col-span-4 flex flex-col gap-2 h-full">
            <div className="px-1 font-mono text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
              <span>Grounded Manual Database References</span>
            </div>

            <SOPBrowser 
              selectedProfileId={selectedProfileId} 
              onProfileSelect={(pId) => setSelectedProfileId(pId)} 
            />
          </section>

        </div>

        {/* BENTO ROW 2: Official Submission and Evaluation Center (Full 12 columns width) */}
        <section className="flex flex-col gap-2 border-t border-slate-900 pt-6">
          <div className="px-1 font-mono text-[10px] text-amber-500 uppercase tracking-widest font-bold">
            <span>Official Candidate Evaluation Station</span>
          </div>

          <SubmissionForm 
            onSimulateResult={handleSimulateResult}
            onClearSimulated={handleClearSimulated}
          />
        </section>

      </main>

      {/* Footer system status notes */}
      <footer className="bg-slate-950 border-t border-slate-900/60 py-6 text-center text-[10px] font-mono text-slate-600 flex flex-col md:flex-row justify-between items-center max-w-7xl w-full mx-auto px-6 gap-3 mt-12">
        <div className="flex items-center gap-1.5 justify-center">
          <Database className="w-3.5 h-3.5 text-slate-700" />
          <span>CARBYN LOCAL RAG MODEL CACHE IS LOADED WITH FULL SOPS SUITE</span>
        </div>
        <div>
          <span>CARBYN AI INC. SPECIALIZED TAKE HOME • CANDIDATE ID: <span className="text-slate-400 font-bold">SM-2026</span></span>
        </div>
      </footer>

    </div>
  );
}
