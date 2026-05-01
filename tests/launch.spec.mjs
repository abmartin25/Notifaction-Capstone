import { test, expect, _electron as electron } from '@playwright/test'
import * as helper from './helperFunctions.mjs'

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { getDefaultState } = require('../default_state.js');

test.describe('BetterNotify Functionality Suite', () => {
  test.describe.configure({ mode: 'serial' });
  let electronApp, appWindow

  test.beforeAll(async () => {
    electronApp = await electron.launch({ args: ['.'] })
    appWindow = await electronApp.firstWindow()
  })

  test.afterAll(async () => {
    await electronApp.close()
  })

  test('Launches Window', async () => {
    // Wait for the first BrowserWindow to open
    const isVisible = await appWindow.evaluate(() => {
      return document.visibilityState === 'visible'
    })
    expect(isVisible).toBe(true)
  })

  test('Opens to Correct Page', async() => {
    // Ensure BrowserWindow has correct title
    // const window = await appWindow
    const window_title = await appWindow.title()
    expect(window_title).toBe('BetterNotify')
    await expect(appWindow.locator('.sidebar .brand')).toContainText('Human-centered security notifications')

    // Ensure Opens to Dashboard Page
    await helper.verifyPageNavigation(appWindow, 'Dashboard')
  })

  // Navigation Tests

  test('Navigation Bar Functionality', async() => {
    // Iterate over our nav windows and ensure they open the correct page
    const pages = ['Dashboard', 'Builder', 'Framework', 'Export']
    for (const page of pages) {
      await helper.navigateToPageUsingNavBar(appWindow, page)
      await helper.verifyPageNavigation(appWindow, page)
    }
  })

  test('Navigation Cards Functionality', async() => {
    // Make sure all cards lead to correct place (Excluding Framework)
    // Go through VALID cards
    const cards = ['Builder', 'Framework', 'Export']
    for (const card of cards) {
      // Go back to dashboard first
      await helper.navigateToPageUsingNavBar(appWindow, 'Dashboard')
      await helper.navigateToPageUsingNavCards(appWindow, card)
      await helper.verifyPageNavigation(appWindow, card)
    }
  })

  test('Navigation Top Right Buttons Functionality', async() => {
    // Have to test all for each subpage individually since they change depending on page
    // Manually written out to cover all boundaries
    // Dashboard to Builder
    await helper.navigateToPageUsingNavBar(appWindow, 'Dashboard')
    await helper.navigateUsingTopRightButtons(appWindow, 'Builder')
    await helper.verifyPageNavigation(appWindow, 'Builder')
    // Builder to Dashboard
    await helper.navigateUsingTopRightButtons(appWindow, 'Dashboard')
    await helper.verifyPageNavigation(appWindow, 'Dashboard')
    // Dashboard to Export
    await helper.navigateUsingTopRightButtons(appWindow, 'Export')
    await helper.verifyPageNavigation(appWindow, 'Export')
    // Export to Dashboard
    await helper.navigateUsingTopRightButtons(appWindow, 'Dashboard')
    await helper.verifyPageNavigation(appWindow, 'Dashboard')
    // Dashboard to Builder
    await helper.navigateUsingTopRightButtons(appWindow, 'Builder')
    await helper.verifyPageNavigation(appWindow, 'Builder')
    // Builder to Export
    await helper.navigateUsingTopRightButtons(appWindow, 'Export')
    await helper.verifyPageNavigation(appWindow, 'Export')
    
  })

  // Builder Tests
  test('Ensure Checkbox Functionality', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const checkboxMappings = ["ckInstructionSteps", "ckDirectAction", "ckExplainVuln", "ckExplainRisk", "ckContextBackground", "ckTimeEst", 
                              "ckTransparency", "ckConsequences", "ckSupportLinks", "ckPreferredDecision", "ckAiTone"];

    for (const checkboxId of checkboxMappings) {
    const isChecked = await helper.getCheckboxStateById(appWindow, checkboxId)
    await helper.checkCheckboxSpecifiedStateById(appWindow, checkboxId, isChecked)
    await helper.clickCheckboxById(appWindow, checkboxId)
    await helper.checkCheckboxSpecifiedStateById(appWindow, checkboxId, !isChecked)
    await helper.clickCheckboxById(appWindow, checkboxId)
    }

    // Do the schedule:
    const scheduleChecked = await helper.getCheckboxStateById(appWindow, "ckSchedule")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckSchedule", scheduleChecked)
    await helper.clickCheckboxById(appWindow, "ckSchedule")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckSchedule", !scheduleChecked)
    
    const showOnBootupChecked = await helper.getCheckboxStateById(appWindow, "ckShowOnBootup")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckShowOnBootup", showOnBootupChecked)
    await helper.clickCheckboxById(appWindow, "ckShowOnBootup")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckShowOnBootup", !showOnBootupChecked)
    await helper.clickCheckboxById(appWindow, "ckShowOnBootup")
    
    const showDuringTaskChecked = await helper.getCheckboxStateById(appWindow, "ckShowDuringTask")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckShowDuringTask", showDuringTaskChecked)
    await helper.clickCheckboxById(appWindow, "ckShowDuringTask")
    await helper.checkCheckboxSpecifiedStateById(appWindow, "ckShowDuringTask", !showDuringTaskChecked)
    await helper.clickCheckboxById(appWindow, "ckShowDuringTask")
    
    await helper.clickCheckboxById(appWindow, "ckSchedule")

  })

  test('Ensure Segmented Control Functionality', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const segmentedControlMappings = [
      { name: 'Motivation framing', options: ['risk_avoidance', 'personal_impact', 'social_norm', 'compliance'] , locator: '#motivationSeg' },
      { name: 'Urgency', options: ['low', 'med', 'high'] , locator: '#urgencySeg' },
      { name: 'Mode of interaction', options: ['click_box', 'slider', 'toggle'] , locator: '#interactionSeg' },
      { name: 'User workflow', options: ['banner', 'popup', 'inline', 'modal'] , locator: '#locationSeg' },
      { name: 'User agency', options: ['must_do', 'remind_later', 'not_urgent'] , locator: '#agencySeg' },
    ]
    for (const control of segmentedControlMappings) {
      for (const option of control.options) {
        await helper.selectSegmentedControlOption(appWindow, option, control.locator)
        await helper.checkButtonHaveClassOn(appWindow, control.name, option, control.locator)
      }
    }
    for (const control of segmentedControlMappings) {
      await helper.selectSegmentedControlOption(appWindow, control.options[0], control.locator)
    }
  })

  test('Ensure Framework Guidance Scores Functionality', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const guidanceMappings = [
      'ckInstructionSteps', 'ckDirectAction','ckExplainVuln', 'ckExplainRisk', 'ckContextBackground', 'ckTimeEst',
      'ckTransparency', 'ckConsequences', 'ckSupportLinks', 'ckPreferredDecision', 'ckAiTone', 'risk_avoidance', 'Message'
    ]
    for (const mapping of guidanceMappings) {
      await helper.checkGuidanceValueByMapping(appWindow, mapping)
    }
  })

  test('Ensure Limits to Text Fields', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const textFieldMappings = [
      { label: 'Title', type: 'input', maxLength: 50 },
      { label: 'Message', type: 'textarea', maxLength: 100 },
    ]
    for (const field of textFieldMappings) {
      await helper.modifyTextFieldByLabel(appWindow, field.label, field.type, 'a'.repeat(field.maxLength*2))
      const fieldValue = await appWindow.locator('.field', { hasText: field.label }).locator(field.type).inputValue()
      expect(fieldValue.length).toBeLessThanOrEqual(field.maxLength)
      await helper.modifyTextFieldByLabel(appWindow, field.label, field.type, '')
    }
  })

  // Ensure configuration matches default when page is launched
  test('Builder Default Configuration', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const defaultConfig = getDefaultState()
    await helper.checkState(appWindow, defaultConfig)
  })

  // Saving & Loading
  test('Create & Export Notification', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    await helper.modifyTextFieldByLabel(appWindow, 'Title', 'input', 'Automated Testing Notification')
    await helper.modifyTextFieldByLabel(appWindow, 'Message', 'textarea', 'This notification was created during automated testing.')
    await helper.selectSegmentedControlOption(appWindow, 'compliance', '#motivationSeg')
    await helper.clickCheckboxById(appWindow, 'ckInstructionSteps')
    await helper.clickCheckboxById(appWindow, 'ckExplainRisk')
    await helper.clickCheckboxById(appWindow, 'ckSupportLinks')
    await helper.clickCheckboxById(appWindow, 'ckCustomContent')
    await helper.modifyTextFieldById(appWindow, 'customStepsInput', 'Do this\nDo that\nProfit')
    await helper.selectSegmentedControlOption(appWindow, 'high', '#urgencySeg')
    await helper.selectSegmentedControlOption(appWindow, 'popup', '#locationSeg')
    await appWindow.locator('[id="saveTemplate"]').click()
    await helper.modifyTextFieldById(appWindow, 'saveTemplateName', 'Automated Testing Notification')
    await appWindow.locator('[id="saveModalConfirm"]').click()

    await helper.navigateToPageUsingNavBar(appWindow, 'Export')
    await helper.checkExportPagePreview(appWindow, 'Automated Testing Notification')
    await helper.checkExportPagePreview(appWindow, 'This notification was created during automated testing.')
    await helper.checkExportPagePreview(appWindow, 'motivation="compliance"')
    await helper.checkExportPagePreview(appWindow, 'include_steps=true')
    await helper.checkExportPagePreview(appWindow, 'urgency=high')
    await helper.checkExportPagePreview(appWindow, 'notification_location="popup"')
      })

  test('Import Notification Configuration', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Dashboard')
    await appWindow.locator('[id="loadTemplate"]').click()

    const loadTestModal = await appWindow.locator('[id="loadModalList"]').getByText('Automated Testing Notification', { exact: true }).locator('xpath=ancestor::div[2]')
    await expect(loadTestModal).toBeVisible()
    const loadButton = loadTestModal.getByText('Load')
    await loadButton.click()

    const defaultConfig = getDefaultState()
    const expectedConfig = { ...defaultConfig, 
      title: 'Automated Testing Notification',
      message: 'This notification was created during automated testing.',
      motivation: 'compliance',
      instructionSteps: true,
      explainRisk: true,
      supportLinks: true,
      customContent: true,
      customSteps: 'Do this',
      urgency: 'high',
      location: 'popup'
    }
    await helper.checkState(appWindow, expectedConfig)
  })

  // Deleting must be done manually due to the nature of the popup
})
