import { expect } from '@playwright/test'
// Helper functions for testing

// Function to navigate to specific page using nav panel
export async function navigateToPageUsingNavBar(appWindow, pageName) {
    await appWindow.locator('.nav button', { hasText: pageName }).click()
}

// Function to navigate to specific page using nav cards
export async function navigateToPageUsingNavCards(appWindow, cardName) {
    await appWindow.locator(`.card[data-route="${cardName.toLowerCase()}"]`).click()
}

// Function to navigate using top right buttons
export async function navigateUsingTopRightButtons(appWindow, buttonName) {
    const button = await appWindow.locator(`.btn[data-route="${buttonName.toLowerCase()}"]`).filter({ visible: true })
    await button.click()
}

// Function to verify correct page by checking heading and active nav button
export async function verifyPageNavigation(appWindow, pageName) {
    await expect(appWindow.getByRole('heading', { name: pageName })).toBeVisible()
    await expect(appWindow.getByRole('button', { name: pageName })).toHaveClass(/active/)
}   