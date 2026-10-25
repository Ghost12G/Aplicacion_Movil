import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { esDiaAgotado, formatearFecha } from "../utils/fechas";

interface Props {
  fechaElegida: string; // formato DD/MM/AAAA
  onElegir: (fecha: string) => void;
}

const DIAS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const ANCHO_CELDA = { width: "14.2857%", height: 52 } as const;

export default function Calendario({ fechaElegida, onElegir }: Props) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const [mesActual, setMesActual] = useState(
    new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );

  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth();

  const cambiarMes = (cantidad: number) => {
    setMesActual(new Date(anio, mes + cantidad, 1));
  };

  // Celdas: primero los huecos vacíos, luego los días del mes
  const celdas: (Date | null)[] = [];
  for (let i = 0; i < mesActual.getDay(); i++) {
    celdas.push(null);
  }
  const diasDelMes = new Date(anio, mes + 1, 0).getDate();
  for (let d = 1; d <= diasDelMes; d++) {
    celdas.push(new Date(anio, mes, d));
  }

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Pressable onPress={() => cambiarMes(-1)} className="bg-sky-900 rounded-lg p-1">
          <Ionicons name="chevron-back" size={22} color="white" />
        </Pressable>
        <Text className="text-xl font-bold text-sky-800">
          {MESES[mes]} de {anio}
        </Text>
        <Pressable onPress={() => cambiarMes(1)} className="bg-sky-900 rounded-lg p-1">
          <Ionicons name="chevron-forward" size={22} color="white" />
        </Pressable>
      </View>

      <View className="flex-row">
        {DIAS.map((dia) => (
          <View key={dia} style={{ width: "14.2857%" }} className="items-center mb-2">
            <Text className="text-gray-600 text-base">{dia}</Text>
          </View>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {celdas.map((dia, i) => {
          if (dia === null) {
            return <View key={`vacio-${i}`} style={ANCHO_CELDA} />;
          }

          const texto = formatearFecha(dia);
          const pasado = dia.getTime() < hoy.getTime();
          const agotado = !pasado && esDiaAgotado(dia);
          const elegido = texto === fechaElegida;

          let estilo = "border-2 border-sky-700";
          let colorTexto = "text-sky-700 font-bold";
          if (pasado) {
            estilo = "";
            colorTexto = "text-gray-300";
          } else if (agotado) {
            estilo = "bg-gray-200";
            colorTexto = "text-gray-600";
          } else if (elegido) {
            estilo = "bg-sky-700";
            colorTexto = "text-white font-bold";
          }

          return (
            <View key={texto} style={ANCHO_CELDA} className="items-center justify-center">
              <Pressable
                disabled={pasado || agotado}
                onPress={() => onElegir(texto)}
                className={`w-11 h-11 rounded-full items-center justify-center ${estilo}`}
              >
                <Text className={`text-base ${colorTexto}`}>{dia.getDate()}</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}
