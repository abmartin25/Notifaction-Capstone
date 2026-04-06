const closeBtn = document.getElementById("closeNotificationBtn");

closeBtn.addEventListener("click", () => {
  window.close();
});

function wireTooltip(triggerId, tooltipId) {
  const trigger = document.getElementById(triggerId);
  const tooltip = document.getElementById(tooltipId);

  if (!trigger || !tooltip) return;

  trigger.addEventListener("mouseenter", () => {
    tooltip.style.display = "block";
  });

  trigger.addEventListener("mouseleave", () => {
    tooltip.style.display = "none";
  });
}

function parseCustomLinks(raw) {
  return (raw || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      if (parts.length < 2) return null;

      return {
        label: parts[0].trim(),
        url: parts.slice(1).join("|").trim(),
      };
    })
    .filter(Boolean);
}

function getInstructionSteps(state) {
  if ((state.customSteps || "").trim()) {
    return state.customSteps
      .split("\n")
      .map((step) => step.trim())
      .filter(Boolean);
  }

  const map = {
    weak_password: [
      "Open your account security settings.",
      "Choose a new password that is unique.",
      "Save the change and sign in again if prompted.",
    ],
    suspicious_login: [
      "Review the recent login attempt.",
      "Change your password if the activity was not you.",
      "Enable extra account protection if available.",
    ],
    cache_clear: [
      "Open your browser settings.",
      "Go to privacy or history options.",
      "Clear cached data for the recent session.",
    ],
    software_update: [
      "Open system or application update settings.",
      "Review the available update.",
      "Install the update and restart if required.",
    ],
  };

  return (
    map[state.context] || [
      "Review the notification details.",
      "Take the recommended action.",
      "Confirm the issue is resolved.",
    ]
  );
}

function getVulnerabilityExplanation(state) {
  if ((state.customVulnerability || "").trim()) {
    return state.customVulnerability.trim();
  }

  const map = {
    weak_password:
      "A weak password is easier for attackers to guess or crack, especially if it has been reused or exposed before.",
    suspicious_login:
      "A suspicious login may indicate that someone else is attempting to access your account from an unfamiliar device or location.",
    cache_clear:
      "Stored browser cache can retain sensitive content, which may be accessible later on a shared or exposed device.",
    software_update:
      "Outdated software may contain known weaknesses that attackers can exploit if updates are not installed.",
  };

  return (
    map[state.context] ||
    "A security weakness was detected that may increase exposure if it is not addressed."
  );
}

function getRiskExplanation(state) {
  if ((state.customRisk || "").trim()) {
    return state.customRisk.trim();
  }

  const map = {
    weak_password:
      "If this password is reused or easily guessed, your account may be more likely to be accessed by someone else.",
    suspicious_login:
      "If the login was unauthorized, your account or personal data could be exposed or changed.",
    cache_clear:
      "Leaving cached content behind may allow sensitive information to remain accessible after the task ends.",
    software_update:
      "Delaying updates can leave your system exposed to known security issues that have already been fixed.",
  };

  return (
    map[state.context] ||
    "Ignoring this issue could increase the chance of account, data, or system exposure."
  );
}

function getContextBackground(state) {
  if ((state.customContext || "").trim()) {
    return state.customContext.trim();
  }

  const map = {
    weak_password:
      "Passwords are often targeted through reuse, guessing, and breach exposure. Stronger passwords reduce that risk.",
    suspicious_login:
      "Login activity from unusual devices or locations can be a sign that account access should be reviewed quickly.",
    cache_clear:
      "Cached browser data may improve convenience, but it can also preserve sensitive material longer than intended.",
    software_update:
      "Security updates are released to correct known weaknesses and reduce exposure over time.",
  };

  return (
    map[state.context] ||
    "This issue relates to a broader security risk that may affect account safety, device protection, or data exposure."
  );
}

function getConsequencesText(state) {
  if ((state.customConsequences || "").trim()) {
    return state.customConsequences.trim();
  }

  const map = {
    weak_password: "If ignored, the account may remain easier to compromise.",
    suspicious_login:
      "If ignored, unauthorized access may continue without being reviewed.",
    cache_clear:
      "If ignored, sensitive content may remain stored on the device.",
    software_update:
      "If ignored, the system may remain exposed to known issues.",
  };

  return (
    map[state.context] ||
    "If ignored, the issue may continue to increase security exposure."
  );
}

