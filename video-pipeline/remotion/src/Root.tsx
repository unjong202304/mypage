import React from "react";
import {Composition} from "remotion";
import {Reel, Props} from "./Reel";

const FPS = 30;

export const Root: React.FC = () => (
  <Composition
    id="Reel"
    component={Reel}
    width={720}
    height={1280}
    fps={FPS}
    durationInFrames={FPS}
    defaultProps={{video: "edited.mp4", duration: 1, captions: [], scenes: []} as Props}
    calculateMetadata={({props}) => ({durationInFrames: Math.max(1, Math.ceil(props.duration * FPS))})}
  />
);
