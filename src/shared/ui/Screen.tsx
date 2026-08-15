import React from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

interface ScreenProps extends ViewProps {
  children: React.ReactNode;
  scroll?: boolean;
  loading?: boolean;
  padded?: boolean;
}

export function Screen({
  children,
  scroll = true,
  loading = false,
  padded = true,
  style,
  ...rest
}: ScreenProps) {
  const content = loading ? (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={colors.accent} />
    </View>
  ) : (
    children
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      {scroll && !loading ? (
        <ScrollView
          contentContainerStyle={[
            styles.content,
            padded && styles.padded,
            style,
          ]}
          keyboardShouldPersistTaps="handled"
          {...rest}
        >
          {content}
        </ScrollView>
      ) : (
        <View style={[styles.content, padded && styles.padded, styles.flex, style]} {...rest}>
          {content}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
  padded: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
  },
});
