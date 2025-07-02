'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DatabaseTestPage() {
  const [testResults, setTestResults] = useState<Record<string, unknown> | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('2025-01-01')
  const [ordersData, setOrdersData] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(false)

  const testDatabaseConnection = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-db')
      const data = await response.json()
      setTestResults(data)
      console.log('Database test results:', data)
    } catch (error) {
      console.error('Error testing database:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadOrdersForDate = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/pedidos?date=${selectedDate}`)
      const data = await response.json()
      setOrdersData(data)
      console.log('Orders data:', data)
    } catch (error) {
      console.error('Error loading orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadAvailableDates = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/pedidos/dates')
      const data = await response.json()
      console.log('Available dates:', data)
      setTestResults((prev: Record<string, unknown> | null) => ({ ...prev, availableDates: data }))
    } catch (error) {
      console.error('Error loading dates:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Prueba de Base de Datos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Pruebas de Conexión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testDatabaseConnection} disabled={loading}>
              Probar Conexión DB
            </Button>
            <Button onClick={loadAvailableDates} disabled={loading}>
              Cargar Fechas Disponibles
            </Button>
            
            {testResults && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">Resultados:</h3>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cargar Pedidos por Fecha</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Fecha:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2 border rounded mt-1"
              />
            </div>
            
            <Button onClick={loadOrdersForDate} disabled={loading || !selectedDate}>
              Cargar Pedidos
            </Button>
            
            {ordersData && (
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <h3 className="font-semibold">Pedidos encontrados: {ordersData.count || 0}</h3>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(ordersData, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
