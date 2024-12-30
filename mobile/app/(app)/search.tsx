import { Search as SearchIcon } from 'lucide-react-native';
import { useState } from 'react';
import { SafeAreaView, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Search() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');

  return (
    <SafeAreaView className='flex-1 bg-background'>
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="space-y-2 mb-6">
          <Text className="text-2xl font-bold text-foreground">Search Trains</Text>
          <Text className="text-muted-foreground">
            Find available train tickets
          </Text>
        </View>

        <View className="space-y-4">
          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">From</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Departure station"
              value={from}
              onChangeText={setFrom}
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">To</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Arrival station"
              value={to}
              onChangeText={setTo}
            />
          </View>

          <View className="space-y-2">
            <Text className="text-sm font-medium text-foreground">Date</Text>
            <TextInput
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Select date"
              value={date}
              onChangeText={setDate}
            />
          </View>

          <TouchableOpacity
            className="bg-primary h-10 rounded-md flex-row items-center justify-center space-x-2 mt-4"
          >
            <SearchIcon size={20} color="white" />
            <Text className="text-primary-foreground font-medium">
              Search Tickets
            </Text>
          </TouchableOpacity>
        </View>

        <View className="mt-8">
          <Text className="text-lg font-semibold text-foreground mb-4">
            Recent Searches
          </Text>

          <View className="space-y-4">
            <TouchableOpacity className="bg-card p-4 rounded-lg border border-border">
              <Text className="text-sm font-medium text-foreground">
                Istanbul - Ankara
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Jan 15, 2024
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-card p-4 rounded-lg border border-border">
              <Text className="text-sm font-medium text-foreground">
                Izmir - Ankara
              </Text>
              <Text className="text-xs text-muted-foreground mt-1">
                Jan 20, 2024
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
} 