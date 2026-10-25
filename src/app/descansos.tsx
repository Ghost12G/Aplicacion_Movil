import { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import Cabecera from "../components/Cabecera";
import Buscador from "../components/Buscador";
import TarjetaHistorial from "../components/TarjetaHistorial";
import { descansos } from "../data/historial";
import { formatearFecha } from "../utils/fechas";

export default function Descansos() {
  const [busqueda, setBusqueda] = useState("");

  const visibles = descansos.filter((d) =>
    `${d.numero} ${d.especialidad} ${d.medico}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  );

  // Último día de descanso = desde + (días - 1)
  const fechaHasta = (desde: Date, dias: number): Date => {
    const hasta = new Date(desde);
    hasta.setDate(hasta.getDate() + dias - 1);
    return hasta;
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Descansos Médicos" />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-10">
        <Buscador
          valor={busqueda}
          onCambiar={setBusqueda}
          placeholder="Buscar por número, especialidad o médico..."
        />

        {visibles.map((d) => (
          <TarjetaHistorial key={d.id} fecha={d.desde}>
            <Text className="font-bold text-base">DESCANSO Nº {d.numero}</Text>
            <Text className="text-sky-700">
              Días: <Text className="text-black font-bold">{d.dias}</Text>
            </Text>
            <Text>
              Del {formatearFecha(d.desde)} al {formatearFecha(fechaHasta(d.desde, d.dias))}
            </Text>
            <Text className="font-bold mt-1">{d.especialidad}</Text>
            <Text>{d.medico}</Text>
          </TarjetaHistorial>
        ))}

        {visibles.length === 0 && (
          <Text className="text-center text-gray-500 mt-8">
            No hay descansos médicos registrados
          </Text>
        )}
      </ScrollView>
    </View>
  );
}
