import * as React from 'react';
import Svg, { Circle } from 'react-native-svg';

import type { WeInnIconProps } from './types';

export function IconWeInnMark(props: WeInnIconProps) {
  const { size = 24, color = 'currentColor', ...rest } = props;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...rest}>
      <Circle cx={12} cy={12} r={9} stroke={color} strokeWidth={2} />
      <Circle cx={12} cy={12} r={2} fill={color} />
    </Svg>
  );
}
