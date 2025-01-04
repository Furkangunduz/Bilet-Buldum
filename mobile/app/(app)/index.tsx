import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, LayoutAnimation, Modal, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, UIManager, View } from 'react-native';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { AlertItem } from '~/components/home/AlertItem';
import { DateTimePickers } from '~/components/home/DateTimePickers';
import { EmptyState } from '~/components/home/EmptyState';
import { SearchForm } from '~/components/home/SearchForm';
import { StationModal } from '~/components/home/StationModal';
import { StatusFilter } from '~/components/home/StatusFilter';
import { useDebounce } from '~/hooks/useDebounce';
import { useSearchAlerts } from '~/hooks/useSearchAlerts';
import { CabinClass, Station, searchAlertsApi, tcddApi } from '~/lib/api';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

// Custom layout animation config
const CustomLayoutAnimation = {
  duration: 300,
  create: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
  update: {
    type: LayoutAnimation.Types.easeInEaseOut,
  },
  delete: {
    type: LayoutAnimation.Types.easeInEaseOut,
    property: LayoutAnimation.Properties.opacity,
  },
};

// Initialize the interstitial ad
const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : 'your-ad-unit-id-here';

const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
  requestNonPersonalizedAdsOnly: true,
  keywords: ['train', 'travel', 'transportation'],
});

