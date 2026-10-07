import { AbsoluteFill } from "remotion";
import { SceneView, Wipe } from "./components/SceneView";
import type { Leave } from "./components/SceneView";
import { Background, TalkCard, TopBar, VoiceBar } from "./components/Shell";
import { ThemeContext } from "./lib/anim";
import { getTheme } from "./themes";
import type { ExplainerProps } from "./types";

export const Explainer = ({ storyboard, theme }: ExplainerProps) => {
  const { scenes } = storyboard;
  return (
    <ThemeContext.Provider value={getTheme(theme ?? storyboard.theme)}>
      <AbsoluteFill>
        <Background />
        {scenes.map((scene, i) => {
          const next = scenes[i + 1];
          const leave: Leave = next ? (next.transition ?? "push") : "none";
          return <SceneView key={scene.start} scene={scene} leave={leave} />;
        })}
        {scenes
          .filter((scene) => scene.transition === "wipe")
          .map((scene) => (
            <Wipe key={scene.start} at={scene.start} />
          ))}
        {/* 外壳压在擦除色块之上：换页时人物、页眉、字幕条始终可见 */}
        <TopBar brand={storyboard.brand} />
        <TalkCard talk={storyboard.talk} brand={storyboard.brand} />
        <VoiceBar captions={storyboard.captions} brand={storyboard.brand} />
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
};
