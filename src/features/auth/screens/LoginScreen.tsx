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
import { useAuth } from '../../../core/auth/AuthContext';
import { AuthRoute } from '../../../shared/constants/routes';
import type { AuthStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<AuthStackParamList, typeof AuthRoute.Login>;

export function LoginScreen({ navigation }: Props) {
  const { login, services } = useAuth();
  const [tenantSlug, setTenantSlug] = useState('acme-barber');
  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('secret123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({
        tenant_slug: tenantSlug.trim(),
        email: email.trim(),
        password,
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll padded>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrap}
      >
        <View style={styles.hero}>
          <View style={styles.logoMark}>
            <Ionicons name="cut-outline" size={28} color={colors.white} />
          </View>
          <Text style={styles.brand}>{tr.shopLogin.brand}</Text>
          <Text style={styles.tagline}>{tr.shopLogin.tagline}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={tr.shopLogin.slug}
            autoCapitalize="none"
            autoCorrect={false}
            value={tenantSlug}
            onChangeText={setTenantSlug}
            placeholder="acme-barber"
          />
          <Input
            label={tr.shopLogin.email}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@shop.com"
          />
          <Input
            label={tr.shopLogin.password}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button label={tr.shopLogin.signIn} onPress={onSubmit} loading={loading} />

          <Pressable
            onPress={() => navigation.navigate(AuthRoute.SignupShop)}
            style={styles.linkWrap}
          >
            <Text style={styles.link}>{tr.shopLogin.openShop}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.accent} />
          </Pressable>
        </View>

        {services.useMockApi ? (
          <View style={styles.mockHint}>
            <Ionicons name="flask-outline" size={16} color={colors.muted} />
            <Text style={styles.mockText}>{tr.shopLogin.mockHint}</Text>
          </View>
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
  logoMark: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  brand: {
    ...typography.brand,
  },
  tagline: {
    ...typography.subtitle,
    maxWidth: 280,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  linkWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
  },
  link: {
    ...typography.label,
    color: colors.accent,
  },
  mockHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.accentSoft,
  },
  mockText: {
    ...typography.caption,
    flex: 1,
    color: colors.muted,
  },
});
