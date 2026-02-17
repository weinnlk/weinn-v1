import React, { useRef, useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, useTheme } from '@weinn/ui';

interface OtpInputProps {
    code: string;
    onChangeCode: (code: string) => void;
    length?: number;
}

export function OtpInput({ code, onChangeCode, length = 6 }: OtpInputProps) {
    const theme = useTheme();
    const inputRef = useRef<TextInput>(null);
    const [isFocused, setIsFocused] = useState(false);

    const handleContainerPress = () => {
        setIsFocused(true);
        inputRef.current?.focus();
    };

    return (
        <View style={styles.container}>
            <TextInput
                ref={inputRef}
                value={code}
                onChangeText={(text) => {
                    const numeric = text.replace(/[^0-9]/g, '');
                    onChangeCode(numeric.slice(0, length));
                }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={length}
                style={styles.hiddenInput}
                autoFocus
            />
            <TouchableOpacity
                style={styles.inputsContainer}
                activeOpacity={1}
                onPress={handleContainerPress}
            >
                {Array.from({ length }).map((_, index) => {
                    const digit = code[index] || '';
                    const isCurrentDigit = index === code.length;
                    const isLastDigit = index === length - 1;
                    const isCodeFull = code.length === length;

                    const isSelected = isFocused && (isCurrentDigit || (isCodeFull && isLastDigit));

                    return (
                        <View
                            key={index}
                            style={[
                                styles.box,
                                {
                                    borderColor: isSelected
                                        ? theme.primary.val
                                        : theme.outline.val,
                                    backgroundColor: theme.surface.val,
                                    borderWidth: isSelected ? 2 : 1,
                                }
                            ]}
                        >
                            <Text variant="header" style={{ textAlign: 'center', fontWeight: 'bold' }}>
                                {digit}
                            </Text>
                        </View>
                    );
                })}
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    inputsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        gap: 8,
    },
    hiddenInput: {
        position: 'absolute',
        width: 1,
        height: 1,
        opacity: 0,
    },
    box: {
        flex: 1,
        aspectRatio: 0.8,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
});

