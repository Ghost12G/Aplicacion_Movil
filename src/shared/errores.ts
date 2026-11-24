// Texto del error para mostrarlo al usuario
export function mensajeDeError(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "Ocurrió un error. Inténtalo de nuevo.";
}
