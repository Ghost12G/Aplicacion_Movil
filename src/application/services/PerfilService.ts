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

  actualizarContacto(datos: ContactoPerfil): Usuario | null {
    const actual = this.sesion.obtenerUsuario();
    if (!actual) return null;

    const actualizado = this.usuarios.actualizarContacto(actual.dni, datos);
    if (!actualizado) return null;

    this.sesion.establecerUsuario(actualizado);

    const recordada = this.sesion.obtenerCuentaRecordada();
    if (recordada && recordada.dni === actualizado.dni) {
      this.sesion.guardarCuentaRecordada(actualizado);
    }
    return actualizado;
  }
}
