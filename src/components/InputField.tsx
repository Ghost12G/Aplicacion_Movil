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

    return (
        <View className="mb-4">
            <View
                className={`flex-row bg-gray-100 px-3 py-2 border-b-2 border-gray-700 ${multilinea ? "items-start" : "items-center"
                    }`}
            >
                <Ionicons name={icono} size={22} color="#374151" />
                <TextInput
                    className={`flex-1 ml-3 text-base ${multilinea ? "min-h-24" : ""}`}
                    placeholder={placeholder}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={ocultar}
                    keyboardType={teclado}
                    multiline={multilinea}
                    textAlignVertical={multilinea ? "top" : "center"}
                    autoCapitalize="none"
                />
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
            {error ? <Text className="text-red-500 text-sm mt-1">{error}</Text> : null}
        </View>
    );
}