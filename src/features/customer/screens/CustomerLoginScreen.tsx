import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';
import { useCustomerSession } from '../session/CustomerSessionContext';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Login
>;

export function CustomerLoginScreen({ route, navigation }: Props) {
  const shopSlug = route.params.shopSlug;
  const { loginWithPhone, loginWithGoogle, services, isAuthenticated } =
    useCustomerSession();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace(CustomerRoute.Services, { shopSlug });
    }
  }, [isAuthenticated, navigation, shopSlug]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithPhone(shopSlug, phone);
      navigation.replace(CustomerRoute.Services, { shopSlug });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = async () => {
    setError(null);
    if (!services.googleSignIn.isConfigured() && !services.useMockApi) {
      setError(tr.customer.googleUnavailable);
      return;
    }
    setGoogleLoading(true);
    try {
      await loginWithGoogle(shopSlug);
      navigation.replace(CustomerRoute.Services, { shopSlug });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Screen scroll padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>{shopSlug}</Text>
          <Text style={styles.title}>{tr.customer.loginTitle}</Text>
          <Text style={styles.subtitle}>{tr.customer.loginSubtitle}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={tr.customer.phoneLabel}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            value={phone}
            onChangeText={setPhone}
            placeholder={tr.customer.phonePlaceholder}
            maxLength={15}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={tr.customer.continuePhone}
            onPress={onSubmit}
            loading={loading}
            disabled={googleLoading}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{tr.customer.or}</Text>
            <View style={styles.dividerLine} />
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={loading || googleLoading}
            onPress={onGoogle}
            style={({ pressed }) => [
              styles.googleBtn,
              pressed && styles.googlePressed,
              (loading || googleLoading) && styles.googleDisabled,
            ]}
          >
            <Ionicons name="logo-google" size={18} color={colors.ink} />
            <Text style={styles.googleLabel}>
              {googleLoading ? tr.customer.googleLoading : tr.customer.googleCta}
            </Text>
          </Pressable>
        </View>

        {services.useMockApi ? (
          <Text style={styles.hint}>{tr.customer.mockHint}</Text>
        ) : null}
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
    paddingTop: spacing.xxl,
  },
  hero: {
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    color: colors.muted,
  },
  title: {
    ...typography.brand,
  },
  subtitle: {
    ...typography.subtitle,
    maxWidth: 320,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  hint: {
    ...typography.caption,
    color: colors.muted,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.line,
  },
  dividerText: {
    ...typography.caption,
    textTransform: 'lowercase',
  },
  googleBtn: {
    minHeight: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  googlePressed: {
    opacity: 0.88,
  },
  googleDisabled: {
    opacity: 0.5,
  },
  googleLabel: {
    ...typography.label,
    fontSize: 15,
  },
});
