module.exports = function svgrTemplate(variables, { tpl }) {
  const iconName = `Icon${variables.componentName.replace(/^Svg/, '')}`;

  return tpl`
${variables.imports};
import type { WeInnIconProps } from './types';

export function ${iconName}({ size = 24, color = '#111111', ...props }: WeInnIconProps) {
  return (
    ${variables.jsx}
  );
}
`;
};
