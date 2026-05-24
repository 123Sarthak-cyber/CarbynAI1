import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Mic, 
  Volume2, 
  VolumeX,
  Play, 
  RotateCcw, 
  Cpu, 
  ChevronRight, 
  ChevronLeft, 
  Zap, 
  Eye,
  ShieldAlert,
  Disc
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DiagnosticResult, HUDStep } from "../types";
import { MachineProfile } from "../data/knowledgeBase";

interface SmartHUDProps {
  activeProfile: MachineProfile;
  result: DiagnosticResult | null;
  loading: boolean;
  onDiagnose: (image: string | null, customQuery?: string) => void;
  onClear: () => void;
}

// Sample industrial fault simulated presets
const SIMULATED_SAMPLES = [
  {
    id: "hvac_broken_fan",
    label: "HVAC Seized Compressor (Triple LED Blink)",
    img: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600",
    query: "Identify why the compressor is clicking and buzzing, and LED shows three quick blinks."
  },
  {
    id: "cnc_swarf",
    label: "CNC Axis travel sensor blocked with swarf",
    img: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&q=80&w=600",
    query: "NGC Screen shows Alarm 103: Limit Switch Triggered."
  },
  {
    id: "panel_overheat",
    label: "Overheating feeder terminal on electrical busbar",
    img: "https://images.unsplash.com/photo-1590412200988-a436bb705300?auto=format&fit=crop&q=80&w=600",
    query: "Perform panel thermal scan. Triple-phase contactor contactor heater keeps tripping under load."
  }
];

