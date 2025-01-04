import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ActivityIndicator, Alert, Animated, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSearchAlerts } from '~/hooks/useSearchAlerts';
import { api, Station } from '~/lib/api';
import { useAuth } from '~/lib/auth';

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
    wantHighSpeedTrain: boolean;
  };
  onStationSelect: (station: Station, type?: 'from' | 'to') => void;
  onShowStationModal: (type: 'from' | 'to' | 'cabin') => void;
  onShowDatePicker: () => void;
  onShowTimePicker: (type: 'start' | 'end') => void;
  onSwapStations: () => void;
  onToggleHighSpeed: (value: boolean) => void;
  onDateChange: (date: string) => void;
  spin: Animated.AnimatedInterpolation<string>;
  arrivalStations: Station[];
  closeBottomSheet: () => void;
  resetSearchForm: () => void;
  setDepartureTimeRange: (timeRange: { start: string; end: string }) => void;
}

export function SearchForm({
  searchForm,
  onStationSelect,
  onShowStationModal,
  onShowDatePicker,
  onShowTimePicker,
  onSwapStations,
  onToggleHighSpeed,
  onDateChange,
  spin,
  arrivalStations,
  closeBottomSheet,
  resetSearchForm,
  setDepartureTimeRange
}: SearchFormProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { user } = useAuth();
  const { mutate: mutateAlerts } = useSearchAlerts();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const validateForm = () => {
    if (!user) {
      router.push('/(auth)/sign-in');
      return false;
    }

    if (!searchForm.fromId) {
      setError('Please select a departure station');
      return false;
    }

    if (!searchForm.toId) {
      setError('Please select an arrival station');
      return false;
    }

    if (!searchForm.date) {
      setError('Please select a date');
      return false;
    }

    if (!searchForm.cabinClass) {
      setError('Please select a cabin class');
      return false;
    }

    if (!searchForm.departureTimeRange.start || !searchForm.departureTimeRange.end) {
      setError('Please select departure time range');
      return false;
    }

    return true;
  };

  const handleCreateAlert = async () => {
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/search-alerts', {
        fromStationId: searchForm.fromId,
        toStationId: searchForm.toId,
        date: `${searchForm.date} 00:00:00`,
        passengerCount: 1,
        departureTimeRange: searchForm.departureTimeRange,
        preferredCabinClass: searchForm.cabinClass,
        wantHighSpeedTrain: searchForm.wantHighSpeedTrain
      });
      await mutateAlerts()
      resetSearchForm();
      Alert.alert(
        'Success',
        'Search alert created successfully! We will notify you when tickets become available.',
        [
          {
            text: 'View Alerts',
            onPress: () => {
              closeBottomSheet();
            },
            style: 'default'
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating alert:', error);
      setError(error.response?.data?.message || 'Failed to create alert. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="relative ">
        <View>
          <Text className="text-sm font-medium text-foreground my-2">From</Text>
          <TouchableOpacity
            onPress={() => onShowStationModal('from')}
            className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          >
            <Ionicons 
              name="train-outline" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
            <Text 
              className={`flex-1 ml-3 text-base ${searchForm.from ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {searchForm.from || 'Select departure station'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
          <ScrollView horizontal className="flex-row pt-3 pb-3">
            {[
              { id: "98", name: "ANKARA GAR , ANKARA" },
              { id: "1135", name: "İZMİT YHT , KOCAELİ" },
              { id: "1325", name: "İSTANBUL(SÖĞÜTLÜÇEŞME) , İSTANBUL" },
              { id: "992", name: "İSTANBUL(HALKALI) , İSTANBUL" }
            ].map((station) => (
              <TouchableOpacity
                key={station.id}
                onPress={() => onStationSelect({ id: station.id, name: station.name }, 'from')}
                className={`px-3 py-1 mx-1 rounded-full ${
                  searchForm.fromId === station.id ? 'bg-primary' : 'bg-secondary'
                }`}
              >
                <Text className={`${
                  searchForm.fromId === station.id ? 'text-primary-foreground' : 'text-secondary-foreground'
                } text-sm`}>
                  {station.name.split(' , ')[0]}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground my-2">To</Text>
          <TouchableOpacity
            onPress={() => searchForm.fromId && onShowStationModal('to')}
            className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            style={{ opacity: searchForm.fromId ? 1 : 0.5 }}
          >
            <Ionicons 
              name="train-outline" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
            <Text 
              className={`flex-1 ml-3 text-base ${searchForm.to ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {!searchForm.fromId 
                ? 'Select departure station first'
                : searchForm.to || 'Select arrival station'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
          {searchForm.fromId && (
            <ScrollView horizontal className="flex-row pt-3 pb-3">
              {arrivalStations
                .filter(station => [
                  "98", "1135", "1325", "992"
                ].includes(station.id))
                .map((station) => (
                  <TouchableOpacity
                    key={station.id}
                    onPress={() => onStationSelect({ id: station.id, name: station.name }, 'to')}
                    className={`px-3 py-1 mx-1 rounded-full ${
                      searchForm.toId === station.id ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className={`${
                      searchForm.toId === station.id ? 'text-primary-foreground' : 'text-secondary-foreground'
                    } text-sm`}>
                      {station.name.split(' , ')[0]}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          )}
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground my-2">Date</Text>
          <Pressable 
            className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            onPress={onShowDatePicker}
          >
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
            <Text className={`flex-1 ml-3 text-base ${searchForm.date ? 'text-foreground' : 'text-muted-foreground'}`}>
              {searchForm.date || 'Select date'}
            </Text>
          </Pressable>
          <ScrollView horizontal className="flex-row pt-3 pb-3">
            {(() => {
              const now = new Date();
              const currentHour = now.getHours();
              const buttons = [];

              if (currentHour < 14) {
                const today = now.toISOString().split('T')[0];
                const isTodaySelected = searchForm.date === today;
                buttons.push(
                  <TouchableOpacity
                    key="today"
                    onPress={() => onDateChange(today)}
                    className={`px-3 py-1 rounded-full ${
                      isTodaySelected ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className={`${
                      isTodaySelected ? 'text-primary-foreground' : 'text-secondary-foreground'
                    } text-sm`}>
                      Today
                    </Text>
                  </TouchableOpacity>
                );
              }
              [1, 2, 3, 4].forEach((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const formattedDate = date.toISOString().split('T')[0];
                const isSelected = searchForm.date === formattedDate;
                const label = days === 1 ? 'Tomorrow' : `${days} Days Later`;

                buttons.push(
                  <TouchableOpacity
                    key={days}
                    onPress={() => onDateChange(formattedDate)}
                    className={`px-3 py-1 mx-1 rounded-full ${
                      isSelected ? 'bg-primary' : 'bg-secondary'
                    }`}
                  >
                    <Text className={`${
                      isSelected ? 'text-primary-foreground' : 'text-secondary-foreground'
                    } text-sm`}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              });

              return buttons;
            })()}
          </ScrollView>
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground my-2">Cabin Class</Text>
          <TouchableOpacity
            onPress={() => onShowStationModal('cabin')}
            className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
          >
            <Ionicons 
              name="business-outline" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
            <Text 
              className={`flex-1 ml-3 text-base ${searchForm.cabinClassName ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {searchForm.cabinClassName || 'Select cabin class'}
            </Text>
            <Ionicons 
              name="chevron-down" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
          </TouchableOpacity>
        </View>

        <View>
          <Text className="text-sm font-medium text-foreground my-2">Departure Time Range</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => onShowTimePicker('start')}
              className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                className="text-foreground"
                color={isDark ? '#fff' : '#000'} 
              />
              <Text className={`flex-1 ml-3 text-base ${searchForm.departureTimeRange.start ? 'text-foreground' : 'text-muted-foreground'}`}>
                {searchForm.departureTimeRange.start || 'Start Time'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onShowTimePicker('end')}
              className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                className="text-foreground"
                color={isDark ? '#fff' : '#000'} 
              />
              <Text className={`flex-1 ml-3 text-base ${searchForm.departureTimeRange.end ? 'text-foreground' : 'text-muted-foreground'}`}>
                {searchForm.departureTimeRange.end || 'End Time'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className="flex-row pt-3 pb-3">
            {[
              { start: "00:00", end: "23:59", label: "All Day" },
              { start: "06:00", end: "12:00", label: "(06:00 - 12:00)" },
              { start: "12:00", end: "18:00", label: "(12:00 - 18:00)" },
              { start: "18:00", end: "06:00", label: "(18:00 - 06:00)" }
            ].map((timeRange) => (
              <TouchableOpacity
                key={timeRange.label}
                onPress={() => {
                  setDepartureTimeRange({start: timeRange.start, end: timeRange.end});
                }}
                className={`px-3 py-1 mx-1 rounded-full ${
                  searchForm.departureTimeRange.start === timeRange.start && 
                  searchForm.departureTimeRange.end === timeRange.end
                    ? 'bg-primary'
                    : 'bg-secondary'
                }`}
              >
                <Text className={`${
                  searchForm.departureTimeRange.start === timeRange.start && 
                  searchForm.departureTimeRange.end === timeRange.end
                    ? 'text-primary-foreground'
                    : 'text-secondary-foreground'
                } text-sm`}>
                  {timeRange.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View className="my-4">
          <TouchableOpacity 
            onPress={() => onToggleHighSpeed(!searchForm.wantHighSpeedTrain)}
            className="flex-row items-center"
          >
            <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${searchForm.wantHighSpeedTrain ? 'bg-primary border-primary' : 'border-input'}`}>
              {searchForm.wantHighSpeedTrain && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={isDark ? '#fff' : '#000'} 
                />
              )}
            </View>
            <Text className="text-base text-foreground">High-speed trains only</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View className="bg-destructive/10 p-3 rounded-lg mb-4">
            <Text className="text-destructive text-sm">{error}</Text>
          </View>
        )}

        <TouchableOpacity 
          onPress={handleCreateAlert}
          disabled={isLoading}
          className={`bg-primary h-14 rounded-xl items-center justify-center my-6 shadow-sm ${
            isLoading ? 'opacity-50' : 'opacity-100'
          }`}
          style={{
            elevation: 2,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color="hsl(var(--primary-foreground))" />
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">
              Create Alert
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 