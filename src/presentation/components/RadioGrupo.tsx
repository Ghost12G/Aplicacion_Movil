import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  pregunta: string;
  opciones: string[];
  valor: string;
  onCambiar: (opcion: string) => void;
  horizontal?: boolean;
}

export default function RadioGrupo({
  pregunta,
  opciones,
  valor,
  onCambiar,
  horizontal = false,
}: Props) {
  return (
    <View className="mb-5">
      <Text className="text-lg mb-2">{pregunta}</Text>
      <View className={horizontal ? "flex-row flex-wrap" : ""}>
        {opciones.map((op) => (
          <Pressable
            key={op}
            onPress={() => onCambiar(op)}
            accessibilityRole="radio"
            accessibilityState={{ checked: valor === op }}
            accessibilityLabel={op}
            className={`flex-row items-center rounded-xl border px-3 py-2 ${
              horizontal ? "mr-3 mb-2" : "mb-2"
            } ${
              valor === op
                ? "border-sky-700 bg-sky-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <Ionicons
              name={valor === op ? "radio-button-on" : "radio-button-off"}
              size={28}
              color={valor === op ? "#0369a1" : "#64748b"}
            />
            <Text
              className={`ml-2 text-base ${
                valor === op ? "font-bold text-sky-900" : "text-slate-700"
              }`}
            >
              {op}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
