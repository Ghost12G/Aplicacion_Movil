import { useState } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import Boton from "../components/boton";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import { actualizarContacto, obtenerUsuarioActual } from "../data/almacen";

const operadores = ["Claro", "Movistar", "Entel", "Bitel"];

export default function Perfil() {
  const router = useRouter();
  const usuario = obtenerUsuarioActual();

  const [operador, setOperador] = useState(usuario ? usuario.operador : "Claro");
  const [guardado, setGuardado] = useState(false);
  const { valores, errores, setErrores, cambiar } = useFormulario({
    celular: usuario ? usuario.celular : "",
    telefonoFijo: usuario ? usuario.telefonoFijo : "",
    correo: usuario ? usuario.correo : "",
  });

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.celular.trim() === "") {
      nuevosErrores.celular = "El celular es obligatorio";
    } else if (valores.celular.length !== 9) {
      nuevosErrores.celular = "El celular debe tener 9 dígitos";
    }

    // El teléfono fijo es opcional, pero si lo escribes debe ser válido
    if (valores.telefonoFijo.trim() !== "") {
      if (valores.telefonoFijo.length < 6 || valores.telefonoFijo.length > 9) {
        nuevosErrores.telefonoFijo = "Debe tener entre 6 y 9 dígitos";
      }
    }

    if (valores.correo.trim() === "") {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(valores.correo)) {
      nuevosErrores.correo = "Escribe un correo válido";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = () => {
    if (!usuario || !validar()) return;

    actualizarContacto(usuario.dni, {
      operador,
      celular: valores.celular,
      telefonoFijo: valores.telefonoFijo,
      correo: valores.correo.trim(),
    });
    setGuardado(true);
  };

  const cerrarModal = () => {
    setGuardado(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Mi Perfil" />

      <ScrollView className="px-4 pt-5" contentContainerClassName="pb-10">
        {usuario && (
          <View className="flex-row items-center bg-cyan-50 rounded-xl p-4 mb-5">
            <Ionicons name="person" size={40} color="#0369a1" />
            <View className="flex-1 ml-4">
              <Text className="font-bold text-base">{usuario.nombre.toUpperCase()}</Text>
              <Text className="text-gray-600">DNI - {usuario.dni}</Text>
            </View>
          </View>
        )}

        <Text className="text-2xl font-bold text-sky-700 mb-4">Datos de Contacto</Text>

        <Text className="text-base mb-2">Operador</Text>
        <View className="flex-row flex-wrap mb-3">
          {operadores.map((op) => (
            <Pressable
              key={op}
              onPress={() => setOperador(op)}
              className={`px-4 py-2 rounded-full mr-2 mb-2 ${
                operador === op ? "bg-sky-600" : "bg-gray-200"
              }`}
            >
              <Text className={operador === op ? "text-white" : "text-gray-700"}>{op}</Text>
            </Pressable>
          ))}
        </View>

        <InputField
          icono="phone-portrait"
          placeholder="Celular"
          value={valores.celular}
          onChangeText={(texto) => cambiar("celular", texto)}
          teclado="numeric"
          error={errores.celular}
        />
        <InputField
          icono="call"
          placeholder="Teléfono Fijo"
          value={valores.telefonoFijo}
          onChangeText={(texto) => cambiar("telefonoFijo", texto)}
          teclado="numeric"
          error={errores.telefonoFijo}
        />
        <InputField
          icono="mail"
          placeholder="Correo"
          value={valores.correo}
          onChangeText={(texto) => cambiar("correo", texto)}
          teclado="email-address"
          error={errores.correo}
        />

        <View className="flex-row mt-2">
          <View className="flex-1 mr-2">
            <Boton titulo="Guardar" onPress={guardar} />
          </View>
          <View className="flex-1 ml-2">
            <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>

      <ModalExito
        visible={guardado}
        titulo="Mi Perfil"
        mensaje="Tus datos de contacto se guardaron correctamente"
        onCerrar={cerrarModal}
      />
    </View>
  );
}
