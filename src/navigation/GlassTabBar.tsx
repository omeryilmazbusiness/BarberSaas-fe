import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors, layout, radius, spacing, typography } from '../shared/theme';

/**
 * Floating iOS-style liquid glass tab bar for the shop manager shell.
 */
export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, layout.floatingTabBarBottom);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.host, { paddingBottom: bottom }]}
    >
      <View style={styles.shell}>
        {Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, styles.webGlass]} />
        ) : (
          <BlurView
            intensity={55}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        )}
        <View style={styles.row}>
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const color = focused ? colors.ink : colors.muted;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={focused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                onPress={onPress}
                style={({ pressed }) => [
                  styles.item,
                  focused && styles.itemActive,
                  pressed && styles.pressed,
                ]}
              >
                {options.tabBarIcon
                  ? options.tabBarIcon({
                      focused,
                      color,
                      size: 22,
                    })
                  : (
                    <Ionicons name="ellipse-outline" size={22} color={color} />
                  )}
                <Text style={[styles.label, { color }]} numberOfLines={1}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: layout.floatingTabBarHorizontal,
    alignItems: 'center',
  },
  shell: {
    width: '100%',
    maxWidth: 520,
    minHeight: layout.floatingTabBarHeight,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(10, 10, 10, 0.12)',
    backgroundColor: Platform.OS === 'web' ? 'transparent' : 'rgba(255,255,255,0.55)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 10 },
      },
      android: {
        elevation: 10,
      },
      default: {},
    }),
  },
  webGlass: {
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    ...(Platform.OS === 'web'
      ? ({
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        } as Record<string, string>)
      : null),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
    gap: 2,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  itemActive: {
    backgroundColor: 'rgba(10, 10, 10, 0.06)',
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.caption,
    fontSize: 10,
    fontWeight: '600',
  },
});
