import { ReactNode, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, Keyboard, ScrollView, TextInput, View } from "react-native";

interface Props {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
  ajustarConTeclado?: boolean;
}

// Mantiene visible el campo enfocado cuando aparece el teclado.
export default function ScrollFormulario({
  children,
  className,
  contentContainerClassName,
  ajustarConTeclado = true,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const posicion = useRef(0);
  const tecladoArriba = useRef<number | null>(null);
  const [altoTeclado, setAltoTeclado] = useState(0);

  const mostrarCampo = () => {
    const limite = tecladoArriba.current;
    if (limite === null) return;

    setTimeout(() => {
      const campo: any = TextInput.State.currentlyFocusedInput();
      if (!campo) return;

      campo.measureInWindow((_x: number, y: number, _ancho: number, alto: number) => {
        const falta = y + alto - (limite - 24);
        if (falta > 0) {
          scrollRef.current?.scrollTo({ y: posicion.current + falta, animated: true });
        }
      });
    }, 150);
  };

  useEffect(() => {
    if (!ajustarConTeclado) {
      tecladoArriba.current = null;
      return;
    }

    const alAbrir = Keyboard.addListener("keyboardDidShow", (e) => {
      tecladoArriba.current = e.endCoordinates.screenY;
      setAltoTeclado(e.endCoordinates.height);
      mostrarCampo();
    });
    const alCerrar = Keyboard.addListener("keyboardDidHide", () => {
      tecladoArriba.current = null;
      setAltoTeclado(0);
    });
    const alEnfocar = DeviceEventEmitter.addListener("campo-enfocado", mostrarCampo);

    return () => {
      alAbrir.remove();
      alCerrar.remove();
      alEnfocar.remove();
    };
  }, [ajustarConTeclado]);

  return (
    <ScrollView
      ref={scrollRef}
      className={className}
      contentContainerClassName={contentContainerClassName}
      keyboardShouldPersistTaps="handled"
      scrollEventThrottle={16}
      onScroll={(e: { nativeEvent: { contentOffset: { y: number } } }) => {
        posicion.current = e.nativeEvent.contentOffset.y;
      }}
    >
      {children}
      <View style={{ height: ajustarConTeclado ? altoTeclado : 0 }} />
    </ScrollView>
  );
}
