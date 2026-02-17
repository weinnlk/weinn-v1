import { Button as TButton, styled } from 'tamagui'
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export const IconButtonFrame = styled(TButton, {
    size: '$4',
    backgroundColor: 'transparent',
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100, // Circle

    hoverStyle: {
        backgroundColor: '$backgroundHover',
    },

    pressStyle: {
        backgroundColor: '$backgroundPress',
    },
})

// @ts-ignore
import { GetProps } from 'tamagui';

export type IconButtonProps = Omit<GetProps<typeof IconButtonFrame>, 'icon'> & {
    icon: string;
    color?: string;
};

export const IconButton = ({
    icon,
    size = '$4',
    color,
    ...props
}: IconButtonProps) => {
    return (
        <IconButtonFrame size={size} {...props}>
            <Icon name={icon} size={24} color={color || '#000'} />
        </IconButtonFrame>
    )
}
