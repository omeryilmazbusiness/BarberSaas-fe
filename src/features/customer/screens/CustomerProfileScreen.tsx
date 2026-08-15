import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type {
  CatalogService,
  CustomerAppointment,
  CustomerMe,
} from '../../../core/types/domain';
import { CustomerRoute } from '../../../shared/constants/routes';
import type { CustomerStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { errorMessage } from '../../../shared/ui/format';
import { AppointmentListItem } from '../components/AppointmentListItem';
import { ProfileHero } from '../components/ProfileHero';
import { UsualPreferencesPanel } from '../components/UsualPreferencesPanel';
import { useCustomerSession } from '../session/CustomerSessionContext';
import { useCustomerShop } from '../session/CustomerShopContext';
import { formatPhoneDisplay } from '../utils/format';

type Props = NativeStackScreenProps<
  CustomerStackParamList,
  typeof CustomerRoute.Profile
>;

function splitAppointments(items: CustomerAppointment[]) {
  const now = Date.now();
  const upcoming: CustomerAppointment[] = [];
  const past: CustomerAppointment[] = [];
  for (const item of items) {
    const start = new Date(item.starts_at).getTime();
    const isPast =
      item.status === 'cancelled' ||
      item.status === 'completed' ||
      item.status === 'no_show' ||
      start < now;
    if (isPast) {
      past.push(item);
    } else {
      upcoming.push(item);
    }
  }
  upcoming.sort(
    (a, b) =>
      new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  return { upcoming, past };
}

export function CustomerProfileScreen({ navigation }: Props) {
  const { shopSlug } = useCustomerShop();
  const { services, session, isAuthenticated, logout } = useCustomerSession();
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingAccount, setSavingAccount] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedHint, setSavedHint] = useState(false);
  const [accountSavedHint, setAccountSavedHint] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [editingAccount, setEditingAccount] = useState(false);
  const [catalog, setCatalog] = useState<CatalogService[]>([]);
  const [appointments, setAppointments] = useState<CustomerAppointment[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [draftNotes, setDraftNotes] = useState('');
  const [draftIds, setDraftIds] = useState<string[]>([]);
  const [draftName, setDraftName] = useState('');
  const [draftPhone, setDraftPhone] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigation.replace(CustomerRoute.Login);
    }
  }, [isAuthenticated, navigation]);

  const applyMe = (me: CustomerMe) => {
    const name = me.full_name ?? '';
    const phoneValue = me.phone ?? '';
    setFullName(name);
    setPhone(phoneValue);
    setEmail(me.email ?? '');
    setDraftName(name);
    setDraftPhone(phoneValue);
    const ids = me.preferences?.preferred_service_ids ?? [];
    const prefNotes = me.preferences?.notes ?? '';
    setSelectedIds(ids);
    setNotes(prefNotes);
    setDraftIds(ids);
    setDraftNotes(prefNotes);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [me, list, mine] = await Promise.all([
        services.customerProfile.getMe(),
        services.catalog.list(),
        services.customerAppointments.listMine().catch(() => []),
      ]);
      applyMe(me);
      setCatalog(list.filter((s) => s.is_active !== false));
      setAppointments(mine);
      setEditingPrefs(false);
      setEditingAccount(false);
      setSavedHint(false);
      setAccountSavedHint(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [
    services.customerProfile,
    services.catalog,
    services.customerAppointments,
  ]);

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        void load();
      }
    }, [isAuthenticated, load]),
  );

  const { upcoming, past } = useMemo(
    () => splitAppointments(appointments),
    [appointments],
  );

  const hasPreferences = selectedIds.length > 0;
  const displayName =
    fullName.trim() ||
    session?.customer.full_name ||
    tr.customer.profileGreeting;

  const summaryLabels = useMemo(
    () =>
      selectedIds
        .map((id) => catalog.find((s) => s.id === id)?.name)
        .filter((name): name is string => Boolean(name)),
    [catalog, selectedIds],
  );

  const beginPrefsEdit = () => {
    setDraftIds(selectedIds);
    setDraftNotes(notes);
    setSavedHint(false);
    setError(null);
    setEditingPrefs(true);
  };

  const cancelPrefsEdit = () => {
    setDraftIds(selectedIds);
    setDraftNotes(notes);
    setEditingPrefs(false);
    setSavedHint(false);
    setError(null);
  };

  const toggleDraftService = (id: string) => {
    setDraftIds((current) =>
      current.includes(id)
        ? current.filter((x) => x !== id)
        : [...current, id],
    );
  };

  const persistProfile = async (input: {
    preferred_service_ids: string[];
    notes: string;
    full_name?: string;
    phone?: string;
  }) => {
    const nameToSave = (input.full_name ?? fullName).trim();
    if (nameToSave.length < 2) {
      setError(tr.common.required);
      return null;
    }
    return services.customerProfile.updateMe({
      full_name: nameToSave,
      phone: (input.phone ?? phone).trim() || undefined,
      preferred_service_ids: input.preferred_service_ids,
      notes: input.notes.trim(),
    });
  };

  const onSavePrefs = async () => {
    setSavingPrefs(true);
    setError(null);
    setSavedHint(false);
    try {
      const me = await persistProfile({
        preferred_service_ids: draftIds,
        notes: draftNotes,
      });
      if (!me) {
        return;
      }
      applyMe(me);
      setEditingPrefs(false);
      setSavedHint(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingPrefs(false);
    }
  };

  const beginAccountEdit = () => {
    setDraftName(fullName);
    setDraftPhone(phone);
    setAccountSavedHint(false);
    setError(null);
    setEditingAccount(true);
  };

  const cancelAccountEdit = () => {
    setDraftName(fullName);
    setDraftPhone(phone);
    setEditingAccount(false);
    setAccountSavedHint(false);
    setError(null);
  };

  const onSaveAccount = async () => {
    setSavingAccount(true);
    setError(null);
    setAccountSavedHint(false);
    try {
      const me = await persistProfile({
        preferred_service_ids: selectedIds,
        notes,
        full_name: draftName,
        phone: draftPhone,
      });
      if (!me) {
        return;
      }
      applyMe(me);
      setEditingAccount(false);
      setAccountSavedHint(true);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSavingAccount(false);
    }
  };

  if (!isAuthenticated) {
    return <Screen loading>{null}</Screen>;
  }

  return (
    <Screen scroll padded loading={loading}>
      <ProfileHero
        shopName={session?.tenant.name ?? shopSlug}
        displayName={displayName}
        subtitle={tr.customer.profileSubtitle}
      />

      <View style={styles.actions}>
        <Button
          label={tr.customer.newBooking}
          onPress={() =>
            navigation.navigate(CustomerRoute.Services)
          }
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr.customer.myAppointmentsTitle}</Text>
        {upcoming.length === 0 && past.length === 0 ? (
          <Text style={styles.empty}>{tr.customer.myAppointmentsEmpty}</Text>
        ) : (
          <View style={styles.list}>
            {upcoming.length > 0 ? (
              <>
                <Text style={styles.groupLabel}>
                  {tr.customer.myAppointmentsUpcoming}
                </Text>
                {upcoming.map((item) => (
                  <AppointmentListItem key={item.id} appointment={item} />
                ))}
              </>
            ) : null}
            {past.length > 0 ? (
              <>
                <Text
                  style={[
                    styles.groupLabel,
                    upcoming.length > 0 && styles.groupSpaced,
                  ]}
                >
                  {tr.customer.myAppointmentsPast}
                </Text>
                {past.slice(0, 3).map((item) => (
                  <AppointmentListItem key={item.id} appointment={item} />
                ))}
              </>
            ) : null}
          </View>
        )}
      </View>

      <UsualPreferencesPanel
        hasPreferences={hasPreferences}
        editing={editingPrefs}
        catalog={catalog}
        selectedIds={draftIds}
        notes={draftNotes}
        summaryLabels={summaryLabels}
        saving={savingPrefs}
        savedHint={savedHint}
        onStartCreate={beginPrefsEdit}
        onStartEdit={beginPrefsEdit}
        onCancel={cancelPrefsEdit}
        onToggleService={toggleDraftService}
        onChangeNotes={setDraftNotes}
        onSave={onSavePrefs}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {tr.customer.profileDetailsTitle}
        </Text>
        {editingAccount ? (
          <>
            <Input
              label={tr.customer.profileName}
              value={draftName}
              onChangeText={setDraftName}
              autoCapitalize="words"
            />
            <Input
              label={tr.customer.profilePhone}
              value={draftPhone}
              onChangeText={setDraftPhone}
              keyboardType="phone-pad"
              placeholder={tr.customer.phonePlaceholder}
            />
            {email ? (
              <View style={styles.emailBlock}>
                <Text style={styles.emailLabel}>{tr.customer.profileEmail}</Text>
                <Text style={styles.emailValue}>{email}</Text>
              </View>
            ) : null}
            <View style={styles.editActions}>
              <Button
                label={tr.common.save}
                onPress={onSaveAccount}
                loading={savingAccount}
              />
              <Button
                label={tr.common.cancel}
                variant="ghost"
                onPress={cancelAccountEdit}
                disabled={savingAccount}
              />
            </View>
          </>
        ) : (
          <>
            <View style={styles.summary}>
              <Text style={styles.summaryText}>{displayName}</Text>
              {phone ? (
                <Text style={styles.summaryMeta}>
                  {formatPhoneDisplay(phone.replace(/\D/g, '') || phone)}
                </Text>
              ) : null}
              {email ? (
                <Text style={styles.summaryMeta}>{email}</Text>
              ) : null}
            </View>
            <Button
              label={tr.customer.profileEditCta}
              variant="secondary"
              onPress={beginAccountEdit}
            />
            {accountSavedHint ? (
              <Text style={styles.saved}>{tr.customer.profileAccountSaved}</Text>
            ) : null}
          </>
        )}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.footer}>
        <Button
          label={tr.common.signOut}
          variant="ghost"
          onPress={async () => {
            await logout();
            navigation.replace(CustomerRoute.Login);
          }}
        />
        <Pressable
          onPress={() =>
            navigation.navigate(CustomerRoute.Services)
          }
          hitSlop={8}
        >
          <Text style={styles.backLink}>← {tr.customer.servicesTitle}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    marginBottom: spacing.lg,
  },
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  list: {
    gap: spacing.sm,
  },
  groupLabel: {
    ...typography.caption,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  groupSpaced: {
    marginTop: spacing.sm,
  },
  empty: {
    ...typography.body,
    color: colors.muted,
    lineHeight: 22,
  },
  summary: {
    gap: spacing.xs,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  summaryText: {
    ...typography.label,
    fontSize: 15,
  },
  summaryMeta: {
    ...typography.caption,
  },
  editActions: {
    gap: spacing.sm,
  },
  emailBlock: {
    gap: spacing.xs,
  },
  emailLabel: {
    ...typography.label,
  },
  emailValue: {
    ...typography.body,
    color: colors.muted,
  },
  saved: {
    ...typography.caption,
    color: colors.ink,
  },
  footer: {
    gap: spacing.md,
    paddingBottom: spacing.lg,
    alignItems: 'center',
  },
  backLink: {
    ...typography.label,
    color: colors.muted,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
    marginBottom: spacing.md,
  },
});
