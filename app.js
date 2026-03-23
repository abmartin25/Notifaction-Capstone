// Establish Navigation for UI
function setupNavigation() {
  document.querySelectorAll(".nav button").forEach((btn) => {
    const route = btn.dataset.route;
    if (route) {
      btn.addEventListener("click", () => showSection(route));
    }
  });

  // TODO Handle Framework Card
  document.querySelectorAll(".grid .card").forEach((card) => {
    const route = card.dataset.route;
    if (route) {
      card.addEventListener("click", () => showSection(route));
    }
  });

  // Top Bar Navigation
  document.querySelectorAll(".topbar .actions button").forEach((btn) => {
    const route = btn.dataset.route;
    if (route) {
      btn.addEventListener("click", () => showSection(route));
    }
  });
}

// Function that Shows the Appropriate Page of UI, While also Updating the State of the Nav Buttons
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

// I ant to split off all of the creating the notification/preview stuff to its own js
// Set default state for the notification configuration
// TODO Add ability to call these from API
const state = getDefaultState();

// Building of Notification Live Preview
// Setup Card-Panel (Configuration Panel)
function setupDropdowns() {
  document.querySelectorAll(".field[data-type='dropdown']").forEach((dropdown) => {
    const forAttr = dropdown.querySelector("label").getAttribute("for");
    const customWrap = dropdown.querySelector(".custom-input-wrap");
    customWrap.addEventListener("input", (e) => {
      state[forAttr] = e.target.value.trim();
      render();
    });

    const select = dropdown.querySelector(".dropdown");
    select.addEventListener("change", (e) => {
      const isCustom = e.target.value === "__custom__";
      customWrap.classList.toggle("hidden", !isCustom);
      state[forAttr] = isCustom ? "" : e.target.value;
      if (isCustom) customWrap.querySelector("input").focus();
        render();
    });
  });
}

function setupTextInputs() {
  document.querySelectorAll(".field[data-type='textInput']").forEach((field) => {
    const forAttr = field.querySelector("label").getAttribute("for");
    field.addEventListener("input", (e) => {
      state[forAttr] = e.target.value;
      render();
    });
  });
}

//This is fine to leave as ID based (one off, components get handled differently)
function setupCheckboxInputs() {
  const checkboxMappings = [
    ["ckInstructionSteps", "instructionSteps"],
    ["ckDirectAction", "directAction"],
    ["ckExplainVuln", "explainVuln"],
    ["ckExplainRisk", "explainRisk"],
    ["ckContextBackground", "contextBackground"],
    ["ckTimeEst", "timeEst"],
    ["ckTransparency", "transparency"],
    ["ckConsequences", "consequences"],
    ["ckSupportLinks", "supportLinks"],
    ["ckPreferredDecision", "preferredDecision"],
    ["ckAiTone", "aiTone"],
    ["ckSchedule", "schedule"],
    ["ckShowOnBootup", "showOnBootup"],
    ["ckShowDuringTask", "showDuringTask"],
  ];

  checkboxMappings.forEach(([id, key]) => {
    document.getElementById(id).addEventListener("change", (e) => {
      state[key] = e.target.checked;
      if (key === "schedule") {
        document.getElementById("scheduleWrap").classList.toggle("hidden", !state.schedule);
      }
      render();
    });
    if (state[key]) {
      document.getElementById(id).checked = true;
    }
  });
}

function setupDeploymentInputs() {
  document.querySelectorAll(".field[data-type='deploymentInputs'] [data-type='input']").forEach((input) => {
    const forAttr = input.querySelector("label").getAttribute("for");
    input.querySelector("input").addEventListener("input", (e) => {
      state[forAttr] = e.target.value;
      render();
    });
  });
}
 
function setupSegmentedControls() {
  document.querySelectorAll(".field[data-type='segmentGroup']").forEach((field) => {
    const forContainer = field.querySelector("div.seg").id.slice(0, -3);
    field.querySelectorAll("button").forEach((button) => {
      button.addEventListener("click", () => {
        field
          .querySelectorAll("button")
          .forEach((b) => b.classList.remove("on"));
        button.classList.add("on");
        state[forContainer] = button.dataset[forContainer.charAt(0)];
        
        if (forContainer === "location") {
          document.querySelector(".sectionNote").textContent =
            locationDescs[button.dataset[forContainer.charAt(0)]] || "";
        }
        
        console.log(`Segment group ${forContainer} changed to ${state[forContainer]}`);
        render();
      });
    })
  });
  
  const locationDescs = {
    banner: "Appears at the top or bottom of the screen; non-blocking.",
    popup: "Appears in the center of the screen; requires user interaction.",
    inline: "Appears within the page content; contextual and subtle.",
    modal: "Overlays the full screen; blocks all other interaction.",
  };
}

// TODO
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

