import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";

export class SolicitudMemoriaRepository implements SolicitudRepository {
  private solicitudes: Solicitud[] = [];

  async agregar(_usuarioUid: string, solicitud: Solicitud): Promise<void> {
    this.solicitudes.push(solicitud);
  }

  async listar(usuarioUid: string): Promise<Solicitud[]> {
    return this.solicitudes.filter((solicitud) => solicitud.usuarioUid === usuarioUid);
  }

  async obtener(usuarioUid: string, id: string): Promise<Solicitud | undefined> {
    return this.solicitudes.find(
      (solicitud) => solicitud.id === id && solicitud.usuarioUid === usuarioUid
    );
  }

  async actualizar(
    usuarioUid: string,
    id: string,
    datos: DatosSolicitud
  ): Promise<void> {
    this.solicitudes = this.solicitudes.map((s) =>
      s.id === id && s.usuarioUid === usuarioUid ? { ...s, ...datos } : s
    );
  }

  async eliminar(usuarioUid: string, id: string): Promise<void> {
    this.solicitudes = this.solicitudes.filter(
      (solicitud) => solicitud.id !== id || solicitud.usuarioUid !== usuarioUid
    );
  }
}
