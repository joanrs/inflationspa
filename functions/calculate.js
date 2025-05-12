const { inflationData } = require('./inflation_data');

exports.handler = async (event, context) => {
    try {
        if (event.httpMethod !== 'POST') {
            return {
                statusCode: 405,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Method Not Allowed' })
            };
        }

        const data = JSON.parse(event.body);
        const { initial_savings, start_month, start_year, end_month, end_year } = data;

        // Validate input
        if (!initial_savings || !start_month || !start_year || !end_month || !end_year) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Missing required fields' })
            };
        }

        if (isNaN(initial_savings) || initial_savings <= 0) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Initial savings must be a positive number' })
            };
        }

        // Generate date range
        const startDate = new Date(`${start_year}-${start_month}-01`);
        const endDate = new Date(`${end_year}-${end_month}-01`);
        if (startDate > endDate) {
            return {
                statusCode: 400,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ error: 'Start date must be before end date' })
            };
        }

        // Collect IPC data for the period
        const ipcData = [];
        let currentDate = new Date(startDate);
        while (currentDate <= endDate) {
            const year = currentDate.getFullYear().toString();
            const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
            if (inflationData[year] && inflationData[year][month] !== undefined) {
                ipcData.push({
                    date: `${year}-${month}`,
                    ipc: inflationData[year][month]
                });
            } else {
                return {
                    statusCode: 400,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ error: `No IPC data for ${year}-${month}` })
                };
            }
            currentDate.setMonth(currentDate.getMonth() + 1);
        }

        // Calculate final savings
        let savings = initial_savings;
        let cumulativeIpc = 1;
        for (const item of ipcData) {
            const ipcFactor = 1 + (item.ipc / 1200); // Convert monthly IPC % to decimal
            savings = savings / ipcFactor; // Adjust savings for inflation
            cumulativeIpc *= ipcFactor; // Accumulate IPC
        }

        const finalSavings = savings.toFixed(2);
        const loss = (initial_savings - finalSavings).toFixed(2);
        const cumulativeIpcPercent = ((cumulativeIpc - 1) * 100).toFixed(2);
        const lossPercent = ((loss / initial_savings) * 100).toFixed(2);

        return {
            statusCode: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Cache-Control': 'public, max-age=3600'
            },
            body: JSON.stringify({
                initial_savings: initial_savings.toFixed(2),
                start_date: `${start_month}-${start_year}`,
                end_date: `${end_month}-${end_year}`,
                final_savings: finalSavings,
                loss: loss,
                ipcOh: lossPercent,
                cumulative_ipc: cumulativeIpcPercent,
                ipc_data: ipcData
            })
        };
    } catch (error) {
        console.error('Calculate function error:', error.message);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ error: `Server error: ${error.message}` })
        };
    }
};