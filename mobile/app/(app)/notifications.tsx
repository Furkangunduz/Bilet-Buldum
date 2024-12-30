import { Bell, Train } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const NOTIFICATIONS = [
  {
    id: 1,
    title: 'Tickets Available!',
    message: 'Istanbul - Ankara tickets are now available for Jan 15, 2024',
    time: '2 hours ago',
    type: 'alert',
  },
  {
    id: 2,
    title: 'Price Drop',
    message: 'Prices for Izmir - Ankara route have decreased',
    time: '5 hours ago',
    type: 'price',
  },
  {
    id: 3,
    title: 'New Route Added',
    message: 'New high-speed train route added: Istanbul - Konya',
    time: '1 day ago',
    type: 'info',
  },
];

export default function Notifications() {
  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="space-y-2 mb-6">
          <Text className="text-2xl font-bold text-foreground">
            Notifications
          </Text>
          <Text className="text-muted-foreground">
            Stay updated with your ticket alerts
          </Text>
        </View>

        <View className="space-y-4">
          {NOTIFICATIONS.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              className="bg-card p-4 rounded-lg border border-border"
            >
              <View className="flex-row space-x-3">
                <View
                  className={`w-8 h-8 rounded-full items-center justify-center ${
                    notification.type === 'alert'
                      ? 'bg-destructive/10'
                      : notification.type === 'price'
                      ? 'bg-primary/10'
                      : 'bg-muted'
                  }`}
                >
                  {notification.type === 'alert' ? (
                    <Bell
                      size={16}
                      className={
                        notification.type === 'alert'
                          ? 'text-destructive'
                          : 'text-primary'
                      }
                    />
                  ) : (
                    <Train
                      size={16}
                      className={
                        notification.type === 'price'
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }
                    />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-medium text-foreground">
                    {notification.title}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-1">
                    {notification.message}
                  </Text>
                  <Text className="text-xs text-muted-foreground mt-2">
                    {notification.time}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
} 