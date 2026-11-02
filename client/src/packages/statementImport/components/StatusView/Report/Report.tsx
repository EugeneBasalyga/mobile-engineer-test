import { memo } from 'react';
import { View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

import { Text } from '@/packages/shared/components';
import { useTranslation } from '@/packages/shared/hooks/translation';

import BodyText from '@/packages/statementImport/components/BodyText';
import ImportButton from '@/packages/statementImport/components/ImportButton';
import InfoRow from '@/packages/statementImport/components/InfoRow';
import {
  type IOperation,
  type IRecurringItem,
} from '@/packages/statementImport/models/statementImport';

import { useReport } from './useReport';

interface ReportProps {
  onOpenItem: (item: IRecurringItem) => void;
  operation: IOperation;
}

const styles = StyleSheet.create((theme) => {
  return {
    item: {
      borderColor: theme.shared.border,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      gap: theme.spacing.sm,
      padding: theme.spacing.lg,
    },
    merchant: {
      ...theme.typography.body.l.medium,
    },
    root: {
      gap: theme.spacing.lg,
    },
  };
});

const Report = memo(({ onOpenItem, operation }: ReportProps) => {
  const { t } = useTranslation('statementImport');

  const { reportItems, totalLabel } = useReport(operation);

  if (!reportItems) {
    return null;
  }

  return (
    <View style={styles.root}>
      <InfoRow label={t('report.total')} value={totalLabel} />

      {reportItems.map(({ amountLabel, item }) => (
        <View key={item.id} style={styles.item}>
          <Text style={styles.merchant}>{item.merchant}</Text>

          <BodyText>{amountLabel}</BodyText>

          <BodyText muted>{t('report.lastSeen', { date: item.lastSeen })}</BodyText>

          <ImportButton
            title={t('report.details', { merchant: item.merchant })}
            onPress={() => onOpenItem(item)}
          />
        </View>
      ))}
    </View>
  );
});

Report.displayName = 'Report';

export default Report;
