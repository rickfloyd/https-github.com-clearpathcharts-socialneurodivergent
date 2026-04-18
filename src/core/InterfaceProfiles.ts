export type InterfaceProfileId =
  | "dynamic_flow"
  | "structured_matrix"
  | "high_legibility"
  | "numeric_relief"
  | "precision_navigation"
  | "rhythmic_flow"
  | "order_system"
  | "calm_concentration"
  | "low_stim_focus"
  | "consistency_matrix"
  | "low_glare_mode"
  | "simplified_dashboard"
  | "visual_guidance"
  | "clarity_first"
  | "workflow_logic"
  | "grounded_ui"
  | "low_friction_flow"
  | "concrete_visuals"
  | "icon_first_mode"
  | "silent_interaction"
  | "standard"
  | "executive_tier"
  | "high_intensity"
  | "focused_analysis"
  | "emergency_relief"
  | "readable_terminal"
  | "numeric_precision"
  | "visual_safety"
  | "assistive_feed"
  | "workflow_support"
  | "interface_friendly"
  | "dynamic_balance"
  | "hyper_concentration"
  | "predictable_matrix"
  | "stable_rhythm"
  | "plain_institutional"
  | "high_contrast"
  | "custom_workflow_mix"
  | "corporate_open"
  | "institutional_standard"
  | "modular_terminal"
  | "asset_navigator"
  | "standard_trader";

export const INTERFACE_PROFILES: { id: InterfaceProfileId; title: string; oneLine: string }[] = [
  { id: "dynamic_flow", title: "Dynamic Flow", oneLine: "Attention regulation for fast-paced markets." },
  { id: "structured_matrix", title: "Structured Matrix", oneLine: "Predictability + reduced sensory overload." },
  { id: "high_legibility", title: "High Legibility", oneLine: "Optimized typography for terminal reading." },
  { id: "numeric_relief", title: "Numeric Relief", oneLine: "Reduces data fatigue during high-volatility events." },
  { id: "precision_navigation", title: "Precision Navigation", oneLine: "Enhanced targets for rapid execution." },
  { id: "rhythmic_flow", title: "Rhythmic Flow", oneLine: "Harmonic interface for stable trading environments." },
  { id: "order_system", title: "Order System", oneLine: "Structure, symmetry, and logic cues." },
  { id: "calm_concentration", title: "Calm Concentration", oneLine: "Muted palette for sustained market analysis." },
  { id: "low_stim_focus", title: "Low Stimulus Focus", oneLine: "Reduced distractions for deep strategy work." },
  { id: "consistency_matrix", title: "Consistency Matrix", oneLine: "Fixed elements for cognitive stability." },
  { id: "low_glare_mode", title: "Low Glare Mode", oneLine: "Reduced luminance for sensitive eyes." },
  { id: "simplified_dashboard", title: "Simplified Dashboard", oneLine: "Lower cognitive load for critical decisions." },
  { id: "visual_guidance", title: "Visual Guidance", oneLine: "High-contrast focal alignment and target tracking." },
  { id: "clarity_first", title: "Clarity First", oneLine: "Uncluttered views for figure-ground distinction." },
  { id: "workflow_logic", title: "Workflow Logic", oneLine: "Step-by-step institutional routing." },
  { id: "grounded_ui", title: "Grounded UI", oneLine: "Reality-anchored cues for stable market viewing." },
  { id: "low_friction_flow", title: "Low Friction Flow", oneLine: "Seamless interaction model for rapid entry." },
];
