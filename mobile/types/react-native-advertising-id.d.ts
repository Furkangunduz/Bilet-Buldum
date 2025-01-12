declare module 'react-native-advertising-id' {
  export interface TrackingStatus {
    status: 'authorized' | 'denied' | 'not-determined' | 'restricted';
  }

  export const ATTrackingPermissionsAndroid: {
    requestPermission(): Promise<TrackingStatus>;
  };
}
