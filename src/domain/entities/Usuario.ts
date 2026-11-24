// El usuario ya no guarda contraseña: eso lo administra Firebase Authentication
export interface Usuario {
  uid: string; // identificador único que entrega Firebase
  dni: string;
  nombre: string;
  correo: string;
  operador: string;
  celular: string;
}

// Datos que se pueden editar en "Mi Perfil" (el correo no se edita)
export type ContactoPerfil = Pick<Usuario, "operador" | "celular">;

// Datos que se piden al crear una cuenta
export interface DatosRegistro {
  nombre: string;
  dni: string;
  correo: string;
  password: string;
  celular: string;
}
