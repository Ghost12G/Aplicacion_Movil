import { DatosSolicitud, Solicitud } from "../entities/Solicitud";

export interface SolicitudRepository {
  agregar(solicitud: Solicitud): void;
  listar(): Solicitud[];
  obtener(id: string): Solicitud | undefined;
  actualizar(id: string, datos: DatosSolicitud): void;
  eliminar(id: string): void;
}
