import { DatosSolicitud, Solicitud } from "../../domain/entities/Solicitud";
import { SolicitudRepository } from "../../domain/repositories/SolicitudRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";
import { formatearFecha } from "../../shared/fechas";

export class SolicitudService {
  private solicitudes: SolicitudRepository;
  private sesion: SesionRepository;

  constructor(solicitudes: SolicitudRepository, sesion: SesionRepository) {
    this.solicitudes = solicitudes;
    this.sesion = sesion;
  }

  async listar(): Promise<Solicitud[]> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para consultar tus solicitudes.");
    return this.solicitudes.listar(usuario.uid);
  }

  async obtener(id: string): Promise<Solicitud | undefined> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para consultar esta solicitud.");
    return this.solicitudes.obtener(usuario.uid, id);
  }

  obtenerDatosContacto(): { nombre: string; telefono: string } {
    const usuario = this.sesion.obtenerUsuario();
    return {
      nombre: usuario?.nombre ?? "",
      telefono: usuario?.celular ?? "",
    };
  }

  async crear(datos: DatosSolicitud): Promise<Solicitud> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para enviar una solicitud.");

    const solicitud: Solicitud = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`,
      fecha: formatearFecha(new Date()),
      usuarioDni: usuario.dni,
      usuarioUid: usuario.uid,
      ...datos,
    };
    await this.solicitudes.agregar(usuario.uid, solicitud);
    return solicitud;
  }

  async actualizar(id: string, datos: DatosSolicitud): Promise<void> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para actualizar esta solicitud.");
    await this.solicitudes.actualizar(usuario.uid, id, datos);
  }

  async eliminar(id: string): Promise<void> {
    const usuario = this.sesion.obtenerUsuario();
    if (!usuario) throw new Error("Debes iniciar sesión para eliminar esta solicitud.");
    await this.solicitudes.eliminar(usuario.uid, id);
  }
}
