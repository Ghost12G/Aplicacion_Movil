import { useCallback, useState } from "react";

export function useFormulario(valoresIniciales: Record<string, string>) {
  const [valores, setValores] = useState(valoresIniciales);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const cambiar = (campo: string, texto: string) => {
    setValores((anterior) => ({ ...anterior, [campo]: texto }));
  };

  const limpiar = () => {
    setValores(valoresIniciales);
    setErrores({});
  };

  const establecerValores = useCallback((nuevosValores: Record<string, string>) => {
    setValores(nuevosValores);
  }, []);

  return { valores, errores, setErrores, cambiar, limpiar, establecerValores };
}
