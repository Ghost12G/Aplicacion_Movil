import { Modal, View, Text, Pressable, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  onClose: () => void;
  onCerrarSesion: () => void;
  centro: string;
  vigencia: string;
}

interface ItemProps {
  icono: keyof typeof Ionicons.glyphMap;
  titulo: string;
  onPress: () => void;
}

function ItemMenu({ icono, titulo, onPress }: ItemProps) {
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-5 py-4">
      <Ionicons name={icono} size={26} color="#0369a1" />
      <Text className="ml-4 text-lg">{titulo}</Text>
    </Pressable>
  );
}

export default function MenuLateral({
  visible,
  onClose,
  onCerrarSesion,
  centro,
  vigencia,
}: Props) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 flex-row">
        {/* Panel blanco del menú */}
        <View className="w-3/4 bg-white">
          <View className="bg-sky-100 pt-14 px-5 pb-5">
            <Image
              source={require("../../assets/images/logo-clinic-digital-horizontal.png")}
              className="w-full h-20 mb-4"
              resizeMode="contain"
            />
            <Text className="text-sky-700 font-bold text-lg">Mi Centro:</Text>
            <Text className="text-sky-700 mb-3">{centro}</Text>
            <Text className="text-sky-700 font-bold text-lg">Vigencia Hasta:</Text>
            <Text className="text-sky-700">{vigencia}</Text>
          </View>

          <ItemMenu icono="home" titulo="Inicio" onPress={onClose} />
          <ItemMenu icono="person" titulo="Mi Perfil" onPress={onClose} />

          <View className="border-t border-gray-300 mt-2" />
          <ItemMenu
            icono="log-out"
            titulo="Cerrar Sesión"
            onPress={onCerrarSesion}
          />
        </View>

        {/* Zona oscura: al tocarla se cierra el menú */}
        <Pressable className="flex-1 bg-black/50" onPress={onClose} />
      </View>
    </Modal>
  );
}