import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import InputField from "../components/InputField";
import ScrollFormulario from "../components/ScrollFormulario";
import Boton from "../components/Boton";
import AvisoInfo from "../components/AvisoInfo";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import { authService, citaFirestoreSyncService } from "../../infrastructure/container";
import { mensajeDeError } from "../../shared/errores";

const formatoCorreo = /\S+@\S+\.\S+/;

export default function LoginScreen() {
  const router = useRouter();
  const [cargando, setCargando] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<"exito" | "error">("exito");
  const { valores, errores, setErrores, cambiar } = useFormulario({
    correo: "",
    password: "",
  });

  const ingresar = async () => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.correo.trim() === "") {
      nuevosErrores.correo = "El correo no puede estar vacío";
    } else if (!formatoCorreo.test(valores.correo)) {
      nuevosErrores.correo = "Escribe un correo válido";
    }
    if (valores.password.trim() === "") {
      nuevosErrores.password = "La contraseña no puede estar vacía";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setCargando(true);
    try {
      await authService.iniciarSesion(valores.correo, valores.password);
      void citaFirestoreSyncService.sincronizarPendientes().catch((error: unknown) => {
        console.error("Las citas siguen pendientes de sincronización.", error);
      });
      setErrores({});
      router.replace("/home");
    } catch (error) {
      setErrores({ password: mensajeDeError(error) });
    } finally {
      setCargando(false);
    }
  };

  const recuperarPassword = async () => {
    if (!formatoCorreo.test(valores.correo)) {
      setErrores({ correo: "Escribe tu correo para recuperar la contraseña" });
      return;
    }

    try {
      await authService.recuperarPassword(valores.correo);
      setTipoMensaje("exito");
      setMensaje("Te enviamos un enlace para restablecer tu contraseña.");
      setMostrarMensaje(true);
    } catch (error) {
      setTipoMensaje("error");
      setMensaje(mensajeDeError(error));
      setMostrarMensaje(true);
    }
  };

  return (
    <ScrollFormulario
      className="flex-1 bg-cyan-50"
      contentContainerClassName="px-6 pt-16 pb-8"
    >
      <Image
        source={require("../../../assets/images/logo-clinic-digital-horizontal.png")}
        className="w-full h-32 mb-6"
        resizeMode="contain"
      />

      <View className="bg-white rounded-2xl p-5 shadow mb-5">
        <Text className="text-3xl font-bold text-center mb-6">Bienvenido(a)</Text>

        <InputField
          icono="mail"
          placeholder="Correo electrónico"
          value={valores.correo}
          onChangeText={(texto) => cambiar("correo", texto)}
          teclado="email-address"
          error={errores.correo}
        />
        <InputField
          icono="lock-closed"
          placeholder="Contraseña"
          value={valores.password}
          onChangeText={(texto) => cambiar("password", texto)}
          esPassword
          error={errores.password}
        />

        <Boton
          titulo={cargando ? "Ingresando..." : "Ingresar"}
          onPress={ingresar}
          deshabilitado={cargando}
        />

        <Pressable onPress={recuperarPassword}>
          <Text className="text-center font-bold text-sky-800 my-4">
            ¿Olvidaste tu contraseña?
          </Text>
        </Pressable>

        <Text className="text-center mb-3">¿Aún no tienes una cuenta Clinic Digital?</Text>
        <Boton
          titulo="Crear cuenta"
          variante="secundario"
          onPress={() => router.push("/register")}
        />
      </View>

      <AvisoInfo texto="Consultas al 000 0000, de lunes a sábado." />
      <AvisoInfo texto="Visítanos en la sede más cercana de tu clínica." />
      <ModalExito
        visible={mostrarMensaje}
        titulo={tipoMensaje === "exito" ? "Revisa tu correo" : "No se pudo enviar"}
        mensaje={mensaje}
        tipo={tipoMensaje}
        onCerrar={() => setMostrarMensaje(false)}
      />
    </ScrollFormulario>
  );
}
