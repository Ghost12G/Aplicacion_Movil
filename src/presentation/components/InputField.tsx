import { useState } from "react";
import {
  DeviceEventEmitter,
  View,
  TextInput,
  Pressable,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Text from "./ThemedText";

interface Props {
  icono: keyof typeof Ionicons.glyphMap;
  placeholder: string;
  value: string;
  onChangeText: (texto: string) => void;
  esPassword?: boolean;
  teclado?: "default" | "numeric" | "email-address";
  multilinea?: boolean;
  error?: string;
  editable?: boolean;
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
  editable = true,
}: Props) {
  const [ocultar, setOcultar] = useState(esPassword);
  const tieneError = Boolean(error);
  const colorScheme = useColorScheme();
  const colorIcono = colorScheme === "dark" ? "#cbd5e1" : "#374151";

  return (
    <View className="mb-4">
      <View
        className={`flex-row bg-gray-100 dark:bg-slate-800 px-3 py-2 border-b-2 ${
          tieneError ? "border-red-600" : "border-gray-700 dark:border-slate-400"
        } ${multilinea ? "items-start" : "items-center"}`}
      >
        <Ionicons name={icono} size={22} color={colorIcono} />

        <View className="flex-1 ml-3">
          {value !== "" && (
            <Text className={`text-xs ${tieneError ? "text-red-600" : "text-gray-500"}`}>
              {placeholder}
            </Text>
          )}
          <TextInput
            className={`text-base text-gray-900 dark:text-slate-100 ${
              multilinea ? "min-h-24" : ""
            }`}
            placeholder={placeholder}
            placeholderTextColor={colorScheme === "dark" ? "#94a3b8" : "#6b7280"}
            value={value}
            onChangeText={onChangeText}
            editable={editable}
            secureTextEntry={ocultar}
            keyboardType={teclado}
            multiline={multilinea}
            textAlignVertical={multilinea ? "top" : "center"}
            autoCapitalize="none"
            onFocus={() => DeviceEventEmitter.emit("campo-enfocado")}
          />
        </View>

        {esPassword && (
          <Pressable onPress={() => setOcultar(!ocultar)}>
            <Ionicons
              name={ocultar ? "eye-outline" : "eye-off-outline"}
              size={22}
              color={colorIcono}
            />
          </Pressable>
        )}
      </View>
      {tieneError ? <Text className="text-red-600 text-sm mt-1">{error}</Text> : null}
    </View>
  );
}
