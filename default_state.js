// Stores the Default State for Notifications
const defaultState = {
  title: "",
  message: "",
  context: "",
  userGroup: "",
  motivation: "risk_avoidance",
  instructionSteps: true,
  directAction: true,
  explainVuln: true,
  explainRisk: true,
  contextBackground: true,
  timeEst: true,
  transparency: true,
  consequences: true,
  supportLinks: true,
  preferredDecision: true,
  aiTone: true,
  urgency: "low",
  interaction: "click_box",
  location: "banner",
  agency: "must_do",
  schedule: false,
  deployDate: "",
  deployHour: "09:00",
  deployWindow: "",
  showOnBootup: false,
  showDuringTask: false,

  customSteps: "",
  customVulnerability: "",
  customRisk: "",
  customContext: "",
  customConsequences: "",
  customTransparency: "",
  customLinks: "",
};

function modifyDefaultState(...modifications) {
  Object.assign(defaultState, ...modifications);
}

function getDefaultState() {
    return { ...defaultState };
}

// For current testing purposes
export { defaultState, modifyDefaultState, getDefaultState };
