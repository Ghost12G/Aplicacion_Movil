// Aquí se "arman" las piezas: se crean los repositorios y se entregan
// a los servicios. Las pantallas solo importan los servicios de este archivo.
import { AuthService } from "../application/services/AuthService";
import { CitaService } from "../application/services/CitaService";
import { HistorialService } from "../application/services/HistorialService";
import { PerfilService } from "../application/services/PerfilService";
import { SolicitudService } from "../application/services/SolicitudService";
import { CitaMemoriaRepository } from "./repositories/CitaMemoriaRepository";
import { EspecialidadEstaticaRepository } from "./repositories/EspecialidadEstaticaRepository";
import { HistorialEstaticoRepository } from "./repositories/HistorialEstaticoRepository";
import { SesionMemoriaRepository } from "./repositories/SesionMemoriaRepository";
import { SolicitudMemoriaRepository } from "./repositories/SolicitudMemoriaRepository";
import { UsuarioMemoriaRepository } from "./repositories/UsuarioMemoriaRepository";

const usuarioRepo = new UsuarioMemoriaRepository();
const sesionRepo = new SesionMemoriaRepository();
const citaRepo = new CitaMemoriaRepository();
const solicitudRepo = new SolicitudMemoriaRepository();
const especialidadRepo = new EspecialidadEstaticaRepository();
const historialRepo = new HistorialEstaticoRepository();

export const authService = new AuthService(usuarioRepo, sesionRepo);
export const perfilService = new PerfilService(usuarioRepo, sesionRepo);
export const citaService = new CitaService(citaRepo, especialidadRepo, sesionRepo);
export const solicitudService = new SolicitudService(solicitudRepo);
export const historialService = new HistorialService(historialRepo);
