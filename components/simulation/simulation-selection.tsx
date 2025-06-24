/* SimulationSelection.tsx
   Pantalla que permite escoger el tipo de simulación (dando clic a las tarjetas),
   cargar archivos si corresponde y, finalmente, enviar el comando por WebSocket.
*/
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import {
  Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, AlertTriangle, Upload, FileText, Play,
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useSimulacionWS, ComandoWS } from "@/hooks/useSimulacionWS";

/* ───────────────────────── util para subir archivos ───────────────────────── */
type FileType = "pedidos" | "bloqueos";

const subirArchivo = async (file: File, tipo: FileType) => {
  const form = new FormData();
  form.append("file", file);

  const url =
    tipo === "pedidos"
      ? "http://localhost:8080/api/pedidos/upload"
      : "http://localhost:8080/api/bloqueos/upload";

  const res = await fetch(url, { method: "POST", body: form });
  if (!res.ok) throw new Error(`Error al subir ${tipo}`);
};

/* ──────────────────────────── tipos locales ───────────────────────────────── */
interface FileInfo { name: string; uploading: boolean; progress: number; }
interface Props { onStartSimulation: (type: string, data: ComandoWS) => void; }

/* ═════════════════════════  COMPONENTE  ════════════════════════════ */
export function SimulationSelection({ onStartSimulation }: Props) {
  /* conexión WS */
  const { enviarComando, conectado } = useSimulacionWS();

  /* estado principal */
  const [simType, setSimType] =
    React.useState<"daily" | "weekly" | "collapse" | null>(null);

  /* archivos (solo usados en daily) */
  const [files, setFiles] = React.useState<Record<FileType, FileInfo | null>>(
    { pedidos: null, bloqueos: null },
  );
  const refs = {
    pedidos: React.useRef<HTMLInputElement>(null),
    bloqueos: React.useRef<HTMLInputElement>(null),
  };

  /* fechas (usadas en weekly / collapse) */
  const [startDate, setStartDate] = React.useState<string>("");
  const endDate = React.useMemo(() => {
    if (!startDate) return "";
    const d = new Date(startDate);
    d.setDate(d.getDate() + 6);                 // 7 días (inicio + 6)
    return d.toISOString().split("T")[0];
  }, [startDate]);

  /* limpiar estados al cambiar de modo */
  React.useEffect(() => {
    setFiles({ pedidos: null, bloqueos: null });
    setStartDate("");
  }, [simType]);

  /* ───── helpers de subida ───── */
  const triggerFile = (type: FileType) => refs[type].current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>, type: FileType) => {
    const file = e.target.files?.[0]; if (!file) return;

    setFiles((p) => ({ ...p, [type]: { name: file.name, uploading: true, progress: 0 } }));
    try {
      await subirArchivo(file, type);
      setFiles((p) => ({ ...p, [type]: { name: file.name, uploading: false, progress: 100 } }));
      toast.success(`Archivo ${type} cargado`);
    } catch {
      toast.error(`Error al subir ${type}`);
      setFiles((p) => ({ ...p, [type]: null }));
    }
  };

  /* ───── iniciar simulación ───── */
  const startSim = () => {
    if (!simType)          { toast("Seleccione el tipo de simulación"); return; }
    if (!conectado)        { toast.error("Socket no conectado"); return; }

    if (simType === "daily") {
      if (!files.pedidos)  { toast("Falta archivo de pedidos"); return; }
    } else {               // weekly | collapse
      if (!startDate)      { toast("Seleccione la fecha de inicio"); return; }
    }

    const cmd: ComandoWS = {
      tipo: "INICIAR_SIMULACION",
      modo: simType,
      archivos:
        simType === "daily"
          ? {
              pedidos:  files.pedidos!.name,
              bloqueos: files.bloqueos?.name ?? null,
            }
          : undefined,
      parametros:
        simType === "weekly"
          ? { fechaInicio: startDate, fechaFin: endDate }
          : simType === "collapse"
          ? { fechaInicio: startDate }
          : undefined,
    };

    enviarComando(cmd);
    onStartSimulation(simType, cmd);
    toast.success("Simulación iniciada");
  };

  const uploading = Object.values(files).some((f) => f?.uploading);

  /* ──────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="container mx-auto">
      {/* encabezado */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simulación de Logística GLP</h1>
        <p className="text-muted-foreground">
          1. Elija el tipo de simulación → 2. Configure datos → 3. Inicie
        </p>
      </header>

      {/* tarjetas de modo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModeCard
          title="Operación Día a Día"
          icon={<Calendar className="h-5 w-5 text-primary" />}
          desc="Simulación en tiempo real del día corriente."
          selected={simType === "daily"}
          onSelect={() => setSimType("daily")}
        />
        <ModeCard
          title="Simulación Semanal"
          icon={<Clock className="h-5 w-5 text-primary" />}
          desc="Proyección de una semana."
          selected={simType === "weekly"}
          onSelect={() => setSimType("weekly")}
        />
        <ModeCard
          title="Simulación Colapso"
          icon={<AlertTriangle className="h-5 w-5 text-primary" />}
          desc="Escenario hasta colapso logístico."
          selected={simType === "collapse"}
          onSelect={() => setSimType("collapse")}
        />
      </div>

      {/* inputs ocultos para archivos (solo daily) */}
      <input hidden type="file" accept=".txt"
             ref={refs.pedidos}  onChange={(e) => onFile(e, "pedidos")} />
      <input hidden type="file" accept=".txt"
             ref={refs.bloqueos} onChange={(e) => onFile(e, "bloqueos")} />

      {/* panel condicional */}
      {simType === "daily" && (
        <DailyPanel
          files={files}
          uploading={uploading}
          triggerFile={triggerFile}
          startSim={startSim}
        />
      )}

      {simType === "weekly" && (
        <WeeklyPanel
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          startSim={startSim}
        />
      )}

      {simType === "collapse" && (
        <CollapsePanel
          startDate={startDate}
          setStartDate={setStartDate}
          startSim={startSim}
        />
      )}
    </div>
  );
}

