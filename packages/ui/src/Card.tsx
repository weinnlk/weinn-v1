import { YStack, styled } from 'tamagui'

export const Card = styled(YStack, {
    backgroundColor: '$background',
    borderRadius: '$4',
    elevation: '$1',
    overflow: 'hidden',

    variants: {
        variant: {
            elevated: {
                elevation: '$2',
                shadowColor: '$shadowColor',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            outlined: {
                borderWidth: 1,
                borderColor: '$borderColor',
                elevation: 0,
            },
            filled: {
                elevation: 0,
                backgroundColor: '$surfaceVariant',
            },
        },
    } as const,

    defaultVariants: {
        variant: 'elevated',
    },
})
