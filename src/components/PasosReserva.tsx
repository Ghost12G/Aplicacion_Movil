import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  paso: 1 | 2 | 3 | 4;
}

const pasos: { nombre: string; icono: keyof typeof Ionicons.glyphMap }[] = [
  { nombre: "Especialidad", icono: "pulse" },
  { nombre: "Médico", icono: "person" },
  { nombre: "Cita", icono: "time" },
  { nombre: "Reservado", icono: "calendar" },
];

export default function PasosReserva({ paso }: Props) {
  return (
    <View className="flex-row mb-5">
      {pasos.map((p, i) => {
        const numero = i + 1;
        const activo = numero === paso;
        const hecho = numero < paso;

        let fondo = "bg-white border border-dashed border-gray-300";
        if (activo) fondo = "bg-sky-900";
        if (hecho) fondo = "bg-sky-500";

        return (
          <View key={p.nombre} className="flex-1 items-center">
            <View className="flex-row items-center w-full">
              <View className={`flex-1 h-px ${i === 0 ? "" : "bg-gray-300"}`} />
              <View className={`w-12 h-12 rounded-full items-center justify-center ${fondo}`}>
                <Ionicons
                  name={p.icono}
                  size={22}
                  color={numero <= paso ? "white" : "#9ca3af"}
                />
              </View>
              <View
                className={`flex-1 h-px ${i === pasos.length - 1 ? "" : "bg-gray-300"}`}
              />
            </View>
            <Text
              className={`mt-1 text-xs ${numero <= paso ? "text-sky-900" : "text-gray-400"}`}
            >
              {p.nombre}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
