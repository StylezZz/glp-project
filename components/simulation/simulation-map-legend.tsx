import React from 'react';

export function SimulationMapLegend() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-4 py-3">
        <h3 className="font-semibold text-white flex items-center">
          🗺️ Leyenda del Mapa
        </h3>
      </div>
      
      <div className="p-4">
        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-400 rounded border border-red-600 flex-shrink-0"></div>
            <span className="text-slate-700">Áreas bloqueadas</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-green-500 rounded flex-shrink-0"></div>
            <span className="text-slate-700">Camiones operativos</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-yellow-500 rounded flex-shrink-0"></div>
            <span className="text-slate-700">En mantenimiento</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-red-600 rounded flex-shrink-0"></div>
            <span className="text-slate-700">Averiados</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-blue-500 rounded flex-shrink-0"></div>
            <span className="text-slate-700">Estación combustible</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 bg-purple-500 rounded flex-shrink-0"></div>
            <span className="text-slate-700">Estación mantenimiento</span>
          </div>
        </div>
      </div>
    </div>
  );
}
