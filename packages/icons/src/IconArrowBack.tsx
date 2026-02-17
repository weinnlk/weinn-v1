import * as React from "react";
import Svg, { Path } from "react-native-svg";
import type { SvgProps } from "react-native-svg";
import type { WeInnIconProps } from './types';
export function IconArrowBack({
  size = 24,
  color = '#111111',
  ...props
}: WeInnIconProps) {
  return <Svg width={24} height={24} fill="none" viewBox="0 0 24 24" {...props}><Path fill={color} d="m8.25 12.9 5.025 5.025L12 19.2 4.8 12 12 4.8l1.275 1.275L8.25 11.1H19.2v1.8z" /></Svg>;
}