import { useState } from "react";
import {
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, Spacing } from "@/constants/theme";
import Printer from "expo-printer";

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

export default function HomeScreen() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = async () => {
    try {
      console.log("Requesting Bluetooth permissions...");
      const granted = await requestBluetoothPermissions();

      if (!granted) {
        console.error("Bluetooth permissions denied");
        return;
      }

      console.log("Attempting to connect to printer...");
      const connection = await Printer.connect("DC:0D:30:25:3D:D2");
      console.log("Connection value returned:", connection);
      console.log("Is connected:", Printer.isConnected());
      setIsConnected(true);
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  const handlePrintTest = async () => {
    try {
      console.log("Sending print test...");
      await Printer.printTest();
      console.log("Print test sent successfully");
    } catch (error) {
      console.error("Print test error:", error);
    }
  };

  const handlePrintSample = async () => {
    try {
      console.log("Sending print Sample...");
      await Printer.printXpTt426bLabel({
        productName: "Jumbo Diet",
        productLine2: "Vanilla Chocolate",
        productLine3: "",
        productionDate: "02/03/2026",
        lineTitle: "Line",
        lineValue: "Line 1",
        casesOnPallet: "120",
        palletNo: "2",
        barcodeValue: "P000000001",
      });
      console.log("Print Sample sent successfully");
    } catch (error) {
      console.error("Print Sample error:", error);
    }
  };

  const handleDisconnect = async () => {
    try {
      console.log("Disconnecting from printer...");
      Printer.disconnect();
      console.log("Disconnected successfully");
      setIsConnected(false);
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.headerSection}>
          <ThemedText type="title" style={styles.title}>
            Printer Control
          </ThemedText>
          <ThemedText type="default" style={styles.status}>
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </ThemedText>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              styles.connectButton,
              pressed && styles.buttonPressed,
            ]}
            onPress={handleConnect}
            disabled={isConnected}
          >
            <ThemedText
              style={[styles.buttonText, isConnected && styles.disabledText]}
            >
              {isConnected ? "✓ Connected" : "Connect to Printer"}
            </ThemedText>
          </Pressable>

          {isConnected && (
            <>
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.testButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePrintTest}
              >
                <ThemedText style={styles.buttonText}>
                  Print Test Page
                </ThemedText>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  styles.testButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handlePrintSample}
              >
                <ThemedText style={styles.buttonText}>
                  Print Test Sample
                </ThemedText>
              </Pressable>
            </>
          )}

          {isConnected && (
            <Pressable
              style={({ pressed }) => [
                styles.button,
                styles.disconnectButton,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDisconnect}
            >
              <ThemedText style={styles.buttonText}>Disconnect</ThemedText>
            </Pressable>
          )}
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.four,
    paddingBottom: BottomTabInset + Spacing.three,
  },
  headerSection: {
    alignItems: "center",
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  title: {
    textAlign: "center",
    fontSize: 28,
  },
  status: {
    fontSize: 16,
    fontWeight: "500",
  },
  buttonContainer: {
    width: "100%",
    maxWidth: 300,
    gap: Spacing.three,
  },
  button: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: Spacing.two,
    alignItems: "center",
    justifyContent: "center",
  },
  connectButton: {
    backgroundColor: "#4CAF50",
  },
  testButton: {
    backgroundColor: "#2196F3",
  },
  disconnectButton: {
    backgroundColor: "#f44336",
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  disabledText: {
    opacity: 0.6,
  },
});
