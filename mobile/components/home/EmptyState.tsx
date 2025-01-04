import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Text, View } from 'react-native';

interface EmptyStateProps {
  selectedStatuses: string[];
}

export const EmptyState: React.FC<EmptyStateProps> = ({ selectedStatuses }) => {
  if (selectedStatuses.length === 0) {
    return null;
  }

  if (selectedStatuses.length === 1) {
    return (
      <View className="flex-1 items-center justify-center py-8">
        <Text className="text-muted-foreground text-base text-center">
          {`No ${selectedStatuses[0] === 'PENDING' 
            ? 'processing' 
            : selectedStatuses[0] === 'COMPLETED'
            ? 'found'
            : 'failed'} alerts`}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center">
      <View className="items-center gap-4 mb-12">
        <Ionicons name="train" size={64} color="#666" />
        <Text className="text-xl font-semibold text-foreground text-center">
          Ready to Start Your Journey?
        </Text>
        <Text className="text-muted-foreground text-center">
          Search for train tickets and set alerts for your preferred routes
        </Text>
      </View>
    </View>
  );
}; 