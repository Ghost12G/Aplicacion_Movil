import { ReactNode } from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  children: ReactNode;
}

export default function TarjetaInfo({ icono, children }: Props) {
  return (
    <View className="flex-row items-center bg-cyan-50 rounded-xl p-4 mb-3">
      <Ionicons name={icono} size={34} color="#0369a1" />
      <View className="flex-1 ml-4">{children}</View>
    </View>
  );
}
