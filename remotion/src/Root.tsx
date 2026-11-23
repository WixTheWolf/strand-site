import { Composition } from "remotion";
import { CartJump } from "./CartJump";
import { HeroFilm } from "./HeroFilm";
import { LipOut } from "./LipOut";
import { Recap2026 } from "./Recap2026";
import { RecapV2 } from "./RecapV2";
import { Teaser2027 } from "./Teaser2027";
import { DECADE_DURATION, Decade } from "./Decade";
import { TEN_DURATION, Ten } from "./Ten";
import { TALL_DURATION, Tall } from "./Tall";
import { FILM_DURATION, StrandFilm } from "./StrandFilm";
import { TeeStrike } from "./TeeStrike";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="StrandTall" component={Tall} durationInFrames={TALL_DURATION} fps={30} width={1080} height={1920} />
      <Composition id="StrandTen" component={Ten} durationInFrames={TEN_DURATION} fps={30} width={1920} height={1080} />
      <Composition id="StrandDecade" component={Decade} durationInFrames={DECADE_DURATION} fps={30} width={1920} height={1080} />
      <Composition
        id="StrandFilm"
        component={StrandFilm}
        durationInFrames={FILM_DURATION}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="StrandRecap"
        component={RecapV2}
        durationInFrames={1750}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="Teaser2027"
        component={Teaser2027}
        durationInFrames={790}
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
