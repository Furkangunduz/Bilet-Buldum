import { Ionicons } from '@expo/vector-icons';
import { Loader2 } from 'lucide-react-native';
import React, { useCallback, useRef } from 'react';
import { Animated, Easing, LayoutAnimation, Text, TouchableOpacity, View } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { SearchAlert } from '~/lib/api';

interface AlertItemProps {
  alert: SearchAlert;
  onDelete: () => Promise<void>;
  onDecline: () => Promise<void>;
  spinAnim: Animated.Value;
  isDark: boolean;
  onSwipeStart: () => void;
  onSwipeClose: () => void;
  setSwipeableRef: (ref: Swipeable | null) => void;
}

export const AlertItem = React.memo(({ 
  alert, 
  onDelete, 
  onDecline, 
  spinAnim, 
  isDark, 
  onSwipeStart, 
  onSwipeClose,
  setSwipeableRef 
}: AlertItemProps) => {
  const swipeableRef = useRef<Swipeable | null>(null);
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  const handleRef = useCallback((ref: Swipeable | null) => {
    swipeableRef.current = ref;
    setSwipeableRef(ref);
  }, [setSwipeableRef]);

  const animate = useCallback(() => {
    return new Promise<void>((resolve) => {
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
          easing: Easing.ease,
        }),
      ]).start(() => {
        LayoutAnimation.configureNext({
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
        });
        resolve();
      });
    });
  }, [translateY, opacity]);

  const handleAction = async () => {
    swipeableRef.current?.close();
    onSwipeClose();
    await animate();
    if (alert.status === 'PENDING') {
      await onDecline();
    } else {
      await onDelete();
    }
  };

  const renderRightActions = () => (
    <TouchableOpacity
      onPress={handleAction}
      className={`w-[95px] justify-center items-center ${
        alert.status === 'PENDING' ? 'bg-yellow-600' : 'bg-destructive'
      }`}
      style={
        {
          borderTopRightRadius: 5,
          borderBottomRightRadius: 5,
        }
      }
      activeOpacity={0.8}
    >
      <View className="items-center">
        <Ionicons 
          name={alert.status === 'PENDING' ? "close-circle-outline" : "trash-outline"} 
          size={24} 
          color="#fff" 
        />
        <Text className="text-white text-xs mt-1">
          {alert.status === 'PENDING' ? 'Decline' : 'Delete'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
        marginBottom: 8,
      }}
    >
      <Swipeable
        ref={handleRef}
        renderRightActions={renderRightActions}
        overshootRight={false}
        onSwipeableWillOpen={onSwipeStart}
        onSwipeableClose={onSwipeClose}
      >
        <View className="bg-card p-4 rounded-lg border border-border">
          <View className="flex-row items-center justify-between mb-2">
            <Text className="text-base font-medium text-foreground max-w-[150px]">
              {alert.fromStationName?.split(' , ')[0]} → {alert.toStationName?.split(' , ')[0]}
            </Text>
            <View className={`px-3 py-1.5 rounded-full flex-row items-center ${
              alert.status === 'PENDING' ? 'bg-yellow-100/80' :
              alert.status === 'COMPLETED' ? 'bg-green-100/80' :
              'bg-red-100/80'
            }`}>
              {alert.status === 'PENDING' ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-medium text-yellow-800">
                    Searching
                  </Text>
                  <Animated.View 
                    style={{
                      transform: [{
                        rotate: spinAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', '360deg']
                        })
                      }],
                      marginLeft: 2
                    }}
                  >
                    <Loader2 
                      size={14} 
                      color="hsl(41, 100%, 35%)" 
                      strokeWidth={2.5}
                    />
                  </Animated.View>
                </View>
              ) : alert.status === 'COMPLETED' ? (
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-medium text-green-800">
                    Found
                  </Text>
                  <Ionicons 
                    name="checkmark-circle" 
                    size={14} 
                    color="hsl(142, 76%, 36%)" 
                  />
                </View>
              ) : (
                <View className="flex-row items-center gap-2">
                  <Text className="text-xs font-medium text-red-800">
                    Failed
                  </Text>
                  <Ionicons 
                    name="alert-circle" 
                    size={14} 
                    color="hsl(0, 84%, 60%)" 
                  />
                </View>
              )}
            </View>
          </View>
          <Text className="text-sm text-muted-foreground">
            {new Date(alert.date).toLocaleDateString('tr-TR', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })} • {alert.cabinClassName || alert.cabinClass}
          </Text>
          <Text className="text-sm text-muted-foreground">
            {alert.departureTimeRange.start.replace(/^(\d{2}):(\d{2})$/, '$1:$2')} - {alert.departureTimeRange.end.replace(/^(\d{2}):(\d{2})$/, '$1:$2')}
          </Text>

          {alert.statusReason && (
            <Text className="text-xs text-muted-foreground mt-2">
              {alert.statusReason}
            </Text>
          )}
        </View>
      </Swipeable>
    </Animated.View>
  );
}); 