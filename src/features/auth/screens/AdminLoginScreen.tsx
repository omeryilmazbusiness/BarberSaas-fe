import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { isPlatformTenant } from '../../../core/auth/platform';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.AdminLogin
>;

/** SaaS backoffice entry — /admin/login */
export function AdminLoginScreen({ navigation }: Props) {
  const { login, isAuthenticated, tenant } = useAuth();
  const { width } = useWindowDimensions();
  const wide = width >= 880;
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated && isPlatformTenant(tenant)) {
      navigation.replace(StackRoute.Admin);
    }
  }, [isAuthenticated, tenant, navigation]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({
        tenant_slug: 'platform',
        email: email.trim(),
        password,
      });
      navigation.replace(StackRoute.Admin);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const brandPanel = (
    <View style={[styles.brandPanel, wide && styles.brandPanelWide]}>
      <View style={styles.brandGlow} />
      <Text style={styles.eyebrow}>{tr.admin.eyebrow}</Text>
      <Text style={styles.brand}>{tr.admin.brand}</Text>
      <Text style={styles.brandLead}>{tr.admin.title}</Text>
      <View style={styles.brandRule} />
      <Text style={styles.brandSub}>{tr.admin.subtitle}</Text>
    </View>
  );

  const formPanel = (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.formPanel, wide && styles.formPanelWide]}
    >
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>{tr.common.signIn}</Text>
        <Text style={styles.formHint}>{tr.admin.secureNote}</Text>
      </View>

      <View style={styles.form}>
        <Input
          label={tr.admin.email}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="username"
          value={email}
          onChangeText={setEmail}
          placeholder={tr.admin.emailPlaceholder}
        />
        <Input
          label={tr.admin.password}
          secureTextEntry
          autoComplete="password"
          textContentType="password"
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => {
            void onSubmit();
          }}
          returnKeyType="go"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={tr.common.signIn}
          onPress={onSubmit}
          loading={loading}
        />
      </View>

      <Pressable
        accessibilityRole="link"
        onPress={() => navigation.navigate(StackRoute.ShopDirectory)}
        hitSlop={8}
        style={styles.backLink}
      >
        <Text style={styles.backText}>← {tr.admin.backToShops}</Text>
      </Pressable>
    </KeyboardAvoidingView>
  );

  return (
    <Screen scroll={!wide} padded={false}>
      <View style={[styles.shell, wide && styles.shellWide]}>
        {brandPanel}
        {formPanel}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  shell: {
    flexGrow: 1,
    minHeight: '100%',
  },
  shellWide: {
    flexDirection: 'row',
    minHeight: 640,
  },
  brandPanel: {
    backgroundColor: colors.ink,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
    overflow: 'hidden',
    position: 'relative',
  },
  brandPanelWide: {
    flex: 1.05,
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.xxl,
  },
  brandGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255,255,255,0.06)',
    top: -60,
    right: -40,
  },
  eyebrow: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  brand: {
    fontSize: 40,
    fontWeight: '700',
    letterSpacing: -1.2,
    color: colors.white,
    marginTop: spacing.xs,
  },
  brandLead: {
    ...typography.subtitle,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 18,
    marginTop: spacing.sm,
  },
  brandRule: {
    width: 48,
    height: 2,
    backgroundColor: colors.white,
    marginVertical: spacing.md,
  },
  brandSub: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.5)',
    lineHeight: 18,
    maxWidth: 320,
  },
  formPanel: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl,
    backgroundColor: colors.paper,
    gap: spacing.xl,
  },
  formPanelWide: {
    flex: 0.95,
    paddingHorizontal: spacing.xxl,
    maxWidth: 480,
    alignSelf: 'center',
    width: '100%',
  },
  formHeader: {
    gap: spacing.xs,
  },
  formTitle: {
    ...typography.title,
    fontSize: 24,
  },
  formHint: {
    ...typography.caption,
    lineHeight: 17,
  },
  form: {
    gap: spacing.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  backText: {
    ...typography.label,
    color: colors.muted,
  },
});
