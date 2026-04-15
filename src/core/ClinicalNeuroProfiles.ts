export type ClinicalNeuroId =
  | "adhd"
  | "asd"
  | "dyslexia"
  | "dyscalculia"
  | "dyspraxia-dcd"
  | "tourette-tics"
  | "ocd"
  | "ptsd"
  | "anxiety"
  | "bipolar"
  | "sensory-processing"
  | "tbi"
  | "apd-capd"
  | "visual-processing"
  | "executive-function"
  | "schizophrenia"
  | "depression"
  | "fetal-alcohol"
  | "intellectual-disability"
  | "misophonia"
  | "standard"
  | "downs"
  | "military"
  | "calm_focus"
  | "low_stim_emergency"
  | "dyslexia_readable"
  | "dyscalculia_numeric_relief"
  | "visual_processing_safe"
  | "apd_assist"
  | "executive_function_support"
  | "motor_friendly"
  | "adhd_dopamine_balanced"
  | "adhd_hyperfocus"
  | "autism_predictable"
  | "tourette_tic_friendly"
  | "plain_language"
  | "high_contrast"
  | "custom_neuro_mix"
  | "corporate_open"
  | "retail_chaos"
  | "retail_modular"
  | "vr_assistive"
  | "standard_trader";

export const CLINICAL_NEURO_PROFILES: { id: ClinicalNeuroId; title: string; oneLine: string }[] = [
  { id: "adhd", title: "ADHD", oneLine: "Attention regulation support." },
  { id: "asd", title: "Autism Spectrum Disorder (ASD)", oneLine: "Predictability + reduced overload." },
  { id: "dyslexia", title: "Dyslexia", oneLine: "Readable type + reduced visual stress." },
  { id: "dyscalculia", title: "Dyscalculia", oneLine: "Reduces numeric overload + sequencing strain." },
  { id: "dyspraxia-dcd", title: "Dyspraxia / DCD", oneLine: "Bigger targets + fewer precision clicks." },
  { id: "tourette-tics", title: "Tourette / Tic Disorders", oneLine: "Low-surprise UI and stable rhythm." },
  { id: "ocd", title: "OCD", oneLine: "Structure, symmetry, certainty cues." },
  { id: "ptsd", title: "PTSD", oneLine: "Calm palette + reduced triggers." },
  { id: "anxiety", title: "Anxiety Disorders", oneLine: "Low stimulation + reduced decision fatigue." },
  { id: "bipolar", title: "Bipolar Disorder", oneLine: "Consistency cues + reduced extremes." },
  { id: "sensory-processing", title: "Sensory Processing Differences", oneLine: "Lower sensory load and glare." },
  { id: "tbi", title: "Traumatic Brain Injury (TBI)", oneLine: "Lower cognitive load + simplified flow." },
  { id: "apd-capd", title: "Auditory Processing Disorder (APD/CAPD)", oneLine: "Caption-first + visual guidance." },
  { id: "visual-processing", title: "Visual Processing Disorder", oneLine: "Figure-ground clarity + reduced clutter." },
  { id: "executive-function", title: "Executive Function Impairment", oneLine: "Step-by-step flow + fewer choices." },
  { id: "schizophrenia", title: "Schizophrenia Spectrum", oneLine: "Reality-testing cues + stable grounding UI." },
  { id: "depression", title: "Depressive Disorders", oneLine: "Low-friction flow + gentle motivational cues." },
  { id: "fetal-alcohol", title: "Fetal Alcohol Spectrum (FASD)", oneLine: "Concrete visual cues + simplified sequencing." },
  { id: "intellectual-disability", title: "Intellectual Disability", oneLine: "Icon-first + simplified decision trees." },
  { id: "misophonia", title: "Misophonia", oneLine: "Visual-only feedback + silent interaction model." },
];
