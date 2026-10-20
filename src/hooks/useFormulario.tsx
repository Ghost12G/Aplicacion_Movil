import { useState } from "react";

export function useFormulario(valoresIniciales: Record<string, string>) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});

  // Cambia solo un campo y deja los demás igual
  const cambiar = (campo: string, texto: string) => {
    setValores((anterior) => ({ ...anterior, [campo]: texto }));
  };

  // Deja todo como al inicio
  const limpiar = () => {
    setValores(valoresIniciales);
    setErrores({});
  };

  return { valores, errores, setErrores, cambiar, limpiar };
}