import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDebounce } from '~/hooks/useDebounce';
import { useSearchAlerts } from '~/hooks/useSearchAlerts';
import { DateTimePickers } from '../../components/home/DateTimePickers';
import { SearchForm } from '../../components/home/SearchForm';
import { StationModal } from '../../components/home/StationModal';
import { CabinClass, Station, searchAlertsApi, tcddApi } from '../../lib/api';

export default function Home() {
  const { searchAlerts, isLoading: isLoadingAlerts, mutate: mutateAlerts } = useSearchAlerts();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const deleteAlertSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['75%','90%'], []);
  const deleteSnapPoints = useMemo(() => ['25%'], []);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

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

  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleStationSelect = (station: Station) => {
    if (showStationModal === 'from') {
      setSearchForm(prev => ({
        ...prev,
        from: station.name,
        fromId: station.id,
        to: '',
        toId: '',
      }));
    } else {
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
    setIsBottomSheetOpen(true);
    bottomSheetRef.current?.expand();
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

  const handleDeleteAlert = async () => {
    if (!selectedAlertId) return;

    try {
      await searchAlertsApi.deleteSearchAlert(selectedAlertId);
      await mutateAlerts();
      deleteAlertSheetRef.current?.close();
      setSelectedAlertId(null);
    } catch (error) {
      console.error('Error deleting alert:', error);
    }
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

  const handleCreateAlert = async () => {
    if (!searchForm.fromId || !searchForm.toId || !searchForm.date) {
      
      return;
    }

    try {
      setIsSubmitting(true);
      await searchAlertsApi.createSearchAlert({
        fromStationId: searchForm.fromId,
        toStationId: searchForm.toId,
        date: searchForm.date,
        cabinClass: searchForm.cabinClass,
        departureTimeRange: searchForm.departureTimeRange
      });

      // Close the bottom sheet
      handleCloseBottomSheet();

      // Reset form
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

      // Refresh the alerts list
      await mutateAlerts();
    } catch (error) {
      console.error('Error creating alert:', error);
      // You might want to show an error message here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className='flex-1 bg-background'>
      <View className="flex-1 bg-background">
        <View className="px-6 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">
            Find Tickets
          </Text>
          <Text className="text-muted-foreground mt-1">
            Set alerts for your journey
          </Text>
        </View>

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
              <View className="flex-1 gap-4">
                {searchAlerts.map((alert) => (
                  <TouchableOpacity
                    key={alert._id} 
                    className="bg-card p-4 rounded-lg border border-border"
                    onLongPress={() => handleLongPressAlert(alert._id)}
                    delayLongPress={500}
                  >
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-base font-medium text-foreground">
                        {alert.fromStationId} → {alert.toStationId}
                      </Text>
                      <View className={`px-2 py-1 rounded-full ${
                        alert.status === 'PENDING' ? 'bg-yellow-100' :
                        alert.status === 'COMPLETED' ? 'bg-green-100' :
                        'bg-red-100'
                      }`}>
                        <Text className={`text-xs font-medium ${
                          alert.status === 'PENDING' ? 'text-yellow-800' :
                          alert.status === 'COMPLETED' ? 'text-green-800' :
                          'text-red-800'
                        }`}>
                          {alert.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-muted-foreground">
                      {new Date(alert.date).toLocaleDateString()} • {alert.cabinClass}
                    </Text>
                    <Text className="text-sm text-muted-foreground">
                      {alert.departureTimeRange.start} - {alert.departureTimeRange.end}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
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
          )}
        </View>

        <View className="p-6 border-t border-border">
          <TouchableOpacity
            onPress={handleSearchPress}
            className="bg-primary w-full h-14 rounded-xl items-center justify-center shadow-sm flex-row gap-4"
          >
            <Ionicons name="search" size={20} color="white" />
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
        enableOverDrag={false}
        backdropComponent={renderBackdrop}
        backgroundStyle={{
          backgroundColor: 'hsl(0 0% 100%)',
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          borderTopWidth: 1,
          borderTopColor: 'hsl(240 5.9% 90%)',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -4,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 16,
        }}
        handleIndicatorStyle={{
          backgroundColor: '#999',
          width: 40,
        }}
        handleStyle={{
          backgroundColor: 'transparent',
          paddingVertical: 12,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
        }}
      >
        <BottomSheetView style={styles.contentContainer}>
          <View className="flex-1 w-full">
            <View className="flex-row items-center justify-between mb-8">
              <Text className="text-2xl font-bold text-foreground">
                Create New Alert
              </Text>
              <TouchableOpacity 
                onPress={handleCloseBottomSheet}
                className="p-2"
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <SearchForm
              searchForm={searchForm}
              onShowStationModal={setShowStationModal}
              onShowDatePicker={() => setShowDatePicker(true)}
              onShowTimePicker={setShowTimePicker}
              onSwapStations={handleSwapStations}
              onToggleHighSpeed={(value) => setSearchForm(prev => ({ ...prev, wantHighSpeedTrain: value }))}
              onDateChange={(date) => setSearchForm(prev => ({ ...prev, date }))}
              spin={spin}
            />
          </View>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={deleteAlertSheetRef}
        index={-1}
        snapPoints={deleteSnapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
      >
        <BottomSheetView style={styles.deleteSheetContent}>
          <Text style={styles.deleteTitle}>Delete Alert</Text>
          <Text style={styles.deleteDescription}>Are you sure you want to delete this alert?</Text>
          <View style={styles.deleteButtons}>
            <TouchableOpacity 
              style={[styles.deleteButton, styles.cancelButton]} 
              onPress={() => {
                deleteAlertSheetRef.current?.close();
                setSelectedAlertId(null);
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.deleteButton, styles.confirmButton]} 
              onPress={handleDeleteAlert}
            >
              <Text style={[styles.buttonText, styles.confirmText]}>Delete</Text>
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
    paddingHorizontal: 20,
    paddingVertical: 8,
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