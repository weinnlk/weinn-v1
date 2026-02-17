import { TamaguiProvider, TamaguiProviderProps } from 'tamagui'
import { config } from './tamagui.config'

export interface WeInnProviderProps extends Omit<TamaguiProviderProps, 'config' | 'defaultTheme'> {
    defaultTheme?: string
}

import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export function WeInnProvider({ children, defaultTheme = 'light', ...restProps }: WeInnProviderProps) {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <TamaguiProvider config={config} defaultTheme={defaultTheme} {...restProps}>
                    {children}
                </TamaguiProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    )
}
