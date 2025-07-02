/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertTriangle, Upload, FileText, Play } from "lucide-react"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SimulationSelectionProps {
  onStartSimulation: (type: string, data: any) => void
}

type FileType = 'pedidos' | 'bloqueos' | 'averias';

interface FileInfo {
  name: string;
  uploading: boolean;
  progress: number;
}

export function SimulationSelection({ onStartSimulation }: SimulationSelectionProps) {
  const [selectedType, setSelectedType] = React.useState<string | null>(null)
  const [selectedDate, setSelectedDate] = React.useState<string>(
    new Date().toISOString().split('T')[0] // Fecha actual por defecto
  )
  const [availableDates, setAvailableDates] = React.useState<any[]>([])
  const [isLoadingDates, setIsLoadingDates] = React.useState(false)
  const [isLoadingSimulation, setIsLoadingSimulation] = React.useState(false)
  const [files, setFiles] = React.useState<Record<FileType, FileInfo | null>>({
    pedidos: null,
    bloqueos: null,
    averias: null,
  })
  const fileInputRefs = {
    pedidos: React.useRef<HTMLInputElement>(null),
    bloqueos: React.useRef<HTMLInputElement>(null),
    averias: React.useRef<HTMLInputElement>(null),
  }

  const handleFileSelect = (simulationType: string, fileType: FileType) => {
    setSelectedType(simulationType)
    if (fileInputRefs[fileType].current) {
      fileInputRefs[fileType].current.click()
    }
  }

  // Configure file input to show only .txt files
  const configureFileInput = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (inputRef.current) {
      // Set accept attribute to ensure only .txt files are shown in file picker
      inputRef.current.setAttribute('accept', '.txt,text/plain');
      
      // Reset the value to ensure onChange fires even if selecting the same file
      inputRef.current.value = '';
    }
  }
  // Simulación de carga de archivos sin endpoints
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fileType: FileType) => {
    const file = e.target.files?.[0];
    if (file) {
      setFiles((prev) => ({
        ...prev,
        [fileType]: {
          name: file.name,
          uploading: true,
          progress: 0,
        },
      }));

      // Simular progreso de carga
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setFiles((prev) => ({
          ...prev,
          [fileType]: {
            ...prev[fileType]!,
            progress,
          },
        }));

        if (progress >= 100) {
          clearInterval(interval);
          setFiles((prev) => ({
            ...prev,
            [fileType]: {
              ...prev[fileType]!,
              uploading: false,
            },
          }));
          toast(`Archivo ${fileType} cargado correctamente`);
        }
      }, 200);

      // Limpiar el input después de procesar
      if (fileInputRefs[fileType].current) {
        fileInputRefs[fileType].current.value = "";
      }
    }
  }
  const handleStartSimulation = () => {
    if (selectedType) {
      const simulationData = {
        type: selectedType,
        pedidos: files.pedidos?.name || null,
        bloqueos: files.bloqueos?.name || null,
        averias: files.averias?.name || null,
      }
      onStartSimulation(selectedType, simulationData)
    } else {
      toast("Por favor seleccione un tipo de simulación")
    }
  }

  // Cargar fechas disponibles cuando se monta el componente
  React.useEffect(() => {
    loadAvailableDates()
  }, [])

  const loadAvailableDates = async () => {
    setIsLoadingDates(true)
    try {
      const response = await fetch('/api/pedidos/dates')
      const data = await response.json()
      if (data.success) {
        setAvailableDates(data.availableDates)
      }
    } catch (error) {
      console.error('Error loading available dates:', error)
    } finally {
      setIsLoadingDates(false)
    }
  }

  const handleStartDatabaseSimulation = async () => {
    if (!selectedType) {
      return
    }

    if (!selectedDate) {
      return
    }

    setIsLoadingSimulation(true)
    try {
      // Cargar pedidos de la fecha seleccionada desde la base de datos
      const response = await fetch(`/api/pedidos?date=${selectedDate}`)
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Error al cargar pedidos')
      }

      // Transformar datos para la simulación
      const simulationData = {
        type: selectedType,
        date: selectedDate,
        orders: data.simulationData || [], // Usar datos transformados
        originalOrders: data.pedidos || [], // Mantener datos originales
        dataSource: 'database',
        totalOrders: data.count || 0
      }

      console.log('Starting simulation with database data:', simulationData)
      onStartSimulation(selectedType, simulationData)
    } catch (error) {
      console.error('Error loading simulation data:', error)
    } finally {
      setIsLoadingSimulation(false)
    }
  }

  return (
    <div className="container mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Simulación</h1>
        <p className="text-muted-foreground">Seleccione el tipo de simulación y cargue los datos necesarios</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Daily Simulation Card */}
        <Card
          className={`cursor-pointer transition-all ${selectedType === "daily" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => setSelectedType("daily")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Operación Día a Día</CardTitle>
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Simulación en tiempo real de las entregas del día corriente. Se inicializa con la fecha y hora actual del
              sistema.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargar archivos necesarios para la simulación</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setSelectedType("daily")}>
              Seleccionar
            </Button>
          </CardFooter>
        </Card>

        {/* Weekly Simulation Card */}
        <Card
          className={`cursor-pointer transition-all ${selectedType === "weekly" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => setSelectedType("weekly")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Simulación Semanal</CardTitle>
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Simulación del desempeño de una semana a partir de la fecha y hora configuradas.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargar archivos necesarios para la simulación</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setSelectedType("weekly")}>
              Seleccionar
            </Button>
          </CardFooter>
        </Card>

        {/* Collapse Simulation Card */}
        <Card
          className={`cursor-pointer transition-all ${selectedType === "collapse" ? "ring-2 ring-primary" : "hover:shadow-md"}`}
          onClick={() => setSelectedType("collapse")}
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Simulación Colapso</CardTitle>
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>
              Simulación de escenario a partir de la fecha y hora configuradas, hasta que se produzca un colapso
              logístico.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-32 bg-muted/30 rounded-md">
              <div className="text-center">
                <FileText className="h-10 w-10 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">Cargar archivos necesarios para la simulación</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => setSelectedType("collapse")}>
              Seleccionar
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Hidden file inputs */}
      <input 
        type="file" 
        ref={fileInputRefs.pedidos} 
        className="hidden" 
        accept=".txt,text/plain" 
        onChange={(e) => handleFileChange(e, 'pedidos')} 
        onClick={() => configureFileInput(fileInputRefs.pedidos)}
      />
      <input 
        type="file" 
        ref={fileInputRefs.bloqueos} 
        className="hidden" 
        accept=".txt,text/plain" 
        onChange={(e) => handleFileChange(e, 'bloqueos')} 
        onClick={() => configureFileInput(fileInputRefs.bloqueos)}
      />
      <input 
        type="file" 
        ref={fileInputRefs.averias} 
        className="hidden" 
        accept=".txt,text/plain" 
        onChange={(e) => handleFileChange(e, 'averias')} 
        onClick={() => configureFileInput(fileInputRefs.averias)}
      />

      {/* Database data section */}
      {selectedType && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Usar Datos Reales de la Base de Datos</CardTitle>
            <CardDescription>
              Seleccione una fecha para cargar pedidos reales desde la base de datos. Esta opción utiliza datos históricos reales.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Seleccionar Fecha:</label>
                {isLoadingDates ? (
                  <div className="flex items-center justify-center p-4">
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Cargando fechas disponibles...
                  </div>
                ) : (
                  <select 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full p-2 border rounded-md mt-1"
                  >
                    <option value="">Seleccione una fecha</option>
                    {availableDates.map((date: any) => (
                      <option key={date.date} value={date.date}>
                        {date.displayName} - {date.monthName} {date.year}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              
              {selectedDate && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <p className="text-sm text-blue-800">
                    ✓ Fecha seleccionada: {selectedDate}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Los pedidos reales de esta fecha serán cargados automáticamente
                  </p>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={!selectedDate || isLoadingSimulation} 
              onClick={handleStartDatabaseSimulation}
            >
              {isLoadingSimulation ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Cargando pedidos del {selectedDate}...
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Iniciar Simulación con Datos Reales
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* File upload section */}
      {selectedType && (
        <Card className="mt-7">          <CardHeader>
            <CardTitle>Archivos para {
              selectedType === "daily" ? "Operación Día a Día" : 
              selectedType === "weekly" ? "Simulación Semanal" :
              "Simulación Colapso"
            }</CardTitle>
            <CardDescription>
              Opcionalmente puede cargar archivos para personalizar la simulación. Si no carga archivos, la simulación generará datos automáticamente.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pedidos" className="w-full">
              <TabsList className="w-full grid grid-cols-3">
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
                <TabsTrigger value="bloqueos">Bloqueos</TabsTrigger>
                <TabsTrigger value="averias">Averías</TabsTrigger>
              </TabsList>
                <TabsContent value="pedidos" className="mt-4">
                <FileUploadSection 
                  fileInfo={files.pedidos}
                  required={false}
                  onUpload={() => handleFileSelect(selectedType, 'pedidos')}
                  description="Archivo de pedidos para la simulación (.txt) - Opcional"
                />
              </TabsContent>
              
              <TabsContent value="bloqueos" className="mt-4">                <FileUploadSection 
                  fileInfo={files.bloqueos}
                  required={false}
                  onUpload={() => handleFileSelect(selectedType, 'bloqueos')}
                  description="Archivo de bloqueos para la simulación (.txt) - Opcional"
                />
              </TabsContent>
              
              <TabsContent value="averias" className="mt-4">
                <FileUploadSection 
                  fileInfo={files.averias}
                  required={false}
                  onUpload={() => handleFileSelect(selectedType, 'averias')}
                  description="Archivo de averías para la simulación (.txt) - Opcional"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              disabled={false} 
              onClick={handleStartSimulation}
            >
              <Play className="mr-2 h-4 w-4" />
              Iniciar Simulación
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

interface FileUploadSectionProps {
  fileInfo: FileInfo | null;
  required: boolean;
  onUpload: () => void;
  description: string;
}

function FileUploadSection({ fileInfo, required, onUpload, description }: FileUploadSectionProps) {
  return (
    <div className="space-y-4">
      {!fileInfo ? (
        <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-muted-foreground/25 rounded-md">
          <FileText className="h-10 w-10 mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <p className="text-xs text-muted-foreground mb-2">Solo se permiten archivos .txt</p>          <Button variant="outline" onClick={onUpload}>
            <Upload className="mr-2 h-4 w-4" />
            Cargar Archivo{required ? " (Obligatorio)" : " (Opcional)"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              <span className="font-medium">{fileInfo.name}</span>
            </div>
            <Badge variant={fileInfo.uploading ? "outline" : "default"}>
              {fileInfo.uploading ? "Procesando..." : "Listo"}
            </Badge>
          </div>

          {fileInfo.uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Procesando archivo...</span>
                <span>{fileInfo.progress}%</span>
              </div>
              <Progress value={fileInfo.progress} />
            </div>
          )}

          {!fileInfo.uploading && (
            <Button variant="outline" size="sm" onClick={onUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Cambiar archivo
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

// Add Badge component since it's used in the file
function Badge({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "outline" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        variant === "default" ? "bg-primary text-primary-foreground" : "border border-primary text-primary"
      }`}
    >
      {children}
    </span>
  )
}
