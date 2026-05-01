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

  if (sectionId === "export") {
    renderCode();
  }
}

function setupExportActions() {
  const copyBtn = document.getElementById("copyCodeBtn");
  if (!copyBtn) return;

  copyBtn.addEventListener("click", async () => {
    const code = document.getElementById("codeOutput").textContent;
    try {
      await navigator.clipboard.writeText(code);
      const original = copyBtn.textContent;
      copyBtn.textContent = "Copied ✓";
      setTimeout(() => {
        copyBtn.textContent = original;
      }, 1500);
    } catch (err) {
      console.error("Failed to copy export code:", err);
    }
  });

  const btnPython = document.getElementById("exportLangPython");
  const btnJson = document.getElementById("exportLangJson");
  if (!btnPython || !btnJson) return;

  function setLang(lang) {
    exportLang = lang;
    btnPython.classList.toggle("primary", lang === "python");
    btnJson.classList.toggle("primary", lang === "json");
    renderCode();
  }

  btnPython.addEventListener("click", () => setLang("python"));
  btnJson.addEventListener("click", () => setLang("json"));
}

// I ant to split off all of the creating the notification/preview stuff to its own js
// Set default state for the notification configuration
// TODO Add ability to call these from API
import { getDefaultState } from "./default_state.js";
const state = getDefaultState();

