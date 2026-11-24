import { useState } from "react";
import { View, Modal, Pressable } from "react-native";
import Text from "../components/ThemedText";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import RadioGrupo from "../components/RadioGrupo";
import Boton from "../components/Boton";
import ScrollFormulario from "../components/ScrollFormulario";
import { useFormulario } from "../hooks/useFormulario";
import { riesgoDiabetesService } from "../../infrastructure/container";
import { formatearFechaHora } from "../../shared/fechas";
import {
  AntecedenteFamiliar,
  DatosRiesgo,
  NivelRiesgo,
  ResultadoRiesgo,
  Sexo,
} from "../../domain/entities/RiesgoDiabetes";

const FAMILIAR_LEJANO = "Sí: Abuelos, Tíos, Primo Hermano";
const FAMILIAR_DIRECTO = "Sí: Padres, Hermanos, Hijos";

const preguntas = [
  { campo: "actividad", texto: "¿Realiza al menos 30 minutos de actividad física al día?", opciones: ["Sí", "No"], horizontal: true },
  { campo: "frutas", texto: "¿Con qué frecuencia come verduras o frutas?", opciones: ["Todos los días", "No todos los días"], horizontal: false },
  { campo: "presion", texto: "¿Toma medicación para la presión alta o padece de Hipertensión Arterial?", opciones: ["No", "Sí"], horizontal: true },
  { campo: "glucosa", texto: "¿Le han encontrado alguna vez valores de glucosa altos?", opciones: ["No", "Sí"], horizontal: true },
  { campo: "familia", texto: "¿Se le ha diagnosticado diabetes (tipo 1 o tipo 2) a algún familiar?", opciones: ["No", FAMILIAR_LEJANO, FAMILIAR_DIRECTO], horizontal: false },
];

// Colores e ícono del resultado según el nivel de riesgo
const estilos: Record<
  NivelRiesgo,
  { fondo: string; icono: keyof typeof Ionicons.glyphMap; colorIcono: string }
> = {
  bajo: { fondo: "bg-green-600", icono: "checkmark-circle", colorIcono: "#16a34a" },
  moderado: { fondo: "bg-orange-500", icono: "alert-circle", colorIcono: "#f97316" },
  alto: { fondo: "bg-red-600", icono: "warning", colorIcono: "#dc2626" },
};

const numero = (texto: string) => parseFloat(texto.replace(",", "."));

export default function DiabetesScreen() {
  const router = useRouter();
  const [resultado, setResultado] = useState<{ datos: ResultadoRiesgo; fecha: Date } | null>(null);

  const { valores, errores, setErrores, cambiar } = useFormulario({
    edad: "",
    sexo: "Hombre",
    peso: "",
    talla: "",
    cintura: "",
    actividad: "Sí",
    frutas: "Todos los días",
    presion: "No",
    glucosa: "No",
    familia: "No",
  });

  const edad = numero(valores.edad);
  const peso = numero(valores.peso);
  const talla = numero(valores.talla);
  const cintura = numero(valores.cintura);
  const imc = riesgoDiabetesService.calcularImc(peso, talla);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (!(edad >= 10 && edad <= 120)) nuevosErrores.edad = "Escribe una edad válida (entre 10 y 120 años)";
    if (!(peso >= 20 && peso <= 300)) nuevosErrores.peso = "Escribe un peso válido (entre 20 y 300 kg)";
    if (!(talla >= 100 && talla <= 250)) nuevosErrores.talla = "Escribe una talla válida (entre 100 y 250 cm)";
    if (!(cintura >= 40 && cintura <= 200)) nuevosErrores.cintura = "Escribe una medida válida (entre 40 y 200 cm)";

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const evaluar = () => {
    if (!validar()) return;

    let familiar: AntecedenteFamiliar = "ninguno";
    if (valores.familia === FAMILIAR_LEJANO) familiar = "lejano";
    if (valores.familia === FAMILIAR_DIRECTO) familiar = "directo";

    const datos: DatosRiesgo = {
      edad,
      sexo: valores.sexo as Sexo,
      pesoKg: peso,
      tallaCm: talla,
      cinturaCm: cintura,
      actividadFisica: valores.actividad === "Sí",
      frutasVerduras: valores.frutas === "Todos los días",
      medicacionPresion: valores.presion === "Sí",
      glucosaAlta: valores.glucosa === "Sí",
      familiar,
    };

    setResultado({ datos: riesgoDiabetesService.evaluar(datos), fecha: new Date() });
  };

  return (
    <View className="flex-1 bg-white dark:bg-slate-950">
      <Cabecera titulo="Riesgo Diabetes Tipo 2" />

      <ScrollFormulario className="px-4 pt-4" contentContainerClassName="pb-10">
        <Text className="text-3xl font-bold text-sky-700 text-center mb-4">Test Diabetes T2</Text>

        <InputField
          icono="person"
          placeholder="¿Cuál es su edad (años)?"
          value={valores.edad}
          onChangeText={(texto) => cambiar("edad", texto)}
          teclado="numeric"
          error={errores.edad}
        />

        <RadioGrupo
          pregunta="Sexo"
          opciones={["Hombre", "Mujer"]}
          valor={valores.sexo}
          onCambiar={(opcion) => cambiar("sexo", opcion)}
          horizontal
        />

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
            Su índice de masa corporal es: <Text className="font-bold">{imc.toFixed(2)} kg/m²</Text>
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
      </ScrollFormulario>

      {/* Resultado */}
      <Modal
        visible={resultado !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setResultado(null)}
      >
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          {resultado && (
            <View className="bg-white dark:bg-slate-900 rounded-3xl w-full overflow-hidden">
              <View className={`${estilos[resultado.datos.nivel].fondo} items-center px-5 py-6`}>
                <View className="bg-white dark:bg-slate-800 rounded-full p-3 mb-3">
                  <Ionicons
                    name={estilos[resultado.datos.nivel].icono}
                    size={44}
                    color={estilos[resultado.datos.nivel].colorIcono}
                  />
                </View>
                <Text className="text-white text-2xl font-bold text-center">
                  {resultado.datos.titulo}
                </Text>
                <Text className="text-white text-center text-base mt-1">
                  {resultado.datos.frase}
                </Text>
              </View>

              <View className="px-5 py-5 items-center">
                <Text className="text-lg font-bold">Puntaje: {resultado.datos.puntaje} de 26</Text>
                <Text className="text-center text-base mt-3">{resultado.datos.consejo}</Text>

                <Text className="mt-4 text-base">Fecha de Evaluación:</Text>
                <Text className="font-bold text-base">{formatearFechaHora(resultado.fecha)}</Text>

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
