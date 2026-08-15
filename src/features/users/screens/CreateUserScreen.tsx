import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../../core/auth/AuthContext';
import { UserRole, type UserRole as Role } from '../../../shared/constants/roles';
import { StackRoute } from '../../../shared/constants/routes';
import type { RootStackParamList } from '../../../navigation/types';
import { colors, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Screen } from '../../../shared/ui/Screen';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { errorMessage } from '../../../shared/ui/format';

type Props = NativeStackScreenProps<RootStackParamList, typeof StackRoute.CreateUser>;

const selectableRoles: Role[] = [
  UserRole.Manager,
  UserRole.Staff,
  UserRole.Customer,
];

export function CreateUserScreen({ navigation }: Props) {
  const { services } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>(UserRole.Customer);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await services.users.create({
        email: email.trim(),
        password,
        full_name: fullName.trim(),
        role,
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
        title="Add user"
        subtitle="Owner role cannot be created here"
        onBack={() => navigation.goBack()}
      />
      <View style={styles.form}>
        <Input
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          placeholder="Can Yılmaz"
        />
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <Input
          label="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.roles}>
          <Text style={styles.roleLabel}>Role</Text>
          <View style={styles.chips}>
            {selectableRoles.map((r) => (
              <Text
                key={r}
                onPress={() => setRole(r)}
                style={[styles.chip, role === r && styles.chipActive]}
              >
                {r}
              </Text>
            ))}
          </View>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Button
          label="Create user"
          onPress={onSubmit}
          loading={loading}
          disabled={fullName.trim().length < 2 || !email || password.length < 6}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md,
  },
  roles: {
    gap: spacing.sm,
  },
  roleLabel: {
    ...typography.label,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    ...typography.label,
    fontSize: 13,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    overflow: 'hidden',
    color: colors.ink,
    textTransform: 'capitalize',
  },
  chipActive: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
    color: colors.accent,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
});