// Render the interactive preview
// Potentially change this to not have to refresh entire thing but subsections depending on type of change
function render() {
  document.getElementById("pvTitle").textContent =
    state.title || "Notification title";
  document.getElementById("pvMsg").textContent =
    state.message || "Notification message will appear here.";
  document.getElementById("pvMeta").textContent =
    `${state.userGroup || "User group"} • ${state.context || "Security context"}`;

  const level = state.urgency;
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
  document.getElementById("pvRiskWrap").style.display = state.explainRisk
    ? "block"
    : "none";
}

function syncHint() {
  const hintParts = [];
  if (state.timeEst) hintParts.push("Includes time estimate");
  if (state.instructionSteps) hintParts.push("Step-by-step guidance enabled");
  if (state.contextBackground) hintParts.push("Risk background included");
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
  if (state.schedule && state.showOnBootup) pills.push("Shown on bootup");
  if (state.schedule && state.showDuringTask) pills.push("Shown during task");
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
  ["click_box", "slider", "toggle"].forEach((mode) => {
    const element = document.getElementById(`pvInteraction_${mode}`);
    if (!element) return;
    element.style.display =
      mode === state.interaction
        ? mode === "toggle" || mode === "slider"
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
  include_steps=${state.instructionSteps},
  include_action=${state.directAction},
  explain_vulnerability=${state.explainVuln},
  explain_risk=${state.explainRisk},
  include_background_context=${state.contextBackground},
  include_time_estimate=${state.timeEst},
  explain_transparency=${state.transparency},
  consequences_if_ignored=${state.consequences},
  decision_support=${state.supportLinks},
  preferred_decision=${state.preferredDecision},
  ai_tone_review=${state.aiTone},
  interaction_mode="${state.interaction}",
  notification_location="${state.location}",
  user_agency="${state.agency}",
  schedule_enabled=${state.schedule},
  deploy_date="${state.deployDate}",
  deploy_hour="${state.deployHour}",
  deploy_window="${state.deployWindow}",
  show_on_bootup=${state.showOnBootup},
  show_during_task=${state.showDuringTask}
)`;
}

function setupReferenceTableToggle() {
  document.getElementById("ckRefTable").addEventListener("change", function () {
    document
      .getElementById("refTableWrap")
      .classList.toggle("open", this.checked);
  });
}

function setupSaveLoad() {
  document.getElementById("saveTemplate").addEventListener("click", () => {
    const nameInput = document.getElementById("saveTemplateName");
    nameInput.value = state.title || "";
    document.getElementById("saveModalError").style.display = "none";
    showModal("saveModal");
    nameInput.focus();
  });

  document.getElementById("saveModalCancel").addEventListener("click", () => hideModal("saveModal"));

  document.getElementById("saveModalConfirm").addEventListener("click", async () => {
    const name = document.getElementById("saveTemplateName").value.trim();
    const errorEl = document.getElementById("saveModalError");
    if (!name) {
      errorEl.textContent = "Please enter a template name.";
      errorEl.style.display = "block";
      return;
    }
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, config: { ...state } }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Save failed");
      hideModal("saveModal");
      flashSaveButton();
    } catch (err) {
      errorEl.textContent = err.message;
      errorEl.style.display = "block";
    }
  });

  document.getElementById("saveTemplateName").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("saveModalConfirm").click();
  });

  document.getElementById("loadTemplate").addEventListener("click", async () => {
    await populateLoadModal();
    showModal("loadModal");
  });

  document.getElementById("loadModalCancel").addEventListener("click", () => hideModal("loadModal"));
}

async function populateLoadModal() {
  const listEl  = document.getElementById("loadModalList");
  const emptyEl = document.getElementById("loadModalEmpty");
  listEl.innerHTML = '<p style="color:#6b7280;font-size:13px;">Loading…</p>';

  try {
    const res = await fetch("/api/templates");
    const templates = await res.json();

    listEl.innerHTML = "";

    if (!templates.length) {
      listEl.style.display = "none";
      emptyEl.style.display = "block";
      return;
    }

    listEl.style.display = "flex";
    emptyEl.style.display = "none";

    templates.forEach((t) => {
      const row = document.createElement("div");
      row.style.cssText = "display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; background:#fff; gap:10px;";

      row.innerHTML = `
        <div style="flex:1; min-width:0;">
          <div style="font-weight:700; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.name}</div>
          <div style="font-size:11px; color:#9ca3af; margin-top:2px;">Saved ${new Date(t.updated_at).toLocaleDateString()}</div>
        </div>
        <div style="display:flex; gap:8px; flex-shrink:0;">
          <button data-id="${t.id}" class="load-pick btn primary" style="padding:7px 12px; font-size:12px;">Load</button>
          <button data-id="${t.id}" class="load-delete btn" style="padding:7px 12px; font-size:12px; color:#ef4444;">Delete</button>
        </div>
      `;

      listEl.appendChild(row);
    });

    listEl.querySelectorAll(".load-pick").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        const res = await fetch(`/api/templates/${id}`);
        const template = await res.json();
        loadStateFromTemplate(template.config);
        hideModal("loadModal");
        showSection("builder");
      });
    });

    listEl.querySelectorAll(".load-delete").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        if (!confirm("Delete this template?")) return;
        await fetch(`/api/templates/${btn.dataset.id}`, { method: "DELETE" });
        await populateLoadModal(); // refresh list
      });
    });

  } catch (err) {
    listEl.innerHTML = `<p style="color:#ef4444;font-size:13px;">Failed to load templates: ${err.message}</p>`;
  }
}

function loadStateFromTemplate(config) {
  Object.assign(state, config);

  document.getElementById("titleInput").value  = state.title   || "";
  document.getElementById("msgInput").value    = state.message || "";

  const ugSelect = document.getElementById("userGroup");
  const ugOptions = Array.from(ugSelect.options).map((o) => o.value);
  if (ugOptions.includes(state.userGroup)) {
    ugSelect.value = state.userGroup;
    document.getElementById("userGroupCustomWrap").classList.add("hidden");
  } else {
    ugSelect.value = "__custom__";
    document.getElementById("userGroupCustomWrap").classList.remove("hidden");
    document.getElementById("userGroupCustom").value = state.userGroup;
  }

  const ctxSelect = document.getElementById("context");
  const ctxOptions = Array.from(ctxSelect.options).map((o) => o.value);
  if (ctxOptions.includes(state.context)) {
    ctxSelect.value = state.context;
    document.getElementById("contextCustomWrap").classList.add("hidden");
  } else {
    ctxSelect.value = "__custom__";
    document.getElementById("contextCustomWrap").classList.remove("hidden");
    document.getElementById("contextCustom").value = state.context;
  }

  const checkboxMappings = [
    ["ckInstructionSteps", "instructionSteps"],
    ["ckDirectAction", "directAction"],
    ["ckExplainVuln", "explainVuln"],
    ["ckExplainRisk", "explainRisk"],
    ["ckContextBackground", "contextBackground"],
    ["ckTimeEst", "timeEst"],
    ["ckTransparency", "transparency"],
    ["ckConsequences", "consequences"],
    ["ckSupportLinks", "supportLinks"],
    ["ckPreferredDecision", "preferredDecision"],
    ["ckAiTone", "aiTone"],
    ["ckSchedule", "schedule"],
    ["ckShowOnBootup", "showOnBootup"],
    ["ckShowDuringTask", "showDuringTask"],
  ];
  checkboxMappings.forEach(([id, key]) => {
    document.getElementById(id).checked = !!state[key];
  });

  document.getElementById("scheduleWrap").classList.toggle("hidden", !state.schedule);
  document.getElementById("deployDate").value   = state.deployDate   || "";
  document.getElementById("deployHour").value   = state.deployHour   || "09:00";
  document.getElementById("deployWindow").value = state.deployWindow || "";

  function restoreSeg(containerId, dataAttr, value) {
    const container = document.getElementById(containerId);
    container.querySelectorAll("button").forEach((b) => {
      b.classList.toggle("on", b.dataset[dataAttr] === value);
    });
  }
  restoreSeg("motivationSeg",  "m", state.motivation);
  restoreSeg("urgencySeg",     "u", state.urgency);
  restoreSeg("interactionSeg", "i", state.interaction);
  restoreSeg("locationSeg",    "l", state.location);
  restoreSeg("agencySeg",      "a", state.agency);

  const locationDescs = {
    banner: "Appears at the top or bottom of the screen; non-blocking.",
    popup:  "Appears in the center of the screen; requires user interaction.",
    inline: "Appears within the page content; contextual and subtle.",
    modal:  "Overlays the full screen; blocks all other interaction.",
  };
  document.getElementById("locationDesc").textContent = locationDescs[state.location] || "";

  render();
}


function showModal(id) {
  const el = document.getElementById(id);
  el.style.display = "flex";
}

function hideModal(id) {
  document.getElementById(id).style.display = "none";
}

document.addEventListener("click", (e) => {
  ["saveModal", "loadModal"].forEach((id) => {
    const modal = document.getElementById(id);
    if (e.target === modal) hideModal(id);
  });
});

function flashSaveButton() {
  const btn = document.getElementById("saveTemplate");
  const original = btn.textContent;
  btn.textContent = "Saved ✓";
  btn.classList.add("primary");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("primary");
  }, 2000);
}

function init() {
  setupDropdowns();
  setupTextInputs();
  setupCheckboxInputs();
  setupDeploymentInputs();
  setupSegmentedControls();
  setupNavigation();
  setupPreviewInteractions();
  setupReferenceTableToggle();
  setupSaveLoad();
  render();
}

init();
