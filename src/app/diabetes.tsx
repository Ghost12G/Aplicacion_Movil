import { useState } from "react";
import { View, Text, ScrollView, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import RadioGrupo from "../components/RadioGrupo";
import Boton from "../components/boton";
import { useFormulario } from "../hooks/useFormulario";
import { formatearFechaHora } from "../utils/fechas";

const preguntas = [
  {
    campo: "actividad",
    texto: "¿Realiza al menos 30 minutos de actividad física?",
    opciones: ["Sí", "No"],
    horizontal: false,
  },
  {
    campo: "frutas",
    texto: "¿Con qué frecuencia come verduras o frutas?",
    opciones: ["Todos los días", "No todos los días"],
    horizontal: false,
  },
  {
    campo: "presion",
    texto: "¿Toma medicación para la presión alta o padece de Hipertensión Arterial?",
    opciones: ["No", "Sí"],
    horizontal: false,
  },
  {
    campo: "glucosa",
    texto: "¿Le han encontrado alguna vez valores de glucosa altos?",
    opciones: ["No", "Sí"],
    horizontal: false,
  },
  {
    campo: "familia",
    texto: "¿Se le ha diagnosticado diabetes (tipo 1 o tipo 2) a algún familiar?",
    opciones: ["No", "Sí: Abuelos, Tíos, Primo Hermano", "Sí: Padres, Hermanos, Hijos"],
    horizontal: false,
  },
];

// Niveles de riesgo según el puntaje (escala simplificada, solo referencial)
const niveles = [
  {
    hasta: 6,
    nombre: "RIESGO BAJO",
    frase: "Una de cada 100 personas puede desarrollar Diabetes tipo 2",
    consejo:
      "Mantener hábitos de vida saludable. Realizar actividad física y alimentación saludable, mantener el peso y el perímetro abdominal en valores adecuados.",
    fondo: "bg-green-600",
  },
  {
    hasta: 11,
    nombre: "RIESGO LIGERAMENTE ELEVADO",
    frase: "Una de cada 25 personas puede desarrollar Diabetes tipo 2",
    consejo:
      "Procura aumentar tu actividad física, cuidar tu alimentación y controlar tu peso. Consulta con tu médico para un chequeo preventivo.",
    fondo: "bg-yellow-500",
  },
  {
    hasta: 14,
    nombre: "RIESGO MODERADO",
    frase: "Una de cada 6 personas puede desarrollar Diabetes tipo 2",
    consejo:
      "Se recomienda acudir a una evaluación médica y realizar un control de glucosa. Mejora tu alimentación y mantén actividad física regular.",
    fondo: "bg-orange-500",
  },
  {
    hasta: 20,
    nombre: "RIESGO ALTO",
    frase: "Una de cada 3 personas puede desarrollar Diabetes tipo 2",
    consejo:
      "Acude pronto a una evaluación médica para un control de glucosa y una orientación personalizada.",
    fondo: "bg-red-600",
  },
  {
    hasta: 99,
    nombre: "RIESGO MUY ALTO",
    frase: "Una de cada 2 personas puede desarrollar Diabetes tipo 2",
    consejo:
      "Acude lo antes posible a una evaluación médica para un control de glucosa y una orientación personalizada.",
    fondo: "bg-red-800",
  },
];

function calcularPuntaje(imc: number, cintura: number, r: Record<string, string>): number {
  let puntos = 0;

  if (imc >= 30) puntos += 3;
  else if (imc >= 25) puntos += 1;

  if (cintura >= 102) puntos += 4;
  else if (cintura >= 94) puntos += 3;

  if (r.actividad === "No") puntos += 2;
  if (r.frutas === "No todos los días") puntos += 1;
  if (r.presion === "Sí") puntos += 2;
  if (r.glucosa === "Sí") puntos += 5;
  if (r.familia.startsWith("Sí: Abuelos")) puntos += 3;
  if (r.familia.startsWith("Sí: Padres")) puntos += 5;

  return puntos;
}

export default function Diabetes() {
  const router = useRouter();
  const [resultado, setResultado] = useState<{
    nivel: (typeof niveles)[number];
    fecha: Date;
  } | null>(null);

  const { valores, errores, setErrores, cambiar } = useFormulario({
    peso: "",
    talla: "",
    cintura: "",
    actividad: "Sí",
    frutas: "Todos los días",
    presion: "No",
    glucosa: "No",
    familia: "No",
  });

  const peso = parseFloat(valores.peso.replace(",", "."));
  const talla = parseFloat(valores.talla.replace(",", "."));
  const cintura = parseFloat(valores.cintura.replace(",", "."));
  const imc = peso > 0 && talla > 0 ? peso / ((talla / 100) * (talla / 100)) : 0;

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!(peso >= 20 && peso <= 300)) {
      nuevosErrores.peso = "Escribe un peso válido (entre 20 y 300 kg)";
    }
    if (!(talla >= 100 && talla <= 250)) {
      nuevosErrores.talla = "Escribe una talla válida (entre 100 y 250 cm)";
    }
    if (!(cintura >= 40 && cintura <= 200)) {
      nuevosErrores.cintura = "Escribe una medida válida (entre 40 y 200 cm)";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const evaluar = () => {
    if (!validar()) return;

    const puntaje = calcularPuntaje(imc, cintura, valores);
    const nivel = niveles.find((n) => puntaje <= n.hasta) ?? niveles[niveles.length - 1];
    setResultado({ nivel, fecha: new Date() });
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Riesgo Diabetes Tipo 2" />

      <ScrollView className="px-4 pt-4" contentContainerClassName="pb-10">
        <Text className="text-3xl font-bold text-sky-700 text-center mb-4">
          Test Diabetes T2
        </Text>

        <InputField
          icono="barbell"
          placeholder="¿Cuál es su peso (kg)?"
          value={valores.peso}
          onChangeText={(texto) => cambiar("peso", texto)}
          teclado="numeric"
          error={errores.peso}
        />
        <InputField
          icono="resize"
          placeholder="¿Cuál es su talla (cm)?"
          value={valores.talla}
          onChangeText={(texto) => cambiar("talla", texto)}
          teclado="numeric"
          error={errores.talla}
        />

        {imc > 0 && (
          <Text className="text-sky-700 text-lg mb-4">
            Su índice de masa corporal es:{" "}
            <Text className="font-bold">{imc.toFixed(2)} kg/m²</Text>
          </Text>
        )}

        <InputField
          icono="body"
          placeholder="¿Cuánto mide su cintura (cm)?"
          value={valores.cintura}
          onChangeText={(texto) => cambiar("cintura", texto)}
          teclado="numeric"
          error={errores.cintura}
        />

        {preguntas.map((p) => (
          <RadioGrupo
            key={p.campo}
            pregunta={p.texto}
            opciones={p.opciones}
            valor={valores[p.campo]}
            onCambiar={(opcion) => cambiar(p.campo, opcion)}
            horizontal={p.horizontal}
          />
        ))}

        <View className="flex-row mt-2">
          <View className="flex-1 mr-2">
            <Boton titulo="Evaluar" onPress={evaluar} />
          </View>
          <View className="flex-1 ml-2">
            <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>

      {/* Resultado */}
      <Modal
        visible={resultado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResultado(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          {resultado && (
            <View className="bg-white rounded-3xl w-full overflow-hidden">
              <View className={`${resultado.nivel.fondo} items-center px-5 py-6`}>
                <View className="bg-white rounded-full p-3 mb-3">
                  <Ionicons name="warning" size={44} color="#f59e0b" />
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                  {resultado.nivel.nombre}
                </Text>
                <Text className="text-white text-center text-lg mt-1">
                  {resultado.nivel.frase}
                </Text>
              </View>

              <View className="px-5 py-5 items-center">
                <Text className="text-center text-base">{resultado.nivel.consejo}</Text>

                <Text className="mt-4 text-base">Fecha de Evaluación:</Text>
                <Text className="font-bold text-base">
                  {formatearFechaHora(resultado.fecha)}
                </Text>

                <Text className="text-gray-500 text-xs text-center mt-3">
                  Este test es referencial y no reemplaza una consulta médica.
                </Text>

                <Pressable
                  onPress={() => setResultado(null)}
                  className="bg-gray-600 rounded-full py-3 px-12 mt-4"
                >
                  <Text className="text-white text-lg font-bold">Aceptar</Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
