import { useState } from "react";
import { View, Image, Pressable } from "react-native";
import Text from "../components/ThemedText";
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
  const [mostrarRecuperacion, setMostrarRecuperacion] = useState(false);
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [enviandoRecuperacion, setEnviandoRecuperacion] = useState(false);
  const [errorRecuperacion, setErrorRecuperacion] = useState("");
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
    setErrorRecuperacion("");
    if (!formatoCorreo.test(correoRecuperacion)) {
      setErrorRecuperacion("Escribe un correo válido.");
      return;
    }

    setEnviandoRecuperacion(true);
    try {
      await authService.recuperarPassword(correoRecuperacion);
      setMostrarRecuperacion(false);
      setTipoMensaje("exito");
      setMensaje("Te enviamos un enlace para restablecer tu contraseña.");
      setMostrarMensaje(true);
    } catch (error) {
      setErrorRecuperacion(mensajeDeError(error));
    } finally {
      setEnviandoRecuperacion(false);
    }
  };

  const abrirRecuperacion = () => {
    setCorreoRecuperacion(valores.correo);
    setErrorRecuperacion("");
    setMostrarRecuperacion(true);
  };

  return (
    <ScrollFormulario
      className="flex-1 bg-cyan-50 dark:bg-slate-950"
      contentContainerClassName="flex-grow justify-center px-6 py-8"
      ajustarConTeclado={!mostrarRecuperacion}
    >
      <Image
        source={require("../../../assets/images/logo-clinic-digital-horizontal.png")}
        className="w-full h-32 mb-6"
        resizeMode="contain"
      />

      <View className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow mb-5">
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

        <Pressable onPress={abrirRecuperacion}>
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

      <AvisoInfo texto="Consultas al 0800 5045, de lunes a domingo." />
      <AvisoInfo texto="Visítanos en la sede más cercana de tu clínica." />
      <ModalExito
        visible={mostrarMensaje}
        titulo={tipoMensaje === "exito" ? "Revisa tu correo" : "No se pudo enviar"}
        mensaje={mensaje}
        tipo={tipoMensaje}
        onCerrar={() => setMostrarMensaje(false)}
      />
      <ModalExito
        visible={mostrarRecuperacion}
        titulo="Recuperar contraseña"
        mensaje="Ingresa tu correo electrónico para enviarte el enlace de restablecimiento."
        tipo="informacion"
        textoAccion={enviandoRecuperacion ? "Enviando..." : "Enviar enlace"}
        textoSecundario="Cancelar"
        onCerrar={() => {
          if (!enviandoRecuperacion) setMostrarRecuperacion(false);
        }}
        onAccion={enviandoRecuperacion ? undefined : recuperarPassword}
        contenidoExtra={
          <InputField
            icono="mail"
            placeholder="Correo electrónico"
            value={correoRecuperacion}
            onChangeText={setCorreoRecuperacion}
            teclado="email-address"
            error={errorRecuperacion}
          />
        }
      />
    </ScrollFormulario>
  );
}
