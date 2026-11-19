import { ReactNode, useEffect, useRef, useState } from "react";
import { DeviceEventEmitter, Keyboard, ScrollView, TextInput, View } from "react-native";

interface Props {
  children: ReactNode;
  className?: string;
  contentContainerClassName?: string;
}

// ScrollView para formularios: cuando se abre el teclado, deja espacio extra
// al final y sube la pantalla para que el campo que se está escribiendo
// quede visible, justo por encima del teclado.
export default function ScrollFormulario({
  children,
  className,
  contentContainerClassName,
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const posicion = useRef(0); // cuánto se ha desplazado la pantalla
  const tecladoArriba = useRef<number | null>(null); // dónde empieza el teclado
  const [altoTeclado, setAltoTeclado] = useState(0);

  // Si el campo enfocado queda tapado por el teclado, sube lo necesario
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
    const alAbrir = Keyboard.addListener("keyboardDidShow", (e) => {
      tecladoArriba.current = e.endCoordinates.screenY;
      setAltoTeclado(e.endCoordinates.height);
      mostrarCampo();
    });
    const alCerrar = Keyboard.addListener("keyboardDidHide", () => {
      tecladoArriba.current = null;
      setAltoTeclado(0);
    });
    // Aviso que envía InputField cuando se toca otro campo con el teclado abierto
    const alEnfocar = DeviceEventEmitter.addListener("campo-enfocado", mostrarCampo);

    return () => {
      alAbrir.remove();
      alCerrar.remove();
      alEnfocar.remove();
    };
  }, []);

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
      <View style={{ height: altoTeclado }} />
    </ScrollView>
  );
}
