import { ContactoPerfil, DatosRegistro, Usuario } from "../entities/Usuario";

// Todas las operaciones son asíncronas porque dependen de internet.
// Si algo falla, lanzan un Error con un mensaje en español.
export interface UsuarioRepository {
  registrar(datos: DatosRegistro): Promise<Usuario>;
  iniciarSesion(correo: string, password: string): Promise<Usuario>;
  cerrarSesion(): Promise<void>;
  // Devuelve el usuario si ya había una sesión iniciada en este celular
  restaurarSesion(): Promise<Usuario | null>;
  recuperarPassword(correo: string): Promise<void>;
  actualizarContacto(uid: string, datos: ContactoPerfil): Promise<Usuario>;
}