/* —──────────────────────  sub-componentes  ────────────────────── */
function ModeCard({ title, icon, desc, selected, onSelect }: {
  title: string; icon: React.ReactNode; desc: string;
  selected: boolean; onSelect: () => void;
}) {
  return (
    <Card
      onClick={onSelect}
      className={`cursor-pointer transition-all ${
        selected ? "ring-2 ring-primary" : "hover:shadow-md"
      }`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>{icon}
        </div>
        <CardDescription>{desc}</CardDescription>
      </CardHeader>
    </Card>
  );
}

/* Panel Día a Día (subida de archivos) */
function DailyPanel({ files, uploading, triggerFile, startSim }: {
  files: Record<FileType, FileInfo | null>;
  uploading: boolean;
  triggerFile: (t: FileType) => void;
  startSim: () => void;
}) {
  return (
    <Card className="mt-7">
      <CardHeader>
        <CardTitle>Archivos – Día a Día</CardTitle>
        <CardDescription>Cargue los archivos necesarios.</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="pedidos">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
            <TabsTrigger value="bloqueos">Bloqueos</TabsTrigger>
          </TabsList>

          <TabsContent value="pedidos">
            <FileSection
              info={files.pedidos}
              required
              desc="Archivo de pedidos (.txt)"
              onUpload={() => triggerFile("pedidos")}
            />
          </TabsContent>

          <TabsContent value="bloqueos">
            <FileSection
              info={files.bloqueos}
              required={false}
              desc="Archivo de bloqueos (.txt)"
              onUpload={() => triggerFile("bloqueos")}
            />
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={uploading || !files.pedidos}
          onClick={startSim}
        >
          <Play className="mr-2 h-4 w-4" /> Iniciar Simulación
        </Button>
      </CardFooter>
    </Card>
  );
}

/* Panel Semanal (fechas) */
function WeeklyPanel({ startDate, setStartDate, endDate, startSim }: {
  startDate: string; setStartDate: (d: string) => void;
  endDate: string; startSim: () => void;
}) {
  return (
    <Card className="mt-7">
      <CardHeader>
        <CardTitle>Parámetros – Simulación Semanal</CardTitle>
        <CardDescription>Seleccione el rango de la simulación.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">Fecha de inicio</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-md border border-input p-2"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm mb-1">Fecha de fin (auto)</label>
            <input
              type="date"
              value={endDate}
              readOnly
              disabled
              className="w-full rounded-md border border-input p-2 opacity-60"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!startDate} onClick={startSim}>
          <Play className="mr-2 h-4 w-4" /> Iniciar Simulación
        </Button>
      </CardFooter>
    </Card>
  );
}

/* Panel Colapso (solo fecha inicio) */
function CollapsePanel({ startDate, setStartDate, startSim }: {
  startDate: string; setStartDate: (d: string) => void;
  startSim: () => void;
}) {
  return (
    <Card className="mt-7">
      <CardHeader>
        <CardTitle>Parámetros – Simulación Colapso</CardTitle>
        <CardDescription>Seleccione la fecha de inicio.</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Fecha de inicio</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-md border border-input p-2"
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button className="w-full" disabled={!startDate} onClick={startSim}>
          <Play className="mr-2 h-4 w-4" /> Iniciar Simulación
        </Button>
      </CardFooter>
    </Card>
  );
}

/* —────────── FileSection & Badge se mantienen igual ─────────── */
function FileSection({ info, required, onUpload, desc }: {
  info: FileInfo | null; required: boolean; onUpload: () => void; desc: string;
}) {
  return (
    <div className="space-y-4">
      {!info ? (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-md">
          <FileText className="h-10 w-10 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">{desc}</p>
          <p className="text-xs text-muted-foreground mb-2">Solo .txt</p>
          <Button variant="outline" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" /> Cargar {required && "(Oblig.)"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">{info.name}</span>
            </div>
            <Badge variant={info.uploading ? "outline" : "default"}>
              {info.uploading ? "Procesando…" : "Listo"}
            </Badge>
          </div>

          {info.uploading && (
            <>
              <div className="flex justify-between text-sm">
                <span>Procesando archivo…</span><span>{info.progress}%</span>
              </div>
              <Progress value={info.progress} />
            </>
          )}

          {!info.uploading && (
            <Button variant="outline" size="sm" onClick={onUpload}>
              <Upload className="mr-2 h-4 w-4" /> Cambiar
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function Badge({ children, variant = "default" }: {
  children: React.ReactNode; variant?: "default" | "outline";
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === "default"
          ? "bg-primary text-primary-foreground"
          : "border border-primary text-primary"
      }`}
    >
      {children}
    </span>
  );
}
