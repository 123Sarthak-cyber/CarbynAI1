import { 
  KNOWLEDGE_BASE, 
  MachineProfile 
} from "../data/knowledgeBase";
import { 
  Library, 
  Settings, 
  Cpu, 
  Lock, 
  Info, 
  CheckCircle2, 
  ShieldAlert,
  Flame,
  FileCheck
} from "lucide-react";

interface SOPBrowserProps {
  selectedProfileId: string;
  onProfileSelect: (profileId: string) => void;
}

export function SOPBrowser({ selectedProfileId, onProfileSelect }: SOPBrowserProps) {
  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-slate-100 flex flex-col gap-5 shadow-xl">
      
      {/* Title block */}
      <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
        <Library className="w-5 h-5 text-cyan-400" />
        <h3 className="font-sans font-bold text-sm uppercase tracking-wider text-slate-100">
          Industrial SOP & Manual Library
        </h3>
      </div>

      {/* Profile selector buttons */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
          CO-PILOT CONTEXT BINDING (CHOOSE PROFILE):
        </span>
        <div className="flex flex-col gap-2">
          {Object.values(KNOWLEDGE_BASE).map((profile) => {
            const isSelected = profile.id === selectedProfileId;
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => onProfileSelect(profile.id)}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-1.5 ${
                  isSelected 
                    ? 'bg-slate-900 border-cyan-500/80 shadow-[0_0_12px_rgba(6,182,212,0.1)]' 
                    : 'bg-slate-950 border-slate-900 hover:border-slate-800 hover:bg-slate-900/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                    isSelected 
                      ? 'bg-cyan-950/80 text-cyan-400 border-cyan-400/30' 
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}>
                    {profile.category}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] font-mono text-cyan-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>HUD SYNCED</span>
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-sans font-bold text-sm tracking-tight text-white">
                    {profile.name}
                  </h4>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-400 font-mono">
                    <span>MFR: {profile.manufacturer}</span>
                    <span>•</span>
                    <span>MOD: {profile.modelNum}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected profile specifications sheet */}
      {selectedProfileId && KNOWLEDGE_BASE[selectedProfileId] && (
        <div className="bg-slate-900/30 border border-slate-900 p-4 rounded-xl flex flex-col gap-4 mt-1">
          
          {/* Section: Specifications */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                RETRIEVED EQUIPMENT SPECS
              </span>
            </div>
            
            <div className="grid grid-cols-1 gap-1.5">
              {Object.entries(KNOWLEDGE_BASE[selectedProfileId].specs).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-xs p-1 px-1.5 rounded bg-slate-950/50 border border-slate-900/50">
                  <span className="font-mono text-slate-400">{key}:</span>
                  <span className="font-sans text-slate-100 font-medium text-right text-[11px] truncate">{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Primary Hazards */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 border-b border-slate-900 pb-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <span className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                CRITICAL LOTO HAZARD THREATS
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {KNOWLEDGE_BASE[selectedProfileId].safetyHazards.map((hazard, i) => (
                <div key={i} className="text-[11px] font-mono text-amber-200/90 flex items-start gap-1 pb-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
                  <span>{hazard}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Library index info */}
          <div className="bg-slate-950/80 p-2.5 rounded border border-slate-800 font-mono text-[10px] text-slate-400 flex items-center gap-1.5">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            <div>
              <span className="text-slate-200 font-bold">RAG BINDING POINTER:</span>{" "}
              {KNOWLEDGE_BASE[selectedProfileId].sopReferences}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
