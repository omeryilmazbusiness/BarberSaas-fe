import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
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
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isAuthenticated) {
      navigation.replace(StackRoute.Shop);
    }
  }, [isAuthenticated, navigation]);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login({
        tenant_slug: 'platform',
        email: email.trim(),
        password,
      });
      navigation.replace(StackRoute.Shop);
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
          <Text style={styles.eyebrow}>{tr.admin.eyebrow}</Text>
          <Text style={styles.title}>{tr.admin.title}</Text>
          <Text style={styles.subtitle}>{tr.admin.subtitle}</Text>
        </View>
        <View style={styles.form}>
          <Input
            label={tr.admin.email}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholder="admin@barbersaas.com"
          />
          <Input
            label={tr.admin.password}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label={tr.common.signIn} onPress={onSubmit} loading={loading} />
        </View>
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
  },
  title: {
    ...typography.brand,
  },
  subtitle: {
    ...typography.subtitle,
  },
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
