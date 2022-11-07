import renderer from "react-test-renderer";
import AppInfoPopup from "../../../src/components/TopBar/AppInfoPopup";
import {fireEvent, render, screen} from "@testing-library/react";
import React from "react";
import TopBar from "../../../src/components/TopBar/TopBar";

jest.mock("../../../src/components/TopBar/PastDataSelector")

describe("AppInfoPopup tests", () => {

    it("matches snapshot", () => {
        const state = renderer.create(<AppInfoPopup state={true} changePopup={jest.fn((e, bool) => e.stopPropagation())} children={"hi"}/>).toJSON();
        expect(state).toMatchSnapshot();
    });


    it("renders AppInfoContainer", () => {
        const {getByTestId} = render(<AppInfoPopup state={true} changePopup={jest.fn((e, bool) => e.stopPropagation())} children={"hi"}/>);
        expect(getByTestId("AppInfoPopupContainer")).toBeTruthy();
    });

    it("clicking on AppInfoContainer test", () => {
        const mockChangePopup = jest.fn();
        const {getByTestId} = render(<AppInfoPopup state={true} changePopup={mockChangePopup} children={"hi"}/>);
        const AppInfoPopupContainer = getByTestId("AppInfoPopupContainer");
        fireEvent.click(AppInfoPopupContainer);
        expect(mockChangePopup).toHaveBeenCalledTimes(1);
    });

    it("clicking on AppInfoContainer test", () => {
        const mockChangePopup = jest.fn((e, bool)=> e.stopPropagation());
        const {getByTestId} = render(<AppInfoPopup state={true} changePopup={mockChangePopup} children={"hi"}/>);
        const AppInfoPopupBox = getByTestId("AppInfoPopupBox");
        fireEvent.click(AppInfoPopupBox);
        expect(mockChangePopup).toHaveBeenCalledTimes(1);
    });

    it("clicking on AppInfoContainer test", () => {
        const mockChangePopup = jest.fn((e, bool)=> e.stopPropagation());
        const {getByTestId} = render(<AppInfoPopup state={true} changePopup={mockChangePopup} children={"hi"}/>);
        const AppInfoPopupContainer = getByTestId("AppInfoCloseButton");
        fireEvent.click(AppInfoPopupContainer);
        expect(mockChangePopup).toHaveBeenCalledTimes(1);
    });
});