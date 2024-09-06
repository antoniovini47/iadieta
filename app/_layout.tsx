import { Stack } from "expo-router";
import { useEffect } from "react";
import "expo-dev-client";
import mobileAds from "react-native-google-mobile-ads";

export default function RootLayout() {
  // Initialize Google Mobile Ads SDK
  useEffect(() => {
    (async () => {
      // // Google AdMob will show any messages here that you just set up on the AdMob Privacy & Messaging page
      // const { status: trackingStatus } = await requestTrackingPermissionsAsync();
      // if (trackingStatus !== "granted") {
      //   // Do something here such as turn off Sentry tracking, store in context/redux to allow for personalized ads, etc.
      // }
      // await mobileAds().initialize();
    })();
  }, []);
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
