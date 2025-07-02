import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
    try {
        console.log('Testing database connection and data structure...');
        
        // Test basic connection
        const connectionTest = await query('SELECT NOW() as current_time');
        console.log('Connection test passed:', connectionTest.rows[0]);
        
        // Test pedidos table structure
        const structureQuery = `
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'pedido' 
            AND table_schema = 'public'
            ORDER BY ordinal_position;
        `;
        const structure = await query(structureQuery);
        console.log('Table structure:', structure.rows);
        
        // Test sample data
        const sampleQuery = `
            SELECT * FROM pedido 
            ORDER BY hora_recepcion ASC 
            LIMIT 5
        `;
        const sampleData = await query(sampleQuery);
        console.log('Sample data:', sampleData.rows);
        
        // Test dates available
        const datesQuery = `
            SELECT 
                DATE(hora_recepcion) as fecha,
                COUNT(*) as total_pedidos
            FROM pedido 
            WHERE hora_recepcion IS NOT NULL
            GROUP BY DATE(hora_recepcion)
            ORDER BY DATE(hora_recepcion) ASC
            LIMIT 10
        `;
        const dates = await query(datesQuery);
        console.log('Available dates:', dates.rows);
        
        return NextResponse.json({
            success: true,
            connection: connectionTest.rows[0],
            tableStructure: structure.rows,
            sampleData: sampleData.rows,
            availableDates: dates.rows,
            message: 'Database connection and structure test successful'
        });
        
    } catch (error) {
        console.error('Database test error:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
