// Devuelve la fecha como DD/MM/AAAA
export function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

// Regla de práctica: los días múltiplos de 4 aparecen "agotados"
export function esDiaAgotado(fecha: Date): boolean {
  return fecha.getDate() % 4 === 0;
}

// Primer día con cupo, contando desde hoy + N días
export function proximaFechaLibre(diasAdelante: number): Date {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + diasAdelante);
  while (esDiaAgotado(fecha)) {
    fecha.setDate(fecha.getDate() + 1);
  }
  return fecha;
}

export const HORAS_DISPONIBLES = [
  "08:20", "08:40", "09:00", "09:20", "09:40",
  "13:20", "13:40", "14:00", "14:20", "15:00",
  "15:20", "15:40", "16:00",
];