// Building of Notification Live Preview
// Setup Card-Panel (Configuration Panel)
function setupDropdowns() {
  document
    .querySelectorAll(".field[data-type='dropdown']")
    .forEach((dropdown) => {
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

function syncDropdowns() {
  document
    .querySelectorAll(".field[data-type='dropdown']")
    .forEach((dropdown) => {
      const forAttr = dropdown.querySelector("label").getAttribute("for");
      const customWrap = dropdown.querySelector(".custom-input-wrap");
      const select = dropdown.querySelector(".dropdown");
      const currentValue = state[forAttr] || getDefaultState()[forAttr]; // Double-Blind to Default
      const dropdownOption = Array.from(select.options).find(
        (o) => o.value === currentValue,
      );
      if (dropdownOption) {
        select.value = currentValue;
      } else {
        select.value = "__custom__";
        customWrap.classList.remove("hidden");
        customWrap.querySelector("input").value = currentValue;
      }
      render();
    });
}

function setupTextInputs() {
  document
    .querySelectorAll(".field[data-type='textInput']")
    .forEach((field) => {
      const forAttr = field.querySelector("label").getAttribute("for");
      field.addEventListener("input", (e) => {
        state[forAttr] = e.target.value;
        render();
      });
    });
}

function syncTextInputs() {
  document
    .querySelectorAll(".field[data-type='textInput']")
    .forEach((field) => {
      const forAttr = field.querySelector("label").getAttribute("for");
      const currentValue = state[forAttr] || getDefaultState()[forAttr]; // Double-Blind to Default
      const select = field.querySelector("textarea, input");
      if (select) select.value = currentValue;
      render();
    });
}

//This is fine to leave as ID based (one off, components get handled differently)
const checkboxMappings = [
  ["ckInstructionSteps", "instructionSteps", "customStepsWrap"],
  ["ckDirectAction", "directAction"],
  ["ckExplainVuln", "explainVuln", "customVulnWrap"],
  ["ckExplainRisk", "explainRisk", "customRiskWrap"],
  ["ckContextBackground", "contextBackground", "customContextWrap"],
  ["ckTimeEst", "timeEst"],
  ["ckTransparency", "transparency", "customTransparencyWrap"],
  ["ckConsequences", "consequences", "customConsequencesWrap"],
  ["ckSupportLinks", "supportLinks", "customLinksWrap"],
  ["ckPreferredDecision", "preferredDecision"],
  ["ckAiTone", "aiTone"],
  ["ckSchedule", "schedule", "scheduleWrap"],
  ["ckCustomContent", "customContent", "customContentWrap"],
  ["ckShowOnBootup", "showOnBootup"],
  ["ckShowDuringTask", "showDuringTask"],
];

const customContentMappings = [
  ["customStepsInput", "customSteps"],
  ["customVulnInput", "customVuln"],
  ["customRiskInput", "customRisk"],
  ["customContextInput", "customContext"],
  ["customTransparencyInput", "customTransparency"],
  ["customConsequencesInput", "customConsequences"],
  ["customLinksInput", "customLinks"],
];

function setupCheckboxInputs() {
  checkboxMappings.forEach(([id, key, customInputId]) => {
    document.getElementById(id).addEventListener("change", (e) => {
      state[key] = e.target.checked;
      if (customInputId) {
        document
          .getElementById(customInputId)
          .classList.toggle("hidden", !state[key]);
      }
      render();
    });
  });
}

function syncCheckboxInputs() {
  checkboxMappings.forEach(([id, key, customInputId]) => {
    document.getElementById(id).checked = state[key];
    if (customInputId) {
      document
        .getElementById(customInputId)
        .classList.toggle("hidden", !state[key]);
    }
    render();
  });
}

function setupCustomContentInputs() {
  customContentMappings.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (!el) return;

    el.addEventListener("input", (e) => {
      state[key] = e.target.value;
      render();
    });
  });
}

function syncCustomContentInputs() {
  customContentMappings.forEach(([id, key]) => {
    const el = document.getElementById(id);
    if (el) {
      const currentValue = state[key] || getDefaultState()[key]; // Double-Blind to Default
      el.value = currentValue;
      render();
    } else return;
  });
}

const locationDescs = {
  banner: "Appears at the top or bottom of the screen; non-blocking.",
  popup: "Appears in the center of the screen; requires user interaction.",
  inline: "Appears within the page content; contextual and subtle.",
  modal: "Overlays the full screen; blocks all other interaction.",
};

function setupSegmentedControls() {
  document
    .querySelectorAll(".field[data-type='segmentGroup']")
    .forEach((field) => {
      const forContainer = field.querySelector("div.seg").id.slice(0, -3);
      field.querySelectorAll("button").forEach((button) => {
        button.addEventListener("click", () => {
          field
            .querySelectorAll("button")
            .forEach((b) => b.classList.remove("on"));
          button.classList.add("on");
          state[forContainer] = button.dataset[forContainer.charAt(0)];

          if (forContainer === "location") {
            field.querySelector(".sectionNote").textContent =
              locationDescs[button.dataset[forContainer.charAt(0)]] || "";
          }

          console.log(
            `Segment group ${forContainer} changed to ${state[forContainer]}`,
          );
          render();
        });
      });
    });
}

function syncSegmentedControls() {
  document
    .querySelectorAll(".field[data-type='segmentGroup']")
    .forEach((field) => {
      const forContainer = field.querySelector("div.seg").id.slice(0, -3);
      const currentValue =
        state[forContainer] || getDefaultState()[forContainer]; // Double-Blind to Default

      field.querySelectorAll("button").forEach((b) => b.classList.remove("on"));

      const buttonToActivate = field.querySelector(
        `button[data-${forContainer.charAt(0)}="${currentValue}"]`,
      );
      if (buttonToActivate) buttonToActivate.classList.add("on");

      if (forContainer === "location") {
        field.querySelector(".sectionNote").textContent =
          locationDescs[currentValue] ||
          locationDescs[getDefaultState().location];
      }
      render();
    });
}

function setupDeploymentInputs() {
  document
    .querySelectorAll(
      ".field[data-type='deploymentInputs'] [data-type='input']",
    )
    .forEach((input) => {
      const forAttr = input.querySelector("label").getAttribute("for");
      input.querySelector("input").addEventListener("input", (e) => {
        state[forAttr] = e.target.value;
        render();
      });
    });
}

function syncDeploymentInputs() {
  document
    .querySelectorAll(
      ".field[data-type='deploymentInputs'] [data-type='input']",
    )
    .forEach((input) => {
      const forAttr = input.querySelector("label").getAttribute("for");
      const inputLocation = input.querySelector("input");
      const currentValue = state[forAttr] || getDefaultState()[forAttr]; // Double-Blind to Default
      if (inputLocation) inputLocation.value = currentValue;
      render();
    });
}

// Summary functions for simplicity
function setupConfigPanel() {
  setupDropdowns();
  setupTextInputs();
  setupCheckboxInputs();
  setupCustomContentInputs();
  setupSegmentedControls();
  setupDeploymentInputs();
}

function syncConfigPanel() {
  syncDropdowns();
  syncTextInputs();
  syncCheckboxInputs();
  syncCustomContentInputs();
  syncSegmentedControls();
  syncDeploymentInputs();
}

// TODO
function setupPreviewInteractions() {
  const primaryBtn = document.getElementById("primaryBtn");
  const remindBtn = document.getElementById("remindBtn");
  const denyBtn = document.getElementById("denyBtn");
  let clickChoice = null;

  primaryBtn.addEventListener("click", () => {
    clickChoice = clickChoice === "allow" ? null : "allow";
    updateClickBoxState(primaryBtn, remindBtn, denyBtn, clickChoice);
  });

  remindBtn.addEventListener("click", () => {
    clickChoice = clickChoice === "remind" ? null : "remind";
    updateClickBoxState(primaryBtn, remindBtn, denyBtn, clickChoice);
  });

  denyBtn.addEventListener("click", () => {
    clickChoice = clickChoice === "deny" ? null : "deny";
    updateClickBoxState(primaryBtn, remindBtn, denyBtn, clickChoice);
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

  // Wire remind me later toggle
  const pvToggleRemind = document.getElementById("pvToggleRemind");
  const pvToggleRemindTrack = document.getElementById("pvToggleRemindTrack");
  const pvToggleRemindThumb = document.getElementById("pvToggleRemindThumb");
  if (pvToggleRemind) {
    pvToggleRemind.addEventListener("change", () => {
      if (pvToggleRemind.checked) {
        pvToggleAllow.checked = false;
        pvToggleDeny.checked = false;
        applyToggleVisual(
          pvToggleAllow,
          pvToggleAllowTrack,
          pvToggleAllowThumb,
          "var(--primary)",
        );
        applyToggleVisual(
          pvToggleDeny,
          pvToggleDenyTrack,
          pvToggleDenyThumb,
          "var(--danger)",
        );
      }
      applyToggleVisual(
        pvToggleRemind,
        pvToggleRemindTrack,
        pvToggleRemindThumb,
        "var(--warn)",
      );
    });
  }

  // Update allow/deny to also uncheck remind
  pvToggleAllow.addEventListener(
    "change",
    () => {
      if (pvToggleAllow.checked && pvToggleRemind) {
        pvToggleRemind.checked = false;
        applyToggleVisual(
          pvToggleRemind,
          pvToggleRemindTrack,
          pvToggleRemindThumb,
          "var(--warn)",
        );
      }
    },
    true,
  );
  pvToggleDeny.addEventListener(
    "change",
    () => {
      if (pvToggleDeny.checked && pvToggleRemind) {
        pvToggleRemind.checked = false;
        applyToggleVisual(
          pvToggleRemind,
          pvToggleRemindTrack,
          pvToggleRemindThumb,
          "var(--warn)",
        );
      }
    },
    true,
  );

  wireTooltip("pvVulnTrigger", "pvVulnTooltip");
  wireTooltip("pvRiskTrigger", "pvRiskTooltip");
}

function updateClickBoxState(primaryBtn, remindBtn, denyBtn, clickChoice) {
  primaryBtn.classList.toggle(
    "primary",
    clickChoice === "allow" || clickChoice === null,
  );
  primaryBtn.classList.remove("selected-deny");

  remindBtn.classList.toggle("primary", clickChoice === "remind");
  remindBtn.classList.toggle("secondary-accent", clickChoice !== "remind");

  denyBtn.classList.toggle("selected-deny", clickChoice === "deny");
  denyBtn.classList.remove("primary");
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
  renderCode();
  syncHint();
  syncInfoStrip();
  syncActionButtonsByAgency();
  syncInstructionSteps();
  syncVulnerabilityText();
  syncRiskText();
  syncContextBackground();
  syncConsequences();
  syncSupportLinks();
  syncTransparency();
  syncInteractionPreview();
  syncGuidance();
}

function syncSliderPreview() {
  const pvSlider = document.getElementById("pvSlider");
  if (pvSlider && !pvSlider._wired) {
    pvSlider._wired = true;
    pvSlider.addEventListener("input", () => {
      const label = document.getElementById("pvSliderLabel");
      const v = parseInt(pvSlider.value);
      const max = parseInt(pvSlider.max);
      if (v === 0) {
        label.textContent = "Allow";
        label.style.color = "var(--primary)";
      } else if (v === max) {
        label.textContent =
          state.agency === "remind_later" ? "Remind me later" : "Don't Allow";
        label.style.color = "var(--muted)";
      } else {
        label.textContent = "Remind me later";
        label.style.color = "var(--muted)";
      }
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

function setupInlineNotificationReceiver() {
  if (!window.electronAPI?.onInlineNotification) return;

  window.electronAPI.onInlineNotification((data) => {
    const host = document.getElementById("inlineNotificationHost");
    if (!host) return;

    host.classList.remove("hidden");

    host.innerHTML = `
      <div class="previewCard">
        <div class="previewHeader">
          <div class="badge ${data.urgency || "low"}">
            ${data.urgency === "high" ? "⚠" : data.urgency === "med" ? "!" : "i"}
          </div>
          <div>
            <div class="previewTitle">${data.title || "Security alert"}</div>
            <div style="font-size:12px;color:var(--muted)">
              ${data.userGroup || "User group"} • ${data.context || "Security context"}
            </div>
          </div>
        </div>
        <p class="previewMsg">${data.message || "Notification message will appear here."}</p>
      </div>
    `;
  });
}

function syncHint() {
  const hintParts = [];
  if (state.timeEst) hintParts.push("Includes time estimate");
  if (state.instructionSteps) hintParts.push("Step-by-step guidance enabled");
  if (state.contextBackground) hintParts.push("Risk background included");
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

function syncActionButtonsByAgency() {
  const primaryBtn = document.getElementById("primaryBtn");
  const remindBtn = document.getElementById("remindBtn");
  const denyBtn = document.getElementById("denyBtn");

  if (!primaryBtn || !remindBtn || !denyBtn) return;

  primaryBtn.style.display = "inline-block";
  primaryBtn.textContent = "Allow";
  remindBtn.style.display = "none";
  denyBtn.style.display = "none";

  if (state.agency === "remind_later") {
    remindBtn.style.display = "inline-block";
    remindBtn.textContent = "Remind me later";
  } else if (state.agency === "not_urgent") {
    remindBtn.style.display = "inline-block";
    remindBtn.textContent = "Remind me later";
    denyBtn.style.display = "inline-block";
    denyBtn.textContent = "Don't Allow";
  }

  // Slider: configure labels and range based on agency
  const pvSlider = document.getElementById("pvSlider");
  const pvSliderLabel = document.getElementById("pvSliderLabel");
  const labelLeft = document.getElementById("pvSliderLabelLeft");
  const labelRight = document.getElementById("pvSliderLabelRight");

  const labelMiddle =
    document.getElementById("pvSliderMiddle") ||
    document.getElementById("pvSliderLabelMiddle");
  const disabledMsg = document.getElementById("pvSliderDisabledMsg");

  if (pvSlider) {
    if (state.agency === "must_do") {
      // Disable slider — show overlay message, keep track inert
      pvSlider.disabled = true;
      pvSlider.style.opacity = "0.35";
      if (disabledMsg) disabledMsg.style.display = "flex";
      if (labelMiddle) labelMiddle.style.display = "none";
      if (labelLeft) labelLeft.textContent = "Allow";
      if (labelRight) labelRight.textContent = "Don't Allow";
    } else if (state.agency === "remind_later") {
      pvSlider.disabled = false;
      pvSlider.style.opacity = "1";
      if (disabledMsg) disabledMsg.style.display = "none";
      pvSlider.min = "0";
      pvSlider.max = "1";
      pvSlider.step = "1";
      pvSlider.value = "0";
      if (labelLeft) labelLeft.textContent = "Allow";
      if (labelMiddle) labelMiddle.style.display = "none";
      if (labelRight) labelRight.textContent = "Remind me later";
      if (pvSliderLabel) {
        pvSliderLabel.textContent = "Allow";
        pvSliderLabel.style.color = "var(--primary)";
      }
    } else if (state.agency === "not_urgent") {
      pvSlider.disabled = false;
      pvSlider.style.opacity = "1";
      if (disabledMsg) disabledMsg.style.display = "none";
      pvSlider.min = "0";
      pvSlider.max = "2";
      pvSlider.step = "1";
      pvSlider.value = "1";
      if (labelLeft) labelLeft.textContent = "Allow";
      if (labelMiddle) {
        labelMiddle.style.display = "block";
        labelMiddle.textContent = "Remind me later";
      }
      if (labelRight) labelRight.textContent = "Don't Allow";
      if (pvSliderLabel) {
        pvSliderLabel.textContent = "Remind me later";
        pvSliderLabel.style.color = "var(--muted)";
      }
    }
  }

  // Toggle rows: show/hide based on agency
  const remindRow = document.getElementById("pvToggleRemindRow");
  const denyRow = document.getElementById("pvToggleDenyRow");
  if (remindRow)
    remindRow.style.display =
      state.agency === "remind_later" || state.agency === "not_urgent"
        ? "flex"
        : "none";
  if (denyRow)
    denyRow.style.display = state.agency === "not_urgent" ? "flex" : "none";

  // Preferred decision highlights
  const preferred = !!state.preferredDecision;
  if (primaryBtn) primaryBtn.classList.toggle("preferred-highlight", preferred);
  const sliderAllowLabel = document.getElementById("pvSliderLabelLeft");
  if (sliderAllowLabel)
    sliderAllowLabel.classList.toggle(
      "preferred-highlight-text",
      preferred && state.agency !== "must_do",
    );
  const toggleAllowRow = document.getElementById("pvToggleAllowRow");
  if (toggleAllowRow)
    toggleAllowRow.classList.toggle("preferred-highlight-row", preferred);
}
function syncInteractionPreview() {
  ["click_box", "slider", "toggle"].forEach((mode) => {
    const element = document.getElementById(`pvInteraction_${mode}`);
    if (!element) return;
    const isCurrent = mode === state.interaction;
    // For must_do + slider: show it but disabled overlay will appear
    element.style.display = isCurrent
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

  const suggestionsEl = document.getElementById("suggestions");
  const prevOpenIndexes = new Set(
    [...suggestionsEl.querySelectorAll("li.suggestion-open")].map((li) =>
      parseInt(li.dataset.idx),
    ),
  );

  suggestionsEl.innerHTML = suggestions
    .map((item, i) => {
      const isOpen = prevOpenIndexes.has(i);
      const title = item.title || item;
      const detail = item.detail || item;
      return `<li class="suggestion-item${isOpen ? " suggestion-open" : ""}" data-idx="${i}">
      <div class="suggestion-header">
        <span class="suggestion-title">${title}</span>
        <span class="suggestion-chevron">${isOpen ? "▲" : "▼"}</span>
      </div>
      <div class="suggestion-detail">${detail}</div>
    </li>`;
    })
    .join("");

  suggestionsEl.querySelectorAll(".suggestion-item").forEach((li) => {
    li.addEventListener("click", () => {
      li.classList.toggle("suggestion-open");
      li.querySelector(".suggestion-chevron").textContent =
        li.classList.contains("suggestion-open") ? "▲" : "▼";
    });
  });

  document.getElementById("aiToneText").textContent = aiToneText;
}

function updateScore(_label, value, meterId, scoreId) {
  document.getElementById(scoreId).textContent = value;
  document.getElementById(meterId).style.width = `${value}%`;
}

let exportLang = "python";

function renderCodePython() {
  return `notif = create_notification(
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

function renderCodeJson() {
  const obj = {
    title: state.title,
    message: state.message,
    context: state.context,
    user_group: state.userGroup,
    urgency: state.urgency,
    motivation: state.motivation,
    include_steps: state.instructionSteps,
    include_action: state.directAction,
    explain_vulnerability: state.explainVuln,
    explain_risk: state.explainRisk,
    include_background_context: state.contextBackground,
    include_time_estimate: state.timeEst,
    explain_transparency: state.transparency,
    consequences_if_ignored: state.consequences,
    decision_support: state.supportLinks,
    preferred_decision: state.preferredDecision,
    ai_tone_review: state.aiTone,
    interaction_mode: state.interaction,
    notification_location: state.location,
    user_agency: state.agency,
    schedule_enabled: state.schedule,
    deploy_date: state.deployDate,
    deploy_hour: state.deployHour,
    deploy_window: state.deployWindow,
    show_on_bootup: state.showOnBootup,
    show_during_task: state.showDuringTask,
  };
  return JSON.stringify(obj, null, 2);
}

function renderCode() {
  document.getElementById("codeOutput").textContent =
    exportLang === "json" ? renderCodeJson() : renderCodePython();
}

function getInstructionSteps(context) {
  if (state.customSteps.trim()) {
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
    map[context] || [
      "Review the notification details.",
      "Take the recommended action.",
      "Confirm the issue is resolved.",
    ]
  );
}

function syncInstructionSteps() {
  const wrap = document.getElementById("pvStepsWrap");
  const list = document.getElementById("pvStepsList");

  if (!wrap || !list) return;

  if (!state.instructionSteps) {
    wrap.style.display = "none";
    list.innerHTML = "";
    return;
  }

  wrap.style.display = "block";
  const steps = getInstructionSteps(state.context);
  list.innerHTML = steps.map((step) => `<li>${step}</li>`).join("");
}

function getVulnerabilityExplanation(context) {
  if (state.customVuln.trim()) {
    return state.customVuln.trim();
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
    map[context] ||
    "A security weakness was detected that may increase exposure if it is not addressed."
  );
}

function syncVulnerabilityText() {
  const tooltip = document.getElementById("pvVulnTooltip");
  if (!tooltip) return;
  tooltip.textContent = getVulnerabilityExplanation(state.context);
}

function getRiskExplanation(context) {
  if (state.customRisk.trim()) {
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
    map[context] ||
    "Ignoring this issue could increase the chance of account, data, or system exposure."
  );
}

function syncRiskText() {
  const tooltip = document.getElementById("pvRiskTooltip");
  if (!tooltip) return;
  tooltip.textContent = getRiskExplanation(state.context);
}

function getContextBackground(context) {
  if (state.customContext.trim()) {
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
    map[context] ||
    "This issue relates to a broader security risk that may affect account safety, device protection, or data exposure."
  );
}

function syncContextBackground() {
  const wrap = document.getElementById("pvContextWrap");
  if (!wrap) return;

  if (!state.contextBackground) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getContextBackground(state.context);
}

function getConsequencesText(context) {
  if (state.customConsequences.trim()) {
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
    map[context] ||
    "If ignored, the issue may continue to increase security exposure."
  );
}

function syncConsequences() {
  const wrap = document.getElementById("pvConsequencesWrap");
  if (!wrap) return;

  if (!state.consequences) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getConsequencesText(state.context);
}

function parseCustomLinks(raw) {
  return raw
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

function getSupportLinks(context) {
  if (state.customLinks.trim()) {
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
    map[context] || [
      { label: "Help Article", url: "#" },
      { label: "Learn More", url: "#" },
    ]
  );
}

function syncSupportLinks() {
  const wrap = document.getElementById("pvSupportLinksWrap");
  if (!wrap) return;

  if (!state.supportLinks) {
    wrap.style.display = "none";
    wrap.innerHTML = "";
    return;
  }

  const links = getSupportLinks(state.context);
  wrap.style.display = "flex";
  wrap.innerHTML = links
    .map((link) => {
      const isReal = link.url && link.url !== "#";
      if (isReal) {
        return `<a class="mini neutral-accent" href="${link.url}" target="_blank" rel="noopener noreferrer" style="cursor:pointer;">${link.label}</a>`;
      } else {
        return `<span class="mini neutral-accent" title="No URL set — enter one in the custom links field" style="opacity:0.4; cursor:not-allowed;">${link.label}</span>`;
      }
    })
    .join("");
}

function getTransparencyText(context) {
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
    map[context] ||
    "Why you are seeing this: the system detected a security-relevant event."
  );
}

function syncTransparency() {
  const wrap = document.getElementById("pvTransparencyWrap");
  if (!wrap) return;

  if (!state.transparency) {
    wrap.style.display = "none";
    wrap.textContent = "";
    return;
  }

  wrap.style.display = "block";
  wrap.textContent = getTransparencyText(state.context);
}

function setupSaveLoad() {
  document.getElementById("saveTemplate").addEventListener("click", () => {
    const nameInput = document.getElementById("saveTemplateName");
    nameInput.value = state.title || "";
    document.getElementById("saveModalError").style.display = "none";
    showModal("saveModal");
    nameInput.focus();
  });

  document
    .getElementById("saveModalCancel")
    .addEventListener("click", () => hideModal("saveModal"));

  document
    .getElementById("saveModalConfirm")
    .addEventListener("click", async () => {
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

  document
    .getElementById("saveTemplateName")
    .addEventListener("keydown", (e) => {
      if (e.key === "Enter")
        document.getElementById("saveModalConfirm").click();
    });

  document
    .getElementById("loadTemplate")
    .addEventListener("click", async () => {
      await populateLoadModal();
      showModal("loadModal");
    });

  document
    .getElementById("loadModalCancel")
    .addEventListener("click", () => hideModal("loadModal"));
}

async function populateLoadModal() {
  const listEl = document.getElementById("loadModalList");
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
      row.style.cssText =
        "display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border:1px solid #e5e7eb; border-radius:12px; cursor:pointer; background:#fff; gap:10px;";

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
  const tempDefaultState = getDefaultState(); // reset to default first
  Object.assign(state, tempDefaultState);
  Object.assign(state, config);
  syncConfigPanel();
  render();
}

function startNotificationPolling() {
  const DEVICE_ID = "my-machine"; // change per machine

  setInterval(async () => {
    try {
      const baseUrl =
        document.getElementById("serverUrlInput")?.value.trim() ||
        "http://localhost:3000";

      const res = await fetch(
        `${baseUrl}/api/pending-notifications/${DEVICE_ID}`,
      );

      const notifications = await res.json();

      if (!Array.isArray(notifications)) return;

      notifications.forEach((notif) => {
        window.electronAPI.sendNotification(notif);
      });
    } catch (err) {
      console.error("Polling error:", err);
    }
  }, 5000); // every 5 seconds
}

function setupRemoteSend() {
  const btn = document.getElementById("sendRemoteBtn");
  if (!btn) return;

  btn.addEventListener("click", async () => {
    const device =
      document.getElementById("deviceInput").value.trim() || "my-machine";

    const baseUrl =
      document.getElementById("serverUrlInput")?.value.trim() ||
      "http://localhost:3000";

    if (!shouldSendNow(state)) {
      alert(
        "This notification is scheduled for a later time or outside the selected deployment window.",
      );
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/send-notification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetDevice: device,
          notification: { ...state },
        }),
      });

      if (!res.ok) throw new Error("Failed to send notification");

      const original = btn.textContent;
      btn.textContent = `Sent to ${device} ✓`;
      setTimeout(() => {
        btn.textContent = original;
      }, 1500);
    } catch (err) {
      console.error("Remote send failed:", err);
      btn.textContent = "Send failed";
    }
  });
}

function checkBootupNotification() {
  if (!state.schedule || !state.showOnBootup) return;
  if (!shouldSendNow(state)) return;

  if (window.electronAPI?.sendNotification) {
    window.electronAPI.sendNotification({ ...state });
  }
}

function getScheduledDateTime(state) {
  if (!state.schedule || !state.deployDate || !state.deployHour) {
    return null;
  }

  return new Date(`${state.deployDate}T${state.deployHour}`);
}

function isWithinDeployWindow(state) {
  if (!state.schedule || !state.deployWindow.trim()) return true;

  const match = state.deployWindow
    .trim()
    .match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);

  if (!match) {
    console.warn("Invalid deploy window format. Expected HH:MM-HH:MM");
    return true;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const startMinutes = Number(match[1]) * 60 + Number(match[2]);
  const endMinutes = Number(match[3]) * 60 + Number(match[4]);

  // Handles normal windows like 09:00-17:00
  if (startMinutes <= endMinutes) {
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  // Handles overnight windows like 22:00-02:00
  return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
}

function shouldSendNow(state) {
  if (!state.schedule) return true;

  const scheduledTime = getScheduledDateTime(state);

  if (scheduledTime && new Date() < scheduledTime) {
    console.log("Blocked: scheduled for future", scheduledTime);
    return false;
  }

  const inWindow = isWithinDeployWindow(state);
  console.log("Deploy window check:", {
    deployWindow: state.deployWindow,
    currentTime: new Date().toLocaleTimeString(),
    inWindow,
  });

  return inWindow;
}

async function checkServerConnection() {
  const input = document.getElementById("serverUrlInput");
  const dot = document.getElementById("serverStatusDot");

  if (!input || !dot) return;

  const baseUrl = input.value.trim() || "http://localhost:3000";

  try {
    const res = await fetch(`${baseUrl}/api/templates`);

    if (!res.ok) throw new Error();

    dot.style.background = "#10b981"; // green
  } catch (err) {
    dot.style.background = "#ef4444"; // red
  }
}

function setupServerStatus() {
  const input = document.getElementById("serverUrlInput");
  if (!input) return;

  checkServerConnection();

  input.addEventListener("change", checkServerConnection);
  input.addEventListener("blur", checkServerConnection);

  setInterval(checkServerConnection, 10000);
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

function setupNotificationLaunch() {
  const btn = document.getElementById("launchNotification");

  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!window.electronAPI?.sendNotification) {
      console.warn("Electron API not available");
      return;
    }

    if (!shouldSendNow(state)) {
      alert(
        "This notification is scheduled for a later time or outside the selected deployment window.",
      );
      return;
    }

    window.electronAPI.sendNotification({ ...state });
  });
}

function init() {
  setupConfigPanel();
  syncConfigPanel();
  setupDeploymentInputs();
  setupSegmentedControls();
  setupNavigation();
  setupPreviewInteractions();
  setupSaveLoad();
  setupNotificationLaunch();
  setupInlineNotificationReceiver();
  setupExportActions();
  startNotificationPolling();
  render();
  checkBootupNotification();
  setupServerStatus();
  setupRemoteSend();
}

init();
