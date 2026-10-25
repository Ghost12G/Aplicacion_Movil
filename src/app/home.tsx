import { useState } from "react";
import { ScrollView, View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import MenuItem from "../components/menuItems";
import MenuLateral from "../components/MenuLateral";
import { CENTRO } from "../data/catalogo";
import { obtenerUsuarioActual, salir } from "../data/almacen";

export default function Home() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);

  const usuario = obtenerUsuarioActual();
  const nombre = usuario ? usuario.nombre.toUpperCase() : "";

  const cerrarSesion = () => {
    setMenuVisible(false);
    salir();
    router.replace("/login");
  };

  return (
    <View className="flex-1 bg-white">
      {/* Cabecera */}
      <View className="flex-row items-center bg-sky-100 pt-12 pb-4 px-4">
        <Pressable onPress={() => setMenuVisible(true)}>
          <Ionicons name="menu" size={34} color="#111827" />
        </Pressable>

        <View className="flex-1 ml-4">
          <Text className="text-sm text-gray-600">Clinic Digital</Text>
          <Text className="text-lg font-bold" numberOfLines={1}>
            Bienvenido, {nombre}
          </Text>
        </View>

        <Image
          source={require("../../assets/images/logo-clinic-digital-horizontal.png")}
          className="w-28 h-12"
          resizeMode="contain"
        />
      </View>

      {/* Accesos */}
      <ScrollView className="px-4 pt-4">
        <Pressable
          onPress={() => router.push("/reservar")}
          className="flex-row items-center bg-sky-900 rounded-2xl p-5 mb-4"
        >
          <Ionicons name="videocam" size={34} color="white" />
          <Text className="flex-1 ml-4 text-white text-xl font-bold">
            Agendar cita virtual
          </Text>
          <Ionicons name="chevron-forward" size={26} color="white" />
        </Pressable>

        <Text className="text-2xl font-bold mb-3">Solicitudes</Text>
        <MenuItem
          titulo="Nueva solicitud"
          icono="create"
          onPress={() => router.push("/solicitud")}
        />

        <Text className="text-2xl font-bold mt-4 mb-3">Citas</Text>
        <MenuItem
          titulo="Citas Programadas"
          icono="calendar"
          onPress={() => router.push("/citas")}
        />
        <MenuItem titulo="Atenciones Realizadas" icono="medkit" />

        <Text className="text-2xl font-bold mt-4 mb-3">Ordenes Médicas</Text>
        <MenuItem titulo="Recetas" icono="document-text" />
        <MenuItem titulo="Descansos Médicos" icono="bed" />

        <View className="h-8" />
      </ScrollView>

      {/* Menú lateral */}
      <MenuLateral
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onCerrarSesion={cerrarSesion}
        centro={CENTRO}
        vigencia="07/11/2026"
      />
    </View>
  );
}
