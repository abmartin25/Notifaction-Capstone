// Function for Evaluating the Security Notification
// Generates a Numerical Value for Clarity, Motivation, Tone, Instruction, Decision, & Trust Based on Design Elements
// Currently Nothing Reduces Scores
function evaluateNotification(state) {
  const clamp = (v) => Math.min(100, Math.max(0, v));
  const messageLengthBoost = state.message.length > 50 ? 10 : 0;

  const clarity = clamp(
    55 +
      messageLengthBoost +
      (state.instructionSteps ? 8 : 0) +
      (state.explainVuln ? 10 : 0) +
      (state.explainRisk ? 10 : 0),
  );

  const motivation = clamp(
    60 +
      (state.motivation === "risk_avoidance" ? 15 : 8) +
      (state.consequences ? 5 : 0),
  );

  const tone = clamp(
    45 + (state.aiTone ? 18 : 0) + (state.message.length > 20 ? 5 : 0),
  );

  const instruction = clamp(
    45 +
      (state.instructionSteps ? 15 : 0) +
      (state.directAction ? 10 : 0) +
      (state.timeEst ? 5 : 0) +
      (state.contextBackground ? 8 : 0),
  );

  const decision = clamp(
    35 +
      (state.supportLinks ? 20 : 0) +
      (state.preferredDecision ? 20 : 0) +
      (state.contextBackground ? 10 : 0),
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
  if (!state.instructionSteps)
    suggestions.push(
      "Include step-by-step instructions to strengthen clarity and guidance.",
    );

  if (!state.directAction)
    suggestions.push("Provide a direct action button for immediate response.");

  if (!state.explainVuln)
    suggestions.push(
      "Add a vulnerability explanation hover pop-up to strengthen clarity of information.",
    );

  if (!state.explainRisk)
    suggestions.push(
      "Add a risk explanation hover pop-up to improve risk communication and user understanding.",
    );

  if (!state.contextBackground)
    suggestions.push(
      "Provide context and background about the risk so the user has better decision support.",
    );

  if (!state.timeEst)
    suggestions.push("Add a time estimate to reduce perceived burden.");

  if (!state.transparency)
    suggestions.push(
      "Explain why the notification appeared to improve transparency, trust, and legitimacy.",
    );

  if (!state.consequences)
    suggestions.push(
      "Mention consequences if ignored to improve motivation and risk communication.",
    );

  if (!state.supportLinks)
    suggestions.push("Provide decision support links to guide next steps.");

  if (!state.preferredDecision)
    suggestions.push("Highlight the preferred option to encourage compliance.");

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

  if (state.schedule && !state.showOnBootup && !state.showDuringTask)
    suggestions.push(
      "Choose when users should see the notification, such as on bootup or during the relevant task.",
    );

  // Urgency, Location, & Agency Mismatch Suggestions
  // TODO Modify Urgency to Reflect Non-Slider
  if (state.location === "banner" && state.urgency === "high")
    suggestions.push(
      "Location mismatch: This notification is high urgency but a banner is easy to miss. Consider a Pop-up or Modal.",
    );

  if (
    (state.location === "popup" || state.location === "modal") &&
    state.urgency === "low"
  )
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

function buildAiToneText(state) {
  if (!state.aiTone) {
    return "Enable AI tone review to simulate a framework-level tone check.";
  }

  const rawMessage = state.message || "";
  const msg = rawMessage.trim();
  const lowerMsg = msg.toLowerCase();

  if (!msg) {
    return "AI tone review: No notification message has been written yet, so tone cannot be evaluated.";
  }

  const harshTerms = [
    "immediately",
    "failure",
    "warning",
    "critical",
    "violation",
    "must",
    "urgent action required",
    "breach",
    "compromised",
    "unsafe",
    "danger",
    "penalty",
  ];

  const supportiveTerms = [
    "please",
    "recommend",
    "suggest",
    "to protect",
    "to help",
    "review",
    "update",
    "check",
    "you can",
  ];

  const technicalTerms = [
    "vulnerability",
    "authentication",
    "credential",
    "token",
    "compromise",
    "exploit",
    "malicious",
    "session",
    "configuration",
    "privilege",
  ];

  const harshCount = harshTerms.filter((term) =>
    lowerMsg.includes(term),
  ).length;
  const supportiveCount = supportiveTerms.filter((term) =>
    lowerMsg.includes(term),
  ).length;
  const technicalCount = technicalTerms.filter((term) =>
    lowerMsg.includes(term),
  ).length;

  const notes = [];

  if (msg.length < 25) {
    notes.push(
      "The message is very short and may not feel informative enough.",
    );
  } else if (msg.length < 45) {
    notes.push(
      "The message could use slightly more context to feel clearer and more trustworthy.",
    );
  }

  if (harshCount >= 3) {
    notes.push("The wording may feel overly forceful or alarm-heavy.");
  } else if (harshCount >= 1 && supportiveCount === 0) {
    notes.push("The tone may feel strict without enough supportive guidance.");
  }

  if (supportiveCount === 0) {
    notes.push(
      "Consider adding more constructive action language, such as what the user should do next.",
    );
  }

  if (
    (state.userGroup || "").toLowerCase() === "general user" &&
    technicalCount >= 2
  ) {
    notes.push("The wording may be too technical for a general user audience.");
  }

  if (!/[.!?]$/.test(msg)) {
    notes.push(
      "Ending the message with cleaner sentence punctuation may make it read more naturally.",
    );
  }

  if (
    !/(update|review|check|change|verify|clear|restart|open|enable|disable)/i.test(
      msg,
    )
  ) {
    notes.push("The message does not clearly communicate the next action.");
  }

  if (state.urgency === "low" && harshCount >= 2) {
    notes.push(
      "The tone feels stronger than the selected low-urgency setting.",
    );
  }

  if (state.urgency === "high" && supportiveCount > 0 && harshCount === 0) {
    notes.push(
      "The tone is supportive, but for a high-urgency alert you may want slightly firmer wording.",
    );
  }

  if (notes.length === 0) {
    return "AI tone review: Tone appears balanced, constructive, and appropriate for the selected notification style.";
  }

  if (notes.length === 1) {
    return `AI tone review: ${notes[0]}`;
  }

  return `AI tone review: ${notes.join(" ")}`;
}
