import { Cita } from "../../domain/entities/Cita";
import { Especialidad, Medico } from "../../domain/entities/Especialidad";
import { CENTRO } from "../../domain/constantes";
import { CitaRepository } from "../../domain/repositories/CitaRepository";
import { EspecialidadRepository } from "../../domain/repositories/EspecialidadRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

export interface DatosReserva {
  especialidad: Especialidad;
  medico: Medico;
  fecha: string;
  hora: string;
}

// Reservar, consultar y cancelar citas
export class CitaService {
  private citas: CitaRepository;
  private especialidades: EspecialidadRepository;
  private sesion: SesionRepository;

  constructor(
    citas: CitaRepository,
    especialidades: EspecialidadRepository,
    sesion: SesionRepository
  ) {
    this.citas = citas;
    this.especialidades = especialidades;
    this.sesion = sesion;
  }

  obtenerEspecialidades(): Especialidad[] {
    return this.especialidades.obtenerTodas();
  }

  listar(): Cita[] {
    return this.citas.listar();
  }

  reservar(datos: DatosReserva): Cita {
    const usuario = this.sesion.obtenerUsuario();

    const cita: Cita = {
      id: Date.now().toString(),
      especialidad: datos.especialidad.nombre,
      servicio: datos.especialidad.servicio,
      medico: datos.medico.nombre,
      consultorio: datos.medico.consultorio,
      modalidad: datos.medico.modalidad,
      fecha: datos.fecha,
      hora: datos.hora,
      estado: "PENDIENTE",
      paciente: usuario ? usuario.nombre.toUpperCase() : "PACIENTE",
      centro: CENTRO,
    };

    this.citas.agregar(cita);
    return cita;
  }

  cancelar(id: string): void {
    this.citas.eliminar(id);
  }
}
