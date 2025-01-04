import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface StatusFilterProps {
  selectedStatuses: string[];
  onStatusChange: (statuses: string[]) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({ selectedStatuses, onStatusChange }) => {
  return (
    <View className="flex-row gap-2 mb-4">
      <TouchableOpacity
        onPress={() => onStatusChange(['PENDING'])}
        className={`px-3 py-1.5 rounded-full ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'PENDING'
          ? 'bg-yellow-100/80' 
          : 'bg-secondary/50'
        }`}
      >
        <Text className={`text-sm font-medium ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'PENDING'
          ? 'text-yellow-800'
          : 'text-secondary-foreground'
        }`}>
          Processing
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onStatusChange(['COMPLETED'])}
        className={`px-3 py-1.5 rounded-full ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'COMPLETED'
          ? 'bg-green-100/80'
          : 'bg-secondary/50'
        }`}
      >
        <Text className={`text-sm font-medium ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'COMPLETED'
          ? 'text-green-800'
          : 'text-secondary-foreground'
        }`}>
          Found
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onStatusChange(['FAILED'])}
        className={`px-3 py-1.5 rounded-full ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'FAILED'
          ? 'bg-red-100/80'
          : 'bg-secondary/50'
        }`}
      >
        <Text className={`text-sm font-medium ${
          selectedStatuses.length === 1 && selectedStatuses[0] === 'FAILED'
          ? 'text-red-800'
          : 'text-secondary-foreground'
        }`}>
          Failed
        </Text>
      </TouchableOpacity>
    </View>
  );
}; 