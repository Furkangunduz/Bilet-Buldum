import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { BlurView } from 'expo-blur';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Animated, FlatList, Modal, Platform, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CabinClass, Station, tcddApi } from '../../lib/api';

// Debounce function for search
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default function Home() {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['80%'], []);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Add maximum date calculation
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

  // Station selection states
  const [departureStations, setDepartureStations] = useState<Station[]>([]);
  const [arrivalStations, setArrivalStations] = useState<Station[]>([]);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [showStationModal, setShowStationModal] = useState<'from' | 'to' | 'cabin' | null>(null);
  const [stationSearch, setStationSearch] = useState('');
  const debouncedSearch = useDebounce(stationSearch, 300); // 300ms debounce

  // Fetch cabin classes on mount
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

  // Fetch departure stations on mount
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
        setDepartureStations([]); // Set empty array on error
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

  // Fetch cabin classes on mount
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

  const filteredStations = useMemo(() => {
    const stations = showStationModal === 'from' ? departureStations : arrivalStations;
    if (!Array.isArray(stations)) return [];
    if (!debouncedSearch) return stations;
  
    const normalizeString = (str: string) =>
      str
        .normalize('NFD') // Normalize to NFD Unicode form
        .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
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

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      onPress={() => handleStationSelect(item)}
      className="p-4 border-b border-border"
    >
      <Text className="text-base text-foreground">{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
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

        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          index={-1}
          enablePanDownToClose={true}
          onClose={() => setIsBottomSheetOpen(false)}
          enableOverDrag={false}
          backgroundStyle={{
            backgroundColor: Platform.select({
              ios: 'rgba(255, 255, 255, 0.95)',
              android: 'white'
            }),
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            borderTopWidth: 1,
            borderTopColor: '#E5E7EB',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -4,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
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
          <BlurView 
            intensity={Platform.OS === 'ios' ? 50 : 0} 
            tint="light" 
            style={[
              StyleSheet.absoluteFill, 
              { 
                borderTopLeftRadius: 24, 
                borderTopRightRadius: 24,
                backgroundColor: Platform.select({
                  ios: 'rgba(255, 255, 255, 0.8)',
                  android: 'white'
                }),
              }
            ]} 
          />
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
              
              <View className="space-y-10 relative">
                <View className="space-y-3">
                  <Text className="text-sm font-medium text-foreground mb-2 mt-1">From</Text>
                  <TouchableOpacity
                    onPress={() => setShowStationModal('from')}
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
                  onPress={handleSwapStations}
                  className="absolute right-2 top-20 z-10 bg-primary w-10 h-10 rounded-full items-center justify-center shadow-sm"
                >
                  <Animated.View style={{ transform: [{ rotate: spin }] }}>
                    <Ionicons name="swap-vertical" size={24} color="white" />
                  </Animated.View>
                </TouchableOpacity>

                <View className="space-y-3">
                  <Text className="text-sm font-medium text-foreground mb-2 mt-1">To</Text>
                  <TouchableOpacity
                    onPress={() => searchForm.fromId && setShowStationModal('to')}
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

                <View className="space-y-3">
                  <Text className="text-sm font-medium text-foreground mb-2 mt-1">Date</Text>
                  <Pressable 
                    className="flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#666" />
                    <Text className="flex-1 ml-3 text-base text-muted-foreground">
                      {searchForm.date || 'Select date'}
                    </Text>
                  </Pressable>
                </View>

                <View className="space-y-3">
                  <Text className="text-sm font-medium text-foreground mb-2 mt-1">Cabin Class</Text>
                  <TouchableOpacity
                    onPress={() => setShowStationModal('cabin')}
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

                <View className="space-y-3">
                  <Text className="text-sm font-medium text-foreground mb-2 mt-1">Departure Time Range</Text>
                  <View className="flex-row space-x-3">
                    <TouchableOpacity
                      onPress={() => setShowTimePicker('start')}
                      className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
                    >
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text className="flex-1 ml-3 text-base text-muted-foreground">
                        {searchForm.departureTimeRange.start || 'Start Time'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setShowTimePicker('end')}
                      className="flex-1 flex-row items-center bg-card border border-input rounded-xl px-4 h-14"
                    >
                      <Ionicons name="time-outline" size={20} color="#666" />
                      <Text className="flex-1 ml-3 text-base text-muted-foreground">
                        {searchForm.departureTimeRange.end || 'End Time'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Time Picker Modal for iOS */}
                {Platform.OS === 'ios' && showTimePicker ? (
                  <Modal
                    visible={!!showTimePicker}
                    transparent={true}
                    animationType="slide"
                  >
                    <View className="flex-1 justify-end bg-black/50">
                      <View className="bg-card p-4">
                        <View className="flex-row justify-between items-center mb-4">
                          <TouchableOpacity onPress={() => setShowTimePicker(null)}>
                            <Text className="text-primary text-base">Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              setShowTimePicker(null);
                            }}
                          >
                            <Text className="text-primary text-base">Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={
                            showTimePicker === 'start' && searchForm.departureTimeRange.start
                              ? new Date(`2000-01-01T${searchForm.departureTimeRange.start}:00`)
                              : showTimePicker === 'end' && searchForm.departureTimeRange.end
                              ? new Date(`2000-01-01T${searchForm.departureTimeRange.end}:00`)
                              : new Date()
                          }
                          mode="time"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              const hours = selectedDate.getHours().toString().padStart(2, '0');
                              const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                              const timeString = `${hours}:${minutes}`;
                              
                              setSearchForm(prev => ({
                                ...prev,
                                departureTimeRange: {
                                  ...prev.departureTimeRange,
                                  [showTimePicker]: timeString
                                }
                              }));
                            }
                          }}
                        />
                      </View>
                    </View>
                  </Modal>
                ) : Platform.OS === 'android' && showTimePicker ? (
                  <DateTimePicker
                    value={
                      showTimePicker === 'start' && searchForm.departureTimeRange.start
                        ? new Date(`2000-01-01T${searchForm.departureTimeRange.start}:00`)
                        : showTimePicker === 'end' && searchForm.departureTimeRange.end
                        ? new Date(`2000-01-01T${searchForm.departureTimeRange.end}:00`)
                        : new Date()
                    }
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowTimePicker(null);
                      if (event.type === 'set' && selectedDate) {
                        const hours = selectedDate.getHours().toString().padStart(2, '0');
                        const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
                        const timeString = `${hours}:${minutes}`;
                        
                        setSearchForm(prev => ({
                          ...prev,
                          departureTimeRange: {
                            ...prev.departureTimeRange,
                            [showTimePicker]: timeString
                          }
                        }));
                      }
                    }}
                  />
                ) : null}

                {/* Date picker modals */}
                {Platform.OS === 'ios' ? (
                  <Modal
                    visible={showDatePicker}
                    transparent={true}
                    animationType="slide"
                  >
                    <View className="flex-1 justify-end bg-black/50">
                      <View className="bg-card p-4">
                        <View className="flex-row justify-between items-center mb-4">
                          <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                            <Text className="text-primary text-base">Cancel</Text>
                          </TouchableOpacity>
                          <TouchableOpacity 
                            onPress={() => {
                              if (!searchForm.date) {
                                const today = new Date();
                                const formattedDate = today.toISOString().split('T')[0];
                                setSearchForm(prev => ({ ...prev, date: formattedDate }));
                              }
                              setShowDatePicker(false);
                            }}
                          >
                            <Text className="text-primary text-base">Done</Text>
                          </TouchableOpacity>
                        </View>
                        <DateTimePicker
                          value={searchForm.date ? new Date(searchForm.date) : new Date()}
                          mode="date"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              const formattedDate = selectedDate.toISOString().split('T')[0];
                              setSearchForm(prev => ({ ...prev, date: formattedDate }));
                            }
                          }}
                          minimumDate={new Date()}
                          maximumDate={maxDate}
                        />
                      </View>
                    </View>
                  </Modal>
                ) : showDatePicker && (
                  <DateTimePicker
                    value={searchForm.date ? new Date(searchForm.date) : new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (event.type === 'set' && selectedDate) {
                        const formattedDate = selectedDate.toISOString().split('T')[0];
                        setSearchForm(prev => ({ ...prev, date: formattedDate }));
                      }
                    }}
                    minimumDate={new Date()}
                    maximumDate={maxDate}
                  />
                )}

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
            </View>
          </BottomSheetView>
        </BottomSheet>

        <Modal
          visible={showStationModal !== null}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowStationModal(null)}
        >
          <SafeAreaView style={{ flex: 1 }}>
            <View className="flex-1 bg-background">
              <View className="p-4 border-b border-border flex-row items-center justify-between">
                <TouchableOpacity
                  onPress={() => setShowStationModal(null)}
                  className="p-2"
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
                <Text className="text-lg font-semibold text-foreground">
                  {showStationModal === 'from' 
                    ? 'Select Departure' 
                    : showStationModal === 'to'
                    ? 'Select Arrival'
                    : 'Select Cabin Class'
                  }
                </Text>
                <View style={{ width: 40 }} />
              </View>

              {showStationModal === 'cabin' ? (
                <View className="flex-1">
                  {isLoadingCabinClasses ? (
                    <View className="flex-1 items-center justify-center">
                      <ActivityIndicator size="large" color="#666" />
                    </View>
                  ) : cabinClassesError ? (
                    <View className="flex-1 items-center justify-center p-4">
                      <Text className="text-red-500 text-center mb-2">{cabinClassesError}</Text>
                      <TouchableOpacity 
                        onPress={() => {
                          setCabinClassesError(null);
                          fetchCabinClasses();
                        }}
                        className="bg-primary px-4 py-2 rounded-lg"
                      >
                        <Text className="text-primary-foreground">Try Again</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <FlatList
                      data={cabinClasses}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          onPress={() => {
                            setSearchForm(prev => ({
                              ...prev,
                              cabinClass: item.id,
                              cabinClassName: item.name
                            }));
                            setShowStationModal(null);
                          }}
                          className="p-4 border-b border-border"
                        >
                          <Text className="text-base text-foreground">{item.name}</Text>
                        </TouchableOpacity>
                      )}
                      keyExtractor={item => item.id}
                      ListEmptyComponent={
                        <View className="flex-1 items-center justify-center p-4">
                          <Text className="text-muted-foreground text-center">
                            No cabin classes available
                          </Text>
                        </View>
                      }
                    />
                  )}
                </View>
              ) : (
                <>
                  <View className="p-4">
                    <View className="flex-row items-center bg-card border border-input rounded-xl px-4">
                      <Ionicons name="search" size={20} color="#666" />
                      <TextInput
                        className="flex-1 h-12 ml-2 text-base"
                        placeholder="Search stations"
                        placeholderTextColor="#666"
                        value={stationSearch}
                        onChangeText={setStationSearch}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                      {stationSearch ? (
                        <TouchableOpacity onPress={() => setStationSearch('')}>
                          <Ionicons name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                      ) : null}
                    </View>
                  </View>

                  {isLoadingStations ? (
                    <View className="flex-1 items-center justify-center">
                      <ActivityIndicator size="large" color="#666" />
                    </View>
                  ) : (
                    <FlatList
                      data={filteredStations}
                      renderItem={renderStationItem}
                      keyExtractor={item => item.id}
                      contentContainerStyle={{ flexGrow: 1 }}
                      keyboardShouldPersistTaps="handled"
                      ListEmptyComponent={
                        <View className="flex-1 items-center justify-center p-4">
                          <Text className="text-muted-foreground text-center">
                            {stationSearch 
                              ? 'No stations found'
                              : showStationModal === 'to' 
                                ? 'Select a departure station first'
                                : 'No stations available'}
                          </Text>
                        </View>
                      }
                    />
                  )}
                </>
              )}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    </SafeAreaView> 
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 24,
  },
});