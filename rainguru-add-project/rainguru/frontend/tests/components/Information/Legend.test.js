import React from "react";
import {render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import Legend from "../../../src/components/Information/Legend";

describe("Legend tests", () => {

    it("matches snapshot", () => {
        const state = renderer.create(<Legend/>).toJSON();
        expect(state).toMatchSnapshot();
    });


    it("renders legend", () => {
        const {getByTestId} = render(<Legend/>);
        expect(getByTestId("legend-box")).toBeTruthy();
    });

    it("renders legend text correctly", () => {
        const {getByTestId} = render(<Legend/>);
        expect(getByTestId("legend-box")).toHaveTextContent("Precipitation [mm/h]");
        expect(getByTestId("legend-box")).toHaveTextContent("0.1");
        expect(getByTestId("legend-box")).toHaveTextContent("1");
        expect(getByTestId("legend-box")).toHaveTextContent("10");
        expect(getByTestId("legend-box")).toHaveTextContent(">100");
    });
});