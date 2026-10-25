import { Modal, View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  visible: boolean;
  titulo: string;
  mensaje: string;
  onCerrar: () => void;
}

export default function ModalExito({ visible, titulo, mensaje, onCerrar }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCerrar}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="bg-green-600 rounded-2xl p-6 w-full items-center">
          <Ionicons name="checkmark-circle" size={60} color="white" />
          <Text className="text-white text-2xl font-bold mt-2">{titulo}</Text>
          <Text className="text-white text-center mt-2 mb-5">{mensaje}</Text>
          <Pressable onPress={onCerrar} className="bg-white px-8 py-3 rounded-full">
            <Text className="text-green-700 font-bold text-base">Aceptar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
