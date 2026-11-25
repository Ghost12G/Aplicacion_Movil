export type TipoSolicitud = "Consulta" | "Reclamo" | "Sugerencia";

export interface DatosSolicitud {
  nombre: string;
  telefono: string;
  tipo: TipoSolicitud | "";
  descripcion: string;
}

export interface Solicitud extends DatosSolicitud {
  id: string;
  fecha: string;
  usuarioDni: string;
  usuarioUid: string;
}
