import { DarkTheme, DefaultTheme, ThemeProvider } from "expo-router";
import { PermissionsAndroid, Platform, useColorScheme } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import AppTabs from "@/components/app-tabs";

import Printer from "expo-printer";
import { useEffect } from "react";

async function requestBluetoothPermissions() {
  if (Platform.OS !== "android") return true;

  if (Platform.Version >= 31) {
    const permissions = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
    ]);

    return (
      permissions[PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN] ===
        PermissionsAndroid.RESULTS.GRANTED &&
      permissions[PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT] ===
        PermissionsAndroid.RESULTS.GRANTED
    );
  }

  return true;
}

export default function TabLayout() {
  useEffect(() => {
    async function testPrinter() {
      try {
        const granted = await requestBluetoothPermissions();

        if (!granted) {
          console.error("Bluetooth permission denied");
          return;
        }

        const result = await Printer.connect("DC:0D:30:25:3D:D2");

        console.log(result);
        console.log("connected:", Printer.isConnected());

        await Printer.printTest();
        Printer.disconnect();
      } catch (e) {
        console.error("Printer error:", e);
      }
    }

    testPrinter();
  }, []);

  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <AppTabs />
    </ThemeProvider>
  );
}
