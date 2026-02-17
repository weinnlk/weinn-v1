import { XStack, styled } from 'tamagui'
import { Text } from './Text'
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// Basic styled container
const ChipFrame = styled(XStack, {
    backgroundColor: '$background',
    borderRadius: '$4',
    paddingHorizontal: '$3',
    paddingVertical: '$1.5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',

    variants: {
        variant: {
            outlined: {
                backgroundColor: 'transparent',
                borderColor: '$borderColor',
            },
            filled: {
                backgroundColor: '$secondaryContainer',
            },
        },
    } as const,

    defaultVariants: {
        variant: 'filled',
    },
})

export const Chip = ({
    icon,
    children,
    variant = 'filled',
    color,
    ...props
}: {
    icon?: string | React.ReactNode;
    children: React.ReactNode;
    variant?: 'outlined' | 'filled';
    color?: string;
    [key: string]: any
}) => {
    return (
        <ChipFrame variant={variant} {...props}>
            {typeof icon === 'string' ? (
                <Icon
                    name={icon}
                    size={16}
                    color={color || (variant === 'filled' ? '#002114' : '#000')}
                    style={{ marginRight: 6 }}
                />
            ) : (
                icon
            )}
            <Text
                variant="label"
                color={color || (variant === 'filled' ? '#002114' : '$color')}
                fontWeight="600"
            >
                {children}
            </Text>
        </ChipFrame>
    )
}
