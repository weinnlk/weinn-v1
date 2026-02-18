import { config as configBase } from '@tamagui/config/v3'
import { createTamagui, createTokens } from 'tamagui'

const weinnColors = {
    // Primary Brand
    primary: '#000000', // WeInn Black
    onPrimary: '#FFFFFF',

    // Accent
    secondary: '#F6BEFF', // Magenta Accent
    onSecondary: '#000000',
    secondaryContainer: '#FCE7FF',
    onSecondaryContainer: '#590066',

    // Surface Hierarchy
    background: '#FAFAFA', // Surface / Base (Gray 25)
    onBackground: '#171717',
    surface: '#FFFFFF', // Surface / Card
    onSurface: '#171717', // Gray 900
    surfaceVariant: '#F5F5F5', // Gray 50
    onSurfaceVariant: '#404040', // Gray 700

    // Semantic - Success
    success: '#008A05',
    onSuccess: '#FFFFFF',
    successBackground: '#E6F6EA',

    // Semantic - Error
    error: '#E00B41',
    onError: '#FFFFFF',
    errorBackground: '#FCE8EF',

    // Semantic - Warning
    warning: '#FFC800',
    onWarning: '#000000',
    warningBackground: '#FFF8E1',

    // Semantic - InfoP
    info: '#2563EB',
    onInfo: '#FFFFFF',
    infoBackground: '#EFF6FF',

    // Borders
    outline: '#E5E5E5', // Gray 100
    outlineVariant: '#D4D4D4', // Gray 200

    // Neutral Scale
    gray25: '#FAFAFA',
    gray50: '#F5F5F5', // Input BG
    gray100: '#E5E5E5', // Borders
    gray200: '#D4D4D4', // Disabled
    gray300: '#BDBDBD', // Hover
    gray400: '#9E9E9E', // Placeholders
    gray500: '#737373', // Secondary Text
    gray600: '#525252',
    gray700: '#404040',
    gray800: '#262626',
    gray900: '#171717', // Primary Text

    white: '#FFFFFF',
    black: '#000000',

    // Shadow Colors (Alpha)
    shadowColor: 'rgba(0,0,0,0.04)',
    shadowColorStrong: 'rgba(0,0,0,0.08)',
    shadowColorModal: 'rgba(0,0,0,0.12)',
}

const tokens = createTokens({
    ...configBase.tokens,
    color: {
        ...configBase.tokens.color,
        ...weinnColors,
    },
    // Define exact spacing tokens if needed, referencing configBase
})

export const config = createTamagui({
    ...configBase,
    tokens,
    themes: {
        ...configBase.themes,
        light: {
            ...configBase.themes.light,
            ...weinnColors,
            background: weinnColors.background, // Gray 25
            color: weinnColors.onBackground, // Gray 900
            borderColor: weinnColors.outline, // Gray 100
            shadowColor: weinnColors.shadowColor,
        },
        dark: {
            ...configBase.themes.dark,
            ...weinnColors,
            // Enterprise Dark Mode Mapping
            primary: weinnColors.white,
            onPrimary: weinnColors.black,
            background: '#0E0E0E', // Dark Base
            onBackground: weinnColors.white,
            surface: '#171717', // Dark Card
            onSurface: weinnColors.white,
            surfaceVariant: '#262626',
            outline: '#404040',
            borderColor: '#404040',
        }
    }
})

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}
