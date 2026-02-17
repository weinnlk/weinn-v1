import { config as configBase } from '@tamagui/config/v3'
import { createTamagui, createTokens } from 'tamagui'

const weinnColors = {
    // Primary Brand
    primary: '#000000', // WeInn Black
    onPrimary: '#FFFFFF',

    // Accent
    secondary: '#F6BEFF', // Magenta Pink
    onSecondary: '#000000',
    secondaryContainer: '#FCE7FF', // Lighter Pink
    onSecondaryContainer: '#590066', // Deep Magenta

    // Neutrals
    background: '#FFFFFF', // WeInn White
    onBackground: '#171717', // Gray 900
    surface: '#FFFFFF',
    onSurface: '#171717',
    surfaceVariant: '#FAFAFA', // Gray 25
    onSurfaceVariant: '#404040', // Gray 700

    // Borders & Dividers
    outline: '#E5E5E5', // Gray 100
    outlineVariant: '#D4D4D4', // Gray 200

    // Semantic
    success: '#008A05',
    onSuccess: '#FFFFFF',
    error: '#E00B41',
    onError: '#FFFFFF',
    errorContainer: '#FFE5EC',
    onErrorContainer: '#8C0020',
    warning: '#FFC800',
    onWarning: '#000000',

    // Extra Grays
    gray25: '#FAFAFA',
    gray50: '#F5F5F5',
    gray100: '#E5E5E5',
    gray200: '#D4D4D4',
    gray300: '#A3A3A3',
    gray400: '#737373',
    gray500: '#525252',
    gray600: '#404040',
    gray700: '#262626',
    gray800: '#171717',
    gray900: '#0A0A0A',

    white: '#FFFFFF',
    black: '#000000',

    // Legacy maps for compatibility (can be refactored later)
    tertiary: '#404040', // Gray 700
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F5F5F5', // Gray 50
    onTertiaryContainer: '#171717',
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
            background: weinnColors.background,
            color: weinnColors.onBackground,
            borderColor: weinnColors.outline,
        },
        dark: {
            ...configBase.themes.dark,
            ...weinnColors,
            // Invert core tokens for dark mode
            primary: weinnColors.white,
            onPrimary: weinnColors.black,
            background: weinnColors.gray900,
            onBackground: weinnColors.white,
            surface: weinnColors.gray900,
            onSurface: weinnColors.white,
            surfaceVariant: weinnColors.gray800,
            onSurfaceVariant: weinnColors.gray200,
            outline: weinnColors.gray700,
            borderColor: weinnColors.gray700,
        }
    }
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}
