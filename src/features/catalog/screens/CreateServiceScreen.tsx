import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<
  RootStackParamList,
  typeof StackRoute.CreateService
>;

export function CreateServiceScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [price, setPrice] = useState('250');
  const [currency, setCurrency] = useState('TRY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const durationMinutes = Number(duration);
      const priceMajor = Number(price);
      await services.catalog.create({
        name: name.trim(),
        description: description.trim() || undefined,
        duration_minutes: durationMinutes,
        price_cents: Math.round(priceMajor * 100),
        currency: currency.trim().toUpperCase() || 'TRY',
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
        title="Add service"
        subtitle="Duration drives appointment end time"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <Input label="Name" value={name} onChangeText={setName} placeholder="Haircut" />
        <Input
          label="Description"
          value={description}
          onChangeText={setDescription}
          placeholder="Optional"
        />
        <Input
          label="Duration (minutes)"
          value={duration}
          onChangeText={setDuration}
          keyboardType="number-pad"
        />
        <Input
          label="Price (major units)"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
        />
        <Input
          label="Currency"
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Create service"
          onPress={onSubmit}
          loading={loading}
          disabled={name.trim().length < 2}
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
