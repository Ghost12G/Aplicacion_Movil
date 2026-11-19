import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";
import { formatearFecha } from "../../shared/fechas";

// CRUD de solicitudes: cada paciente ve y modifica solo las suyas
export class SolicitudService {
  private solicitudes: SolicitudRepository;
  private sesion: SesionRepository;

  constructor(solicitudes: SolicitudRepository, sesion: SesionRepository) {
    this.solicitudes = solicitudes;
    this.sesion = sesion;
  }

  listar(): Solicitud[] {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) return [];
    return this.solicitudes.listar().filter((s) => s.usuarioDni === usuario.dni);
  }

  obtener(id: string): Solicitud | undefined {
    return this.listar().find((s) => s.id === id);
  }

  crear(datos: DatosSolicitud): Solicitud | null {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) return null;

    const solicitud: Solicitud = {
      id: Date.now().toString(),
      fecha: formatearFecha(new Date()),
      usuarioDni: usuario.dni,
      ...datos,
    };
    this.solicitudes.agregar(solicitud);
    return solicitud;
  }

  actualizar(id: string, datos: DatosSolicitud): void {
    if (!this.obtener(id)) return;
    this.solicitudes.actualizar(id, datos);
  }

  eliminar(id: string): void {
    if (!this.obtener(id)) return;
    this.solicitudes.eliminar(id);
  }
}
