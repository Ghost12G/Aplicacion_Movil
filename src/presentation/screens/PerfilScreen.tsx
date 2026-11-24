import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import ScrollFormulario from "../components/ScrollFormulario";
import Boton from "../components/Boton";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import { authService, perfilService } from "../../infrastructure/container";
import { mensajeDeError } from "../../shared/errores";

const operadores = ["Claro", "Movistar", "Entel", "Bitel"];

export default function PerfilScreen() {
  const router = useRouter();
  const usuario = authService.obtenerUsuarioActual();

  const [operador, setOperador] = useState(usuario ? usuario.operador : "Claro");
  const [guardado, setGuardado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const { valores, errores, setErrores, cambiar } = useFormulario({
    celular: usuario ? usuario.celular : "",
  });

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.celular.trim() === "") {
      nuevosErrores.celular = "El celular es obligatorio";
    } else if (valores.celular.length !== 9) {
      nuevosErrores.celular = "El celular debe tener 9 dígitos";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = async () => {
    if (!usuario || !validar()) return;

    setErrorGuardar("");
    try {
      await perfilService.actualizarContacto({
        operador,
        celular: valores.celular,
      });
      setGuardado(true);
    } catch (error) {
      setErrorGuardar(mensajeDeError(error));
    }
  };

  const cerrarModal = () => {
    setGuardado(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo="Mi Perfil" />

      <ScrollFormulario className="px-4 pt-5" contentContainerClassName="pb-10">
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
        <View className="flex-row items-center bg-gray-100 px-3 py-3 mb-4">
          <Ionicons name="mail" size={22} color="#9ca3af" />
          <Text className="ml-3 text-base text-gray-500">{usuario ? usuario.correo : ""}</Text>
        </View>

        <View className="flex-row mt-2">
          <View className="flex-1 mr-2">
            <Boton titulo="Guardar" onPress={guardar} />
          </View>
          <View className="flex-1 ml-2">
            <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
          </View>
        </View>
      </ScrollFormulario>

      <ModalExito
        visible={guardado}
        titulo="Mi Perfil"
        mensaje="Tus datos de contacto se guardaron correctamente"
        onCerrar={cerrarModal}
      />
      <ModalExito
        visible={errorGuardar !== ""}
        titulo="No se pudo guardar"
        mensaje={errorGuardar}
        tipo="error"
        onCerrar={() => setErrorGuardar("")}
      />
    </View>
  );
}
