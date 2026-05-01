// Stores the Default State for Notifications
const defaultState = {
  title: "",
  message: "",
  context: "",
  userGroup: "",
  motivation: "risk_avoidance",
  instructionSteps: false,
  directAction: false,
  explainVuln: false,
  explainRisk: false,
  contextBackground: false,
  timeEst: false,
  transparency: false,
  consequences: false,
  supportLinks: false,
  preferredDecision: false,
  aiTone: false,
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
  customVuln: "",
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
