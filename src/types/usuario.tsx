export interface Usuario {
  dni: string;
  password: string;
  nombre: string;
}

export type TipoDocumento = "D.N.I." | "C.E.";

export type TipoSolicitud = "Consulta" | "Reclamo" | "Sugerencia";

export interface Solicitud {
  nombre: string;
  telefono: string;
  tipo: TipoSolicitud | "";
  descripcion: string;
}