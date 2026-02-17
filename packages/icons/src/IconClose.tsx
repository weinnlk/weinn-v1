import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
import type { WeInnIconProps } from './types';
export function IconClose({
  size = 24,
  color = '#111111',
  ...props
}: WeInnIconProps) {
  return <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}><Path fill={color} d="M6.4 19 5 17.6l5.6-5.6L5 6.4 6.4 5l5.6 5.6L17.6 5 19 6.4 13.4 12l5.6 5.6-1.4 1.4-5.6-5.6z" /></Svg>;
}