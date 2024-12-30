import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetBackdropProps, BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useDebounce } from '~/hooks/useDebounce';
import { DateTimePickers } from '../../components/home/DateTimePickers';
import { SearchForm } from '../../components/home/SearchForm';
import { StationModal } from '../../components/home/StationModal';
import { CabinClass, Station, tcddApi } from '../../lib/api';


export default function Home() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

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
    cabinClass: '',
    cabinClassName: '',
    departureTimeRange: {
      start: '',
      end: ''
    }
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

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        pressBehavior="close"
      />
    ),
    []
  );

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

        <View className="flex-1 items-center justify-center px-6">
          <View className="items-center space-y-4 mb-12">
            <Ionicons name="train" size={64} color="#666" />
            <Text className="text-xl font-semibold text-foreground text-center">
              Ready to Start Your Journey?
            </Text>
            <Text className="text-muted-foreground text-center">
              Search for train tickets and set alerts for your preferred routes
            </Text>
          </View>
          
          <TouchableOpacity
            onPress={handleSearchPress}
            className="bg-primary w-full h-14 rounded-xl items-center justify-center shadow-sm flex-row space-x-2"
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
                spin={spin}
              />
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
});