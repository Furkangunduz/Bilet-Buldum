import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleStationSelect = (station: Station, type?: 'from' | 'to') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onStationSelect(station, type);
  };

  const handleShowModal = (type: 'from' | 'to' | 'cabin') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowStationModal(type);
  };

  const handleDatePicker = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowDatePicker();
  };

  const handleTimePicker = (type: 'start' | 'end') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onShowTimePicker(type);
  };

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSwapStations();
  };

  const handleHighSpeedToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggleHighSpeed(value);
  };

  const validateForm = () => {
    if (!user) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      router.push('/(auth)/sign-in');
      return false;
    }

    if (!searchForm.fromId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t('home.searchForm.errors.selectDeparture'));
      return false;
    }

    if (!searchForm.toId) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t('home.searchForm.errors.selectArrival'));
      return false;
    }

    if (!searchForm.date) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t('home.searchForm.errors.selectDate'));
      return false;
    }

    if (!searchForm.cabinClass) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t('home.searchForm.errors.selectCabinClass'));
      return false;
    }

    if (!searchForm.departureTimeRange.start || !searchForm.departureTimeRange.end) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(t('home.searchForm.errors.selectTimeRange'));
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
      await mutateAlerts();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      resetSearchForm();
      Alert.alert(
        t('common.success'),
        t('home.searchForm.alertCreatedSuccess'),
        [
          {
            text: t('home.searchForm.viewAlerts'),
            onPress: () => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              closeBottomSheet();
            },
            style: 'default'
          },
        ]
      );
    } catch (error: any) {
      console.error('Error creating alert:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(error.response?.data?.message || t('home.searchForm.errors.createAlertFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="relative ">
        <View>
          <Text className="text-sm font-medium text-foreground my-2">{t('home.searchForm.from')}</Text>
          <TouchableOpacity
            onPress={() => handleShowModal('from')}
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
              {searchForm.from || t('home.searchForm.selectDepartureStation')}
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
                onPress={() => handleStationSelect({ id: station.id, name: station.name }, 'from')}
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
          <Text className="text-sm font-medium text-foreground my-2">{t('home.searchForm.to')}</Text>
          <TouchableOpacity
            onPress={() => searchForm.fromId && handleShowModal('to')}
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
                ? t('home.searchForm.selectDepartureFirst')
                : searchForm.to || t('home.searchForm.selectArrivalStation')}
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
                    onPress={() => handleStationSelect({ id: station.id, name: station.name }, 'to')}
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
          <Text className="text-sm font-medium text-foreground my-2">{t('home.searchForm.date')}</Text>
          <Pressable 
            className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            onPress={handleDatePicker}
          >
            <Ionicons 
              name="calendar-outline" 
              size={20} 
              className="text-foreground"
              color={isDark ? '#fff' : '#000'} 
            />
            <Text className={`flex-1 ml-3 text-base ${searchForm.date ? 'text-foreground' : 'text-muted-foreground'}`}>
              {searchForm.date || t('home.searchForm.selectDate')}
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
                      {t('home.searchForm.today')}
                    </Text>
                  </TouchableOpacity>
                );
              }
              [1, 2, 3, 4].forEach((days) => {
                const date = new Date();
                date.setDate(date.getDate() + days);
                const formattedDate = date.toISOString().split('T')[0];
                const isSelected = searchForm.date === formattedDate;
                const label = days === 1 ? t('home.searchForm.tomorrow') : t('home.searchForm.daysLater', { days });

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
          <Text className="text-sm font-medium text-foreground my-2">{t('home.searchForm.cabinClass')}</Text>
          <TouchableOpacity
            onPress={() => handleShowModal('cabin')}
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
              {searchForm.cabinClassName || t('home.searchForm.selectCabinClass')}
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
          <Text className="text-sm font-medium text-foreground my-2">{t('home.searchForm.departureTime')}</Text>
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => handleTimePicker('start')}
              className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                className="text-foreground"
                color={isDark ? '#fff' : '#000'} 
              />
              <Text className={`flex-1 ml-3 text-base ${searchForm.departureTimeRange.start ? 'text-foreground' : 'text-muted-foreground'}`}>
                {searchForm.departureTimeRange.start || t('home.searchForm.startTime')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleTimePicker('end')}
              className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
            >
              <Ionicons 
                name="time-outline" 
                size={20} 
                className="text-foreground"
                color={isDark ? '#fff' : '#000'} 
              />
              <Text className={`flex-1 ml-3 text-base ${searchForm.departureTimeRange.end ? 'text-foreground' : 'text-muted-foreground'}`}>
                {searchForm.departureTimeRange.end || t('home.searchForm.endTime')}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal className="flex-row pt-3 pb-3">
            {[
              { start: "00:00", end: "23:59", label: t('home.searchForm.timeRanges.allDay') },
              { start: "06:00", end: "12:00", label: t('home.searchForm.timeRanges.morning') },
              { start: "12:00", end: "18:00", label: t('home.searchForm.timeRanges.afternoon') },
              { start: "18:00", end: "06:00", label: t('home.searchForm.timeRanges.night') }
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
            onPress={() => handleHighSpeedToggle(!searchForm.wantHighSpeedTrain)}
            className="flex-row items-center"
          >
            <View className={`w-5 h-5 border rounded mr-2 items-center justify-center ${searchForm.wantHighSpeedTrain ? 'bg-primary border-primary' : 'border-input'}`}>
              {searchForm.wantHighSpeedTrain && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={isDark ? '#000' : '#fff'} 
                />
              )}
            </View>
            <Text className="text-base text-foreground">{t('home.searchForm.highSpeedTrain')}</Text>
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
          className={`bg-primary h-14 rounded-xl items-center justify-center mt-6 mb-20 shadow-sm ${
            isLoading ? 'opacity-50' : 'opacity-100'
          }`}
          style={{
            elevation: 2,
          }}
        >
          {isLoading ? (
            <ActivityIndicator color={isDark ? '#000' : '#fff'} />
          ) : (
            <Text className="text-primary-foreground font-semibold text-base">
              {t('home.searchForm.createAlert')}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 