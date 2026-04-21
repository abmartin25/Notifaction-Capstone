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

  // Content of Builder

  // Ensure configuration matches default when page is launched
  test('Builder Default Configuration @debug', async() => {
    await helper.navigateToPageUsingNavBar(appWindow, 'Builder')
    const defaultConfig = getDefaultState()
    await helper.checkState(appWindow, defaultConfig)
  })


  // Content of Export

  
})