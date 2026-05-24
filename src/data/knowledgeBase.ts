export interface SymptomGuide {
  symptom: string;
  indicator: string;
  possibleCauses: string[];
  initialSteps: string[];
}

export interface MachineProfile {
  id: string;
  name: string;
  category: string;
  modelNum: string;
  manufacturer: string;
  specs: Record<string, string>;
  safetyHazards: string[];
  requiredPPE: string[];
  symptoms: SymptomGuide[];
  sopReferences: string;
}

export const KNOWLEDGE_BASE: Record<string, MachineProfile> = {
  hvac_trane_voyager: {
    id: "hvac_trane_voyager",
    name: "Trane Voyager Commercial HVAC Unit",
    category: "HVAC Systems",
    modelNum: "YCD-120-C4",
    manufacturer: "Trane Technologies",
    specs: {
      "Cooling Capacity": "10 Tons / 120,000 BTU/h",
      "Voltage/Phase": "460V / 3-Phase",
      "Refrigerant Type": "R-410A",
      "Control Voltage": "24VAC",
      "Compressor Type": "Dual Scroll, Hermetic"
    },
    safetyHazards: [
      "460VAC Electrical Shock Hazard",
      "High Refrigerant Pressure Blowout (up to 600 PSI)",
      "Moving Fan Blades / Belt Drive Entanglement",
      "Hot Condensor Coils & Compressor Surfaces"
    ],
    requiredPPE: [
      "Class E Insulated Protective Gloves (rated up to 1000V)",
      "ANSI Z87.1 Approved Safety Glasses",
      "Non-conductive, arc-rated workwear",
      "Steel-toed boots"
    ],
    symptoms: [
      {
        symptom: "Compressor fails to start / buzzes but trips main breaker",
        indicator: "3 Blinks on Control board LED",
        possibleCauses: [
          "Seized hermetic scroll compressor mechanism",
          "Locked rotor current on dual scroll motor",
          "Shorted run/start capacitor or burned contactor terminal block",
          "Phase loss or phase imbalance on L1/L2/L3 supplies"
        ],
        initialSteps: [
          "Safely shut down the 460V primary service disconnect switch.",
          "Verify zero-voltage state using a calibrated CAT-III multimeter across all three phases.",
          "Inspect contactor contact pads for carbon scoring, welding, or mechanical fusion.",
          "Safely discharge start/run capacitors and measure microfarads using a capacitance meter."
        ]
      },
      {
        symptom: "Evaporator coil freezing / restricted airflow",
        indicator: "Ice accumulation on copper feedback lines",
        possibleCauses: [
          "Dirty air filter causing low delta-T across coils",
          "Loose, worn, or snapped blower belt drive",
          "Low refrigerant charge due to copper joint hairline leaks"
        ],
        initialSteps: [
          "Power off HVAC system at thermostat and switch fan control to manual 'ON'.",
          "Inspect belt tension (should have no more than 0.5 inches of play).",
          "Examine air filter; swap immediately if high pressure-drop is detected."
        ]
      }
    ],
    sopReferences: "Standard Operating Procedure SOP-HVAC-102-REV4; section 4.2 Compressor Diagnostics and section 7.5 Charging with safety protocols."
  },
  cnc_haas_vf2: {
    id: "cnc_haas_vf2",
    name: "Haas VF-2 Vertical Machining Center",
    category: "CNC Machinery",
    modelNum: "VF-2-YT",
    manufacturer: "Haas Automation",
    specs: {
      "Spindle Motor": "30 HP Vector Drive",
      "Max Spindle Speed": "8,100 RPM",
      "Axis Travel (X/Y/Z)": "30\" x 20\" x 20\"",
      "Control System": "Haas Next Generation Control (NGC)",
      "Pneumatic Feed": "85 PSI (min) dry, filtered air"
    },
    safetyHazards: [
      "Crush and pinch hazards from high speed X/Y/Z axis movements",
      "30 HP Spindle tool rotation (laceration/flying debris)",
      "High-pressure pneumatic blowback",
      "High current vector drive voltage reservoirs (325VDC)"
    ],
    requiredPPE: [
      "Heavy-duty chemical-resistant nitrile gloves during coolant contact",
      "ANSI Z87.1 Approved Safety Glasses with side shields",
      "Steel-toed safety boots"
    ],
    symptoms: [
      {
        symptom: "Spindle motor overheat warning / Vector Drive emergency stop",
        indicator: "Error Code 102 (Spindle Overheat) or Error 107 on Screen",
        possibleCauses: [
          "Clogged regenerative spindle oil cooler jacket or filter",
          "Coolant pump rotor jam or cooling fan blockage",
          "Excessive heavy-loading feeds over prolonged continuous cycle"
        ],
        initialSteps: [
          "Safely hit the Red Emergency Stop Button immediately and lock spindle physically.",
          "Inspect the cooling system flow gauges and check the spindle thermal oil reservoir level.",
          "Examine spindle cooling fan at the rear of motor housing; clean accumulated metal swarf and oil sludge."
        ]
      },
      {
        symptom: "Axis Travel Limit stuck / software lockout",
        indicator: "Alarm 103 (Limit Switch Triggered) on NGC Interface",
        possibleCauses: [
          "Over-travel onto physical limit bumper switches",
          "Swarf/chips accumulation behind the proximity switch trigger plate",
          "Defective X-axis or Y-axis electronic limit sensor module"
        ],
        initialSteps: [
          "Hold down 'Zero Return' + 'Single Block' then command slow jog in opposite direction.",
          "Inspect proximity roller arm for spring recoil tension or debris binding.",
          "Measure 24V supply to the switch module backplane."
        ]
      }
    ],
    sopReferences: "Haas Mill Operator Manual SEC-7.2 (Proximity Switch Troubleshooting) and SEC-12.4 (Spindle Oil Cooler Preventative Maintenance)."
  },
  eaton_electrical_panel: {
    id: "eaton_electrical_panel",
    name: "Eaton Pow-R-Line C Group Panelboard",
    category: "Electrical Systems",
    modelNum: "PRL1a-400A",
    manufacturer: "Eaton Electrical",
    specs: {
      "Max Amperage": "400 Amps Main Lug / Main Breaker",
      "Voltage Rating": "480Y/277VAC, 3-Phase, 4-Wire",
      "Short Circuit Rating": "65,000 AIC (Amperes Interrupting Capacity)",
      "Enclosure NEMA": "Type 1 Indoor Utility Surface"
    },
    safetyHazards: [
      "High Voltage Arc Flash Hazard (Flash Protection Boundary: 48 inches)",
      "Lethal Phase-to-Phase/Phase-to-Ground Shock Hazard (480V)",
      "Thermal burns from overheated contact shoes or loose connections"
    ],
    requiredPPE: [
      "NFPA 70E Category 2 Arc Flash suit with full face shield",
      "Insulated safety boots & dielectric safety sleeves",
      "1000V rated insulated torque tools"
    ],
    symptoms: [
      {
        symptom: "Breaker tripping repeatedly under nominal rating loads",
        indicator: "Excessive heat build-up under thermal camera assessment",
        possibleCauses: [
          "Loose breaker bolt mounting to primary busbar, creating high contact resistance",
          "Internal mechanical deterioration or spring fatigue in historical trip actuator",
          "Balanced three-phase overload on secondary branch feeder lines"
        ],
        initialSteps: [
          "Initiate Arc Flash safety barrier check; keep unauthorized personnel 10 feet back.",
          "Utilize a calibrated FLIR thermal camera to locate high-temperature hotspots.",
          "Power off upstream main source feed. Tag out according to LOTO 1910.147 instructions.",
          "Check contact bolt tightness using insulated torque wrenches to Eaton's exact guidelines (31 lb-in)."
        ]
      }
    ],
    sopReferences: "Eaton PRL Series Installation manual Section 2 (Mounting and Torque Specs) and NFPA 70E electrical safety guidelines."
  }
};
