import { useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Cabecera from "../components/Cabecera";
import Buscador from "../components/Buscador";
import { cancelarCita, obtenerCitas } from "../data/almacen";
import { Cita, Modalidad } from "../types/usuario";

const pestanas: Modalidad[] = ["Virtual", "Presencial"];

export default function CitasProgramadas() {
  const [pestana, setPestana] = useState<Modalidad>("Presencial");
  const [citas, setCitas] = useState<Cita[]>(obtenerCitas);
  const [busqueda, setBusqueda] = useState("");
  const [detalle, setDetalle] = useState<Cita | null>(null);

  // Buscador: filtra por especialidad o médico mientras se escribe
  const visibles = citas.filter(
    (c) =>
      c.modalidad === pestana &&
      `${c.especialidad} ${c.medico}`.toLowerCase().includes(busqueda.toLowerCase())
  );

  const cancelar = (cita: Cita) => {
    Alert.alert("Cancelar cita", "¿Seguro que quieres cancelar esta cita?", [
      { text: "No" },
      {
        text: "Sí, cancelar",
        style: "destructive",
        onPress: () => {
          cancelarCita(cita.id);
          setCitas(obtenerCitas());
        },
      },
    ]);
  };

  const filasDetalle = (c: Cita): [string, string][] => [
    ["Estado", c.estado],
    ["Fecha de Cita", c.fecha],
    ["Hora de Cita", c.hora],
    ["Especialidad", c.especialidad],
    ["Médico", c.medico],
    ["Paciente", c.paciente],
    ["Centro", c.centro],
    ["Consultorio", c.consultorio],
    ["Modalidad de Atención", c.modalidad.toUpperCase()],
  ];

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Citas Programadas" />

      {/* Pestañas */}
      <View className="flex-row">
        {pestanas.map((op) => (
          <Pressable
            key={op}
            onPress={() => setPestana(op)}
            className={`flex-1 py-3 items-center ${
              pestana === op ? "bg-sky-900" : "bg-gray-200"
            }`}
          >
            <Text className={`text-lg ${pestana === op ? "text-white" : "text-gray-800"}`}>
              {op}es
            </Text>
          </Pressable>
        ))}
      </View>

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-10">
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por especialidad o médico..."
        />

        {visibles.map((c) => (
          <View
            key={c.id}
            className="bg-white rounded-xl shadow mb-4 overflow-hidden border border-sky-200"
          >
            <Text className="bg-sky-700 text-white font-bold text-center p-3">
              TIENES UNA CITA EN {c.especialidad} - {c.servicio}
            </Text>

            <View className="p-3">
              <View className="flex-row justify-between">
                <Text className="text-base">Estado:</Text>
                <Text className="text-base font-bold">{c.estado}</Text>
              </View>
              <View className="flex-row justify-between">
                <Text className="text-base">Fecha:</Text>
                <Text className="text-base">
                  {c.fecha} - {c.hora}
                </Text>
              </View>
              <View className="flex-row justify-between pb-3 border-b border-gray-300">
                <Text className="text-base">Centro:</Text>
                <Text className="text-base font-bold">{c.centro}</Text>
              </View>

              <View className="flex-row mt-3">
                <Pressable
                  onPress={() => setDetalle(c)}
                  className="bg-sky-500 rounded-2xl px-4 py-3 items-center mr-3"
                >
                  <Ionicons name="eye" size={22} color="white" />
                  <Text className="text-white text-xs mt-1">Ver Detalles</Text>
                </Pressable>
                <Pressable
                  onPress={() => cancelar(c)}
                  className="bg-red-500 rounded-2xl px-4 py-3 items-center"
                >
                  <Ionicons name="ban" size={22} color="white" />
                  <Text className="text-white text-xs mt-1">Cancelar Cita</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ))}

        {visibles.length === 0 && (
          <Text className="text-center text-gray-500 mt-8">
            No tienes citas {pestana.toLowerCase()}es
          </Text>
        )}
      </ScrollView>

      {/* Detalles de la cita */}
      <Modal
        visible={detalle !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDetalle(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          {detalle && (
            <View className="bg-white rounded-3xl p-5 w-full">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="flex-1 text-center text-xl font-bold text-sky-800">
                  DETALLES DE LA CITA
                </Text>
                <Pressable onPress={() => setDetalle(null)}>
                  <Ionicons name="close" size={28} color="#111827" />
                </Pressable>
              </View>

              {filasDetalle(detalle).map(([titulo, valor]) => (
                <View
                  key={titulo}
                  className="flex-row justify-between py-2 border-t border-gray-200"
                >
                  <Text className="text-base w-2/5">{titulo}:</Text>
                  <Text className="text-base font-bold flex-1 text-right">{valor}</Text>
                </View>
              ))}

              <Pressable
                onPress={() => setDetalle(null)}
                className="bg-sky-900 rounded-full py-3 px-10 self-center mt-4"
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
