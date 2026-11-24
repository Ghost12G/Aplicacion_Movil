// Aquí se "arman" las piezas: se crean los repositorios y se entregan
// a los servicios. Las pantallas solo importan los servicios de este archivo.
import { AuthService } from "../application/services/AuthService";
import { CitaService } from "../application/services/CitaService";
import { HistorialService } from "../application/services/HistorialService";
import { PerfilService } from "../application/services/PerfilService";
import { RiesgoDiabetesService } from "../application/services/RiesgoDiabetesService";
import { SolicitudService } from "../application/services/SolicitudService";
import { CitaSQLiteRepository } from "./repositories/CitaSQLiteRepository";
import { EspecialidadApiRepository } from "./repositories/EspecialidadApiRepository";
import { HistorialEstaticoRepository } from "./repositories/HistorialEstaticoRepository";
import { SesionMemoriaRepository } from "./repositories/SesionMemoriaRepository";
import { SolicitudFirestoreRepository } from "./repositories/SolicitudFirestoreRepository";
import { UsuarioFirebaseRepository } from "./repositories/UsuarioFirebaseRepository";
import { CitaFirestoreSyncService } from "./services/CitaFirestoreSyncService";
import { NotificacionCitaService } from "./services/NotificacionCitaService";

const usuarioRepo = new UsuarioFirebaseRepository();
const sesionRepo = new SesionMemoriaRepository();
const citaRepo = new CitaSQLiteRepository();
const solicitudRepo = new SolicitudFirestoreRepository();
const especialidadRepo = new EspecialidadApiRepository();
const historialRepo = new HistorialEstaticoRepository();

export const authService = new AuthService(usuarioRepo, sesionRepo);
export const perfilService = new PerfilService(usuarioRepo, sesionRepo);
export const citaService = new CitaService(citaRepo, especialidadRepo, sesionRepo);
export const citaFirestoreSyncService = new CitaFirestoreSyncService(
  citaRepo,
  sesionRepo,
  especialidadRepo
);
export const notificacionCitaService = new NotificacionCitaService();
export const solicitudService = new SolicitudService(solicitudRepo, sesionRepo);
export const historialService = new HistorialService(historialRepo, sesionRepo);
export const riesgoDiabetesService = new RiesgoDiabetesService();
