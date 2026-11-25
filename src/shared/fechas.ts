export const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

export function formatearFecha(fecha: Date): string {
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}/${fecha.getFullYear()}`;
}

export function formatearFechaHora(fecha: Date): string {
  const horas24 = fecha.getHours();
  const sufijo = horas24 >= 12 ? "PM" : "AM";
  const horas12 = String(horas24 % 12 || 12).padStart(2, "0");
  const minutos = String(fecha.getMinutes()).padStart(2, "0");
  return `${formatearFecha(fecha)} ${horas12}:${minutos} ${sufijo}`;
}

export function fechaRelativa(meses: number, dia: number): Date {
  const hoy = new Date();
  return new Date(hoy.getFullYear(), hoy.getMonth() + meses, dia);
}

export function fechaHoraDe(fecha: string, hora: string): Date {
  const [dia, mes, anio] = fecha.split("/").map(Number);
  const [horas, minutos] = hora.split(":").map(Number);
  return new Date(anio, mes - 1, dia, horas, minutos);
}

export function yaPaso(fecha: string, hora: string, ahora: Date = new Date()): boolean {
  return fechaHoraDe(fecha, hora).getTime() <= ahora.getTime();
}

// Un día aparece "agotado" si ya pasó su última hora (por ejemplo, hoy a las
// 17:00) y, como regla de práctica, los días múltiplos de 4.
export function esDiaAgotado(fecha: Date): boolean {
  const ultimaHora = HORAS_DISPONIBLES[HORAS_DISPONIBLES.length - 1];
  if (yaPaso(formatearFecha(fecha), ultimaHora)) return true;
  return fecha.getDate() % 4 === 0;
}

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
