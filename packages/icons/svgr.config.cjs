const path = require('path');

/**
 * SVGR config for react-native-svg icons.
 *
 * Usage:
 * npx svgr --config-file packages/icons/svgr.config.cjs packages/icons/raw --out-dir packages/icons/src
 */
module.exports = {
  native: true,
  typescript: true,
  icon: true,
  prettier: false,
  expandProps: 'end',
  // Replace common hardcoded colors with the `color` prop.
  // This helps keep icons themeable.
  replaceAttrValues: {
    '#111': '{color}',
    '#111111': '{color}',
    '#000': '{color}',
    '#000000': '{color}',
    'black': '{color}',
  },
  svgo: true,
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            removeViewBox: false,
          },
        },
      },
      {
        name: 'removeXMLNS',
        active: true,
      },
    ],
  },
  template: require(path.join(__dirname, 'svgr.template.cjs')),
};
