import * as React from "react";
import Svg, { G, Path, Defs, ClipPath } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
import type { WeInnIconProps } from './types';
export function IconChevronDown({
  size = 24,
  color = '#111',
  ...props
}: WeInnIconProps) {
  return (
    <Svg width={size} height={size} fill="none" viewBox="0 0 24 24" {...props}>
      <G clipPath="url(#a)">
        <Path stroke={color} strokeWidth={2} d="m18 9-6 6-6-6" />
      </G>
      <Defs>
        <ClipPath id="a">
          <Path fill="#fff" d="M0 0h24v24H0z" />
        </ClipPath>
      </Defs>
    </Svg>
  );
}