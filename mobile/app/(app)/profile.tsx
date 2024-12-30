import { Bell, CreditCard, LogOut, Settings } from 'lucide-react-native';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { SUBSCRIPTION_PLANS } from '../../lib/constants';

export default function Profile() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <View className="space-y-2 mb-6">
          <Text className="text-2xl font-bold text-foreground">{user?.name}</Text>
          <Text className="text-muted-foreground">{user?.email}</Text>
        </View>

        <View className="space-y-4">
          <TouchableOpacity className="flex-row items-center space-x-3 bg-card p-4 rounded-lg border border-border">
            <CreditCard size={24} className="text-foreground" />
            <View>
              <Text className="text-sm font-medium text-foreground">
                Subscription
              </Text>
              <Text className="text-xs text-muted-foreground">
                {user?.subscription?.status === 'active'
                  ? `Active until ${user.subscription.expiresAt}`
                  : 'No active subscription'}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center space-x-3 bg-card p-4 rounded-lg border border-border">
            <Bell size={24} className="text-foreground" />
            <View>
              <Text className="text-sm font-medium text-foreground">
                Notifications
              </Text>
              <Text className="text-xs text-muted-foreground">
                Manage your notifications
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center space-x-3 bg-card p-4 rounded-lg border border-border">
            <Settings size={24} className="text-foreground" />
            <View>
              <Text className="text-sm font-medium text-foreground">Settings</Text>
              <Text className="text-xs text-muted-foreground">
                App preferences
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {(!user?.subscription || user.subscription.status !== 'active') && (
          <View className="mt-8">
            <Text className="text-lg font-semibold text-foreground mb-4">
              Upgrade Your Account
            </Text>

            <View className="space-y-4">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  className="bg-card p-4 rounded-lg border border-border"
                >
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-lg font-semibold text-foreground">
                      {plan.name}
                    </Text>
                    <Text className="text-lg font-bold text-primary">
                      ₺{plan.price}
                    </Text>
                  </View>
                  {plan.features.map((feature, index) => (
                    <Text
                      key={index}
                      className="text-sm text-muted-foreground mt-1"
                    >
                      • {feature}
                    </Text>
                  ))}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        <TouchableOpacity
          onPress={signOut}
          className="flex-row items-center space-x-2 mt-8 p-4"
        >
          <LogOut size={20} className="text-destructive" />
          <Text className="text-destructive font-medium">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
} 