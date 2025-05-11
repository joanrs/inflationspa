document.addEventListener('DOMContentLoaded', function() {
    const inflationData = JSON.parse(document.getElementById('inflation-data').textContent);
    const labels = [];
    const data = [];

    for (const year in inflationData) {
        for (const month in inflationData[year]) {
            labels.push(`${year}-${month.padStart(2, '0')}`);
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