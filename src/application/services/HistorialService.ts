import { Atencion, Descanso, Receta } from "../../domain/entities/Historial";
import { HistorialRepository } from "../../domain/repositories/HistorialRepository";

// Consulta de atenciones, recetas y descansos médicos
export class HistorialService {
  private historial: HistorialRepository;

  constructor(historial: HistorialRepository) {
    this.historial = historial;
  }

  atenciones(): Atencion[] {
    return this.historial.obtenerAtenciones();
  }

  recetas(): Receta[] {
    return this.historial.obtenerRecetas();
  }

  descansos(): Descanso[] {
    return this.historial.obtenerDescansos();
  }
}
