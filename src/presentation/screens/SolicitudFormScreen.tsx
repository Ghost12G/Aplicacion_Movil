import { useEffect, useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import Cabecera from "../components/Cabecera";
import InputField from "../components/InputField";
import ScrollFormulario from "../components/ScrollFormulario";
import Boton from "../components/Boton";
import ModalExito from "../components/ModalExito";
import { useFormulario } from "../hooks/useFormulario";
import { solicitudService } from "../../infrastructure/container";
import { Solicitud, TipoSolicitud } from "../../domain/entities/Solicitud";
import { mensajeDeError } from "../../shared/errores";

const tipos: TipoSolicitud[] = ["Consulta", "Reclamo", "Sugerencia"];

export default function SolicitudFormScreen() {
  const router = useRouter();
  const parametros = useLocalSearchParams<{ id?: string }>();
  const id = Array.isArray(parametros.id) ? parametros.id[0] : parametros.id;

  const [existente, setExistente] = useState<Solicitud | null>(null);
  const contacto = solicitudService.obtenerDatosContacto();
  const contactoPrecargado =
    !id && Boolean(contacto.nombre.trim() && contacto.telefono.trim());
  const [cargandoSolicitud, setCargandoSolicitud] = useState(Boolean(id));
  const [guardando, setGuardando] = useState(false);
  const [mensajeModal, setMensajeModal] = useState("");
  const [tipoModal, setTipoModal] = useState<"exito" | "error">("exito");
  const [guardado, setGuardado] = useState(false);
  const {
    valores,
    errores,
    setErrores,
    cambiar,
    establecerValores,
  } = useFormulario({
    nombre: contacto.nombre,
    telefono: contacto.telefono,
    tipo: "",
    descripcion: "",
  });

  useEffect(() => {
    if (!id) return;

    let activo = true;
    void solicitudService
      .obtener(id)
      .then((solicitud) => {
        if (!activo) return;
        if (!solicitud) {
          throw new Error("No se encontró la solicitud que quieres editar.");
        }
        setExistente(solicitud);
        establecerValores({
          nombre: solicitud.nombre,
          telefono: solicitud.telefono,
          tipo: solicitud.tipo,
          descripcion: solicitud.descripcion,
        });
      })
      .catch((error: unknown) => {
        if (!activo) return;
        setTipoModal("error");
        setMensajeModal(mensajeDeError(error));
        setGuardado(true);
      })
      .finally(() => {
        if (activo) setCargandoSolicitud(false);
      });

    return () => {
      activo = false;
    };
  }, [id, establecerValores]);

  const validar = (): boolean => {
    const nuevosErrores: Record<string, string> = {};

    if (valores.nombre.trim() === "") {
      nuevosErrores.nombre = "El nombre es obligatorio";
    }
    if (valores.telefono.trim() === "") {
      nuevosErrores.telefono = "El teléfono es obligatorio";
    } else if (valores.telefono.length !== 9) {
      nuevosErrores.telefono = "El teléfono debe tener 9 dígitos";
    }
    if (valores.tipo === "") {
      nuevosErrores.tipo = "Elige un tipo de solicitud";
    }
    if (valores.descripcion.trim() === "") {
      nuevosErrores.descripcion = "La descripción es obligatoria";
    } else if (valores.descripcion.trim().length < 10) {
      nuevosErrores.descripcion = "Escribe al menos 10 caracteres";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;

    setGuardado(false);
    setGuardando(true);
    const datos = {
      nombre: valores.nombre.trim(),
      telefono: valores.telefono,
      tipo: valores.tipo as TipoSolicitud,
      descripcion: valores.descripcion.trim(),
    };

    try {
      if (existente) {
        await solicitudService.actualizar(existente.id, datos);
      } else {
        await solicitudService.crear(datos);
      }
      setTipoModal("exito");
      setMensajeModal(
        existente
          ? "Los cambios se guardaron correctamente."
          : "Tu solicitud se guardó en tu cuenta y podrás consultarla desde tus otros dispositivos."
      );
      setGuardado(true);
    } catch (error) {
      setTipoModal("error");
      setMensajeModal(mensajeDeError(error));
      setGuardado(true);
    } finally {
      setGuardando(false);
    }
  };

  const cerrarModal = () => {
    setGuardado(false);
    if (tipoModal === "exito") router.back();
  };

  return (
    <View className="flex-1 bg-white">
      <Cabecera titulo={id ? "Editar solicitud" : "Nueva solicitud"} />

      <ScrollFormulario className="px-4 pt-6" contentContainerClassName="pb-10">
        {cargandoSolicitud && (
          <Text className="mb-4 text-center text-sky-800">
            Cargando solicitud...
          </Text>
        )}
        {contactoPrecargado && (
          <Text className="text-sm text-gray-600 mb-3">
            El nombre y teléfono se cargaron desde tu perfil.
          </Text>
        )}
        <InputField
          icono="person"
          placeholder="Nombre del cliente"
          value={valores.nombre}
          onChangeText={(texto) => cambiar("nombre", texto)}
          error={errores.nombre}
          editable={Boolean(existente) || !contactoPrecargado}
        />
        <InputField
          icono="call"
          placeholder="Teléfono"
          value={valores.telefono}
          onChangeText={(texto) => cambiar("telefono", texto)}
          teclado="numeric"
          error={errores.telefono}
          editable={Boolean(existente) || !contactoPrecargado}
        />

        <Text className="text-base mb-2">Tipo de solicitud</Text>
        <View className="flex-row mb-1">
          {tipos.map((opcion) => (
            <Pressable
              key={opcion}
              onPress={() => cambiar("tipo", opcion)}
              className={`px-4 py-2 rounded-full mr-2 ${
                valores.tipo === opcion ? "bg-sky-600" : "bg-gray-200"
              }`}
            >
              <Text
                className={valores.tipo === opcion ? "text-white" : "text-gray-700"}
              >
                {opcion}
              </Text>
            </Pressable>
          ))}
        </View>
        {errores.tipo ? (
          <Text className="text-red-600 text-sm mb-3">{errores.tipo}</Text>
        ) : (
          <View className="mb-4" />
        )}

        <InputField
          icono="create"
          placeholder="Descripción"
          value={valores.descripcion}
          onChangeText={(texto) => cambiar("descripcion", texto)}
          multilinea
          error={errores.descripcion}
        />

        <Boton
          titulo={
            guardando
              ? "Guardando..."
              : id
                ? "Guardar cambios"
                : "Enviar solicitud"
          }
          onPress={guardar}
          deshabilitado={guardando || cargandoSolicitud || Boolean(id && !existente)}
        />
        <View className="h-3" />
        <Boton titulo="Cancelar" variante="gris" onPress={() => router.back()} />
      </ScrollFormulario>

      <ModalExito
        visible={guardado}
        titulo="Solicitud"
        mensaje={mensajeModal}
        onCerrar={cerrarModal}
        tipo={tipoModal}
      />
    </View>
  );
}
