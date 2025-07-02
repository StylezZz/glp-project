const URL = {
    development: 'http://localhost:8080',
    production: 'https://api.gplogistics.com' // A modificar
}


const GLPLogisticsAPI = {
    orders:{
        async uploadFile(file:File){
            try{
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${URL.development}/api/pedidos/upload`,{
                    method: "POST",
                    body: formData,
                    }   
                );
                if(!response){
                    throw new Error("No se cargador correctamente los pedidos");
                }
                const data = await response.json(); 
                /*
                    {
                        "nombreArchivo": "pedidos.xlsx",
                        "pedidosCargados": 111xx,
                    }
                */
               return data;
            }catch(error){
                console.error("Error uploading file:", error);
                throw error;
            }
        }
    },
    blockages:{
        async uploadFile(file:File){
            try{
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(`${URL.development}/api/bloqueos/upload`,{
                    method: "POST",
                    body: formData,
                    }   
                );
                if(!response){
                    throw new Error("No se cargador correctamente los bloqueos");
                }
                const data = await response.json(); 
                /*
                    {
                        "message": "Se cargaron correctamente",
                        "total": 111xx,
                    }
                */
               return data;
            }catch(error){
                console.error("Error uploading file:", error);
                throw error;
            }
        }
    },
    breadowns:{
        async uploadFile(file:File){
            try{
                const formData = new FormData();
                formData.append('file',file);
                const response = await fetch(`${URL.development}/`,{
                    method: "POST",
                    body: formData,
                }); // Modificar URL
                if(!response){
                    throw new Error("No se cargaron correctamente las averías");
                }
                const data = await response.json();
                /*
                    {
                        "message": "Se cargaron correctamente",
                        "total": 111xx,
                    }
                */
                return data;
            }catch(error){
                console.error("Error uploading file:", error);
                throw error;
            }
        }
    },
    algorithm:{
        async planRoutes(){
            try{
                const payload = {
                    "tamañoPoblacion": 200,
                    "numGeneraciones": 100,
                    "tasaMutacion": 0.15,
                    "tasaCruce": 0.85,
                    "elitismo": 10,
                }
                const response = await fetch(`${URL.development}/api/algorithm/start-semanal`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                if(!response){
                    throw new Error("No se pudo iniciar el algoritmo de planificación de rutas");
                }
                const data = await response.json();
                /*
                    Regresa un uuid encontrar el estado del algoritmo
                */
                return data;
            }catch(error){
                console.error("Error starting algorithm:", error);
                throw error;
            }
        },
        async makeMovements(uuid:string){
            try{
                const response = await fetch(`${URL.development}/api/movimientos/generar-automatico/${uuid}`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    }
                });
                if(response.status.toString() !== "success" ){
                    throw new Error("No se pudieron generar los movimientos automáticamente");
                }
                const data = await response.json();
                /*
                    {
                        "totalMovimientos": 20,
                        "algoritmoId": "d8c1224e-a5fd-44b8-8b42-f03c4b97b008",
                        "fechaInicio": "2025-06-19T23:08:49.4135418",
                        "status": "success",
                        "duracionTotalHoras": 44,
                        "mensaje": "Movimientos generados automáticamente usando SimulacionTemporalService",
                        "fechaFin": "2025-06-21T19:25:49.4135418",
                        "estadisticas": {
                            "distribucionTiposPasos": {
                                "ENTREGA": 2227,
                                "FIN": 20,
                                "INICIO": 20,
                                "MOVIMIENTO": 6252
                            },
                            "totalPasos": 8519,
                            "totalMovimientos": 20,
                            "promedioPasosPorMovimiento": 425.95
                        }
                    }
                */
               return data;
            }catch(error){
                console.error("Error making movements:", error);
                throw error;
            }
        },
        async initializeSimulation(uuid:string){
            try{
                const payload = {
                    "algoritmoId": uuid,
                    "fechaInicial": Date.now(),
                }
                const response = await fetch(`${URL.development}/api/simulation/initialize`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });
                if(!response){
                    throw new Error("No se pudo iniciar la simulación");
                }
                const data = await response.json();
                /**
                 * {
                    "fecha": "2025-06-19T00:00:00",
                    "wsEndpoint": "/ws/simulation",
                    "algoritmoId": "d8c1224e-a5fd-44b8-8b42-f03c4b97b008",
                    "mensaje": "Simulación inicializada correctamente",
                    "status": "success"
                    }
                 */
                return data;
            }catch(error){
                console.error("Error initializing simulation:", error);
                throw error;
            }
        }
    }

}

export default GLPLogisticsAPI;