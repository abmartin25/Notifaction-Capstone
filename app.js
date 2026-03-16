const state = {
  title: "",
  message: "",
  context: "",
  userGroup: "",
  motivation: "risk_avoidance",
  steps: true,
  action: true,
  explainVuln: true,
  explain: true,
  background: true,
  time: false,
  transparency: false,
  consequences: false,
  decision: false,
  preferredDecision: false,
  aiTone: false,
  urgency: 55,
  interaction: "click_box",
  location: "banner",
  agency: "must_do",
  schedule: false,
  deployDate: "",
  deployHour: "09:00",
  deployWindow: "",
  bootup: false,
  duringTask: true,
};

const refs = {
  titleInput: document.getElementById("titleInput"),
  msgInput: document.getElementById("msgInput"),
  contextSelect: document.getElementById("context"),
  userGroupSelect: document.getElementById("userGroup"),
  motivationSeg: document.getElementById("motivationSeg"),
  urgencyInput: document.getElementById("urgency"),
  userGroupCustomWrap: document.getElementById("userGroupCustomWrap"),
  userGroupCustom: document.getElementById("userGroupCustom"),
  contextCustomWrap: document.getElementById("contextCustomWrap"),
  contextCustom: document.getElementById("contextCustom"),
  scheduleWrap: document.getElementById("scheduleWrap"),
};

function setupDropdowns() {
  refs.userGroupSelect.addEventListener("change", (e) => {
    const isCustom = e.target.value === "__custom__";
    refs.userGroupCustomWrap.classList.toggle("hidden", !isCustom);
    state.userGroup = isCustom ? "" : e.target.value;
    if (isCustom) refs.userGroupCustom.focus();
    render();
  });

  refs.userGroupCustom.addEventListener("input", (e) => {
    state.userGroup = e.target.value.trim();
    render();
  });

  refs.contextSelect.addEventListener("change", (e) => {
    const isCustom = e.target.value === "__custom__";
    refs.contextCustomWrap.classList.toggle("hidden", !isCustom);
    state.context = isCustom ? "" : e.target.value;
    if (isCustom) refs.contextCustom.focus();
    render();
  });

  refs.contextCustom.addEventListener("input", (e) => {
    state.context = e.target.value.trim();
    render();
  });
}

function setupInputs() {
  refs.titleInput.addEventListener("input", (e) => {
    state.title = e.target.value;
    render();
  });

  refs.msgInput.addEventListener("input", (e) => {
    state.message = e.target.value;
    render();
  });

  refs.urgencyInput.addEventListener("input", (e) => {
    state.urgency = parseInt(e.target.value, 10);
    render();
  });

  const checkboxMappings = [
    ["ckSteps", "steps"],
    ["ckAction", "action"],
    ["ckExplainVuln", "explainVuln"],
    ["ckExplain", "explain"],
    ["ckBackground", "background"],
    ["ckTime", "time"],
    ["ckTransparency", "transparency"],
    ["ckConsequences", "consequences"],
    ["ckDecision", "decision"],
    ["ckPreferredDecision", "preferredDecision"],
    ["ckAiTone", "aiTone"],
    ["ckSchedule", "schedule"],
    ["ckBootup", "bootup"],
    ["ckDuringTask", "duringTask"],
  ];

  checkboxMappings.forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", (e) => {
      state[key] = e.target.checked;
      if (key === "schedule") {
        refs.scheduleWrap.classList.toggle("hidden", !state.schedule);
      }
      render();
    });
  });

  document.getElementById("deployDate").addEventListener("input", (e) => {
    state.deployDate = e.target.value;
    render();
  });
  document.getElementById("deployHour").addEventListener("input", (e) => {
    state.deployHour = e.target.value;
    render();
  });
  document.getElementById("deployWindow").addEventListener("input", (e) => {
    state.deployWindow = e.target.value;
    render();
  });
}

