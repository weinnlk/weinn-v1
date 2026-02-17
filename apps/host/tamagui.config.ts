import { config } from '@weinn/ui/src/tamagui.config'

export default config

export type Conf = typeof config

declare module 'tamagui' {
    interface TamaguiCustomConfig extends Conf { }
}
