import { config as configBase } from '@tamagui/config/v3'
import { createTamagui, createTokens } from 'tamagui'

const weinnColors = {
    primary: 'rgb(0, 108, 76)',
    onPrimary: '#FFFFFF',
    primaryContainer: 'rgb(137, 248, 198)',
    onPrimaryContainer: 'rgb(0, 33, 20)',
    secondary: 'rgb(77, 99, 87)',
    onSecondary: '#FFFFFF',
    secondaryContainer: 'rgb(207, 232, 217)',
    onSecondaryContainer: 'rgb(9, 32, 22)',
    tertiary: 'rgb(62, 99, 115)',
    onTertiary: '#FFFFFF',
    tertiaryContainer: 'rgb(194, 232, 253)',
    onTertiaryContainer: 'rgb(0, 31, 40)',
    error: 'rgb(186, 26, 26)',
    onError: '#FFFFFF',
    errorContainer: 'rgb(255, 218, 214)',
    onErrorContainer: 'rgb(65, 0, 2)',
    background: '#FBFDF9',
    onBackground: '#191C1A',
    surface: '#FBFDF9',
    onSurface: '#191C1A',
    surfaceVariant: '#DBE5DE',
    onSurfaceVariant: '#404944',
    outline: '#707974',
    outlineVariant: '#BFC9C2',
    white: '#FFFFFF',
}

const tokens = createTokens({
    ...configBase.tokens,
    color: {
        ...configBase.tokens.color,
        ...weinnColors,
    }
})

export const config = createTamagui({
    ...configBase,
    tokens,
    themes: {
        ...configBase.themes,
        light: {
            ...configBase.themes.light,
            ...weinnColors,
            // Map some basic keys to WeInn colors for consistency
            background: weinnColors.background,
            color: weinnColors.onBackground,
            borderColor: weinnColors.outline,
        },
        // We can define a proper dark theme later, for now extends base or just adds tokens
        dark: {
            ...configBase.themes.dark,
            ...weinnColors,
        }
    }
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}
