import { View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Props {
  titulo: string;
  onAtras?: () => void; // si no se envía, vuelve a la pantalla anterior
}

export default function Cabecera({ titulo, onAtras }: Props) {
  const router = useRouter();

  return (
    <View className="flex-row items-center bg-sky-100 pt-12 pb-4 px-4">
      <Pressable onPress={onAtras ?? (() => router.back())}>
        <Ionicons name="arrow-back" size={30} color="#111827" />
      </Pressable>

      <Text className="flex-1 mx-4 text-lg" numberOfLines={1}>
        {titulo}
      </Text>

      <Image
        source={require("../../assets/images/logo-clinic-digital-horizontal.png")}
        className="w-28 h-10"
        resizeMode="contain"
      />
    </View>
  );
}
