import React from "react";
import {fireEvent, render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import TopBar  from "../../../src/components/TopBar/TopBar";
import Map from "../../../src/components/Map/Map";

jest.mock("../../../src/components/TopBar/PastDataSelector");

// disable certain warnings
const warnings = console.error.bind(console.error)
beforeAll(() => { console.error = errormessage => {
    !errormessage.toString().includes("Warning: `%s` uses `getDerivedStateFromProps` but its initial state is %s. " +
        "This is not recommended. Instead, define the initial state by assigning an object to `this.state` in the " +
        "constructor of `%s`. This ensures that `getDerivedStateFromProps` arguments have a consistent shape.%s")
        && !errormessage.toString().includes("Warning: %s.getDerivedStateFromProps(): " +
        "A valid state object (or null) must be returned. You have returned undefined.%s")
        && warnings(errormessage);
}})
afterAll(() => { console.error = warnings })

afterEach(() => {
    jest.clearAllMocks();
});

describe("TopBar basic tests", () => {
    it("matches snapshot", () => {
        const state = renderer.create(<TopBar/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("renders Topbar properly", () => {
        render(<TopBar/>);
        const element = screen.getByTestId("topBar-container");
        expect(element).toBeTruthy();
    });
});

describe("icons on top bar tests", () => {
    it("user location search works as intended", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const userLocationIcon = screen.getByTestId("user-location");
        Map.map = {locate: jest.fn()};
        expect(Map.map.locate).toBeCalledTimes(0);
        // When the location icon is clicked, method to show user's current location should be called
        fireEvent.click(userLocationIcon);
        expect(Map.map.locate).toBeCalledTimes(1);
    });

    it("tu delft icon button works as intended", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const userLocationIcon = screen.getByTestId("tudelft-location");
        Map.map = {fireEvent: jest.fn()};
        expect(Map.map.fireEvent).toBeCalledTimes(0);
        // When the location icon is clicked, method to show user's current location should be called
        fireEvent.click(userLocationIcon);
        expect(Map.map.fireEvent).toBeCalledTimes(1);
    });
});

describe("items in the sidebar works as intended", () => {

    it("Application information test", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const AppInfoPopupContainer = screen.getByTestId("application-info-popup-container");
        expect(AppInfoPopupContainer).toBeEmptyDOMElement();

        fireEvent.click(AppInfoPopupContainer);
        // when the app info sidebar menu is clicked, AppInfoPopupContainer should no longer be an empty dom element.
        expect(AppInfoPopupContainer.childNodes.length).toBe(1);
        // text of a div inside of AppInfoPopupContainer that appears when clicking on AppInfoPopupContainer
        // should also equal to the corresponding app info popup text set in SideBarData.js
        const title = screen.getByTestId("application-info-popuptext-topbar");
        expect(title.firstChild).toStrictEqual(screen.getByTestId("application-info-popuptext-sidebardata"));
    });

    it("Contributors test", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const ContributorPopupContainer = screen.getByTestId("contributor-popup-container");
        expect(ContributorPopupContainer).toBeEmptyDOMElement();

        fireEvent.click(ContributorPopupContainer);
        // when the contributor sidebar menu is clicked, ContributorPopupContainer should no longer be an empty dom element.
        expect(ContributorPopupContainer.childNodes.length).toBe(1);
        // text of a div inside of ContributorPopupContainer that appears when clicking on ContributorPopupContainer
        // should also equal to the corresponding popup text set in SideBarData.js
        const title = screen.getByTestId("contributor-popuptext-topbar");
        expect(title.firstChild).toStrictEqual(screen.getByTestId("contributor-popuptext-sidebardata"));
    });

    it("Disclaimer test", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const DisclaimerPopupContainer = screen.getByTestId("disclaimer-popup-container");
        expect(DisclaimerPopupContainer).toBeEmptyDOMElement();

        fireEvent.click(DisclaimerPopupContainer);
        // when the disclaimer sidebar menu is clicked, DisclaimerPopupContainer should no longer be an empty dom element.
        expect(DisclaimerPopupContainer.childNodes.length).toBe(1);
        // text of a div inside of DisclaimerPopupContainer that appears when clicked on DisclaimerPopupContainer
        // should also equal to the corresponding disclaimer popup text set in SideBarData.js
        const title = screen.getByTestId("disclaimer-popuptext-topbar");
        expect(title.firstChild).toStrictEqual(screen.getByTestId("disclaimer-popuptext-sidebardata"));
    });

    it("privacy info test", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const PrivacyPopupContainer = screen.getByTestId("privacy-popup-container");
        expect(PrivacyPopupContainer).toBeEmptyDOMElement();

        fireEvent.click(PrivacyPopupContainer);
        // when the privacy info sidebar menu is clicked, PrivacyPopupContainer should no longer be an empty dom element.
        expect(PrivacyPopupContainer.childNodes.length).toBe(1);
        // text of a div inside of PrivacyPopupContainer that appears when PrivacyPopupContainer gets clicked
        // should also equal to the corresponding popup text set in SideBarData.js
        const title = screen.getByTestId("privacy-popuptext-topbar");
        expect(title.firstChild).toStrictEqual(screen.getByTestId("privacy-popuptext-sidebardata"));
    });

    it("acknowledgement test", () => {
        render(<TopBar loadingData={true} updateProp={0} displayData={jest.fn()}/>)
        const AcknowledgementPopupContainer = screen.getByTestId("acknowledgement-popup-container");
        expect(AcknowledgementPopupContainer).toBeEmptyDOMElement();

        fireEvent.click(AcknowledgementPopupContainer);
        // when the acknowledgement menu is clicked, AcknowledgementPopupContainer should no longer be an empty dom element.
        expect(AcknowledgementPopupContainer.childNodes.length).toBe(1);
        // text of a div inside of AcknowledgementPopupContainer that appears when AcknowledgementPopupContainer is
        // clicked should also equal to the corresponding acknowledgement popup text defined in SideBarData.js
        const title = screen.getByTestId("acknowledgement-popuptext-topbar");
        expect(title.firstChild).toStrictEqual(screen.getByTestId("acknowledgement-popuptext-sidebardata"));
    });
});