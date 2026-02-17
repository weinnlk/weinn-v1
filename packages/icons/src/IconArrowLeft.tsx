import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

import type { WeInnIconProps } from './types';

export function IconArrowLeft({
  size = 24,
  color = '#111111',
  ...props
}: WeInnIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path d="M15 18l-6-6 6-6" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
