export type ResultadoRecordatorio =
  | { estado: "programado" }
  | { estado: "permiso-denegado" }
  | { estado: "menos-de-24-horas" }
  | { estado: "no-disponible" }
  | { estado: "error" };
