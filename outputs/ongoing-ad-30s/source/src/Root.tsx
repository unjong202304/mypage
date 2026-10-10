import React from "react";
import {Composition} from "remotion";
import {Ad} from "./Ad";
import {AdFast} from "./AdFast";
import {FPS} from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="AdFast30" component={AdFast} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 30} defaultProps={{narration: false}} />
    <Composition id="Ad30" component={Ad} width={1080} height={1920} fps={FPS} durationInFrames={FPS * 30} defaultProps={{narration: false}} />
  </>
);
