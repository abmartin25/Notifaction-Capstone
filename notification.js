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

function setClickBoxState(choice) {
  const primaryBtn = document.getElementById("ntPrimaryBtn");
  const denyBtn = document.getElementById("ntDenyBtn");

  const isAllow = choice === "allow" || choice === null;
  primaryBtn.classList.toggle("primary", isAllow);
  denyBtn.classList.toggle("selected-deny", choice === "deny");
}

function setInteractionMode(mode) {
  const clickBox = document.getElementById("ntInteraction_click_box");
  const slider = document.getElementById("ntInteraction_slider");
  const toggle = document.getElementById("ntInteraction_toggle");

  clickBox.style.display = mode === "click_box" ? "flex" : "none";
  slider.style.display = mode === "slider" ? "block" : "none";
  toggle.style.display = mode === "toggle" ? "block" : "none";
}

function setAgency(state) {
  const mainBtn = document.getElementById("ntAgencyMainBtn");
  const secondaryBtn = document.getElementById("ntAgencySecondaryBtn");
  const tertiaryBtn = document.getElementById("ntAgencyTertiaryBtn");

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

function setHint(state) {
  const hintParts = [];
  if (state.timeEst) hintParts.push("Includes time estimate");
  if (state.instructionSteps) hintParts.push("Step-by-step guidance enabled");
  if (state.contextBackground) hintParts.push("Risk background included");
  if (state.transparency) hintParts.push("Why this appeared is explained");

  document.getElementById("ntHint").textContent = hintParts.join(" • ");
}

function setInfoStrip(state) {
  const pills = [];
  if (state.consequences) pills.push("Consequences shown");
  if (state.preferredDecision) pills.push("Preferred choice highlighted");
  if (state.schedule && state.deployDate)
    pills.push(`Deploy ${state.deployDate}`);
  if (state.schedule && state.deployWindow)
    pills.push(`Window ${state.deployWindow}`);
  if (state.schedule && state.showOnBootup) pills.push("Shown on bootup");
  if (state.schedule && state.showDuringTask) pills.push("Shown during task");

  document.getElementById("ntInfoStrip").innerHTML = pills
    .map((pill) => `<span class="pill">${pill}</span>`)
    .join("");
}

function setTooltips(state) {
  document.getElementById("ntVulnWrap").style.display = state.explainVuln
    ? "block"
    : "none";
  document.getElementById("ntRiskWrap").style.display = state.explainRisk
    ? "block"
    : "none";
}

function setBadge(urgency) {
  const badge = document.getElementById("badge");
  badge.className = `badge ${urgency}`;
  badge.textContent = urgency === "low" ? "i" : urgency === "med" ? "!" : "⚠";
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

function setClickBoxBehavior() {
  const primaryBtn = document.getElementById("ntPrimaryBtn");
  const denyBtn = document.getElementById("ntDenyBtn");

  let choice = null;

  primaryBtn.addEventListener("click", () => {
    choice = choice === "allow" ? null : "allow";
    setClickBoxState(choice);
  });

  denyBtn.addEventListener("click", () => {
    choice = choice === "deny" ? null : "deny";
    setClickBoxState(choice);
  });
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
  setAgency(state);
  setHint(state);
  setInfoStrip(state);
  setTooltips(state);
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
