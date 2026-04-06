import { test, expect, _electron as electron } from '@playwright/test'

test('Launch Tests', async () => {
  const electronApp = await electron.launch({ args: ['electron-main.js'], executablePath: require('electron') })
  const isPackaged = await electronApp.evaluate(async ({ app }) => {
    // This runs in Electron's main process, parameter here is always
    // the result of the require('electron') in the main app script.
    return app.isPackaged
  })
  expect(isPackaged).toBe(false)

  // Wait for the first BrowserWindow to open
  // and return its Page object
  const window = await electronApp.firstWindow()

  // Ensure BrowserWindow is visible
  const isVisible = await window.evaluate(() => {
    return document.visibilityState === 'visible'
  })
  expect(isVisible).toBe(true)

  // Ensure BrowserWindow has correct title
  const window_title = await window.title()
  expect(window_title).toBe('SENTINEL SDK — Prototype')

  // Ensure Opens to Dashboard Page
  // Check heading and selected nav button
  await expect(window.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  await expect(window.getByRole('button', { name: 'Dashboard' })).toHaveClass(/active/)

  // Iterate through Nav buttons and ensure they navigate to the correct page
  const navButtons = ['Dashboard', 'Builder', 'Export']
  for (const buttonName of navButtons) {
    await window.getByRole('button', { name: buttonName }).click()
    await expect(window.getByRole('heading', { name: buttonName })).toBeVisible()
    await expect(window.getByRole('button', { name: buttonName })).toHaveClass(/active/)
  }

  // close app
  await electronApp.close()
})