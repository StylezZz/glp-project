import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        console.log('Fetching available dates...');

        const datesQuery = `
            SELECT 
                DATE(hora_recepcion) as fecha,
                COUNT(*) as total_pedidos,
                EXTRACT(MONTH FROM hora_recepcion) as mes,
                EXTRACT(YEAR FROM hora_recepcion) as año
            FROM pedido 
            WHERE hora_recepcion IS NOT NULL
            GROUP BY DATE(hora_recepcion), EXTRACT(MONTH FROM hora_recepcion), EXTRACT(YEAR FROM hora_recepcion)
            ORDER BY DATE(hora_recepcion) ASC
        `;

        const result = await query(datesQuery);
        
        const availableDates = result.rows.map(row => ({
            date: row.fecha,
            totalOrders: parseInt(row.total_pedidos),
            month: parseInt(row.mes),
            year: parseInt(row.año),
            monthName: getMonthName(parseInt(row.mes)),
            displayName: `${row.fecha} (${row.total_pedidos} pedidos)`
        }));

        return NextResponse.json({
            success: true,
            message: "Fechas disponibles obtenidas correctamente",
            totalDates: availableDates.length,
            availableDates: availableDates
        });

    } catch (error) {
        console.error("Error fetching available dates:", error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : "Error al obtener fechas disponibles"
        }, { status: 500 });
    }
}

function getMonthName(month: number): string {
    const months = [
        '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[month] || 'Desconocido';
}
