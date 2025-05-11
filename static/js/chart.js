document.addEventListener('DOMContentLoaded', function() {
    const inflationData = JSON.parse(document.getElementById('inflation-data').textContent);
    const labels = [];
    const data = [];

    // Process years and months in chronological order
    const years = Object.keys(inflationData).sort(); // Sort years (2020, 2021, ...)
    for (const year of years) {
        const months = Object.keys(inflationData[year]).sort(); // Sort months (01, 02, ...)
        for (const month of months) {
            labels.push(`${year}-${month}`);
            data.push(inflationData[year][month]);
        }
    }

    const ctx = document.getElementById('ipcChart').getContext('2d');
    // Fallback: Explicitly set canvas height
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
});