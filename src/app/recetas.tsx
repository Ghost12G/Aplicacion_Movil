import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Cabecera from "../components/Cabecera";
import Pestanas from "../components/Pestanas";
import Buscador from "../components/Buscador";
import TarjetaHistorial from "../components/TarjetaHistorial";
import { CENTRO } from "../data/catalogo";
import { recetas } from "../data/historial";
import { Receta } from "../types/usuario";

const pestanas = ["Anteriores", "Mes Actual", "Siguientes"];

// Decide en qué pestaña va una receta según su mes
function categoria(fecha: Date): string {
  const hoy = new Date();
  const diferencia =
    (fecha.getFullYear() - hoy.getFullYear()) * 12 + (fecha.getMonth() - hoy.getMonth());

  if (diferencia < 0) return "Anteriores";
  if (diferencia === 0) return "Mes Actual";
  return "Siguientes";
}

export default function Recetas() {
  const [pestana, setPestana] = useState("Anteriores");
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<Receta | null>(null);

  const visibles = recetas.filter(
    (r) =>
      categoria(r.fecha) === pestana &&
      `${r.numero} ${r.especialidad} ${r.medico}`
        .toLowerCase()
        .includes(busqueda.toLowerCase())
  );

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Recetas" />
      <Pestanas opciones={pestanas} activa={pestana} onCambiar={setPestana} />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-10">
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por número, especialidad o médico..."
        />

        {visibles.map((r) => (
          <TarjetaHistorial key={r.id} fecha={r.fecha} onPress={() => setDetalle(r)}>
            <Text className="font-bold text-base">RECETA Nº {r.numero}</Text>
            <Text className="text-sky-700">IPRESS:</Text>
            <Text>{CENTRO}</Text>
            <Text className="font-bold">{r.especialidad}</Text>
            <Text>{r.medico}</Text>
            <Text>Acto Médico: {r.actoMedico}</Text>
            <Text className="text-sky-700">
              Estado: <Text className="font-bold">{r.estado}</Text>
            </Text>
          </TarjetaHistorial>
        ))}

        {visibles.length === 0 && (
          <Text className="text-center text-gray-500 mt-8">
            No hay recetas en esta sección
          </Text>
        )}
      </ScrollView>

      {/* Detalle de la receta */}
      <Modal
        visible={detalle !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalle(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          {detalle && (
            <View className="bg-white rounded-3xl p-5 w-full">
              <View className="flex-row items-center justify-between pb-3 border-b border-gray-200">
                <Text className="flex-1 text-center text-xl font-bold text-sky-800">
                  RECETA Nº {detalle.numero}
                </Text>
                <Pressable onPress={() => setDetalle(null)}>
                  <Ionicons name="close" size={28} color="#111827" />
                </Pressable>
              </View>

              <View className="flex-row justify-between py-3">
                <Text className="text-base w-1/3">Médico:</Text>
                <Text className="text-base font-bold flex-1 text-right">{detalle.medico}</Text>
              </View>
              <View className="flex-row justify-between pb-3 border-b border-gray-200">
                <Text className="text-base w-1/3">C.Asistencial:</Text>
                <Text className="text-base font-bold flex-1 text-right">{CENTRO}</Text>
              </View>

              <Pressable
                onPress={() =>
                  Alert.alert("Ver receta", "El PDF de la receta no está disponible por el momento")
                }
                className="flex-row items-center bg-sky-600 rounded-full px-4 py-2 self-end my-3"
              >
                <Ionicons name="document-text" size={22} color="white" />
                <Text className="text-white ml-2">Ver Receta</Text>
              </Pressable>

              <Text className="font-bold text-base py-2 border-t border-b border-gray-200">
                MEDICAMENTOS:
              </Text>

              <ScrollView className="max-h-64">
                {detalle.medicamentos.map((m) => (
                  <View key={m.nombre} className="flex-row py-3">
                    <Ionicons name="medical" size={30} color="#0369a1" />
                    <View className="flex-1 ml-4">
                      <Text className="font-bold text-sky-700 text-base">{m.nombre}</Text>
                      <Text className="text-gray-700">Cantidad: {m.cantidad}</Text>
                      <Text className="text-gray-700">UM/FF: {m.unidad}</Text>
                      <Text className="text-gray-700">{m.indicacion}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>

              <Pressable
                onPress={() => setDetalle(null)}
                className="bg-sky-900 rounded-full py-3 px-10 self-center mt-3"
              >
                <Text className="text-white text-lg font-bold">Cerrar</Text>
              </Pressable>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
