import { expect } from '@playwright/test'
import { get } from 'node:http'
import { parse } from 'node:path'
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

    checkButtonHaveClassOn(appWindow, 'Motivation framing', expectedConfig.motivation, '#motivationSeg')

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckInstructionSteps', expectedConfig.instructionSteps)){
        console.log('Checking instruction steps')
        checkTextAreaValueById('customStepsWrap', expectedConfig.customSteps)
        const previewSteps = await appWindow.locator('[id="pvStepsWrap"]')
        await expect(previewSteps).toContainText(expectedConfig.customSteps ? expectedConfig.customSteps : 'Next steps\nReview the notification details.Take the recommended action.Confirm the issue is resolved.')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckDirectAction', expectedConfig.directAction)) {} 

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckExplainVuln', expectedConfig.explainVuln)) {
        checkTextAreaValueById('customVulnWrap', expectedConfig.customVuln)
        checkLocatorVisibilityById('pvVulnWrap', 'learn about vulnerability')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckExplainRisk', expectedConfig.explainRisk)) {
        checkTextAreaValueById('customRiskWrap', expectedConfig.customRisk)
        checkLocatorVisibilityById('pvRiskWrap', 'learn about risk')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckContextBackground', expectedConfig.contextBackground)) {
        checkTextAreaValueById('customContextWrap', expectedConfig.customContext)
        checkLocatorVisibilityById('pvContextWrap', 'This issue relates to a broader security risk that may affect account safety, device protection, or data exposure')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckTimeEst', expectedConfig.timeEst)) {}

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckTransparency', expectedConfig.transparency)) {
        checkTextAreaValueById('customTransparencyWrap', expectedConfig.customTransparency)
        checkLocatorVisibilityById('pvTransparencyWrap', 'Why you are seeing this: the system detected a security-relevant event.')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckConsequences', expectedConfig.consequences)) {
        checkTextAreaValueById('customConsequencesWrap', expectedConfig.customConsequences)
        checkLocatorVisibilityById('pvConsequencesWrap', 'If ignored, the issue may continue to increase security exposure.')
        checkLocatorVisibilityById('pvInfoStrip', 'Consequences shown')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckSupportLinks', expectedConfig.supportLinks)) {
        checkTextAreaValueById('customLinksWrap', expectedConfig.customLinks)
        checkLocatorVisibilityById('pvSupportLinksWrap')
    }

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckPreferredDecision', expectedConfig.preferredDecision)) {
        checkLocatorVisibilityById('pvInfoStrip', 'Preferred choice highlighted')
    }
    
    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckAiTone', expectedConfig.aiTone)) {}

    checkButtonHaveClassOn(appWindow, 'Urgency', expectedConfig.urgency, '#urgencySeg')
    checkUrgencyPreview(expectedConfig.urgency)

    checkButtonHaveClassOn(appWindow, 'Mode of interaction', expectedConfig.interaction, '#interactionSeg')
    checkModeOfInteractionPreview(expectedConfig.interaction)

    checkButtonHaveClassOn(appWindow, 'User workflow', expectedConfig.location, '#locationSeg')
    checkWorkflowPreview(expectedConfig.location)
    
    checkButtonHaveClassOn(appWindow, 'User agency', expectedConfig.agency, '#agencySeg')
    checkUserAgencyPreview(expectedConfig.agency)

    if (await checkCheckboxSpecifiedStateById(appWindow, 'ckSchedule', expectedConfig.schedule)) {
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

    //Helpers
    async function checkTextAreaValueById(fieldId, checkValue) {
        const tempField = await appWindow.locator('[id="' + fieldId + '"]').locator('textarea')
        await expect(tempField).toHaveValue(checkValue)
    }

    async function checkLocatorVisibilityById(fieldId) {
        const tempField = await appWindow.locator('[id="' + fieldId + '"]')
        await expect(tempField).toBeVisible()
    }

    async function checkSuggestionFor(suggestionText) {
        await expect(appWindow.locator('[id="suggestions"]', { hasText: suggestionText })).toBeVisible()
    }

    async function checkUrgencyPreview(expectedUrgency) {
        const preview = await appWindow.locator('[id="badge"]')
        switch (expectedUrgency) {
            case 'low':
                await expect(preview).toHaveClass('badge low')
                break
            case 'medium':
                await expect(preview).toHaveClass('badge medium')
                break
            case 'high':
                await expect(preview).toHaveClass('badge high')
                break
        }
    }

    async function checkModeOfInteractionPreview(expectedInteraction) {
        const preview = await appWindow.locator('.previewCard')
        switch (expectedInteraction) {
            case 'click_box':
                await expect(preview.locator('[id="pvInteraction_click_box"]')).toBeVisible()
                break
            case 'slider':
                await expect(preview.locator('[id="pvInteraction_slider"]')).toBeVisible()
                break
            case 'toggle':
                await expect(preview.locator('[id="pvInteraction_toggle"]')).toBeVisible()
                break
        }
    }

    async function checkWorkflowPreview(expectedWorkflow) {
        const tempField = await appWindow.locator('.field', { hasText: "User workflow" })
        const text = await tempField.locator('[id="locationDesc"]').textContent()
        await expect(text).toBe(expectedWorkflow === 'banner' ? 'Appears at the top or bottom of the screen; non-blocking.' 
                              : expectedWorkflow === 'popup'? 'Appears in the center of the screen; requires user interaction.' 
                              : expectedWorkflow === 'inline' ? 'Appears within the page content; contextual and subtle.'
                              : 'Overlays the full screen; blocks all other interaction.')
    }

    async function checkUserAgencyPreview(expectedAgency) {
        const preview = await appWindow.locator('.previewCard')
        const remindIsVisible = await (preview.locator('[id="remindBtn"]')).isVisible()
        const denyIsVisible = await (preview.locator('[id="denyBtn"]')).isVisible()
        switch (expectedAgency) {
            case 'must_do':
                await expect(remindIsVisible).toBe(false)
                await expect(denyIsVisible).toBe(false)
                break
            case 'remind_later':
                await expect(remindIsVisible).toBe(true)
                await expect(denyIsVisible).toBe(false)
                break
            case 'not_urgent':
                await expect(remindIsVisible).toBe(true)
                await expect(denyIsVisible).toBe(true)
                break
            }
    }
}

    export async function selectSegmentedControlOption(appWindow, hasText, segmentName) {
        const tempLabel = segmentName[1]
        const tempField = segmentName.slice(1)
        const button = await appWindow.locator('[id="' + tempField + '"] button[data-' + tempLabel + '="' + hasText + '"]')
        await button.click()
    }

    export async function checkButtonHaveClassOn(appWindow, hasText, expectedButton, segmentName) {
        const tempLabel = segmentName[1]
        const tempField = await appWindow.locator('.field', { hasText: hasText }).locator(segmentName)
        const tempButton = tempField.locator('button[data-' + tempLabel + '="' + expectedButton + '"]')
        await expect(tempButton).toHaveClass(/on/)
    }

    export async function clickCheckboxById(appWindow, fieldId) {
        const tempField = await appWindow.locator('[type=checkbox][id="' + fieldId + '"]')
        await tempField.click()
    }

    export async function getCheckboxStateById(appWindow, fieldId) {
        const tempField = await appWindow.locator('[type=checkbox][id="' + fieldId + '"]').evaluate(el => el.checked)
        return tempField
    }

    export async function checkCheckboxSpecifiedStateById(appWindow, fieldId, checkValue) {
        const tempField = await getCheckboxStateById(appWindow, fieldId)
        expect(tempField).toBe(checkValue)
        if (tempField) {
            return true
        } else {
            await checkCheckboxNotCheckedRamification(appWindow, fieldId)
        }
    }

    export async function checkCheckboxNotCheckedRamification(appWindow, fieldId) {
        const checkboxMappings = {
        "ckInstructionSteps": "Add step-by-step instructions",
        "ckDirectAction": "Add a direct action button",
        "ckExplainVuln": "Explain the vulnerability",
        "ckExplainRisk": "Explain the risk",
        "ckContextBackground": "Provide context and background",
        "ckTimeEst": "Include a time estimate",
        "ckTransparency": "Explain why this appeared",
        "ckConsequences": "Mention consequences if ignored",
        "ckSupportLinks": "Add decision support links",
        "ckPreferredDecision": "Highlight the preferred option",
        "ckAiTone": "Enable AI tone review",
        "ckSchedule": "Set a deployment schedule",
        "ckShowOnBootup": "Choose a display trigger",
        "ckShowDuringTask": "Choose a display trigger",
        };
        // ckShowOnBootup and ckShowDuringTask are linked, so if one is checked it triggers both and we ignore this ramification
        if (fieldId === 'ckShowOnBootup') {
            const showDuringTask = await getCheckboxStateById(appWindow, 'ckShowDuringTask')
            if (!showDuringTask) {
                await expect(appWindow.locator('[id="suggestions"]', { hasText: checkboxMappings[fieldId] })).toBeVisible()
            }
        }
        else if (fieldId === 'ckShowDuringTask') {
            const showOnBootup = await getCheckboxStateById(appWindow, 'ckShowOnBootup')
            if (!showOnBootup) {
                await expect(appWindow.locator('[id="suggestions"]', { hasText: checkboxMappings[fieldId] })).toBeVisible()
            }
        } else {
            await expect(appWindow.locator('[id="suggestions"]', { hasText: checkboxMappings[fieldId] })).toBeVisible()
        }
    }

    export async function getGuidanceValue(appWindow, fieldId) {
        const tempField = await appWindow.locator('.guide', { hasText: fieldId })
        const tempVal = await tempField.locator('[id="s' + fieldId + '"]').textContent()
        return tempVal
    }

    export async function checkGuidanceValueByMapping(appWindow, fieldId) {
        const guidanceMappings = [
        { objectId: 'ckInstructionSteps', impacts: {'Clarity' : 8, 'Instruction' : 15} },
        { objectId: 'ckDirectAction', impacts: {'Instruction' : 10} },
        { objectId: 'ckExplainVuln', impacts: {'Clarity' : 10, 'Trust' : 8} },
        { objectId: 'ckExplainRisk', impacts: {'Clarity' : 10} },
        { objectId: 'ckContextBackground', impacts: {'Instruction' : 8, 'Decision' : 10} },
        { objectId: 'ckTimeEst', impacts: {'Instruction' : 5} },
        { objectId: 'ckTransparency', impacts: {'Trust' : 20} },
        { objectId: 'ckConsequences', impacts: {'Motivation' : 5, 'Trust' : 8} },
        { objectId: 'ckSupportLinks', impacts: {'Decision' : 20} },
        { objectId: 'ckPreferredDecision', impacts: {'Decision' : 20} },
        { objectId: 'ckAiTone', impacts: {'Tone' : 18} },
        { objectId: 'risk_avoidance', impacts: {'Motivation' : 7} },
        { objectId: 'Message', impacts: {'Clarity' : {'Length' : 50, 'Impact' : 10}, 'Tone' : {'Length' : 20, 'Impact' : 5}} },
        ]

        if (fieldId.startsWith('ck')) {
            const mapping = guidanceMappings.find(mapping => mapping.objectId === fieldId)
            if (mapping) {
                if (await getCheckboxStateById(appWindow, mapping.objectId)) {
                    await clickCheckboxById(appWindow, mapping.objectId)
                }
                for (const [guidanceField, expectedImpact] of Object.entries(mapping.impacts)) {
                    const currentGuidanceValue = await getGuidanceValue(appWindow, guidanceField)
                    await clickCheckboxById(appWindow, mapping.objectId)
                    const newGuidanceValue = await getGuidanceValue(appWindow, guidanceField)
                    expect(newGuidanceValue).toBe((parseInt(currentGuidanceValue) + expectedImpact).toString())
                    await clickCheckboxById(appWindow, mapping.objectId)
                }
            }
        } else if (fieldId === 'Message') {
            const mapping = guidanceMappings.find(mapping => mapping.objectId === fieldId)
            for (const [guidanceField, expectedImpact] of Object.entries(mapping.impacts)) {
                const messageField = await appWindow.locator('.field', { hasText: fieldId }).locator('textarea')
                await messageField.fill('x'.repeat(expectedImpact.Length))
                const messageFieldLength = (await messageField.inputValue()).length
                await expect(messageFieldLength).toBeLessThanOrEqual(expectedImpact.Length)
                const currentMotivationValue = await getGuidanceValue(appWindow, guidanceField)

                await messageField.fill('x'.repeat(expectedImpact.Length+1))
                const newMessageFieldLength = (await messageField.inputValue()).length
                await expect(newMessageFieldLength).toBeGreaterThan(expectedImpact.Length)
                const newMotivationValue = await getGuidanceValue(appWindow, guidanceField)
                expect(newMotivationValue).toBe((parseInt(currentMotivationValue) + mapping.impacts[guidanceField].Impact).toString())

                await messageField.fill('')
            }
        } else if (fieldId === 'risk_avoidance') {
            const mapping = guidanceMappings.find(mapping => mapping.objectId === fieldId)
            for (const [guidanceField, expectedImpact] of Object.entries(mapping.impacts)) {
                await selectSegmentedControlOption(appWindow, 'personal_impact', '#motivationSeg')
                const currentMotivationValue = await getGuidanceValue(appWindow, guidanceField)
                
                await selectSegmentedControlOption(appWindow, 'risk_avoidance', '#motivationSeg')
                const newMotivationValue = await getGuidanceValue(appWindow, guidanceField)
                console.log(`Expected new value: ${parseInt(currentMotivationValue) + mapping.impacts[guidanceField]}`)
                expect(newMotivationValue).toBe((parseInt(currentMotivationValue) + mapping.impacts[guidanceField]).toString()) 
            }
        }
    }

    export async function modifyTextFieldByLabel(appWindow, fieldLabel, locator, newValue) {
        const messageField = await appWindow.locator('.field', { hasText: fieldLabel }).locator(locator)
        await messageField.fill(newValue)
        const fieldValue = await messageField.inputValue()
        await expect(fieldValue).toBe(newValue)
    }

    export async function modifyTextFieldById(appWindow, fieldId, newValue) {
        const messageField = await appWindow.locator(`[id="${fieldId}"]`)
        await messageField.fill(newValue)
        const fieldValue = await messageField.inputValue()
        await expect(fieldValue).toBe(newValue)
    }

    export async function checkExportPagePreview(appWindow, expectedValueString) {
        const previewText = await appWindow.locator('[id=codeOutput]').textContent()
        await expect(previewText).toContain(expectedValueString)
    }

