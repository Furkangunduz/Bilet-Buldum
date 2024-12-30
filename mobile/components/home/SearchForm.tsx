import { Ionicons } from '@expo/vector-icons';
import { Animated, Pressable, Text, TouchableOpacity, View } from 'react-native';

interface SearchFormProps {
  searchForm: {
    from: string;
    fromId: string;
    to: string;
    toId: string;
    date: string;
    cabinClass: string;
    cabinClassName: string;
    departureTimeRange: {
      start: string;
      end: string;
    };
  };
  onShowStationModal: (type: 'from' | 'to' | 'cabin') => void;
  onShowDatePicker: () => void;
  onShowTimePicker: (type: 'start' | 'end') => void;
  onSwapStations: () => void;
  spin: Animated.AnimatedInterpolation<string>;
}

export function SearchForm({
  searchForm,
  onShowStationModal,
  onShowDatePicker,
  onShowTimePicker,
  onSwapStations,
  spin
}: SearchFormProps) {
  return (
    <View className="space-y-10 relative">
      <View >
        <Text className="text-sm font-medium text-foreground my-2">From</Text>
        <TouchableOpacity
          onPress={() => onShowStationModal('from')}
          className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
        >
          <Ionicons name="train-outline" size={20} color="#666" />
          <Text 
            className={`flex-1 ml-3 text-base ${searchForm.from ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {searchForm.from || 'Select departure station'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Swap Button */}
      <TouchableOpacity 
        onPress={onSwapStations}
        className="absolute right-2 top-20 z-10 bg-primary w-10 h-10 rounded-full items-center justify-center shadow-sm"
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="swap-vertical" size={24} color="white" />
        </Animated.View>
      </TouchableOpacity>

      <View >
        <Text className="text-sm font-medium text-foreground my-2">To</Text>
        <TouchableOpacity
          onPress={() => searchForm.fromId && onShowStationModal('to')}
          className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          style={{ opacity: searchForm.fromId ? 1 : 0.5 }}
        >
          <Ionicons name="train-outline" size={20} color="#666" />
          <Text 
            className={`flex-1 ml-3 text-base ${searchForm.to ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {!searchForm.fromId 
              ? 'Select departure station first'
              : searchForm.to || 'Select arrival station'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View >
        <Text className="text-sm font-medium text-foreground my-2">Date</Text>
        <Pressable 
          className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          onPress={onShowDatePicker}
        >
          <Ionicons name="calendar-outline" size={20} color="#666" />
          <Text className="flex-1 ml-3 text-base text-muted-foreground">
            {searchForm.date || 'Select date'}
          </Text>
        </Pressable>
      </View>

      <View >
        <Text className="text-sm font-medium text-foreground my-2">Cabin Class</Text>
        <TouchableOpacity
          onPress={() => onShowStationModal('cabin')}
          className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
        >
          <Ionicons name="business-outline" size={20} color="#666" />
          <Text 
            className={`flex-1 ml-3 text-base ${searchForm.cabinClassName ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            {searchForm.cabinClassName || 'Select cabin class'}
          </Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View >
        <Text className="text-sm font-medium text-foreground my-2">Departure Time Range</Text>
        <View className="flex-row gap-4">
          <TouchableOpacity
            onPress={() => onShowTimePicker('start')}
            className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text className="flex-1 ml-3 text-base text-muted-foreground">
              {searchForm.departureTimeRange.start || 'Start Time'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => onShowTimePicker('end')}
            className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          >
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text className="flex-1 ml-3 text-base text-muted-foreground">
              {searchForm.departureTimeRange.end || 'End Time'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity 
        className="bg-primary h-14 rounded-xl items-center justify-center mt-6 shadow-sm"
        style={{
          elevation: 2,
        }}
      >
        <Text className="text-primary-foreground font-semibold text-base">
          Create Alert
        </Text>
      </TouchableOpacity>
    </View>
  );
} 