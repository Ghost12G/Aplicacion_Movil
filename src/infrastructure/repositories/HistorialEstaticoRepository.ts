import { Atencion, Descanso, Receta } from "../../domain/entities/Historial";
import { HistorialRepository } from "../../domain/repositories/HistorialRepository";
import { atenciones, descansos, recetas } from "../data/historial";

export class HistorialEstaticoRepository implements HistorialRepository {
  obtenerAtenciones(): Atencion[] {
    return atenciones;
  }

  obtenerRecetas(): Receta[] {
    return recetas;
  }

  obtenerDescansos(): Descanso[] {
    return descansos;
  }
}