function getTransparencyText(state) {
  if ((state.customTransparency || "").trim()) {
    return state.customTransparency.trim();
  }

  const map = {
    weak_password:
      "Why you are seeing this: your password was identified as weak or potentially exposed.",
    suspicious_login:
      "Why you are seeing this: a recent login attempt looked unusual for this account.",
    cache_clear:
      "Why you are seeing this: this task may leave sensitive browser data stored on the device.",
    software_update:
      "Why you are seeing this: an available update addresses security-related issues.",
  };

  return (
    map[state.context] ||
    "Why you are seeing this: the system detected a security-relevant event."
  );
}

function getSupportLinks(state) {
  if ((state.customLinks || "").trim()) {
    return parseCustomLinks(state.customLinks);
  }

  const map = {
    weak_password: [
      { label: "Password Help", url: "#" },
      { label: "Account Security", url: "#" },
    ],
    suspicious_login: [
      { label: "Review Login Activity", url: "#" },
      { label: "Secure Account", url: "#" },
    ],
    cache_clear: [
      { label: "Browser Privacy Help", url: "#" },
      { label: "Clear Cached Data", url: "#" },
    ],
    software_update: [
      { label: "Update Instructions", url: "#" },
      { label: "Release Notes", url: "#" },
    ],
  };

  return (
    map[state.context] || [
      { label: "Help Article", url: "#" },
      { label: "Learn More", url: "#" },
    ]
  );
}

function setBadge(urgency) {
  const badge = document.getElementById("badge");
  badge.className = `badge ${urgency}`;
  badge.textContent = urgency === "low" ? "i" : urgency === "med" ? "!" : "⚠";
}

function setInteractionMode(mode) {
  const clickBox = document.getElementById("ntInteraction_click_box");
  const slider = document.getElementById("ntInteraction_slider");
  const toggle = document.getElementById("ntInteraction_toggle");

  clickBox.style.display = mode === "click_box" ? "flex" : "none";
  slider.style.display = mode === "slider" ? "block" : "none";
  toggle.style.display = mode === "toggle" ? "block" : "none";
}

function setClickBoxState(choice) {
  const primaryBtn = document.getElementById("ntPrimaryBtn");
  const remindBtn = document.getElementById("ntRemindBtn");
  const denyBtn = document.getElementById("ntDenyBtn");

  primaryBtn.classList.toggle("primary", choice === "allow" || choice === null);

  remindBtn.classList.toggle("primary", choice === "remind");
  remindBtn.classList.toggle("secondary-accent", choice !== "remind");

  denyBtn.classList.toggle("selected-deny", choice === "deny");
}

function setClickBoxBehavior() {
  const primaryBtn = document.getElementById("ntPrimaryBtn");
  const remindBtn = document.getElementById("ntRemindBtn");
  const denyBtn = document.getElementById("ntDenyBtn");

  let choice = null;

  primaryBtn.addEventListener("click", () => {
    choice = choice === "allow" ? null : "allow";
    setClickBoxState(choice);
  });

  remindBtn.addEventListener("click", () => {
    choice = choice === "remind" ? null : "remind";
    setClickBoxState(choice);
  });

  denyBtn.addEventListener("click", () => {
    choice = choice === "deny" ? null : "deny";
    setClickBoxState(choice);
  });
}

function setSliderBehavior() {
  const slider = document.getElementById("ntSlider");
  const label = document.getElementById("ntSliderLabel");

  slider.addEventListener("input", () => {
    label.textContent = slider.value === "0" ? "Allow" : "Don't Allow";
    label.style.color =
      slider.value === "0" ? "var(--primary)" : "var(--muted)";
  });
}

function setToggleVisuals() {
  const allowShell = document.getElementById("ntToggleAllowShell");
  const denyShell = document.getElementById("ntToggleDenyShell");

  let allowOn = false;
  let denyOn = false;

  allowShell.addEventListener("click", () => {
    allowOn = !allowOn;
    if (allowOn) denyOn = false;

    allowShell.classList.toggle("toggle-on-primary", allowOn);
    denyShell.classList.remove("toggle-on-danger");
  });

  denyShell.addEventListener("click", () => {
    denyOn = !denyOn;
    if (denyOn) allowOn = false;

    denyShell.classList.toggle("toggle-on-danger", denyOn);
    allowShell.classList.remove("toggle-on-primary");
  });
}

