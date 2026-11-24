import { DatosSolicitud, Solicitud } from "../entities/Solicitud";

export interface SolicitudRepository {
  agregar(usuarioUid: string, solicitud: Solicitud): Promise<void>;
  listar(usuarioUid: string): Promise<Solicitud[]>;
  obtener(usuarioUid: string, id: string): Promise<Solicitud | undefined>;
  actualizar(usuarioUid: string, id: string, datos: DatosSolicitud): Promise<void>;
  eliminar(usuarioUid: string, id: string): Promise<void>;
}
