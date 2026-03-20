// Function for Evaluating the Security Notification
// Generates a Numerical Value for Clarity, Motivation, Tone, Instruction, Decision, & Trust Based on Design Elements
// Currently Nothing Reduces Scores
function evaluateNotification(state) {
  const clamp = (v) => Math.min(100, Math.max(0, v));
  const messageLengthBoost = state.message.length > 50 ? 10 : 0;

  const clarity = clamp(
    55 +
      messageLengthBoost +
      (state.steps ? 8 : 0) +
      (state.explainVuln ? 10 : 0) +
      (state.explain ? 10 : 0),
  );

  const motivation = clamp(
    60 +
      (state.motivation === "risk_avoidance" ? 15 : 8) +
      (state.consequences ? 5 : 0),
  );

  const tone = clamp(
    45 + 
      (state.aiTone ? 18 : 0) + 
      (state.message.length > 20 ? 5 : 0),
  );

  const instruction = clamp(
    45 +
      (state.steps ? 15 : 0) +
      (state.action ? 10 : 0) +
      (state.time ? 5 : 0) +
      (state.background ? 8 : 0),
  );

  const decision = clamp(
    35 +
      (state.decision ? 20 : 0) +
      (state.preferredDecision ? 20 : 0) +
      (state.background ? 10 : 0),
  );

  const trust = clamp(
    40 +
      (state.transparency ? 20 : 0) +
      (state.consequences ? 8 : 0) +
      (state.explainVuln ? 8 : 0),
  );

  const scores = {
    clarity,
    motivation,
    tone,
    instruction,
    decision,
    trust,
  };

  return {
    scores,
    suggestions: buildSuggestions(state),
    aiToneText: buildAiToneText(state),
  };
}

// Function for Generating Suggestions Based on the Notification Design Aspects (State)
// This Justifies Design Elements that are Toggled Off, ex: Step-by-step instructions, Direct action button, etc. & General Mismatches of Tones
function buildSuggestions(state) {
  const suggestions = [];

  // Instruction Design Suggestions
  if (!state.steps)
    suggestions.push(
      "Include step-by-step instructions to strengthen clarity and guidance.",
    );

  if (!state.action)
    suggestions.push(
      "Provide a direct action button for immediate response."
    );

  if (!state.explainVuln)
    suggestions.push(
      "Add a vulnerability explanation hover pop-up to strengthen clarity of information.",
    );
    
  if (!state.explain)
    suggestions.push(
      "Add a risk explanation hover pop-up to improve risk communication and user understanding.",
    );

  if (!state.background)
    suggestions.push(
      "Provide context and background about the risk so the user has better decision support.",
    );

  if (!state.time)
    suggestions.push(
      "Add a time estimate to reduce perceived burden."
    );
  
  if (!state.transparency)
    suggestions.push(
      "Explain why the notification appeared to improve transparency, trust, and legitimacy.",
    );

  if (!state.consequences)
    suggestions.push(
      "Mention consequences if ignored to improve motivation and risk communication.",
    );

  if (!state.decision)
    suggestions.push(
      "Provide decision support links to guide next steps."
    );

  if (!state.preferredDecision)
    suggestions.push(
      "Highlight the preferred option to encourage compliance."
    );

  if (!state.aiTone)
    suggestions.push(
      "Enable AI tone review so the framework guidance can flag overly harsh or unclear messaging.",
    );

  // Interaction, Workflow, & Agency Suggestions
  if (state.interaction === "click_box")
    suggestions.push(
      "Interaction mode: Click boxes are easy to dismiss without reading. Consider using a Sliding Bar or Toggle instead for a more deliberate decision.",
    );

  // Schedule Suggestions
  if (!state.schedule)
    suggestions.push(
      "Add deployment scheduling controls to better manage notification frequency.",
    );

  if (state.schedule && !state.bootup && !state.duringTask)
    suggestions.push(
      "Choose when users should see the notification, such as on bootup or during the relevant task.",
    );

  // Urgency, Location, & Agency Mismatch Suggestions
  // TODO Modify Urgency to Reflect Non-Slider
  if (state.location === "banner" && state.urgency === "high")
    suggestions.push(
      "Location mismatch: This notification is high urgency but a banner is easy to miss. Consider a Pop-up or Modal.",
    );

  if ((state.location === "popup" || state.location === "modal") && state.urgency === "low")
    suggestions.push(
      "Location mismatch: Pop-ups and Modals should usually be reserved for high urgency notifications. Consider a Banner or Inline placement instead.",
    );
  
  if (state.urgency === "high" && state.agency === "not_urgent")
    suggestions.push(
      "User agency mismatch: A high urgency notification should not default to Not urgent.",
    );
  
  if (state.urgency === "low" && state.agency === "must_do")
    suggestions.push(
      "User agency mismatch: A low urgency notification may feel too forceful if the user must act immediately.",
    );

  // Message Length Suggestion
  if (state.message.length < 35) {
    suggestions.push(
      "Increase message clarity by providing a higher level of detail, such as the risk and likely consequence.",
    );
  }

  // No Suggestions Default
  if (suggestions.length === 0) {
    suggestions.push("Looks balanced. Consider A/B testing for optimization.");
  }

  return suggestions;
}

// Method to build an AI Tone Review
// TODO
function buildAiToneText(state) {
  if (!state.aiTone) {
    return "Enable AI tone review to simulate a framework-level tone check.";
  }

  const msg = (state.message || "").toLowerCase();
  const harshTerms = [
    "immediately",
    "failure",
    "warning",
    "critical",
    "violation",
    "must",
  ];
  const harshCount = harshTerms.filter((term) => msg.includes(term)).length;

  if (harshCount >= 3) {
    return "AI tone review: The wording may feel too forceful. Consider softer guidance with clear reasons and actionable next steps.";
  }
  if (state.message.length < 25) {
    return "AI tone review: The message may be too short to feel informative or trustworthy. Add context and guidance.";
  }
  return "AI tone review: Tone appears constructive and action-oriented. The message likely supports compliance without sounding overly punitive.";
}
