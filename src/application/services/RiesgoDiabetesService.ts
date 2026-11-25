import { DatosRiesgo, ResultadoRiesgo } from "../../domain/entities/RiesgoDiabetes";

// Test de riesgo de diabetes tipo 2 basado en la escala FINDRISC.
// Suma puntos según los datos del paciente (de 0 a 26) y los agrupa en
// tres niveles. Es una guía referencial: no reemplaza una consulta médica.
export class RiesgoDiabetesService {
  calcularImc(pesoKg: number, tallaCm: number): number {
    if (!(pesoKg > 0) || !(tallaCm > 0)) return 0;
    const tallaM = tallaCm / 100;
    return pesoKg / (tallaM * tallaM);
  }

  calcularPuntaje(datos: DatosRiesgo): number {
    let puntos = 0;

    if (datos.edad > 64) puntos += 4;
    else if (datos.edad >= 55) puntos += 3;
    else if (datos.edad >= 45) puntos += 2;

    const imc = this.calcularImc(datos.pesoKg, datos.tallaCm);
    if (imc > 30) puntos += 3;
    else if (imc >= 25) puntos += 1;

    if (datos.sexo === "Hombre") {
      if (datos.cinturaCm > 102) puntos += 4;
      else if (datos.cinturaCm >= 94) puntos += 3;
    } else {
      if (datos.cinturaCm > 88) puntos += 4;
      else if (datos.cinturaCm >= 80) puntos += 3;
    }

    if (!datos.actividadFisica) puntos += 2;
    if (!datos.frutasVerduras) puntos += 1;
    if (datos.medicacionPresion) puntos += 2;
    if (datos.glucosaAlta) puntos += 5;
    if (datos.familiar === "lejano") puntos += 3;
    if (datos.familiar === "directo") puntos += 5;

    return puntos;
  }

  evaluar(datos: DatosRiesgo): ResultadoRiesgo {
    const imc = this.calcularImc(datos.pesoKg, datos.tallaCm);
    const puntaje = this.calcularPuntaje(datos);

    if (puntaje < 7) {
      return {
        imc, puntaje, nivel: "bajo", titulo: "RIESGO BAJO",
        frase: "Aproximadamente 1 de cada 100 personas con este puntaje puede desarrollar Diabetes tipo 2 en los próximos 10 años",
        consejo: "Mantén hábitos de vida saludable: actividad física regular, alimentación equilibrada y un peso y perímetro abdominal adecuados.",
      };
    }
    if (puntaje < 15) {
      return {
        imc, puntaje, nivel: "moderado", titulo: "RIESGO MODERADO",
        frase: "Entre 1 de cada 25 y 1 de cada 6 personas con este puntaje puede desarrollar Diabetes tipo 2 en los próximos 10 años",
        consejo: "Conviene mejorar tus hábitos (actividad física, alimentación y control del peso) y consultar con un médico para un control de glucosa preventivo.",
      };
    }
    return {
      imc, puntaje, nivel: "alto", titulo: "RIESGO ALTO",
      frase: "Entre 1 de cada 3 y 1 de cada 2 personas con este puntaje puede desarrollar Diabetes tipo 2 en los próximos 10 años",
      consejo: "Se recomienda acudir pronto a una evaluación médica para un control de glucosa y una orientación personalizada.",
    };
  }
}
