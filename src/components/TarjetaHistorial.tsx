import { ReactNode } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MESES } from "../utils/fechas";

interface Props {
  fecha: Date;
  etiqueta?: string; // por ejemplo "(Atención)"
  onPress?: () => void; // si se envía, la tarjeta se puede tocar
  children: ReactNode;
}

export default function TarjetaHistorial({ fecha, etiqueta, onPress, children }: Props) {
  const dia = String(fecha.getDate()).padStart(2, "0");

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row bg-white rounded-xl shadow mb-4 overflow-hidden border border-sky-200"
    >
      <View className="w-2 bg-sky-600" />

      <View className="w-24 items-center justify-center px-1 my-3 border-r border-gray-300">
        <Text className="text-3xl font-bold">{dia}</Text>
        <Text className="text-xs">{MESES[fecha.getMonth()].toUpperCase()}</Text>
        <Text className="text-xs">{fecha.getFullYear()}</Text>
        {etiqueta ? <Text className="text-xs">{etiqueta}</Text> : null}
      </View>

      <View className="flex-1 p-3">{children}</View>

      {onPress && (
        <View className="justify-center pr-3">
          <Ionicons name="chevron-forward" size={24} color="#111827" />
        </View>
      )}
    </Pressable>
  );
}
