import "../global.css";
import { useEffect } from "react";
import * as Network from "expo-network";
import { Stack } from "expo-router";
import { citaFirestoreSyncService } from "../infrastructure/container";

export default function RootLayout() {
  const estadoRed = Network.useNetworkState();

  useEffect(() => {
    if (!estadoRed.isConnected || estadoRed.isInternetReachable === false) return;

    void citaFirestoreSyncService.sincronizarPendientes().catch((error: unknown) => {
      console.error("La sincronización de citas quedó pendiente.", error);
    });
  }, [estadoRed.isConnected, estadoRed.isInternetReachable]);

  return <Stack screenOptions={{ headerShown: false }} />;
}