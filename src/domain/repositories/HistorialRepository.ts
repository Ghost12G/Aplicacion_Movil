import { Atencion, Descanso, Receta } from "../entities/Historial";

export interface HistorialRepository {
  obtenerAtenciones(): Atencion[];
  obtenerRecetas(): Receta[];
  obtenerDescansos(): Descanso[];
}
