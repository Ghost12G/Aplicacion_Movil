import { ContactoPerfil, Usuario } from "../entities/Usuario";

export interface UsuarioRepository {
  // Devuelve false si el documento ya estaba registrado
  registrar(usuario: Usuario): boolean;
  buscarPorCredenciales(dni: string, password: string): Usuario | null;
  actualizarContacto(dni: string, datos: ContactoPerfil): Usuario | null;
}
