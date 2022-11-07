import React from "react";
import {render, screen} from "@testing-library/react";
import renderer from "react-test-renderer";
import "@testing-library/jest-dom/extend-expect";
import Information from "../../../src/components/Information/Information";
import Communication from "../../../src/components/Communication";

beforeEach(() => {
    // set up communication with a timestamp (23:50), so it can't break the tests since it will be requested in most
    // use a correction for timezones so each timezone runs it with the same local time to keep the tests intact
    const timeZoneOffset = ((new Date()).getTimezoneOffset()) * 60;
    Communication.dataTimestamp = new Date(1000 * (1653263400 + timeZoneOffset));
});

describe("Information tests", () => {
    it("matches snapshot", () => {
        const state = renderer.create(<Information/>).toJSON();
        expect(state).toMatchSnapshot();
    });

    it("renders information", () => {
        render(<Information/>);
        const element = screen.getByTestId("information");
        expect(element).toBeTruthy();
    });


    describe("passing props tests", () => {
        it("no change in update prop", () => {
            expect(Information
                .getDerivedStateFromProps({animationBarUpdateProp: 4}, {animationBarUpdateProp: 4})).toBeNull();
        });

        it("change in update prop", () => {
            expect(Information
                .getDerivedStateFromProps({animationBarUpdateProp: 5}, {animationBarUpdateProp: 4}))
                .toStrictEqual({animationBarUpdateProp: 5});
        });
    });
});
