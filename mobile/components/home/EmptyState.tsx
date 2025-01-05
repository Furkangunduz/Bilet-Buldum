import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  selectedStatuses?: string[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedStatuses }) => {
  const { t } = useTranslation();

  if (!selectedStatuses || selectedStatuses.length === 0) {
    return <View className="flex-1 items-center justify-center">
    <View className="items-center gap-4 mb-12">
      <Ionicons name="train" size={64} color="#666" />
      <Text className="text-xl font-semibold text-foreground text-center">
        {t('home.emptyState.readyToStart')}
      </Text>
      <Text className="text-muted-foreground text-center">
        {t('home.emptyState.description')}
      </Text>
    </View>
  </View>;
  }

  if (selectedStatuses.length === 1) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-muted-foreground text-base text-center">
          {t('home.emptyState.noAlertsWithStatus', {
            status: selectedStatuses[0] === 'PENDING' 
              ? t('home.alerts.status.PENDING').toLowerCase()
              : selectedStatuses[0] === 'COMPLETED'
              ? t('home.alerts.status.COMPLETED').toLowerCase()
              : t('home.alerts.status.FAILED').toLowerCase()
          })}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center gap-4 mb-12">
        <Ionicons name="train" size={64} color="#666" />
        <Text className="text-xl font-semibold text-foreground text-center">
          {t('home.emptyState.readyToStart')}
        </Text>
        <Text className="text-muted-foreground text-center">
          {t('home.emptyState.description')}
        </Text>
      </View>
    </View>
  );
}; 