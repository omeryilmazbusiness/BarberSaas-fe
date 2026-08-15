import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { CustomerRoute, StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';
import { formatShopBrand } from '../../../shared/ui/ScreenHeader';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.ManagerLogin
>;

/** Shop manager entry — /:shopSlug/manager */
export function ManagerLoginScreen({ route, navigation }: Props) {
  const shopSlug = route.params?.shopSlug ?? 'acme-barber';
  const { login, isAuthenticated, services } = useAuth();
  const [email, setEmail] = useState('owner@acme.com');
  const [password, setPassword] = useState('secret123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shopName, setShopName] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      navigation.replace(StackRoute.Shop);
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const tenant = await services.tenants.getBySlug(shopSlug);
        if (!cancelled) {
          setShopName(tenant.name);
        }
      } catch {
        if (!cancelled) {
          setShopName(null);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [services.tenants, shopSlug]);

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
          <Text style={styles.brand}>
            {formatShopBrand(shopName, shopSlug)}
          </Text>
          <Text style={styles.badge}>{tr.manager.title}</Text>
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
          <Button
            label={tr.common.signIn}
            onPress={onSubmit}
            loading={loading}
          />
          <Button
            label={tr.manager.customerLoginCta}
            variant="secondary"
            onPress={() =>
              navigation.navigate(StackRoute.Customer, {
                shopSlug,
                screen: CustomerRoute.Login,
              })
            }
            disabled={loading}
          />
        </View>
        <Pressable
          onPress={() => navigation.navigate(StackRoute.ShopDirectory)}
          hitSlop={8}
        >
          <Text style={styles.dirLink}>← {tr.admin.backToShops}</Text>
        </Pressable>
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
  brand: {
    ...typography.brand,
    fontSize: 34,
    letterSpacing: 0,
  },
  badge: {
    ...typography.caption,
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
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
  dirLink: {
    ...typography.label,
    color: colors.muted,
    textAlign: 'center',
  },
});
