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
  typeof StackRoute.ManagerLogin
>;

/** Shop manager entry — /:shopSlug/manager */
export function ManagerLoginScreen({ route, navigation }: Props) {
  const shopSlug = route.params?.shopSlug ?? 'acme-barber';
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('secret123');
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
        tenant_slug: shopSlug,
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
          <Text style={styles.eyebrow}>{shopSlug}</Text>
          <Text style={styles.title}>{tr.manager.title}</Text>
          <Text style={styles.subtitle}>{tr.manager.subtitle}</Text>
        </View>
        <View style={styles.form}>
          <Input
            label={tr.manager.email}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label={tr.manager.password}
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
