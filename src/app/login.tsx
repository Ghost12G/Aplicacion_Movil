import { useState } from "react";
import { View, Text, Image, ScrollView, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import InputField from "../components/InputField";
import Boton from "../components/boton";
import AvisoInfo from "../components/AvisoInfo";
import { useFormulario } from "../hooks/useFormulario";
import {
  iniciarSesion,
  iniciarSesionRecordada,
  obtenerCuentaRecordada,
  olvidarCuenta,
  recordarCuenta,
} from "../data/almacen";
import { Usuario } from "../types/usuario";

export default function Login() {
  const router = useRouter();
  const [recordar, setRecordar] = useState(false);
  // Si hay una cuenta recordada, se muestra su tarjeta en vez del formulario
  const [cuenta, setCuenta] = useState<Usuario | null>(obtenerCuentaRecordada);
  const { valores, errores, setErrores, cambiar } = useFormulario({
    dni: "",
    password: "",
  });

  const ingresar = () => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.dni.trim() === "") {
      nuevosErrores.dni = "El número de documento no puede estar vacío";
    }
    if (valores.password.trim() === "") {
      nuevosErrores.password = "La contraseña no puede estar vacía";
    }
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    const usuario = iniciarSesion(valores.dni, valores.password);

    if (usuario) {
      if (recordar) {
        recordarCuenta(usuario);
      } else {
        olvidarCuenta();
      }
      setErrores({});
      router.replace("/home");
    } else {
      setErrores({ password: "Documento o contraseña incorrectos" });
    }
  };

  const ingresarConCuenta = () => {
    iniciarSesionRecordada();
    router.replace("/home");
  };

  const quitarCuenta = () => {
    olvidarCuenta();
    setCuenta(null);
  };

  return (
    <ScrollView
      className="flex-1 bg-cyan-50"
      contentContainerClassName="px-6 pt-16 pb-8"
    >
      <Image
        source={require("../../assets/images/logo-clinic-digital-horizontal.png")}
        className="w-full h-32 mb-6"
        resizeMode="contain"
      />

      <View className="bg-white rounded-2xl p-5 shadow mb-5">
        <Text className="text-3xl font-bold text-center mb-6">Bienvenido(a)</Text>

        {cuenta ? (
          <View>
            <View className="flex-row items-center bg-cyan-50 rounded-xl p-4 mb-5 shadow">
              <Ionicons name="person" size={40} color="#0369a1" />
              <View className="flex-1 ml-4">
                <Text className="font-bold text-base">{cuenta.nombre.toUpperCase()}</Text>
                <Text className="text-gray-600">DNI - {cuenta.dni}</Text>
              </View>
              <Pressable onPress={quitarCuenta}>
                <Ionicons name="close-circle" size={32} color="#ef4444" />
              </Pressable>
            </View>

            <Boton titulo="Ingresar" onPress={ingresarConCuenta} />
          </View>
        ) : (
          <View>
            <InputField
              icono="person"
              placeholder="Número de Documento"
              value={valores.dni}
              onChangeText={(texto) => cambiar("dni", texto)}
              teclado="numeric"
              error={errores.dni}
            />
            <InputField
              icono="lock-closed"
              placeholder="Contraseña"
              value={valores.password}
              onChangeText={(texto) => cambiar("password", texto)}
              esPassword
              error={errores.password}
            />

            <Pressable
              onPress={() => setRecordar(!recordar)}
              className="flex-row items-center mb-4"
            >
              <Ionicons
                name={recordar ? "checkbox" : "square-outline"}
                size={28}
                color="#0369a1"
              />
              <Text className="ml-2">Recordar Cuenta</Text>
            </Pressable>

            <Boton titulo="Ingresar" onPress={ingresar} />
          </View>
        )}

        <Pressable
          onPress={() =>
            Alert.alert("Recuperar contraseña", "Esta función estará disponible pronto")
          }
        >
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
    </ScrollView>
  );
}
