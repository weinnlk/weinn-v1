import * as React from 'react';
import { Image, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, Card, IconButton } from '@weinn/ui';
import { useTheme } from 'tamagui';
import Markdown from 'react-native-markdown-display';
import { HomeContentItem } from '../../types';
import { getCta } from '../../utils';

// Replicating styles for Markdown to match theme
const getMarkdownStyles = (theme: any) => ({
    body: { color: theme.onSurface.get(), fontSize: 16, lineHeight: 24 },
    heading1: { color: theme.primary.get(), fontSize: 24, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
    heading2: { color: theme.primary.get(), fontSize: 20, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
    link: { color: theme.primary.get() },
    bullet_list_icon: { color: theme.onSurfaceVariant.get() },
});

export function ContentModalScreen({ route, navigation }: { route: any; navigation: any }) {
    const insets = useSafeAreaInsets();
    const theme = useTheme();
    const item = (route?.params?.item ?? null) as HomeContentItem | null;
    const cta = item ? getCta(item) : null;

    if (!item) return null;

    return (
        <View style={{ flex: 1, backgroundColor: theme.background.get() }}>
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

                    <IconButton
                        icon="close"
                        size={24}
                        onPress={() => navigation.goBack()}
                        style={{
                            position: 'absolute',
                            top: insets.top + 8,
                            left: 16,
                            backgroundColor: theme.surface.get(),
                            borderRadius: 20,
                            width: 40,
                            height: 40,
                            alignItems: 'center',
                            justifyContent: 'center',
                            elevation: 2,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 1 },
                            shadowOpacity: 0.2,
                            shadowRadius: 1.41,
                        }}
                    />
                </View>

                {/* Content */}
                <View style={{ padding: 24, gap: 16 }}>
                    <View>
                        {item.title && (
                            <Text variant="headlineMedium" fontWeight="bold" color="$onSurface">
                                {item.title}
                            </Text>
                        )}
                        {item.subtitle && (
                            <Text variant="bodyLarge" color="$onSurfaceVariant" mt="$2">
                                {item.subtitle}
                            </Text>
                        )}
                    </View>

                    <Markdown style={getMarkdownStyles(theme) as any}>
                        {typeof item?.payload?.body_markdown === 'string' ? item.payload.body_markdown : ''}
                    </Markdown>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            {cta && (
                <Card
                    variant="elevated"
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        paddingHorizontal: 16,
                        paddingTop: 16,
                        paddingBottom: insets.bottom + 16,
                        backgroundColor: theme.surface.get(),
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                    }}
                >
                    <Button
                        variant="primary"
                        onPress={() => {
                            if (cta.action.type === 'navigate_tab') {
                                navigation.navigate('Tabs', { screen: cta.action.tab });
                            }
                        }}
                        size="$4"
                        borderRadius={12}
                    >
                        {cta.label}
                    </Button>
                </Card>
            )}
        </View>
    );
}
