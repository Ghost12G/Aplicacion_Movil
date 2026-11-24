import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import InputField from "../components/InputField";
import ScrollFormulario from "../components/ScrollFormulario";
import Boton from "../components/Boton";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import { authService, citaFirestoreSyncService } from "../../infrastructure/container";
import { mensajeDeError } from "../../shared/errores";

type TipoDocumento = "D.N.I." | "C.E.";

const tiposDocumento: TipoDocumento[] = ["D.N.I.", "C.E."];

export default function RegisterScreen() {
  const router = useRouter();
  const [tipoDoc, setTipoDoc] = useState<TipoDocumento>("D.N.I.");
  const [cargando, setCargando] = useState(false);
  const [mostrarMensaje, setMostrarMensaje] = useState(false);
  const [registroCorrecto, setRegistroCorrecto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const { valores, errores, setErrores, cambiar } = useFormulario({
    nombre: "",
    documento: "",
    verificador: "",
    fechaNacimiento: "",
    celular: "",
    correo: "",
    password: "",
    confirmar: "",
  });

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};
    const largoDoc = tipoDoc === "D.N.I." ? 8 : 9;

    if (valores.nombre.trim().length < 3) {
      nuevosErrores.nombre = "Escribe tu nombre completo";
    }

    if (valores.documento.trim() === "") {
      nuevosErrores.documento = "El número de documento es obligatorio";
    } else if (valores.documento.length !== largoDoc) {
      nuevosErrores.documento = `El documento debe tener ${largoDoc} dígitos`;
    }

    if (valores.verificador.trim() === "") {
      nuevosErrores.verificador = "El carácter verificador es obligatorio";
    } else if (valores.verificador.length !== 1) {
      nuevosErrores.verificador = "Debe ser 1 solo dígito";
    }

    if (valores.fechaNacimiento.trim() === "") {
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
    } else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(valores.fechaNacimiento)) {
      nuevosErrores.fechaNacimiento = "Usa el formato DD/MM/AAAA";
    }

    if (valores.celular.trim() === "") {
      nuevosErrores.celular = "El celular es obligatorio";
    } else if (valores.celular.length !== 9) {
      nuevosErrores.celular = "El celular debe tener 9 dígitos";
    }

    if (valores.correo.trim() === "") {
      nuevosErrores.correo = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(valores.correo)) {
      nuevosErrores.correo = "Escribe un correo válido";
    }

    if (valores.password.trim() === "") {
      nuevosErrores.password = "La contraseña es obligatoria";
    } else if (valores.password.length < 6) {
      nuevosErrores.password = "Mínimo 6 caracteres";
    }

    if (valores.confirmar !== valores.password) {
      nuevosErrores.confirmar = "Las contraseñas no coinciden";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const registrar = async () => {
    if (!validar()) return;

    setCargando(true);
    try {
      await authService.registrar({
        nombre: valores.nombre.trim(),
        dni: valores.documento,
        correo: valores.correo.trim(),
        password: valores.password,
        celular: valores.celular,
      });
      void citaFirestoreSyncService.sincronizarPendientes().catch((error: unknown) => {
        console.error("Las citas siguen pendientes de sincronización.", error);
      });
      setRegistroCorrecto(true);
      setMensaje("Tu cuenta fue creada correctamente. Ya puedes empezar a usar Clinic Digital.");
      setMostrarMensaje(true);
    } catch (error) {
      setRegistroCorrecto(false);
      setMensaje(mensajeDeError(error));
      setMostrarMensaje(true);
    } finally {
      setCargando(false);
    }
  };

  const cerrarMensaje = () => {
    setMostrarMensaje(false);
    if (registroCorrecto) router.replace("/home");
  };

  return (
    <ScrollFormulario
      className="flex-1 bg-cyan-50"
      contentContainerClassName="px-6 pt-16 pb-10"
    >
      <View className="bg-white rounded-2xl p-5">
        <Text className="text-3xl font-bold text-center mb-6">Crear cuenta</Text>

        <InputField
          icono="person"
          placeholder="Nombre completo"
          value={valores.nombre}
          onChangeText={(texto) => cambiar("nombre", texto)}
          error={errores.nombre}
        />

        <Text className="text-base mb-2">Tipo de documento</Text>
        <View className="flex-row mb-4">
          {tiposDocumento.map((opcion) => (
            <Pressable
              key={opcion}
              onPress={() => setTipoDoc(opcion)}
              className={`px-4 py-2 rounded-full mr-2 ${
                tipoDoc === opcion ? "bg-sky-600" : "bg-gray-200"
              }`}
            >
              <Text className={tipoDoc === opcion ? "text-white" : "text-gray-700"}>
                {opcion}
              </Text>
            </Pressable>
          ))}
        </View>

        <InputField
          icono="card"
          placeholder="N° Documento de Identidad"
          value={valores.documento}
          onChangeText={(texto) => cambiar("documento", texto)}
          teclado="numeric"
          error={errores.documento}
        />
        <InputField
          icono="id-card"
          placeholder="Carácter verificador"
          value={valores.verificador}
          onChangeText={(texto) => cambiar("verificador", texto)}
          teclado="numeric"
          error={errores.verificador}
        />
        <InputField
          icono="calendar"
          placeholder="Fecha de nacimiento (DD/MM/AAAA)"
          value={valores.fechaNacimiento}
          onChangeText={(texto) => cambiar("fechaNacimiento", texto)}
          error={errores.fechaNacimiento}
        />
        <InputField
          icono="call"
          placeholder="Celular"
          value={valores.celular}
          onChangeText={(texto) => cambiar("celular", texto)}
          teclado="numeric"
          error={errores.celular}
        />
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
          placeholder="Nueva contraseña"
          value={valores.password}
          onChangeText={(texto) => cambiar("password", texto)}
          esPassword
          error={errores.password}
        />
        <InputField
          icono="lock-closed"
          placeholder="Confirmar contraseña"
          value={valores.confirmar}
          onChangeText={(texto) => cambiar("confirmar", texto)}
          esPassword
          error={errores.confirmar}
        />

        <Boton
          titulo={cargando ? "Creando cuenta..." : "Registrarme"}
          onPress={registrar}
          deshabilitado={cargando}
        />
        <View className="h-3" />
        <Boton
          titulo="Volver"
          variante="gris"
          onPress={() => router.back()}
        />
      </View>

      <ModalExito
        visible={mostrarMensaje}
        titulo={registroCorrecto ? "¡Bienvenido(a)!" : "No se pudo crear la cuenta"}
        mensaje={mensaje}
        tipo={registroCorrecto ? "exito" : "error"}
        onCerrar={cerrarMensaje}
      />
    </ScrollFormulario>
  );
}
