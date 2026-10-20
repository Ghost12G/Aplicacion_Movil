import { useState } from "react";
import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MenuItem from "../components/menuItems";
import MenuLateral from "../components/MenuLateral";

export default function Home() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const cerrarSesion = () => {
    setMenuVisible(false);
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-white ">
      {/* Cabecera */}
      <View className="flex-row items-center bg-sky-100 pt-16 pb-3 px-4">
        <Pressable onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={34} color="#111827" />
        </Pressable>

        <View className="flex-1 ml-3 ">
          <Text className="text-sm text-gray-600">Clinic Digital</Text>
          <Text className="text-lg font-bold">Bienvenido, JOSE PALACIOS</Text>
        </View>

        <Image
          source={require("../../assets/images/logo-clinic-digital-horizontal.png")}
          className="w-28 h-12"
          resizeMode="contain"
        />
      </View>

      {/* Accesos */}
      <ScrollView className="px-4 pt-4">
        <Text className="text-2xl font-bold mb-3">Solicitudes</Text>
        <MenuItem
          titulo="Nueva solicitud"
          icono="create"
          onPress={() => router.push("/solicitud")}
        />

        <Text className="text-2xl font-bold mt-4 mb-3">Citas</Text>
        <MenuItem titulo="Citas Programadas" icono="calendar" />
        <MenuItem titulo="Atenciones Realizadas" icono="medkit" />

        <Text className="text-2xl font-bold mt-4 mb-3">Ordenes Médicas</Text>
        <MenuItem titulo="Recetas" icono="document-text" />
        <MenuItem titulo="Descansos Médicos" icono="bed" />
      </ScrollView>

      {/* Menú lateral */}
      <MenuLateral
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCerrarSesion={cerrarSesion}
        centro="Clinic Digital"
        vigencia="07/11/2026"
      />
    </View>
  );
}