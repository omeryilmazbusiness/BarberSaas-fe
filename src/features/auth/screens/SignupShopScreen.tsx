import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { AuthRoute } from '../../../shared/constants/routes';
import type { AuthStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<AuthStackParamList, typeof AuthRoute.SignupShop>;

export function SignupShopScreen({ navigation }: Props) {
  const { services, login } = useAuth();
  const [slug, setSlug] = useState('');
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('Europe/Istanbul');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await services.tenants.create({
        slug: slug.trim().toLowerCase(),
        name: name.trim(),
        timezone: timezone.trim() || 'UTC',
        owner: {
          email: email.trim(),
          password,
          full_name: fullName.trim(),
        },
      });
      await login({
        tenant_slug: slug.trim().toLowerCase(),
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
    <Screen>
      <ScreenHeader
        title={tr.signup.title}
        subtitle={tr.signup.subtitle}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <Input
          label={tr.signup.shopName}
          value={name}
          onChangeText={setName}
          placeholder="Acme Barber"
        />
        <Input
          label={tr.signup.slug}
          autoCapitalize="none"
          autoCorrect={false}
          value={slug}
          onChangeText={setSlug}
          placeholder="acme-barber"
        />
        <Input
          label={tr.signup.timezone}
          autoCapitalize="none"
          value={timezone}
          onChangeText={setTimezone}
          placeholder="Europe/Istanbul"
        />
        <Text style={styles.section}>{tr.signup.ownerSection}</Text>
        <Input
          label={tr.signup.ownerName}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Jane Owner"
        />
        <Input
          label={tr.signup.ownerEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label={tr.signup.password}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button label={tr.signup.submit} onPress={onSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  section: {
    ...typography.label,
    marginTop: spacing.sm,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontSize: 11,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
