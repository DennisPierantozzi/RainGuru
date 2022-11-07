import renderer from "react-test-renderer";
import Slider from "../../../src/components/Information/Slider";
import {render} from "@testing-library/react";
import React from "react";
import Communication  from "../../../src/components/Communication";
import AnimationBar from "../../../src/components/Information/AnimationBar";
import 'jest-canvas-mock';

describe("Slider test", () => {

    it("static variables changed correctly after showPrecipitationData is executed", () => {
        render(<AnimationBar/>)
        const mockFetchPrecipitation = jest.fn().mockReturnValue([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        Communication.fetchPrecipitation = mockFetchPrecipitation;
        const mockMakeChart = jest.fn().mockReturnValue(null)
        Slider.makeChart = mockMakeChart;
        Slider.showPrecipitationData(1,1).then(() => {
            expect(Slider.lastLat).toBe(1);
            expect(Slider.lastLong).toBe(1);
            expect(Slider.predictions).toStrictEqual([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
            const mockFetchPrecipitation2 = jest.fn().mockReturnValue([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
            Communication.fetchPrecipitation = mockFetchPrecipitation2;
            const mockMakeChart2 = jest.fn().mockReturnValue(null)
            Slider.makeChart = mockMakeChart2;
            Slider.showPrecipitationData(2,10).then(() => {
                expect(Slider.lastLat).toBe(2);
                expect(Slider.lastLong).toBe(10);
                expect(Slider.predictions).toStrictEqual([0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
            });
        });
    });
});
