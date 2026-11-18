import { Composition } from "remotion";
import { CartJump } from "./CartJump";
import { LipOut } from "./LipOut";
import { TeeStrike } from "./TeeStrike";

export const RemotionRoot: React.FC = () => {
  return (
    <>
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