export default function Home() {
  const { searchAlerts, isLoading: isLoadingAlerts, mutate: mutateAlerts } = useSearchAlerts();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const deleteAlertSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['60%'], []);
  const deleteSnapPoints = useMemo(() => ['25%'], []);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);
  const [isAdLoaded, setIsAdLoaded] = useState(false);
  const [currentSnapPointIndex, setCurrentSnapPointIndex] = useState(0);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(['PENDING']);

  const filteredAlerts = useMemo(() => {
    return searchAlerts.filter(alert => selectedStatuses.includes(alert.status));
  }, [searchAlerts, selectedStatuses]);

  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 10);
    return date;
  }, []);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [searchForm, setSearchForm] = useState({
    from: '',
    fromId: '',
    to: '',
    toId: '',
    date: '',
    cabinClass: '1',
    cabinClassName: 'EKONOMİ',
    departureTimeRange: {
      start: '00:00',
      end: '23:59'
    },
    wantHighSpeedTrain: true
  });

  const [departureStations, setDepartureStations] = useState<Station[]>([]);
  const [arrivalStations, setArrivalStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [showStationModal, setShowStationModal] = useState<'from' | 'to' | 'cabin' | null>(null);
  const [stationSearch, setStationSearch] = useState('');
  const debouncedSearch = useDebounce(stationSearch, 300);

  const [cabinClasses, setCabinClasses] = useState<CabinClass[]>([]);
  const [isLoadingCabinClasses, setIsLoadingCabinClasses] = useState(false);
  const [cabinClassesError, setCabinClassesError] = useState<string | null>(null);

  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [spinAnim] = useState(new Animated.Value(0));

  const fetchCabinClasses = async () => {
    try {
      setIsLoadingCabinClasses(true);
      setCabinClassesError(null);
      
      const response = await tcddApi.getCabinClasses();
      
      if (response?.data?.data) {
        setCabinClasses(response.data.data);
      } else {
        console.warn('⚠️ No cabin classes data in response');
        setCabinClassesError('No cabin classes available');
      }
    } catch (error) {
      console.error('❌ Error in fetchCabinClasses:', error);
      setCabinClassesError('Failed to load cabin classes');
      setCabinClasses([]);
    } finally {
      setIsLoadingCabinClasses(false);
    }
  };

  useEffect(() => {
    const fetchDepartureStations = async () => {
      try {
        setIsLoadingStations(true);
        const response = await tcddApi.getDepartureStations();
        if (response.data.data) {
          setDepartureStations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching departure stations:', error);
        setDepartureStations([]);
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchDepartureStations();
  }, []);

  useEffect(() => {
    const fetchArrivalStations = async () => {
      if (!searchForm.fromId) {
        setArrivalStations([]);
        return;
      }

      try {
        setIsLoadingStations(true);
        const response = await tcddApi.getArrivalStations(searchForm.fromId);
        if (response?.data?.data) {
          setArrivalStations(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching arrival stations:', error);
        setArrivalStations([]); 
      } finally {
        setIsLoadingStations(false);
      }
    };

    fetchArrivalStations();
  }, [searchForm.fromId]);

  useEffect(() => {
    fetchCabinClasses();
  }, []);

  const handleStationSelect = (station: Station, type?: 'from' | 'to') => {
    const selectionType = type || showStationModal;
    
    if (selectionType === 'from') {
      setSearchForm(prev => ({
        ...prev,
        from: station.name,
        fromId: station.id,
        to: '',
        toId: '',
      }));
    } else if (selectionType === 'to') {
      setSearchForm(prev => ({
        ...prev,
        to: station.name,
        toId: station.id,
      }));
    }
    setShowStationModal(null);
    setStationSearch('');
  };

  const handleCabinClassSelect = (cabinClass: CabinClass) => {
    setSearchForm(prev => ({
      ...prev,
      cabinClass: cabinClass.id,
      cabinClassName: cabinClass.name
    }));
    setShowStationModal(null);
  };

  const filteredStations = useMemo(() => {
    const stations = showStationModal === 'from' ? departureStations : arrivalStations;
    if (!Array.isArray(stations)) return [];
    if (!debouncedSearch) return stations;
  
    const normalizeString = (str: string) =>
      str
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
  
    const searchLower = normalizeString(debouncedSearch);
    return stations.filter(station => 
      normalizeString(station.name).includes(searchLower)
    );
  }, [showStationModal, departureStations, arrivalStations, debouncedSearch]);
  
  const handleSearchPress = () => {
    if (isAdLoaded) {
      try {
        interstitial.show();
      } catch (error) {
        console.warn('Failed to show ad, opening bottom sheet directly:', error);
        setIsBottomSheetOpen(true);
        bottomSheetRef.current?.expand();
      }
    } else {
      // If ad is not loaded, just show the bottom sheet
      setIsBottomSheetOpen(true);
      bottomSheetRef.current?.expand();
    }
  };

  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    bottomSheetRef.current?.close();
  };

  const handleSwapStations = () => {
    if (!searchForm.from || !searchForm.to) return;

    Animated.sequence([
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: 0,
        useNativeDriver: true,
      })
    ]).start();

    setSearchForm(prev => ({
      ...prev,
      from: prev.to,
      fromId: prev.toId,
      to: prev.from,
      toId: prev.fromId,
    }));
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  const handleLongPressAlert = (alertId: string) => {
    setSelectedAlertId(alertId);
    deleteAlertSheetRef.current?.expand();
  };

  const handleDeleteAlert = async (alertId: string) => {
    try {
      await searchAlertsApi.deleteSearchAlert(alertId);
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      await mutateAlerts();
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
  };

  const handleDeclineAlert = async (alertId: string) => {
    try {
      await searchAlertsApi.declineSearchAlert(alertId);
      LayoutAnimation.configureNext(CustomLayoutAnimation);
      await mutateAlerts();
    } catch (error) {
      console.error('Error declining alert:', error);
    }
  };

  const resetSearchForm = () => {
    setSearchForm({
      from: '',
      fromId: '',
      to: '',
      toId: '',
      date: '',
      cabinClass: '1',
      cabinClassName: 'EKONOMİ',
      departureTimeRange: {
        start: '00:00',
        end: '23:59'
      },
      wantHighSpeedTrain: true
    });
  };

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  useEffect(() => {
    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      setIsAdLoaded(true);
    });

    const unsubscribeClosed = interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      setIsAdLoaded(false);
      interstitial.load();
      setIsBottomSheetOpen(true);
      bottomSheetRef.current?.expand();
    });

    const unsubscribeError = interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.warn('Ad failed to load:', error);
      setIsAdLoaded(false);
    });

    interstitial.load();

    return () => {
      unsubscribeLoaded();
      unsubscribeClosed();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    const startSpinning = () => {
      Animated.loop(
        Animated.timing(spinAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        })
      ).start();
    };

    startSpinning();
  }, []);

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className="flex-1 bg-background">
        <View className="flex-1 px-6">
          {isLoadingAlerts ? (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color="#666" />
            </View>
          ) : searchAlerts.length > 0 ? (
            <View className="flex-1">
              <Text className="text-lg font-semibold text-foreground mb-4 mt-6">
                Your Active Alerts
              </Text>
              <StatusFilter 
                selectedStatuses={selectedStatuses}
                onStatusChange={setSelectedStatuses}
              />
              <ScrollView className="flex-1 gap-4">
                {filteredAlerts.length > 0 ? (
                  filteredAlerts.map((alert) => (
                    <AlertItem
                      key={alert._id}
                      alert={alert}
                      onDelete={() => handleDeleteAlert(alert._id)}
                      onDecline={() => handleDeclineAlert(alert._id)}
                      spinAnim={spinAnim}
                      isDark={isDark}
                    />
                  ))
                ) : (
                  <EmptyState selectedStatuses={selectedStatuses} />
                )}
              </ScrollView>
            </View>
          ) : (
            <EmptyState  />
          )}
        </View>

        <View className="p-6">
          <TouchableOpacity
            onPress={handleSearchPress}
            className="bg-primary w-full h-14 rounded-xl items-center justify-center shadow-sm flex-row gap-6"
          >
            <Ionicons name="search" size={22} color={isDark ? '#000' : '#fff'}  />
            <Text className="text-primary-foreground font-semibold text-base">
              Start Searching
            </Text>
          </TouchableOpacity>
        </View>

        <Modal
          visible={showStationModal !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowStationModal(null)}
        >
          <StationModal
            type={showStationModal}
            onClose={() => setShowStationModal(null)}
            stationSearch={stationSearch}
            onSearchChange={setStationSearch}
            isLoading={isLoadingStations}
            stations={filteredStations}
            onStationSelect={handleStationSelect}
            cabinClasses={cabinClasses}
            isLoadingCabinClasses={isLoadingCabinClasses}
            cabinClassesError={cabinClassesError}
            onCabinClassSelect={handleCabinClassSelect}
            onRetryLoadCabinClasses={fetchCabinClasses}
          />
        </Modal>

        <DateTimePickers
          showDatePicker={showDatePicker}
          showTimePicker={showTimePicker}
          searchForm={searchForm}
          onDateChange={(date) => setSearchForm(prev => ({ ...prev, date }))}
          onTimeChange={(time, type) => 
            setSearchForm(prev => ({
              ...prev,
              departureTimeRange: {
                ...prev.departureTimeRange,
                [type]: time
              }
            }))
          }
          onCloseDatePicker={() => setShowDatePicker(false)}
          onCloseTimePicker={() => setShowTimePicker(null)}
          maxDate={maxDate}
        />
      </View>
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose={true}
        onClose={() => setIsBottomSheetOpen(false)}
        onChange={(index) => setCurrentSnapPointIndex(index)}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 2,
          borderColor: isDark ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 5.9% 90%)',
          shadowColor: isDark ? 'hsl(240 3.7% 15.9%)' : '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 8,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
          width: 60,
        }}
        handleStyle={{
          backgroundColor: 'transparent',
          paddingVertical: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <BottomSheetScrollView
          style={[
            styles.contentContainer, 
            { 
              backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)',
            }
          ]}
        >
          <View className="flex-1 w-full">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-2xl font-bold text-foreground">
                Create New Alert
              </Text>
              <TouchableOpacity 
                onPress={handleCloseBottomSheet}
                className="p-2"
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={isDark ? '#fff' : '#000'} 
                />
              </TouchableOpacity>
            </View>
            
            <BottomSheetScrollView className="flex-1 w-full">
              <SearchForm
                searchForm={searchForm}
                onStationSelect={handleStationSelect}
                onShowStationModal={setShowStationModal}
                onShowDatePicker={() => setShowDatePicker(true)}
                onShowTimePicker={setShowTimePicker}
                onSwapStations={handleSwapStations}
                onDateChange={(date) => setSearchForm(prev => ({ ...prev, date }))}
                closeBottomSheet={handleCloseBottomSheet}
                resetSearchForm={resetSearchForm}
                onToggleHighSpeed={(value) => setSearchForm(prev => ({ ...prev, wantHighSpeedTrain: value }))}
                spin={spin}
                arrivalStations={arrivalStations}
                setDepartureTimeRange={
                  (timeRange) => {
                    setSearchForm(prev => ({
                      ...prev,
                      departureTimeRange: timeRange
                    }));
                  }
                }
              />
            </BottomSheetScrollView>

          </View>
        </BottomSheetScrollView>
      </BottomSheet>

      <BottomSheet
        ref={deleteAlertSheetRef}
        index={-1}
        snapPoints={deleteSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 2,
          borderTopColor: isDark ? 'hsl(240 3.7% 15.9%)' : 'hsl(240 5.9% 90%)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: isDark ? 0.5 : 0.1,
          shadowRadius: 8,
          elevation: 16,
        }}
        handleIndicatorStyle={{
          backgroundColor: isDark ? 'hsl(240 5% 64.9%)' : 'hsl(240 3.8% 46.1%)',
          width: 40,
        }}
      >
        <BottomSheetView style={[styles.deleteSheetContent, { backgroundColor: isDark ? 'hsl(224 71% 4%)' : 'hsl(0 0% 100%)' }]}>
          <Text className="text-xl font-bold text-foreground mb-2">Delete Alert</Text>
          <Text className="text-base text-muted-foreground mb-6">Are you sure you want to delete this alert?</Text>
          <View className="flex-row justify-between gap-3">
            <TouchableOpacity 
              className="flex-1 bg-secondary py-3 rounded-lg items-center"
              onPress={() => {
                deleteAlertSheetRef.current?.close();
                setSelectedAlertId(null);
              }}
            >
              <Text className="text-secondary-foreground font-semibold">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              className="flex-1 bg-destructive py-3 rounded-lg items-center"
              onPress={() => {
              }}
            >
              <Text className="text-destructive-foreground font-semibold">Delete</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  deleteSheetContent: {
    padding: 20,
  },
  deleteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deleteDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  deleteButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  deleteButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#ff4444',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmText: {
    color: 'white',
  },
});