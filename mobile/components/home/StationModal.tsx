import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, FlatList, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { CabinClass, Station } from '../../lib/api';

interface StationModalProps {
  type: 'from' | 'to' | 'cabin' | null;
  onClose: () => void;
  stationSearch: string;
  onSearchChange: (text: string) => void;
  isLoading: boolean;
  stations: Station[];
  onStationSelect: (station: Station) => void;
  cabinClasses: CabinClass[];
  isLoadingCabinClasses: boolean;
  cabinClassesError: string | null;
  onCabinClassSelect: (cabinClass: CabinClass) => void;
  onRetryLoadCabinClasses: () => void;
}

export function StationModal({
  type,
  onClose,
  stationSearch,
  onSearchChange,
  isLoading,
  stations,
  onStationSelect,
  cabinClasses,
  isLoadingCabinClasses,
  cabinClassesError,
  onCabinClassSelect,
  onRetryLoadCabinClasses
}: StationModalProps) {
  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      onPress={() =>{
        onStationSelect(item)
      }}
      className="p-4 border-b border-border"
    >
      <Text className="text-base text-foreground">{item.name}</Text>
    </TouchableOpacity>
  );


  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View className="flex-1 bg-background">
        <View className="p-4 border-b border-border flex-row items-center justify-between">
          <TouchableOpacity
            onPress={onClose}
            className="p-2"
          >
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {type === 'from' 
              ? 'Select Departure' 
              : type === 'to'
              ? 'Select Arrival'
              : 'Select Cabin Class'
            }
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {type === 'cabin' ? (
          <View className="flex-1">
            {isLoadingCabinClasses ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#666" />
              </View>
            ) : cabinClassesError ? (
              <View className="flex-1 items-center justify-center p-4">
                <Text className="text-red-500 text-center mb-2">{cabinClassesError}</Text>
                <TouchableOpacity 
                  onPress={onRetryLoadCabinClasses}
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
                    onPress={() => onCabinClassSelect(item)}
                    className="p-4 border-b border-border"
                  >
                    <Text className="text-base text-foreground">{item.name}</Text>
                  </TouchableOpacity>
                )}
                keyExtractor={item => `${type === 'cabin' ? 'cabin' : 'cabinClass'}-${item.id}`}
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
                  onChangeText={onSearchChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {stationSearch ? (
                  <TouchableOpacity onPress={() => onSearchChange('')}>
                    <Ionicons name="close-circle" size={20} color="#666" />
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>

           

            {isLoading ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#666" />
              </View>
            ) : (
              <FlatList
                data={stations}
                renderItem={renderStationItem}
                keyExtractor={item => `${type === 'from' ? 'from' : 'to'}-${item.id}`}
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center p-4">
                    <Text className="text-muted-foreground text-center">
                      {stationSearch 
                        ? 'No stations found'
                        : type === 'to' 
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
  );
} 