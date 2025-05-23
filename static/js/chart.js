document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Temporary workaround: Use direct function path until /api/* redirect is fixed
        const response = await fetch('/.netlify/functions/api_inflation_data');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch inflation data: ${response.status} ${response.statusText}\nResponse: ${errorText.slice(0, 100)}...`);
        }
        const inflationData = await response.json();

        const labels = [];
        const data = [];

        // Process years and months in chronological order
        const years = Object.keys(inflationData).sort();
        for (const year of years) {
            const months = Object.keys(inflationData[year]).sort();
            for (const month of months) {
                labels.push(`${year}-${month}`);
                data.push(inflationData[year][month]);
            }
        }

        const ctx = document.getElementById('ipcChart').getContext('2d');
        ctx.canvas.style.height = '500px';
        ctx.canvas.style.width = '100%';

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'IPC (%)',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    borderWidth: 2,
                    tension: 0.1,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        ticks: {
                            maxRotation: 90,
                            minRotation: 90
                        }
                    },
                    y: {
                        suggestedMin: -2,
                        suggestedMax: 12,
                        ticks: {
                            stepSize: 2
                        }
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'IPC de España por mes'
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering historical chart:', error);
        const chartContainer = document.querySelector('#ipcChart').parentElement;
        chartContainer.innerHTML = '<p class="text-danger">Error al cargar los datos del IPC. Por favor, intenta de nuevo más tarde.</p>';
    }
});