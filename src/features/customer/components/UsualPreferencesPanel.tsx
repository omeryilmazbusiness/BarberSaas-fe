import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { CatalogService } from '../../../core/types/domain';
import { tr } from '../../../shared/i18n/tr';
import { colors, radius, spacing, typography } from '../../../shared/theme';
import { Button } from '../../../shared/ui/Button';
import { ServiceCard } from './ServiceCard';

interface UsualPreferencesPanelProps {
  hasPreferences: boolean;
  editing: boolean;
  catalog: CatalogService[];
  selectedIds: string[];
  notes: string;
  summaryLabels: string[];
  saving: boolean;
  savedHint: boolean;
  onStartCreate: () => void;
  onStartEdit: () => void;
  onCancel: () => void;
  onToggleService: (id: string) => void;
  onChangeNotes: (value: string) => void;
  onSave: () => void;
}

export function UsualPreferencesPanel({
  hasPreferences,
  editing,
  catalog,
  selectedIds,
  notes,
  summaryLabels,
  saving,
  savedHint,
  onStartCreate,
  onStartEdit,
  onCancel,
  onToggleService,
  onChangeNotes,
  onSave,
}: UsualPreferencesPanelProps) {
  if (!editing) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{tr.customer.usualSetupTitle}</Text>
        {hasPreferences ? (
          <>
            <View style={styles.summary}>
              <Text style={styles.activeBadge}>{tr.customer.usualActive}</Text>
              <Text style={styles.summaryText}>
                {summaryLabels.length > 0
                  ? summaryLabels.join(' · ')
                  : tr.customer.groomingTitle}
              </Text>
              {notes.trim() ? (
                <Text style={styles.summaryNotes} numberOfLines={2}>
                  {notes}
                </Text>
              ) : null}
            </View>
            <Button
              label={tr.customer.usualEditCta}
              variant="secondary"
              onPress={onStartEdit}
            />
          </>
        ) : (
          <>
            <Text style={styles.lead}>{tr.customer.usualSetupLead}</Text>
            <Button
              label={tr.customer.usualCreateCta}
              variant="secondary"
              onPress={onStartCreate}
            />
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {hasPreferences
          ? tr.customer.usualEditCta
          : tr.customer.usualCreateCta}
      </Text>
      <Text style={styles.lead}>{tr.customer.groomingSubtitle}</Text>
      <View style={styles.list}>
        {catalog.map((service) => (
          <ServiceCard
            key={service.id}
            service={service}
            selected={selectedIds.includes(service.id)}
            onPress={() => onToggleService(service.id)}
          />
        ))}
      </View>
      <Text style={styles.notesLabel}>{tr.customer.groomingNotes}</Text>
      <TextInput
        value={notes}
        onChangeText={onChangeNotes}
        placeholder={tr.customer.groomingNotesPlaceholder}
        placeholderTextColor={colors.muted}
        multiline
        style={styles.notes}
      />
      <View style={styles.editActions}>
        <Button label={tr.common.save} onPress={onSave} loading={saving} />
        <Button
          label={tr.common.cancel}
          variant="ghost"
          onPress={onCancel}
          disabled={saving}
        />
      </View>
      {savedHint ? (
        <Text style={styles.saved}>{tr.customer.profileSaved}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.label,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  lead: {
    ...typography.caption,
    lineHeight: 18,
    marginTop: -spacing.sm,
  },
  summary: {
    gap: spacing.sm,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
  },
  activeBadge: {
    ...typography.caption,
    color: colors.ink,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  summaryText: {
    ...typography.label,
    fontSize: 14,
  },
  summaryNotes: {
    ...typography.caption,
    lineHeight: 16,
  },
  list: {
    gap: spacing.sm,
  },
  notesLabel: {
    ...typography.label,
  },
  notes: {
    minHeight: 88,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    textAlignVertical: 'top',
    color: colors.ink,
    fontSize: 15,
    backgroundColor: colors.surface,
  },
  editActions: {
    gap: spacing.sm,
  },
  saved: {
    ...typography.caption,
    color: colors.ink,
  },
});