export function SmartHUD({ activeProfile, result, loading, onDiagnose, onClear }: SmartHUDProps) {
  const [useCamera, setUseCamera] = useState(false);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [customQuery, setCustomQuery] = useState("");
  const [simulatedVoiceLog, setSimulatedVoiceLog] = useState<string>("SmartHUD voice interface online. Waiting for trigger...");
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // End camera on component unmount
  useEffect(() => {
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [videoStream]);

  // Handle Speech synthesis of active step
  const speakStep = (step: HUDStep) => {
    if (isMuted || !window.speechSynthesis) return;
    
    // Stop any running speech
    window.speechSynthesis.cancel();
    
    const text = `Step ${step.stepNumber}. ${step.title}. ${step.instruction}. Safety check: ${step.safetyNote}. Target parameter: ${step.targetMetric}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select slightly crisp industrial-robot voice if available
    const voices = window.speechSynthesis.getVoices();
    const roboticVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang.startsWith("en"));
    if (roboticVoice) {
      utterance.voice = roboticVoice;
    }
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
    setSimulatedVoiceLog(`TTS Readout: "Step ${step.stepNumber} read aloud..."`);
  };

  // Speak active step changes
  useEffect(() => {
    if (result && result.steps && result.steps[activeStepIdx]) {
      speakStep(result.steps[activeStepIdx]);
    }
  }, [result, activeStepIdx]);

  // Activate Browser Camera
  const startCamera = async () => {
    try {
      setCapturedImage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setVideoStream(stream);
      setUseCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setSimulatedVoiceLog("Optical waveguide camera active.");
    } catch (err) {
      console.error("Camera access failed:", err);
      alert("Microphone, camera, or browser permissions block camera stream. Try using preset templates or file uploads below!");
    }
  };

  // Turn off Camera
  const stopCamera = () => {
    if (videoStream) {
      videoStream.getTracks().forEach(track => track.stop());
    }
    setVideoStream(null);
    setUseCamera(false);
  };

  // Take snapshot of camera frame
  const captureFrame = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Draw cyber crosshairs directly onto overlay image for flair
        ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
        ctx.lineWidth = 2;
        ctx.strokeRect(canvas.width / 4, canvas.height / 4, canvas.width / 2, canvas.height / 2);
        
        const dataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(dataUrl);
        stopCamera();
        setSimulatedVoiceLog("Frame snapshot captured directly onto HUD buffer.");
      }
    }
  };

  // Handle uploaded local file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
        setSimulatedVoiceLog("External telemetry image loaded.");
      };
      reader.readAsDataURL(file);
    }
  };

  // Trigger diagnose
  const runDiagnosis = (img: string | null, queryText?: string) => {
    onDiagnose(img, queryText || customQuery);
    setActiveStepIdx(0);
  };

  // Reset image
  const resetImageState = () => {
    setCapturedImage(null);
    stopCamera();
    onClear();
  };

  // Voice Command Emulation Handler
  const triggerVoiceCommand = (commandType: string) => {
    if (!result) {
      setSimulatedVoiceLog("No instructions active. Diagnostics must run first.");
      return;
    }
    
    if (commandType === "NEXT") {
      if (activeStepIdx < result.steps.length - 1) {
        setActiveStepIdx(prev => prev + 1);
        setSimulatedVoiceLog(`Voice Recognized: "[NEXT STEP]". Navigating...`);
      } else {
        setSimulatedVoiceLog(`Voice Recognized: "[NEXT STEP]". Tasks complete!`);
      }
    } else if (commandType === "PREV") {
      if (activeStepIdx > 0) {
        setActiveStepIdx(prev => prev - 1);
        setSimulatedVoiceLog(`Voice Recognized: "[PREVIOUS STEP]". Navigating back...`);
      }
    } else if (commandType === "SOP") {
      setSimulatedVoiceLog(`Voice Recognized: "[SPECS]". Reading machine safety...`);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const text = `Observing ${activeProfile.name}. Required protective gear: ${result.requiredPPE.join(", ")}. Primary hazard is ${result.safetyWarnings[0] || "None"}.`;
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
      }
    }
  };

  const activeStep: HUDStep | null = result?.steps?.[activeStepIdx] || null;

  return (
    <div id="smart-hud-viewport" className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-100 shadow-2xl">
      
      {/* LEFT: Wearable Optical / Visual Input Feed - 7 cols */}
      <div id="optical-feed-container" className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Title HUD status */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
            <span className="font-mono text-xs tracking-widest text-cyan-400 font-bold">WEARABLE AR FEED</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
            LASER-WAVEGUIDE V.3.1
          </div>
        </div>

        {/* Viewfinder Frame simulating optical glasses shield */}
        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-slate-800 bg-black flex flex-col items-center justify-center group shadow-inner">
          
          {/* Cyber HUD Grid lines overlay */}
          <div className="absolute inset-0 pointer-events-none border border-cyan-500/10 grid grid-cols-3 grid-rows-3 z-10">
            <div className="border-r border-b border-cyan-500/5"></div>
            <div className="border-r border-b border-cyan-500/5"></div>
            <div className="border-b border-cyan-500/5"></div>
            <div className="border-r border-b border-cyan-500/10"></div>
            <div className="border-r border-b border-cyan-500/20 relative">
              {/* Central Target reticle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-cyan-400/40 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60"></div>
              </div>
            </div>
            <div className="border-b border-cyan-500/10"></div>
          </div>

          {/* Active scanning logs in top corners */}
          <div className="absolute top-3 left-3 z-10 pointer-events-none font-mono text-[9px] text-cyan-400/80 bg-slate-950/80 p-1.5 rounded border border-cyan-500/30 flex flex-col gap-0.5 max-w-[200px]">
            <div className="flex items-center gap-1.5">
              <Disc className="w-3 h-3 text-red-500 animate-spin" />
              <span>EYE-TRACKING SECURE</span>
            </div>
            <span>H_RES: {useCamera ? "64FPS" : "STANDBY"}</span>
            <span>GRID_SYS: ACTIVE_RAG</span>
          </div>

          <div className="absolute top-3 right-3 z-10 pointer-events-none font-mono text-[9px] text-amber-400/80 bg-slate-950/80 p-1.5 rounded border border-amber-500/30 flex flex-col gap-0.5 text-right">
            <span>TARGET PROFILE:</span>
            <span className="font-bold text-slate-100">{activeProfile.name}</span>
            <span>MODEL: {activeProfile.modelNum}</span>
          </div>

          {/* Actual Feed Content */}
          {useCamera && !capturedImage && (
            <video 
              ref={videoRef}
              autoPlay 
              playsInline 
              id="technician-camera-feed"
              className="w-full h-full object-cover"
            />
          )}

          {capturedImage && (
            <img 
              src={capturedImage} 
              alt="Technician Visual Telemetry" 
              className="w-full h-full object-cover"
            />
          )}

          {!useCamera && !capturedImage && (
            <div className="flex flex-col items-center justify-center p-6 text-center select-none text-slate-400">
              <Camera className="w-12 h-12 text-slate-600 mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">Wearable Optical Input Offline</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Activate your camera to analyze physical wiring or select sample templates/files below to trigger full diagnostic logic.
              </p>
            </div>
          )}

          {/* Active Diagnostic overlay if result exists */}
          {result && (
            <div className="absolute inset-0 bg-slate-950/35 pointer-events-none z-10">
              {/* Highlight bounding boxes */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: [1, 0.4, 1], scale: 1 }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border-2 border-dashed border-cyan-400 rounded-lg"
              >
                <div className="absolute -top-6 left-0 bg-cyan-950/90 text-cyan-400 border border-cyan-400/50 text-[10px] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1.5 backdrop-blur-md">
                  <Cpu className="w-3 h-3" />
                  <span>IDENTIFIED: {result.identifiedPart}</span>
                </div>
              </motion.div>
            </div>
          )}

          {/* Scanning animation bar */}
          {loading && (
            <motion.div 
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "linear" }}
              className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(34,211,238,0.8)] z-10 pointer-events-none"
            />
          )}

          {/* Bottom HUD controls embedded in glass */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-slate-950/90 py-1 px-3 rounded-full border border-slate-800 shadow-xl backdrop-blur-md">
            {useCamera && !capturedImage ? (
              <button 
                onClick={captureFrame} 
                id="camera-snap-trigger"
                className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 hover:text-white"
              >
                <CheckCircle className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>TAKE SNAPSHOT</span>
              </button>
            ) : (
              <button 
                onClick={startCamera} 
                id="camera-activate-trigger"
                className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-400 hover:text-white"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>ACTIVATE CAMERA</span>
              </button>
            )}

            {(useCamera || capturedImage) && (
              <>
                <span className="text-slate-700 font-mono">|</span>
                <button 
                  onClick={resetImageState} 
                  id="reset-lens-trigger"
                  className="flex items-center gap-1 text-[11px] font-mono text-slate-400 hover:text-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>DISCHARGE</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Dynamic visual sampler presets & upload */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/50 p-3 rounded-xl border border-slate-900">
          
          {/* File Upload Trigger */}
          <div className="flex flex-col gap-1.5 justify-center">
            <label className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1">
              <Upload className="w-3 h-3" />
              <span>UPLOAD HOUSING SNAPSHOT</span>
            </label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload}
              className="text-xs text-slate-400 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-slate-100 file:cursor-pointer hover:file:bg-slate-700"
            />
          </div>

          {/* Test telemetry samples */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono font-semibold text-slate-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              <span>OR LOAD DEFECT TELEMETRY SNAPSHOT</span>
            </span>
            <div className="flex flex-col gap-1">
              {SIMULATED_SAMPLES.map(sample => (
                <button
                  key={sample.id}
                  onClick={() => {
                    setCapturedImage(sample.img);
                    setCustomQuery(sample.query);
                    stopCamera();
                    runDiagnosis(sample.img, sample.query);
                  }}
                  className="text-left text-[10px] font-mono bg-slate-950/80 hover:bg-slate-800 p-1 px-2 rounded border border-slate-800 text-slate-300 hover:text-cyan-400 flex items-center justify-between"
                >
                  <span className="truncate">{sample.label}</span>
                  <ChevronRight className="w-3 h-3 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Query Input section */}
        <div className="flex flex-col gap-1.5 p-3.5 bg-slate-950 border border-slate-900 rounded-xl">
          <label className="text-[11px] font-mono font-semibold text-cyan-400 tracking-wider">
            HANDS-FREE INDUSTRIAL COMMAND QUERY
          </label>
          <div className="flex gap-2">
            <input 
              type="text"
              value={customQuery}
              onChange={(e) => setCustomQuery(e.target.value)}
              placeholder="e.g. Compressor overheated, show diagnostic steps or check limitswitch wiring..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-100 hover:border-slate-700 focus:outline-none focus:border-cyan-400 font-mono"
            />
            <button
              onClick={() => runDiagnosis(capturedImage)}
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-4 py-1.5 rounded text-xs font-mono tracking-widest disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>RUN INFERENCE</span>
            </button>
          </div>
          <span className="text-[9px] font-mono text-slate-400">
            *Grounds response context using dynamic RAG manuals for maximum technician accuracy.
          </span>
        </div>

        {/* Speech output logger */}
        <div className="bg-slate-900/40 p-2.5 rounded-lg border border-slate-900 font-mono text-[10px] flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-bold">AUDIO TELEMETRY STREAM:</span>
            <span className="text-slate-300 italic truncate max-w-[340px]">{simulatedVoiceLog}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setIsMuted(prev => !prev)}
            className="text-slate-400 hover:text-white shrink-0"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-400" />}
          </button>
        </div>

      </div>

      {/* RIGHT: High-tech HUD Checklist & Alarms - 5 cols */}
      <div id="hud-telemetry-panel" className="lg:col-span-5 flex flex-col gap-4 border-l lg:border-l-0 lg:pl-0 border-slate-900">
        
        {/* Title pane info */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <span className="font-mono text-xs tracking-widest text-amber-500 font-bold">DIGNOSTIC TELEMETRY</span>
          <div className="flex gap-2">
            {result?.isDamageDetected && (
              <span className="text-[9px] font-mono bg-red-950 text-red-400 px-1.5 py-0.5 rounded border border-red-500/30">
                DISCREPANCY ALERT
              </span>
            )}
          </div>
        </div>

        {/* Loading pane */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Cpu className="w-10 h-10 text-cyan-400 animate-spin mb-3" />
            <p className="font-mono text-xs text-cyan-400 font-bold blink">RETRIVEING FIELD MANUALS...</p>
            <p className="text-[11px] text-slate-500 font-mono mt-1">Generating RAG schema payload & syncing model</p>
          </div>
        )}

        {/* No active result guide */}
        {!result && !loading && (
          <div className="bg-slate-900/20 rounded-xl border border-dashed border-slate-900 p-8 flex flex-col items-center justify-center text-center my-auto">
            <Wrench className="w-12 h-12 text-slate-700 mb-2" />
            <p className="text-sm font-semibold text-slate-400">Waiting for Diagnostic Trigger</p>
            <p className="text-xs text-slate-600 max-w-xs mt-1">
              Select or capture a machine anomaly, verify the query template, and trigger 'Run Inference' to pop step instructions in real-time.
            </p>
          </div>
        )}

        {/* Actual HUD Outputs */}
        {result && !loading && (
          <div className="flex flex-col gap-4">
            
            {/* Component State Dashboard */}
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-900 flex flex-col gap-2">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono uppercase">
                <span>IDENTIFIED HARWARE</span>
                <span className={`font-bold ${result.isDamageDetected ? 'text-red-400' : 'text-green-400'}`}>
                  {result.isDamageDetected ? 'FAULT CONFIRMED' : 'NORMAL ALIGN'}
                </span>
              </div>
              <h4 className="text-md font-bold tracking-tight text-white font-sans">{result.identifiedPart}</h4>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">{result.stateSummary}</p>
            </div>

            {/* Glowing arc alarms */}
            {result.safetyWarnings.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-amber-500 uppercase tracking-widest font-bold">SAFETY INTERDICTION OVERRIDES:</span>
                <div className="flex flex-col gap-1.5">
                  {result.safetyWarnings.map((warn, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-red-950/70 text-red-100 border border-red-500/50 p-2.5 rounded-lg flex items-start gap-2 text-xs font-mono shadow-[0_0_12px_rgba(239,68,68,0.15)]"
                    >
                      <AlertTriangle className="w-4.5 h-4.5 text-red-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <span className="text-red-400 font-bold block">[!!] WARNING:</span>
                        <span>{warn}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Action step HUD overlay controls */}
            <div className="flex flex-col gap-2.5">
              <div className="flex justify-between items-center border-b border-slate-900 pb-1.5">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-bold">ACTIVE STEP PROTOCOLS:</span>
                <span className="text-[10px] text-slate-400 font-mono">
                  STEP {activeStepIdx + 1} OF {result.steps.length}
                </span>
              </div>

              {/* Progress dots bar */}
              <div className="flex gap-1">
                {result.steps.map((_, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`flex-1 h-1.5 rounded duration-300 cursor-pointer ${
                      idx === activeStepIdx 
                        ? 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                        : idx < activeStepIdx 
                        ? 'bg-green-500/80' 
                        : 'bg-slate-800'
                    }`}
                  />
                ))}
              </div>

              {/* Focus step view */}
              <AnimatePresence mode="wait">
                {activeStep && (
                  <motion.div 
                    key={activeStepIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-[#0b1329] border border-cyan-500/30 p-4 rounded-xl flex flex-col gap-3 shadow-lg relative"
                  >
                    {/* Diagnostic HUD Metric Meter */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded font-mono text-[9px] text-yellow-400">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span>{activeStep.targetMetric !== "N/A" ? activeStep.targetMetric : "SPEC: SOP"}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-400/40 text-[10px] font-mono font-bold flex items-center justify-center">
                        {activeStep.stepNumber}
                      </span>
                      <h5 className="font-bold text-slate-100 font-mono text-xs uppercase text-cyan-200">
                        {activeStep.title}
                      </h5>
                    </div>

                    <p className="text-sm text-slate-200 font-sans leading-relaxed pl-1">
                      {activeStep.instruction}
                    </p>

                    {/* Safety Sub-Note */}
                    <div className="bg-amber-950/40 border border-amber-500/30 p-2.5 rounded-lg flex items-start gap-1.5 text-[11px] font-mono">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-amber-500 font-bold">SAFETY PROTOCOL:</span>{" "}
                        <span className="text-slate-300">{activeStep.safetyNote}</span>
                      </div>
                    </div>

                    {/* Step Controls */}
                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <div className="text-[10px] font-mono text-slate-400 font-bold">
                        EST. DURATION: <span className="text-white font-sans font-normal">{activeStep.estimateMinutes} MIN</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => speakStep(activeStep)}
                          className="p-1 px-2.5 rounded bg-slate-900 border border-slate-800 hover:border-cyan-500 text-[10px] font-mono text-cyan-400 flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Volume2 className="w-3 h-3 text-cyan-400" />
                          <span>READ VOICE</span>
                        </button>
                      </div>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* Prev Next trigger emulation widgets with Voice feedback */}
              <div className="flex gap-2.5 mt-1">
                <button
                  type="button"
                  disabled={activeStepIdx === 0}
                  onClick={() => triggerVoiceCommand("PREV")}
                  className="flex-1 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono font-bold text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-40 transition-all flex items-center justify-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>PREVIOUS STEP</span>
                </button>
                <button
                  type="button"
                  onClick={() => triggerVoiceCommand("NEXT")}
                  className="flex-1 py-2 rounded-lg bg-cyan-950/70 border border-cyan-400/30 hover:border-cyan-400 text-xs font-mono font-bold text-cyan-300 hover:text-white disabled:opacity-40 transition-all flex items-center justify-center gap-1"
                >
                  <span>{activeStepIdx === result.steps.length - 1 ? 'FINISH REPAIR' : 'NEXT STEP'}</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Gear belt & PPE indicators */}
            <div className="grid grid-cols-2 gap-3.5 mt-1">
              {/* Mandatory PPE checklist toolbelt */}
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">MANDATORY ACTIVE GEAR (PPE)</span>
                <div className="flex flex-col gap-1">
                  {result.requiredPPE.map((ppe, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-cyan-400 grow-0 shrink-0"></span>
                      <span className="truncate">{ppe}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specialized Toolbelt */}
              <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-900 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider">RECOMMENDED TOOLS</span>
                <div className="flex flex-col gap-1">
                  {result.suggestedTools.map((tool, i) => (
                    <div key={i} className="text-[10px] font-mono text-slate-300 flex items-center gap-1">
                      <Wrench className="w-3 h-3 text-cyan-400 shrink-0" />
                      <span className="truncate">{tool}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Overall summary resolution */}
            <div className="bg-slate-900/30 border border-slate-900 p-3 rounded-xl font-mono text-[11px] leading-relaxed">
              <span className="text-cyan-400 font-bold block uppercase mb-1">CO-PILOT CONCLUDING OUTCOME PLAN:</span>
              <p className="text-slate-300">{result.overallResolutionPlan}</p>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
