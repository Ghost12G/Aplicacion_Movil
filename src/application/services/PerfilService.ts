import { ContactoPerfil, Usuario } from "../../domain/entities/Usuario";
import { UsuarioRepository } from "../../domain/repositories/UsuarioRepository";
import { SesionRepository } from "../../domain/repositories/SesionRepository";

// Actualizar los datos de contacto del usuario que inició sesión
export class PerfilService {
  private usuarios: UsuarioRepository;
  private sesion: SesionRepository;

  constructor(usuarios: UsuarioRepository, sesion: SesionRepository) {
    this.usuarios = usuarios;
    this.sesion = sesion;
  }

  async actualizarContacto(datos: ContactoPerfil): Promise<Usuario | null> {
    const actual = this.sesion.obtenerUsuario();
    if (!actual) return null;

    const actualizado = await this.usuarios.actualizarContacto(actual.uid, datos);
    this.sesion.establecerUsuario(actualizado);
    return actualizado;
  }
}
