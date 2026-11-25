import { ContactoPerfil, DatosRegistro, Usuario } from "../entities/Usuario";

export interface UsuarioRepository {
  registrar(datos: DatosRegistro): Promise<Usuario>;
  iniciarSesion(correo: string, password: string): Promise<Usuario>;
  cerrarSesion(): Promise<void>;
  restaurarSesion(): Promise<Usuario | null>;
  recuperarPassword(correo: string): Promise<void>;
  actualizarContacto(uid: string, datos: ContactoPerfil): Promise<Usuario>;
}
