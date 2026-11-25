export function traducirError(error: unknown): string {
  const codigo = (error as { code?: string }).code ?? "";

  switch (codigo) {
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/invalid-email":
      return "El correo no es válido.";
    case "auth/weak-password":
      return "La contraseña debe tener al menos 6 caracteres.";
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Correo o contraseña incorrectos.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
    case "auth/network-request-failed":
    case "unavailable":
      return "No hay conexión a internet.";
    case "permission-denied":
      return "No tienes permiso para esta acción. Revisa las reglas de Firestore.";
    default:
      return "Ocurrió un error. Inténtalo de nuevo.";
  }
}
