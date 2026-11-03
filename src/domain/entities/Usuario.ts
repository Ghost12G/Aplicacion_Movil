export interface Usuario {
  dni: string;
  password: string;
  nombre: string;
  operador: string;
  celular: string;
  telefonoFijo: string;
  correo: string;
}

// Datos que se pueden editar en "Mi Perfil"
export type ContactoPerfil = Pick<
  Usuario,
  "operador" | "celular" | "telefonoFijo" | "correo"
>;
