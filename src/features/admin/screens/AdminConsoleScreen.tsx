import React, { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { isPlatformTenant } from '../../../core/auth/platform';
import type { Tenant } from '../../../core/types/domain';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<RootStackParamList, typeof StackRoute.Admin>;

function formatRegisteredAt(iso?: string): string {
  if (!iso) {
    return '—';
  }
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso));
}

export function AdminConsoleScreen({ navigation }: Props) {
  const { services, tenant, logout, isAuthenticated } = useAuth();
  const [shops, setShops] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');

  React.useEffect(() => {
    if (!isAuthenticated || !isPlatformTenant(tenant)) {
      navigation.replace(StackRoute.AdminLogin);
    }
  }, [isAuthenticated, tenant, navigation]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await services.tenants.list();
      setShops(
        list
          .filter((t) => t.slug !== 'platform')
          .sort((a, b) => {
            const ta = a.created_at ? new Date(a.created_at).getTime() : 0;
            const tb = b.created_at ? new Date(b.created_at).getTime() : 0;
            return tb - ta;
          }),
      );
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [services.tenants]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const resetForm = () => {
    setName('');
    setSlug('');
    setOwnerName('');
    setOwnerEmail('');
    setOwnerPassword('');
    setShowForm(false);
    setSavedHint(false);
  };

  const onCreate = async () => {
    setSaving(true);
    setError(null);
    setSavedHint(false);
    try {
      const cleanSlug = slug.trim().toLowerCase();
      await services.tenants.create({
        slug: cleanSlug,
        name: name.trim(),
        timezone: 'Europe/Istanbul',
        owner: {
          email: ownerEmail.trim(),
          password: ownerPassword,
          full_name: ownerName.trim(),
        },
      });
      await load();
      resetForm();
      setSavedHint(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen scroll padded loading={loading}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{tr.adminConsole.eyebrow}</Text>
        <Text style={styles.title}>{tr.adminConsole.title}</Text>
        <Text style={styles.subtitle}>{tr.adminConsole.subtitle}</Text>
      </View>

      <View style={styles.actions}>
        {!showForm ? (
          <Button
            label={tr.adminConsole.addBarber}
            onPress={() => {
              setSavedHint(false);
              setShowForm(true);
            }}
          />
        ) : null}
      </View>

      {showForm ? (
        <View style={styles.form}>
          <Text style={styles.formTitle}>{tr.adminConsole.addBarber}</Text>
          <Input
            label={tr.adminConsole.shopName}
            value={name}
            onChangeText={setName}
            placeholder="Acme Barber"
          />
          <Input
            label={tr.adminConsole.slug}
            value={slug}
            onChangeText={setSlug}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="acme-barber"
          />
          <Input
            label={tr.adminConsole.ownerName}
            value={ownerName}
            onChangeText={setOwnerName}
          />
          <Input
            label={tr.adminConsole.ownerEmail}
            value={ownerEmail}
            onChangeText={setOwnerEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label={tr.adminConsole.ownerPassword}
            value={ownerPassword}
            onChangeText={setOwnerPassword}
            secureTextEntry
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            label={tr.adminConsole.save}
            onPress={onCreate}
            loading={saving}
          />
          <Button
            label={tr.common.cancel}
            variant="ghost"
            onPress={resetForm}
            disabled={saving}
          />
        </View>
      ) : null}

      {!showForm && error ? <Text style={styles.error}>{error}</Text> : null}
      {savedHint ? (
        <Text style={styles.saved}>{tr.adminConsole.created}</Text>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr.adminConsole.listTitle}</Text>
        {shops.length === 0 ? (
          <Text style={styles.empty}>{tr.adminConsole.empty}</Text>
        ) : (
          <View style={styles.list}>
            {shops.map((shop) => (
              <View key={shop.id} style={styles.row}>
                <View style={styles.rowText}>
                  <Text style={styles.shopName}>{shop.name}</Text>
                  <Text style={styles.shopSlug}>/{shop.slug}</Text>
                </View>
                <Text style={styles.date}>
                  {formatRegisteredAt(shop.created_at)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Button
        label={tr.common.signOut}
        variant="ghost"
        onPress={async () => {
          await logout();
          navigation.replace(StackRoute.AdminLogin);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm,
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  eyebrow: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    ...typography.title,
  },
  subtitle: {
    ...typography.subtitle,
  },
  actions: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
    marginBottom: spacing.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  formTitle: {
    ...typography.label,
    fontSize: 15,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 15,
  },
  list: {
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  shopName: {
    ...typography.label,
    fontSize: 15,
  },
  shopSlug: {
    ...typography.caption,
  },
  date: {
    ...typography.caption,
    textAlign: 'right',
    maxWidth: 120,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.sm,
  },
  saved: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
});
