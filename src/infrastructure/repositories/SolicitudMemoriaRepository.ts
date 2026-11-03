import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";

export class SolicitudMemoriaRepository implements SolicitudRepository {
  private solicitudes: Solicitud[] = [];

  agregar(solicitud: Solicitud): void {
    this.solicitudes.push(solicitud);
  }

  listar(): Solicitud[] {
    return [...this.solicitudes];
  }

  obtener(id: string): Solicitud | undefined {
    return this.solicitudes.find((s) => s.id === id);
  }

  actualizar(id: string, datos: DatosSolicitud): void {
    this.solicitudes = this.solicitudes.map((s) =>
      s.id === id ? { ...s, ...datos } : s
    );
  }

  eliminar(id: string): void {
    this.solicitudes = this.solicitudes.filter((s) => s.id !== id);
  }
}
