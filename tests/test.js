

// Test the loading of default state
import { expect } from "chai";
import { defaultState, modifyDefaultState, getDefaultState } from "../default_state.js";
it ("Test Get Default State", () => {
    const state = getDefaultState();
    expect(state).to.be.an("object");
    expect(state).to.deep.equal(defaultState);
})

it ("Test Modify Default State", () => {
    const originalDefaultState = getDefaultState();
    modifyDefaultState({ title: "New Title" });
    const comparisonState = getDefaultState();
    expect(comparisonState.title).to.equal("New Title");
})