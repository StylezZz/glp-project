import { useEffect, useRef, useState } from "react";

/* ───────────── 1) Tipo de los comandos que envías al backend ───────────── */
export type ComandoWS = {
  tipo: string;                          // INICIAR_SIMULACION, GENERAR_AVERIA, ...
  modo?: "daily" | "weekly" | "collapse";
  archivos?: {
    pedidos?: string;
    bloqueos?: string | null;
    averias?: string | null;
  };
  codigoCamion?: string;
  tipoIncidente?: string;
  momentoSimulacion?: string;            // ISO-8601
};

export interface PosicionDTO {
  codigoCamion: string;
  x: number;
  y: number;
  estado: string;
  ts: string;
}

interface UseSimulacionWS {
  vehiculos: Record<string, PosicionDTO>;
  enviarComando: (cmd: ComandoWS) => void;    // ← usa el nuevo tipo
  conectado: boolean;
}

export const useSimulacionWS = (): UseSimulacionWS => {
  const [vehiculos, setVehiculos] = useState<Record<string, PosicionDTO>>({});
  const [conectado, setConectado] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);

  /* abrir conexión al montar */
  useEffect(() => {
const ws = new WebSocket("ws://localhost:8080/ws/simulation");
    socketRef.current = ws;

    ws.onopen    = () => setConectado(true);
    ws.onclose   = () => setConectado(false);

    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "POSICION") {
        const p = msg.payload as PosicionDTO;
        setVehiculos((prev) => ({ ...prev, [p.codigoCamion]: p }));
      }
      /* maneja aquí otros tipos si los necesitas */
    };

    return () => ws.close();
  }, []);

  const enviarComando = (cmd: ComandoWS) => {
    socketRef.current?.send(JSON.stringify(cmd));
  };

  return { vehiculos, enviarComando, conectado };
};
