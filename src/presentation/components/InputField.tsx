import { useState } from "react";
import { View, TextInput, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (texto: string) => void;
  esPassword?: boolean;
  teclado?: "default" | "numeric" | "email-address";
  multilinea?: boolean;
  error?: string;
}

export default function InputField({
  icono,
  placeholder,
  value,
  onChangeText,
  esPassword = false,
  teclado = "default",
  multilinea = false,
  error,
}: Props) {
  const [ocultar, setOcultar] = useState(esPassword);
  const tieneError = Boolean(error);

  return (
    <View className="mb-4">
      <View
        className={`flex-row bg-gray-100 px-3 py-2 border-b-2 ${
          tieneError ? "border-red-600" : "border-gray-700"
        } ${multilinea ? "items-start" : "items-center"}`}
      >
        <Ionicons name={icono} size={22} color="#374151" />

        <View className="flex-1 ml-3">
          {value !== "" && (
            <Text className={`text-xs ${tieneError ? "text-red-600" : "text-gray-500"}`}>
              {placeholder}
            </Text>
          )}
          <TextInput
            className={`text-base ${multilinea ? "min-h-24" : ""}`}
            placeholder={placeholder}
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={ocultar}
            keyboardType={teclado}
            multiline={multilinea}
            textAlignVertical={multilinea ? "top" : "center"}
            autoCapitalize="none"
          />
        </View>

        {esPassword && (
          <Pressable onPress={() => setOcultar(!ocultar)}>
            <Ionicons
              name={ocultar ? "eye-outline" : "eye-off-outline"}
              size={22}
              color="#374151"
            />
          </Pressable>
        )}
      </View>
      {tieneError ? <Text className="text-red-600 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
