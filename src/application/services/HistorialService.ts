import { Atencion, Descanso, Receta } from "../../domain/entities/Historial";
import { HistorialRepository } from "../../domain/repositories/HistorialRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

// Consulta de atenciones, recetas y descansos médicos del paciente que inició sesión
export class HistorialService {
  private historial: HistorialRepository;
  private sesion: SesionRepository;

  constructor(historial: HistorialRepository, sesion: SesionRepository) {
    this.historial = historial;
    this.sesion = sesion;
  }

  private dniActual(): string | null {
    const usuario = this.sesion.obtenerUsuario();
    return usuario ? usuario.dni : null;
  }

  atenciones(): Atencion[] {
    const dni = this.dniActual();
    return dni ? this.historial.obtenerAtenciones().filter((a) => a.pacienteDni === dni) : [];
  }

  recetas(): Receta[] {
    const dni = this.dniActual();
    return dni ? this.historial.obtenerRecetas().filter((r) => r.pacienteDni === dni) : [];
  }

  descansos(): Descanso[] {
    const dni = this.dniActual();
    return dni ? this.historial.obtenerDescansos().filter((d) => d.pacienteDni === dni) : [];
  }
}
