import { Composition } from "remotion";
import { Explainer } from "./Explainer";
import demo from "./storyboards/example.json";
import type { ExplainerProps, Storyboard } from "./types";

const defaultProps: ExplainerProps = { storyboard: demo as Storyboard };

export const Root = () => (
  <Composition
    id="Explainer"
    component={Explainer}
    defaultProps={defaultProps}
    // 尺寸、帧率、时长都跟着分镜走；渲染时用 --props 换成别的分镜即可。
    calculateMetadata={({ props }) => ({
      fps: props.storyboard.fps,
      width: props.storyboard.width,
      height: props.storyboard.height,
      durationInFrames: Math.round(props.storyboard.duration * props.storyboard.fps),
    })}
    fps={30}
    width={1920}
    height={1080}
    durationInFrames={300}
  />
);
