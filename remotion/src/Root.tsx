import { Composition } from "remotion";
import { CartJump } from "./CartJump";
import { HeroFilm } from "./HeroFilm";
import { LipOut } from "./LipOut";
import { Recap2026 } from "./Recap2026";
import { RecapV2 } from "./RecapV2";
import { TeeStrike } from "./TeeStrike";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="StrandRecap"
        component={RecapV2}
        durationInFrames={1065}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Recap2026Classic"
        component={Recap2026}
        durationInFrames={1012}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="HeroFilm"
        component={HeroFilm}
        durationInFrames={680}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="TeeStrike"
        component={TeeStrike}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={640}
      />
      <Composition
        id="CartJump"
        component={CartJump}
        durationInFrames={168}
        fps={30}
        width={1920}
        height={640}
      />
      <Composition
        id="LipOut"
        component={LipOut}
        durationInFrames={195}
        fps={30}
        width={1920}
        height={640}
      />
    </>
  );
};
