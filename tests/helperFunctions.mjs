import { expect } from '@playwright/test'
// Helper functions for testing

// Function to navigate to specific page using nav panel
export async function navigateToPageUsingNavBar(appWindow, pageName) {
    await appWindow.locator('.nav button', { hasText: pageName }).click()
}

// Function to navigate to specific page using nav cards
export async function navigateToPageUsingNavCards(appWindow, cardName) {
    await appWindow.locator(`.card[data-route='${cardName.toLowerCase()}']`).click()
}

// Function to navigate using top right buttons
export async function navigateUsingTopRightButtons(appWindow, buttonName) {
    const button = await appWindow.locator(`.btn[data-route='${buttonName.toLowerCase()}']`).filter({ visible: true })
    await button.click()
}

// Function to verify correct page by checking heading and active nav button
export async function verifyPageNavigation(appWindow, pageName) {
    await expect(appWindow.getByRole('heading', { name: pageName })).toBeVisible()
    await expect(appWindow.getByRole('button', { name: pageName })).toHaveClass(/active/)
}   

// Function to check notification state
// Because of the number of fields and differences in how they are labeled within the HTML, we are going to do this manually for now
export async function checkState(appWindow, expectedConfig) {
    await expect(appWindow.getByLabel('User group')).toHaveValue(expectedConfig.userGroup)
    await expect(appWindow.getByLabel('Security context')).toHaveValue(expectedConfig.context)
    const previewHeaderUserContext = await appWindow.locator('.previewHeader #pvMeta')
    await expect(previewHeaderUserContext).toContainText([expectedConfig.userGroup || 'User group', expectedConfig.context || 'Security context'].filter(Boolean).join(' • '))

    const titleField = await appWindow.locator('.field', { hasText: 'Title' }).locator('input')
    await expect(titleField).toHaveValue(expectedConfig.title)
    const previewTitle = await appWindow.locator('.previewTitle')
    await expect(previewTitle).toHaveText(expectedConfig.title ? expectedConfig.title : 'Notification title')

    const messageField = await appWindow.locator('.field', { hasText: 'Message' }).locator('textarea')
    await expect(messageField).toHaveValue(expectedConfig.message)
    const previewMessage = await appWindow.locator('.previewMsg')
    await expect(previewMessage).toHaveText(expectedConfig.message ? expectedConfig.message : 'Notification message will appear here.')

    const motivationField = await appWindow.locator('.field', { hasText: 'Motivation framing' }).locator('#motivationSeg')
    const motivationButton = motivationField.locator('button[data-m="' + expectedConfig.motivation + '"]')
    await expect(motivationButton).toHaveClass(/on/)

    const stepByStepInstructions = await appWindow.locator('[type=checkbox][id="ckInstructionSteps"]').evaluate(el => el.checked)
    expect(stepByStepInstructions).toBe(expectedConfig.instructionSteps)
    if (expectedConfig.instructionSteps) {
        const stepsField = await appWindow.locator('[id="customStepsWrap"]').locator('textarea')
        await expect(stepsField).toHaveValue(expectedConfig.customSteps)
        const previewSteps = await appWindow.locator('[id="pvStepsWrap"]')
        await expect(previewSteps).toContainText(expectedConfig.customSteps ? expectedConfig.customSteps : 'Next steps\nReview the notification details.Take the recommended action.Confirm the issue is resolved.')
    }

    const directAction = await appWindow.locator('[type=checkbox][id="ckDirectAction"]').evaluate(el => el.checked)
    expect(directAction).toBe(expectedConfig.directAction)

    const explainVuln = await appWindow.locator('[type=checkbox][id="ckExplainVuln"]').evaluate(el => el.checked)
    expect(explainVuln).toBe(expectedConfig.explainVuln)
    if (expectedConfig.explainVuln) {
        const vulnField = await appWindow.locator('[id="customVulnWrap"]').locator('textarea')
        await expect(vulnField).toHaveValue(expectedConfig.customVulnerability)
        const previewVuln = await appWindow.locator('[id="pvVulnWrap"]')
        await expect(previewVuln).toBeVisible()
        await expect(previewVuln).toContainText('learn about vulnerability')

    }

    const explainRisk = await appWindow.locator('[type=checkbox][id="ckExplainRisk"]').evaluate(el => el.checked)
    expect(explainRisk).toBe(expectedConfig.explainRisk)
    if (expectedConfig.explainRisk) {
        const riskField = await appWindow.locator('[id="customRiskWrap"]').locator('textarea')
        await expect(riskField).toHaveValue(expectedConfig.customRisk)
        const previewRisk = await appWindow.locator('[id="pvRiskWrap"]')
        await expect(previewRisk).toBeVisible()
        await expect(previewRisk).toContainText('learn about risk')

    }

    const contextBackground = await appWindow.locator('[type=checkbox][id="ckContextBackground"]').evaluate(el => el.checked)
    expect(contextBackground).toBe(expectedConfig.contextBackground)
    if (expectedConfig.contextBackground) {
        const contextField = await appWindow.locator('[id="customContextWrap"]').locator('textarea')
        await expect(contextField).toHaveValue(expectedConfig.customContext)
        const previewContext = await appWindow.locator('[id="pvContextWrap"]')
        await expect(previewContext).toBeVisible()
        await expect(previewContext).toContainText('This issue relates to a broader security risk that may affect account safety, device protection, or data exposure')
    }

    const timeEst = await appWindow.locator('[type=checkbox][id="ckTimeEst"]').evaluate(el => el.checked)
    expect(timeEst).toBe(expectedConfig.timeEst)

    const transparency = await appWindow.locator('[type=checkbox][id="ckTransparency"]').evaluate(el => el.checked)
    expect(transparency).toBe(expectedConfig.transparency)
    if (expectedConfig.transparency) {
        const transparencyField = await appWindow.locator('[id="customTransparencyWrap"]').locator('textarea')
        await expect(transparencyField).toHaveValue(expectedConfig.customTransparency)
        const previewTransparency = await appWindow.locator('[id="pvTransparencyWrap"]')
        await expect(previewTransparency).toBeVisible()
        await expect(previewTransparency).toContainText('Why you are seeing this: the system detected a security-relevant event.')
    }

    const consequences = await appWindow.locator('[type=checkbox][id="ckConsequences"]').evaluate(el => el.checked)
    expect(consequences).toBe(expectedConfig.consequences)
    if (expectedConfig.consequences) {
        const consequencesField = await appWindow.locator('[id="customConsequencesWrap"]').locator('textarea')
        await expect(consequencesField).toHaveValue(expectedConfig.customConsequences)
        const previewConsequences = await appWindow.locator('[id="pvConsequencesWrap"]')
        await expect(previewConsequences).toBeVisible()
        await expect(previewConsequences).toContainText('If ignored, the issue may continue to increase security exposure.')
        const previewInfoStrip = await appWindow.locator('[id="pvInfoStrip"]')
        await expect(previewInfoStrip).toBeVisible()
        await expect(previewInfoStrip).toContainText('Consequences shown')
    }

    const supportLinks = await appWindow.locator('[type=checkbox][id="ckSupportLinks"]').evaluate(el => el.checked)
    expect(supportLinks).toBe(expectedConfig.supportLinks)
    if (expectedConfig.supportLinks) {
        const linksField = await appWindow.locator('[id="customLinksWrap"]').locator('textarea')
        await expect(linksField).toHaveValue(expectedConfig.customLinks)
        const previewLinks = await appWindow.locator('[id="pvSupportLinksWrap"]')
        await expect(previewLinks).toBeVisible()
        // Need to add specific link check
    }

    const preferredDecision = await appWindow.locator('[type=checkbox][id="ckPreferredDecision"]').evaluate(el => el.checked)
    expect(preferredDecision).toBe(expectedConfig.preferredDecision)
    if (expectedConfig.preferredDecision) {
        // Need to add checked to make sure highlight is correct
        const previewInfoStrip = await appWindow.locator('[id="pvInfoStrip"]')
        await expect(previewInfoStrip).toBeVisible()
        await expect(previewInfoStrip).toContainText('Preferred choice highlighted')
    }
    
    const aiTone = await appWindow.locator('[type=checkbox][id="ckAiTone"]').evaluate(el => el.checked)
    expect(aiTone).toBe(expectedConfig.aiTone)

    const urgencyField = await appWindow.locator('.field', { hasText: 'Urgency' }).locator('#urgencySeg')
    const urgencyButton = urgencyField.locator('button[data-u="' + expectedConfig.urgency + '"]')
    await expect(urgencyButton).toHaveClass(/on/)
    // Add preview check

    const interactionField = await appWindow.locator('.field', { hasText: 'Mode of interaction' }).locator('#interactionSeg')
    const interactionButton = interactionField.locator('button[data-i="' + expectedConfig.interaction + '"]')
    await expect(interactionButton).toHaveClass(/on/)
    // Add preview check

    const userWorkflowField = await appWindow.locator('.field', { hasText: 'User workflow' }).locator('#locationSeg')
    const userWorkflowButton = userWorkflowField.locator('button[data-l="' + expectedConfig.location + '"]')
    await expect(userWorkflowButton).toHaveClass(/on/)

    const agencyField = await appWindow.locator('.field', { hasText: 'User agency' }).locator('#agencySeg')
    const agencyButton = agencyField.locator('button[data-a="' + expectedConfig.agency + '"]')
    await expect(agencyButton).toHaveClass(/on/)
    // Add preview check

    const schedule = await appWindow.locator('[type=checkbox][id="ckSchedule"]').evaluate(el => el.checked)
    expect(schedule).toBe(expectedConfig.schedule)
    if (expectedConfig.schedule) {
        const deployDateField = await appWindow.locator('.field', { hasText: 'Deployment date' }).locator('input[type="date"]')
        await expect(deployDateField).toHaveValue(expectedConfig.deployDate)
        const deployHourField = await appWindow.locator('.field', { hasText: 'Preferred hour' }).locator('input[type="time"]')
        await expect(deployHourField).toHaveValue(expectedConfig.deployHour)
        const deployWindowField = await appWindow.locator('.field', { hasText: 'Hour range' }).locator('input[type="text"]')
        await expect(deployWindowField).toHaveValue(expectedConfig.deployWindow)
        const showOnBootup = await appWindow.locator('[type=checkbox][id="ckShowOnBootup"]').evaluate(el => el.checked)
        expect(showOnBootup).toBe(expectedConfig.showOnBootup)
        const showDuringTask = await appWindow.locator('[type=checkbox][id="ckShowDuringTask"]').evaluate(el => el.checked)
        expect(showDuringTask).toBe(expectedConfig.showDuringTask)
    }
    // Add preview check
}