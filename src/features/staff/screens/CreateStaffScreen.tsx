import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { tr } from '../../../shared/i18n/tr';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<RootStackParamList, typeof StackRoute.CreateStaff>;

export function CreateStaffScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await services.staff.create({
        display_name: displayName.trim(),
        title: title.trim() || undefined,
        is_bookable: true,
      });
      navigation.goBack();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <ScreenHeader
        title={tr.staff.add}
        subtitle={tr.staff.addSubtitle}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <Input
          label={tr.staff.name}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Ali Demir"
        />
        <Input
          label={tr.staff.roleTitle}
          value={title}
          onChangeText={setTitle}
          placeholder="Senior Barber"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label={tr.staff.submit}
          onPress={onSubmit}
          loading={loading}
          disabled={displayName.trim().length < 2}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
