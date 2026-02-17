import { Button as TButton, styled, Spinner, GetProps } from 'tamagui'
import { forwardRef } from 'react'

const StyledButton = styled(TButton, {
    // Default props
    size: '$4',
    backgroundColor: '$background',
    borderRadius: '$3', // 8px for inner elements/buttons
    pressStyle: { opacity: 0.9 }, // Subtle press effect by default

    variants: {
        variant: {
            primary: {
                backgroundColor: '$primary',
                color: '$onPrimary',
                hoverStyle: {
                    backgroundColor: '$primaryHover',
                },
                pressStyle: {
                    backgroundColor: '$primaryPress',
                }
            },
            secondary: {
                backgroundColor: '$secondary',
                color: '$onSecondary',
                hoverStyle: {
                    backgroundColor: '$secondaryHover',
                },
                pressStyle: {
                    backgroundColor: '$secondaryPress',
                }
            },
            outline: {
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: '$outline',
                color: '$primary',
                hoverStyle: {
                    backgroundColor: '$backgroundHover',
                },
                pressStyle: {
                    backgroundColor: '$backgroundPress',
                }
            },
            ghost: {
                backgroundColor: 'transparent',
                borderWidth: 0,
                color: '$primary',
                hoverStyle: {
                    backgroundColor: '$surfaceVariant',
                },
                pressStyle: {
                    backgroundColor: '$outlineVariant',
                }
            },
        },
    } as const,

    defaultVariants: {
        variant: 'primary',
    },
})

type ButtonProps = GetProps<typeof StyledButton> & {
    loading?: boolean
}

export const Button = StyledButton.styleable<ButtonProps>(
    ({ children, loading, ...props }, ref) => {
        return (
            <StyledButton
                ref={ref}
                {...props}
                icon={loading ? <Spinner color="$color" /> : props.icon}
                disabled={loading || props.disabled}
            >
                {children}
            </StyledButton>
        )
    }
)
