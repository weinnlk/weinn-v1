import { Text as TText, styled } from 'tamagui'

export const Text = styled(TText, {
    color: '$color',
    fontFamily: '$body',

    variants: {
        variant: {
            default: {
                fontSize: '$4',
                lineHeight: '$4',
            },
            header: {
                fontSize: '$8',
                lineHeight: '$8',
                fontWeight: 'bold',
                color: '$color',
            },
            title: {
                fontSize: '$7',
                lineHeight: '$7',
                fontWeight: '600',
                color: '$color',
            },
            subtitle: {
                fontSize: '$5',
                lineHeight: '$5',
                color: '$colorHover',
            },
            body: {
                fontSize: '$4',
                lineHeight: '$6',
                color: '$color',
            },
            label: {
                fontSize: '$3',
                lineHeight: '$3',
                color: '$colorPress',
            },
            // Mapping for compatibility
            headlineMedium: {
                fontSize: '$8',
                lineHeight: '$8',
                fontWeight: 'bold',
                color: '$color',
            },
            headlineSmall: {
                fontSize: '$7',
                lineHeight: '$7',
                fontWeight: 'bold',
                color: '$color',
            },
            titleMedium: {
                fontSize: '$5',
                lineHeight: '$5',
                fontWeight: '600',
                color: '$color',
            },
            bodyLarge: {
                fontSize: '$5',
                lineHeight: '$6',
                color: '$color',
            },
            bodyMedium: {
                fontSize: '$4',
                lineHeight: '$6',
                color: '$color',
            },
            bodySmall: {
                fontSize: '$3',
                lineHeight: '$4',
                color: '$color',
            },
        },
    } as const,

    defaultVariants: {
        variant: 'body',
    },
})
