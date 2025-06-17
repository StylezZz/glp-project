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
type FileType = "pedidos" | "bloqueos" | "averias";

const subirArchivo = async (file: File, tipo: FileType) => {
  const form = new FormData();
  form.append("file", file);

  const url =
    tipo === "pedidos"
      ? "http://localhost:8080/api/pedidos/upload"
      : tipo === "bloqueos"
      ? "http://localhost:8080/api/bloqueos/upload"
      : ""; // averías aún no

  if (!url) return;

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

  /* estado de archivos */
  const [selected, setSelected] = React.useState<string | null>(null);
  const [files, setFiles] = React.useState<Record<FileType, FileInfo | null>>(
    { pedidos: null, bloqueos: null, averias: null },
  );
  const refs = {
    pedidos: React.useRef<HTMLInputElement>(null),
    bloqueos: React.useRef<HTMLInputElement>(null),
    averias: React.useRef<HTMLInputElement>(null),
  };

  /* ───── helpers de subida ───── */
  const triggerFile = (mode: string, type: FileType) => {
    setSelected(mode);
    refs[type].current?.click();
  };

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
    if (!files.pedidos) { toast("Falta archivo de pedidos"); return; }
    if (!conectado)      { toast.error("Socket no conectado"); return; }

    const cmd: ComandoWS = {
      tipo: "INICIAR_SIMULACION",
      modo: selected as any,                     // "daily" | "weekly" | "collapse"
      archivos: {
        pedidos:  files.pedidos.name,
        bloqueos: files.bloqueos?.name ?? null,
      },
    };

    enviarComando(cmd);
    onStartSimulation(selected ?? "", cmd);
    toast.success("Simulación iniciada");
  };

  const uploading = Object.values(files).some((f) => f?.uploading);

  /* ──────────────────────────── UI ─────────────────────────────── */
  return (
    <div className="container mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simulación</h1>
        <p className="text-muted-foreground">Seleccione tipo y cargue los datos.</p>
      </header>

      {/* tarjetas de modo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ModeCard
          title="Operación Día a Día"
          icon={<Calendar className="h-5 w-5 text-primary" />}
          desc="Simulación en tiempo real del día corriente."
          selected={selected === "daily"}
          onSelect={() => setSelected("daily")}
        />
        <ModeCard
          title="Simulación Semanal"
          icon={<Clock className="h-5 w-5 text-primary" />}
          desc="Proyección de una semana."
          selected={selected === "weekly"}
          onSelect={() => setSelected("weekly")}
        />
        <ModeCard
          title="Simulación Colapso"
          icon={<AlertTriangle className="h-5 w-5 text-primary" />}
          desc="Escenario hasta colapso logístico."
          selected={selected === "collapse"}
          onSelect={() => setSelected("collapse")}
        />
      </div>

      {/* inputs ocultos */}
      <input hidden type="file" accept=".txt"
             ref={refs.pedidos}  onChange={(e) => onFile(e, "pedidos")} />
      <input hidden type="file" accept=".txt"
             ref={refs.bloqueos} onChange={(e) => onFile(e, "bloqueos")} />

      {/* panel de tabs tras escoger modo */}
      {selected && (
        <Card className="mt-7">
          <CardHeader>
            <CardTitle>Archivos – {selected === "daily" ? "Día a Día"
                       : selected === "weekly" ? "Semanal" : "Colapso"}</CardTitle>
            <CardDescription>Cargue los archivos necesarios.</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="pedidos">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="bloqueos">Bloqueos</TabsTrigger>
                <TabsTrigger value="averias">Averías</TabsTrigger>
              </TabsList>

              <TabsContent value="pedidos">
                <FileSection
                  info={files.pedidos}
                  required
                  desc="Archivo de pedidos (.txt)"
                  onUpload={() => triggerFile(selected, "pedidos")}
                />
              </TabsContent>

              <TabsContent value="bloqueos">
                <FileSection
                  info={files.bloqueos}
                  required={false}
                  desc="Archivo de bloqueos (.txt)"
                  onUpload={() => triggerFile(selected, "bloqueos")}
                />
              </TabsContent>

              <TabsContent value="averias">
                <FileSection
                  info={files.averias}
                  required={false}
                  desc="Archivo de averías (.txt) – próximamente"
                  onUpload={() => toast("Aún no implementado")}
                />
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter>
            <Button className="w-full" disabled={uploading || !files.pedidos} onClick={startSim}>
              <Play className="mr-2 h-4 w-4" /> Iniciar Simulación
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

/* —──────────────────────  sub-componentes auxiliares  ────────────────────── */
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
      <CardContent>
        <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
          <div className="text-center">
            <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Cargar archivos</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">Seleccionar</Button>
      </CardFooter>
    </Card>
  );
}

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
