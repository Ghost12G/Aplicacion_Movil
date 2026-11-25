export interface Usuario {
  uid: string; // identificador único que entrega Firebase
  dni: string;
  nombre: string;
  correo: string;
  operador: string;
  celular: string;
}

export type ContactoPerfil = Pick<Usuario, "operador" | "celular">;

export interface DatosRegistro {
  nombre: string;
  dni: string;
  correo: string;
  password: string;
  celular: string;
}