function setupSegmentedControls() {
  setupSegmentGroup("motivationSeg", "m", "motivation");
  setupSegmentGroup("interactionSeg", "i", "interaction");
  setupSegmentGroup("agencySeg", "a", "agency");

  const locationDescs = {
    banner: "Appears at the top or bottom of the screen; non-blocking.",
    popup: "Appears in the center of the screen; requires user interaction.",
    inline: "Appears within the page content; contextual and subtle.",
    modal: "Overlays the full screen; blocks all other interaction.",
  };

  const locationSeg = document.getElementById("locationSeg");
  locationSeg.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      locationSeg
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("on"));
      button.classList.add("on");
      state.location = button.dataset.l;
      document.getElementById("locationDesc").textContent =
        locationDescs[button.dataset.l] || "";
      render();
    });
  });
}

function setupSegmentGroup(containerId, datasetKey, stateKey) {
  const container = document.getElementById(containerId);
  container.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      container
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("on"));
      button.classList.add("on");
      state[stateKey] = button.dataset[datasetKey];
      render();
    });
  });
}

function setupNavigation() {
  document.querySelectorAll(".nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll("main > section")
        .forEach((sec) => sec.classList.add("hidden"));
      document.getElementById(btn.dataset.route).classList.remove("hidden");
      document
        .querySelectorAll(".nav button")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  document
    .getElementById("backDash")
    .addEventListener("click", () => showSection("dashboard"));
  document
    .getElementById("backDash2")
    .addEventListener("click", () => showSection("dashboard"));
  document
    .getElementById("goCreate")
    .addEventListener("click", () => showSection("builder"));
  document.getElementById("goExport").addEventListener("click", () => {
    showSection("export");
    renderCode();
  });
  document.getElementById("goExport2").addEventListener("click", () => {
    showSection("export");
    renderCode();
  });
}

function showSection(sectionId) {
  document
    .querySelectorAll("main > section")
    .forEach((sec) => sec.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
  document
    .querySelectorAll(".nav button")
    .forEach((b) => b.classList.remove("active"));
  const activeNav = document.querySelector(
    `.nav button[data-route="${sectionId}"]`,
  );
  if (activeNav) activeNav.classList.add("active");
}

function setupPreviewInteractions() {
  const primaryBtn = document.getElementById("primaryBtn");
  const denyBtn = document.getElementById("denyBtn");
  let clickChoice = null;

  primaryBtn.addEventListener("click", () => {
    clickChoice = clickChoice === "allow" ? null : "allow";
    updateClickBoxState(primaryBtn, denyBtn, clickChoice);
  });

  denyBtn.addEventListener("click", () => {
    clickChoice = clickChoice === "deny" ? null : "deny";
    updateClickBoxState(primaryBtn, denyBtn, clickChoice);
  });

  const pvToggleAllow = document.getElementById("pvToggleAllow");
  const pvToggleDeny = document.getElementById("pvToggleDeny");
  const pvToggleAllowTrack = document.getElementById("pvToggleAllowTrack");
  const pvToggleAllowThumb = document.getElementById("pvToggleAllowThumb");
  const pvToggleDenyTrack = document.getElementById("pvToggleDenyTrack");
  const pvToggleDenyThumb = document.getElementById("pvToggleDenyThumb");

  pvToggleAllow.addEventListener("change", () => {
    if (pvToggleAllow.checked) {
      pvToggleDeny.checked = false;
      applyToggleVisual(
        pvToggleDeny,
        pvToggleDenyTrack,
        pvToggleDenyThumb,
        "var(--danger)",
      );
    }
    applyToggleVisual(
      pvToggleAllow,
      pvToggleAllowTrack,
      pvToggleAllowThumb,
      "var(--primary)",
    );
  });

  pvToggleDeny.addEventListener("change", () => {
    if (pvToggleDeny.checked) {
      pvToggleAllow.checked = false;
      applyToggleVisual(
        pvToggleAllow,
        pvToggleAllowTrack,
        pvToggleAllowThumb,
        "var(--primary)",
      );
    }
    applyToggleVisual(
      pvToggleDeny,
      pvToggleDenyTrack,
      pvToggleDenyThumb,
      "var(--danger)",
    );
  });

  wireTooltip("pvVulnTrigger", "pvVulnTooltip");
  wireTooltip("pvRiskTrigger", "pvRiskTooltip");
}

function updateClickBoxState(primaryBtn, denyBtn, clickChoice) {
  const isAllow = clickChoice === "allow" || clickChoice === null;
  primaryBtn.classList.toggle("primary", isAllow);
  primaryBtn.classList.toggle("selected-deny", false);
  denyBtn.classList.toggle("selected-deny", clickChoice === "deny");
  denyBtn.classList.toggle("primary", false);
}

function applyToggleVisual(checkbox, track, thumb, color) {
  track.style.background = checkbox.checked ? color : "#d1d5db";
  thumb.style.transform = checkbox.checked
    ? "translateX(18px)"
    : "translateX(0)";
}

function wireTooltip(triggerId, tooltipId) {
  const trigger = document.getElementById(triggerId);
  const tooltip = document.getElementById(tooltipId);
  if (!trigger._wired) {
    trigger._wired = true;
    trigger.addEventListener("mouseenter", () => {
      tooltip.style.display = "block";
    });
    trigger.addEventListener("mouseleave", () => {
      tooltip.style.display = "none";
    });
  }
}

function render() {
  document.getElementById("pvTitle").textContent =
    state.title || "Notification title";
  document.getElementById("pvMsg").textContent =
    state.message || "Notification message will appear here.";
  document.getElementById("pvMeta").textContent =
    `${state.userGroup || "User group"} • ${state.context || "Security context"}`;

  const level =
    state.urgency < 35 ? "low" : state.urgency < 70 ? "med" : "high";
  const badge = document.getElementById("badge");
  badge.className = `badge ${level}`;
  badge.textContent = level === "low" ? "i" : level === "med" ? "!" : "⚠";

  syncSliderPreview();
  syncTooltipVisibility();
  syncHint();
  syncInfoStrip();
  syncAgencyPreview();
  syncInteractionPreview();
  syncGuidance();
}

function syncSliderPreview() {
  const pvSlider = document.getElementById("pvSlider");
  if (pvSlider && !pvSlider._wired) {
    pvSlider._wired = true;
    pvSlider.addEventListener("input", () => {
      const label = document.getElementById("pvSliderLabel");
      label.textContent = pvSlider.value === "0" ? "Allow" : "Don't Allow";
      label.style.color =
        pvSlider.value === "0" ? "var(--primary)" : "var(--muted)";
    });
  }
}

function syncTooltipVisibility() {
  document.getElementById("pvVulnWrap").style.display = state.explainVuln
    ? "block"
    : "none";
  document.getElementById("pvRiskWrap").style.display = state.explain
    ? "block"
    : "none";
}

function syncHint() {
  const hintParts = [];
  if (state.time) hintParts.push("Includes time estimate");
  if (state.steps) hintParts.push("Step-by-step guidance enabled");
  if (state.background) hintParts.push("Risk background included");
  if (state.transparency) hintParts.push("Why this appeared is explained");
  document.getElementById("pvHint").textContent = hintParts.join(" • ");
}

function syncInfoStrip() {
  const infoStrip = document.getElementById("pvInfoStrip");
  const pills = [];
  if (state.consequences) pills.push("Consequences shown");
  if (state.preferredDecision) pills.push("Preferred choice highlighted");
  if (state.schedule && state.deployDate)
    pills.push(`Deploy ${state.deployDate}`);
  if (state.schedule && state.deployWindow)
    pills.push(`Window ${state.deployWindow}`);
  if (state.schedule && state.bootup) pills.push("Shown on bootup");
  if (state.schedule && state.duringTask) pills.push("Shown during task");
  infoStrip.innerHTML = pills
    .map((pill) => `<span class="pill">${pill}</span>`)
    .join("");
}

function syncAgencyPreview() {
  const mainBtn = document.getElementById("agencyMainBtn");
  const secondaryBtn = document.getElementById("agencySecondaryBtn");
  const tertiaryBtn = document.getElementById("agencyTertiaryBtn");

  mainBtn.textContent =
    state.agency === "must_do"
      ? "Have to"
      : state.agency === "remind_later"
        ? "Remind me later"
        : "Not urgent";

  secondaryBtn.style.display =
    state.agency === "must_do" ? "inline-block" : "none";
  tertiaryBtn.style.display =
    state.agency === "must_do"
      ? "inline-block"
      : state.agency === "remind_later"
        ? "inline-block"
        : "none";

  if (state.agency === "remind_later") {
    secondaryBtn.textContent = "Have to";
    tertiaryBtn.textContent = "Not urgent";
  } else if (state.agency === "not_urgent") {
    tertiaryBtn.textContent = "Have to";
  } else {
    secondaryBtn.textContent = "Remind me later";
    tertiaryBtn.textContent = "Not urgent";
  }
}

function syncInteractionPreview() {
  ["click_box", "checkbox", "toggle"].forEach((mode) => {
    const element = document.getElementById(`pvInteraction_${mode}`);
    if (!element) return;
    element.style.display =
      mode === state.interaction
        ? mode === "toggle" || mode === "checkbox"
          ? "block"
          : "flex"
        : "none";
  });
}

function syncGuidance() {
  const result = evaluateNotification(state);
  const { scores, suggestions, aiToneText } = result;

  updateScore("Clarity", scores.clarity, "mClarity", "sClarity");
  updateScore("Motivation", scores.motivation, "mMotivation", "sMotivation");
  updateScore("Tone", scores.tone, "mTone", "sTone");
  updateScore(
    "Instruction",
    scores.instruction,
    "mInstruction",
    "sInstruction",
  );
  updateScore("Decision", scores.decision, "mDecision", "sDecision");
  updateScore("Trust", scores.trust, "mTrust", "sTrust");

  document.getElementById("suggestions").innerHTML = suggestions
    .map((item) => `<li>${item}</li>`)
    .join("");
  document.getElementById("aiToneText").textContent = aiToneText;
}

function updateScore(_label, value, meterId, scoreId) {
  document.getElementById(scoreId).textContent = value;
  document.getElementById(meterId).style.width = `${value}%`;
}

function renderCode() {
  document.getElementById("codeOutput").textContent =
    `notif = create_notification(
  title="${state.title}",
  message="${state.message}",
  context="${state.context}",
  user_group="${state.userGroup}",
  urgency=${state.urgency},
  motivation="${state.motivation}",
  include_steps=${state.steps},
  include_action=${state.action},
  explain_vulnerability=${state.explainVuln},
  explain_risk=${state.explain},
  include_background_context=${state.background},
  include_time_estimate=${state.time},
  explain_transparency=${state.transparency},
  consequences_if_ignored=${state.consequences},
  decision_support=${state.decision},
  preferred_decision=${state.preferredDecision},
  ai_tone_review=${state.aiTone},
  interaction_mode="${state.interaction}",
  notification_location="${state.location}",
  user_agency="${state.agency}",
  schedule_enabled=${state.schedule},
  deploy_date="${state.deployDate}",
  deploy_hour="${state.deployHour}",
  deploy_window="${state.deployWindow}",
  show_on_bootup=${state.bootup},
  show_during_task=${state.duringTask}
)`;
}

function setupReferenceTableToggle() {
  document.getElementById("ckRefTable").addEventListener("change", function () {
    document
      .getElementById("refTableWrap")
      .classList.toggle("open", this.checked);
  });
}

function init() {
  setupDropdowns();
  setupInputs();
  setupSegmentedControls();
  setupNavigation();
  setupPreviewInteractions();
  setupReferenceTableToggle();
  render();
}

init();