function setActionButtonsByAgency(state) {
  const primaryBtn = document.getElementById("ntPrimaryBtn");
  const remindBtn = document.getElementById("ntRemindBtn");
  const denyBtn = document.getElementById("ntDenyBtn");

  primaryBtn.style.display = "inline-flex";
  remindBtn.style.display = "none";
  denyBtn.style.display = "none";

  if (state.agency === "remind_later") {
    remindBtn.style.display = "inline-flex";
  } else if (state.agency === "not_urgent") {
    remindBtn.style.display = "inline-flex";
    denyBtn.style.display = "inline-flex";
  }
}

function setHint(state) {
  const hintParts = [];
  if (state.timeEst) hintParts.push("Includes time estimate");
  if (state.instructionSteps) hintParts.push("Step-by-step guidance enabled");
  if (state.contextBackground) hintParts.push("Risk background included");

  document.getElementById("ntHint").textContent = hintParts.join(" • ");
}

function setTooltips(state) {
  const vulnWrap = document.getElementById("ntVulnWrap");
  const riskWrap = document.getElementById("ntRiskWrap");
  const vulnTooltip = document.getElementById("ntVulnTooltip");
  const riskTooltip = document.getElementById("ntRiskTooltip");

  if (state.explainVuln) {
    vulnWrap.style.display = "block";
    vulnTooltip.textContent = getVulnerabilityExplanation(state);
  } else {
    vulnWrap.style.display = "none";
    vulnTooltip.textContent = "";
  }

  if (state.explainRisk) {
    riskWrap.style.display = "block";
    riskTooltip.textContent = getRiskExplanation(state);
  } else {
    riskWrap.style.display = "none";
    riskTooltip.textContent = "";
  }
}

function setTransparency(state) {
  const wrap = document.getElementById("ntTransparency");

  if (!state.transparency) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getTransparencyText(state);
}

function setContextBackground(state) {
  const wrap = document.getElementById("ntContextWrap");

  if (!state.contextBackground) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getContextBackground(state);
}

function setConsequences(state) {
  const wrap = document.getElementById("ntConsequencesWrap");

  if (!state.consequences) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getConsequencesText(state);
}

function setInstructionSteps(state) {
  const wrap = document.getElementById("ntStepsWrap");
  const list = document.getElementById("ntStepsList");

  if (!state.instructionSteps) {
    wrap.style.display = "none";
    list.innerHTML = "";
    return;
  }

  wrap.style.display = "block";
  const steps = getInstructionSteps(state);
  list.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
}

function setSupportLinks(state) {
  const wrap = document.getElementById("ntSupportLinksWrap");

  if (!state.supportLinks) {
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  const links = getSupportLinks(state);
  wrap.style.display = "flex";
  wrap.innerHTML = links
    .map(
      (link) =>
        `<a class="mini neutral-accent" href="${link.url}" target="_blank" rel="noopener noreferrer">${link.label}</a>`,
    )
    .join("");
}

function applyNotificationState(state) {
  document.getElementById("ntTitle").textContent =
    state.title || "Security alert";

  document.getElementById("ntMsg").textContent =
    state.message || "Notification message will appear here.";

  document.getElementById("ntMeta").textContent =
    `${state.userGroup || "User group"} • ${state.context || "Security context"}`;

  setBadge(state.urgency || "low");
  setInteractionMode(state.interaction || "click_box");
  setActionButtonsByAgency(state);
  setHint(state);
  setTooltips(state);
  setTransparency(state);
  setContextBackground(state);
  setConsequences(state);
  setInstructionSteps(state);
  setSupportLinks(state);
}

wireTooltip("ntVulnTrigger", "ntVulnTooltip");
wireTooltip("ntRiskTrigger", "ntRiskTooltip");
setSliderBehavior();
setToggleVisuals();
setClickBoxBehavior();

if (window.electronAPI?.onNotificationData) {
  window.electronAPI.onNotificationData((data) => {
    applyNotificationState(data);
  });
}
