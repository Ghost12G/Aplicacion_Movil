import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";
import { formatearFecha } from "../../shared/fechas";

// CRUD de solicitudes: crear, listar, editar y eliminar
export class SolicitudService {
  private solicitudes: SolicitudRepository;

  constructor(solicitudes: SolicitudRepository) {
    this.solicitudes = solicitudes;
  }

  listar(): Solicitud[] {
    return this.solicitudes.listar();
  }

  obtener(id: string): Solicitud | undefined {
    return this.solicitudes.obtener(id);
  }

  crear(datos: DatosSolicitud): Solicitud {
    const solicitud: Solicitud = {
      id: Date.now().toString(),
      fecha: formatearFecha(new Date()),
      ...datos,
    };
    this.solicitudes.agregar(solicitud);
    return solicitud;
  }

  actualizar(id: string, datos: DatosSolicitud): void {
    this.solicitudes.actualizar(id, datos);
  }

  eliminar(id: string): void {
    this.solicitudes.eliminar(id);
  }
}
