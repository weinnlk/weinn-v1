import { Avatar as TAvatar, styled, GetProps } from 'tamagui'

const StyledAvatar = styled(TAvatar, {
    circular: true,
    size: '$4', // default size
})

const StyledAvatarImage = styled(TAvatar.Image, {
    // any default image styles
})

const StyledAvatarFallback = styled(TAvatar.Fallback, {
    backgroundColor: '$background',
    justifyContent: 'center',
    alignItems: 'center',
})

export const Avatar = StyledAvatar.styleable<{
    src?: string
    fallback?: React.ReactNode
}>((props, ref) => {
    const { src, fallback, children, ...rest } = props
    return (
        <StyledAvatar ref={ref} {...rest}>
            {src && <StyledAvatarImage source={{ uri: src }} />}
            {fallback && <StyledAvatarFallback>{fallback}</StyledAvatarFallback>}
            {children}
        </StyledAvatar>
    )
})
