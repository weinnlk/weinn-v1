import * as React from 'react';
import { Image, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, useTheme, Card, IconButton, YStack } from '@weinn/ui';
import Markdown from 'react-native-markdown-display';

// Replicating styles for Markdown to match theme
const getMarkdownStyles = (theme: any) => ({
    body: { color: theme.onSurface.val, fontSize: 16, lineHeight: 24 },
    heading1: { color: theme.primary.val, fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    heading2: { color: theme.primary.val, fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    link: { color: theme.primary.val },
    bullet_list_icon: { color: theme.onSurfaceVariant.val },
});

type HomeContentApp = 'guest' | 'host';
type HomeContentPlacement = 'home_top_carousel' | 'home_mid';
type HomeContentType = 'promo_hero' | 'article_modal';

type HomeContentAction =
    | { type: 'navigate_tab'; tab: 'Home' | 'Bookings' | 'Messages' | 'Profile' }
    | { type: 'open_article_modal' };

type HomeContentItem = {
    id: string;
    app: HomeContentApp;
    placement: HomeContentPlacement;
    type: HomeContentType;
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    payload: any;
    priority: number;
};

function getCta(item: HomeContentItem): { label: string; action: HomeContentAction } | null {
    const cta = item?.payload?.cta;
    if (!cta) return null;

    const label = typeof cta?.label === 'string' ? cta.label : '';
    const action = cta?.action;

    if (!label || !action || typeof action !== 'object') return null;

    if (action.type === 'navigate_tab' && typeof action.tab === 'string') {
        const tab = action.tab as any;
        if (tab === 'Home' || tab === 'Bookings' || tab === 'Messages' || tab === 'Profile') {
            return { label, action: { type: 'navigate_tab', tab } };
        }
    }

    if (action.type === 'open_article_modal') {
        return { label, action: { type: 'open_article_modal' } };
    }

    return null;
}

export function ContentModalScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const item = (route?.params?.item ?? null) as HomeContentItem | null;
    const cta = item ? getCta(item) : null;

    if (!item) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.val }}>
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
                showsVerticalScrollIndicator={false}
            >
                {/* Hero Image or Spacer */}
                <View>
                    {item.image_url ? (
                        <Image source={{ uri: item.image_url }} style={{ width: '100%', height: 250, resizeMode: 'cover' }} />
                    ) : (
                        <View style={{ height: insets.top + 60 }} />
                    )}

                    {/* Floating Close Button */}
                    <View
                        style={{
                            position: 'absolute',
                            top: insets.top + 8,
                            left: 16,
                            elevation: 2,
                            backgroundColor: theme.surface.val,
                            borderRadius: 24,
                        }}
                    >
                        <IconButton
                            icon="close"
                            color={theme.onSurface.val}
                            size={24}
                            onPress={() => navigation.goBack()}
                        />
                    </View>
                </View>

                {/* Content */}
                <YStack padding="$4" gap="$4">
                    <View>
                        {item.title && (
                            <Text variant="header" style={{ fontWeight: 'bold', color: '$onSurface' }}>
                                {item.title}
                            </Text>
                        )}
                        {item.subtitle && (
                            <Text variant="body" style={{ color: '$onSurfaceVariant', marginTop: 8 }}>
                                {item.subtitle}
                            </Text>
                        )}
                    </View>

                    <Markdown style={getMarkdownStyles(theme) as any}>
                        {typeof item?.payload?.body_markdown === 'string' ? item.payload.body_markdown : ''}
                    </Markdown>
                </YStack>
            </ScrollView>

            {/* Sticky Footer */}
            {cta && (
                <Card
                    elevation="$2"
                    position="absolute"
                    bottom={0}
                    left={0}
                    right={0}
                    paddingHorizontal="$4"
                    paddingTop="$4"
                    paddingBottom={insets.bottom + 16}
                    backgroundColor="$surface"
                    borderTopLeftRadius="$4"
                    borderTopRightRadius="$4"
                    borderRadius={0}
                >
                    <Button
                        variant="primary"
                        onPress={() => {
                            if (cta.action.type === 'navigate_tab') {
                                navigation.navigate('Tabs', { screen: cta.action.tab });
                            }
                        }}
                        borderRadius="$3"
                    >
                        {cta.label}
                    </Button>
                </Card>
            )}
        </View>
    );
}

