import React from "react";
import {render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import PopupContainer from "../../../src/components/PopupContainer/PopupContainer";


describe("PopupContainer tests", () => {
    it("matches snapshot", () => {
        const state = renderer.create(<PopupContainer/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("renders PopupContainer", () => {
        render(<PopupContainer/>);
        const element = screen.getByTestId("popupContainer");
        expect(element).toBeTruthy();
    });
});