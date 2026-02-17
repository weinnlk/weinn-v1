import { Input as TInput, styled } from 'tamagui'

export const Input = styled(TInput, {
    size: '$4',
    borderWidth: 1,
    borderColor: '$borderColor',
    backgroundColor: '$background',
    color: '$color',

    focusStyle: {
        borderColor: '$primary',
    },
})
