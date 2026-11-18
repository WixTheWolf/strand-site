import { COLORS } from "./palette";

export const Ball: React.FC<{ size?: number; rotate?: number }> = ({
  size = 48,
  rotate = 0,
}) => {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{ rotate: `${rotate}deg`, display: "block" }}
    >
      <circle cx="12" cy="12" r="11" fill={COLORS.ballWhite} stroke="rgba(0,0,0,0.14)" />
      {[
        [8, 8],
        [14, 7],
        [10, 13],
        [16, 12],
        [12, 17],
        [7, 16],
      ].map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" fill="rgba(0,0,0,0.13)" />
      ))}
    </svg>
  );
};
