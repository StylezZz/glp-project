/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const date = searchParams.get("date"); // Formato: YYYY-MM-DD
        const month = searchParams.get("month");
        const year = searchParams.get("year") || '2025';

        console.log(`Fetching orders for date: ${date}, month: ${month}, year: ${year}`);

        let ordersQuery = '';
        let queryParams: any[] = [];

        if (date) {
            // Filtrar por fecha específica
            ordersQuery = `
                SELECT * FROM pedido 
                WHERE DATE(hora_recepcion) = $1
                ORDER BY hora_recepcion ASC
            `;
            queryParams = [date];
            console.log(`Filtering by specific date: ${date}`);
        } else if (month) {
            // Filtrar por mes
            const monthNumber = getMonthNumber(month);
            ordersQuery = `
                SELECT * FROM pedido 
                WHERE EXTRACT(MONTH FROM hora_recepcion) = $1 
                AND EXTRACT(YEAR FROM hora_recepcion) = $2
                ORDER BY hora_recepcion ASC
            `;
            queryParams = [monthNumber, parseInt(year)];
            console.log(`Filtering by month: ${month} (${monthNumber}) and year: ${year}`);
        } else {
            // Sin filtro, obtener los primeros 10 (como tu query original)
            ordersQuery = `
                SELECT * FROM pedido 
                ORDER BY hora_recepcion ASC 
                LIMIT 10
            `;
            console.log('No filters applied, getting first 10 orders');
        }

        const ordersResult = await query(ordersQuery, queryParams);
        console.log(`Found ${ordersResult.rows.length} pedidos`);

        // Transformar los datos al formato de la simulación
        const transformedOrders = ordersResult.rows.map(row => ({
            id: row.id_pedido,
            customerId: row.id_cliente,
            origin: { 
                x: 35, // Depósito central (ajusta según tu mapa)
                y: 25, 
                name: "Depósito Central" 
            },
            destination: { 
                x: parseInt(row.x), 
                y: parseInt(row.y), 
                name: `Cliente ${row.id_cliente}` 
            },
            quantity: parseInt(row.cantidad_glp),
            priority: calculatePriority(parseInt(row.cantidad_glp)),
            status: row.entregado ? 'delivered' : 'pending',
            createdAt: new Date(row.hora_recepcion).getTime(),
            assignedVehicle: row.camion_asignado,
            revenue: calculateRevenue(parseInt(row.cantidad_glp), 35, 25, parseInt(row.x), parseInt(row.y)),
            timeWindow: {
                start: new Date(row.hora_recepcion).getTime(),
                end: row.tiempo_limite_entrega ? 
                    new Date(row.tiempo_limite_entrega).getTime() : 
                    new Date(row.hora_recepcion).getTime() + 8 * 60 * 60 * 1000 // 8 horas por defecto
            }
        }));
        
        return NextResponse.json({
            success: true,
            message: "Pedidos obtenidos correctamente",
            filters: {
                date: date,
                month: month,
                year: year
            },
            count: ordersResult.rows.length,
            pedidos: ordersResult.rows, // Datos originales
            simulationData: transformedOrders // Datos transformados para la simulación
        });

    } catch (error) {
        console.error("Error fetching pedidos:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Error desconocido al obtener pedidos",
            details: 'Error connecting to the database or executing the query'
        }, { status: 500 });
    }
}

function getMonthNumber(month: string | null): number {
    const months: Record<string, number> = {
        'enero': 1,
        'febrero': 2,
        'marzo': 3,
        'abril': 4,
        'mayo': 5,
        'junio': 6,
        'julio': 7,
        'agosto': 8,
        'septiembre': 9,
        'octubre': 10,
        'noviembre': 11,
        'diciembre': 12
    };
    return months[month?.toLowerCase() || ''] || 1;
}

function calculatePriority(quantity: number): string {
    if (quantity >= 10) return 'high';
    if (quantity >= 5) return 'medium';
    return 'low';
}

function calculateRevenue(quantity: number, originX: number, originY: number, destX: number, destY: number): number {
    const distance = Math.sqrt(Math.pow(destX - originX, 2) + Math.pow(destY - originY, 2));
    return Math.round((distance * 0.5 + quantity * 2) * 10) / 10;
}