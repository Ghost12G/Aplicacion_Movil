export type TipoSolicitud = "Consulta" | "Reclamo" | "Sugerencia";

// Los datos que se escriben en el formulario
export interface DatosSolicitud {
  nombre: string;
  telefono: string;
  tipo: TipoSolicitud | "";
  descripcion: string;
}

// Una solicitud ya guardada: los datos del formulario + id y fecha
export interface Solicitud extends DatosSolicitud {
  id: string;
  fecha: string;
}
