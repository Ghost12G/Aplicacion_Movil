import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";
import { db } from "../firebase/config";

function esSolicitud(datos: unknown, usuarioUid: string): datos is Solicitud {
  if (typeof datos !== "object" || datos === null) return false;
  const solicitud = datos as Record<string, unknown>;
  return (
    typeof solicitud.id === "string" &&
    typeof solicitud.fecha === "string" &&
    typeof solicitud.usuarioDni === "string" &&
    solicitud.usuarioUid === usuarioUid &&
    typeof solicitud.nombre === "string" &&
    typeof solicitud.telefono === "string" &&
    (solicitud.tipo === "Consulta" ||
      solicitud.tipo === "Reclamo" ||
      solicitud.tipo === "Sugerencia") &&
    typeof solicitud.descripcion === "string"
  );
}

function coleccionSolicitudes(usuarioUid: string) {
  return collection(db, "usuarios", usuarioUid, "solicitudes");
}

export class SolicitudFirestoreRepository implements SolicitudRepository {
  async agregar(usuarioUid: string, solicitud: Solicitud): Promise<void> {
    await setDoc(doc(coleccionSolicitudes(usuarioUid), solicitud.id), solicitud);
  }

  async listar(usuarioUid: string): Promise<Solicitud[]> {
    const resultado = await getDocs(coleccionSolicitudes(usuarioUid));
    return resultado.docs.map((documento) => {
      const datos: unknown = documento.data();
      if (!esSolicitud(datos, usuarioUid) || datos.id !== documento.id) {
        throw new Error(
          `La solicitud ${documento.id} guardada en Firebase tiene datos no válidos.`
        );
      }
      return datos;
    });
  }

  async obtener(usuarioUid: string, id: string): Promise<Solicitud | undefined> {
    const resultado = await getDoc(doc(coleccionSolicitudes(usuarioUid), id));
    if (!resultado.exists()) return undefined;

    const datos: unknown = resultado.data();
    if (!esSolicitud(datos, usuarioUid) || datos.id !== resultado.id) {
      throw new Error(`La solicitud ${id} guardada en Firebase tiene datos no válidos.`);
    }
    return datos;
  }

  async actualizar(
    usuarioUid: string,
    id: string,
    datos: DatosSolicitud
  ): Promise<void> {
    await updateDoc(doc(coleccionSolicitudes(usuarioUid), id), {
      ...datos,
      usuarioUid,
    });
  }

  async eliminar(usuarioUid: string, id: string): Promise<void> {
    await deleteDoc(doc(coleccionSolicitudes(usuarioUid), id));
  }
}
