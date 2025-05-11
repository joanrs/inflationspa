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
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'IPC (%)',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
                pointRadius: 3 // Match results chart for consistent appearance
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
                    suggestedMin: -2, // Tight fit for min IPC (-0.9)
                    suggestedMax: 12, // Tight fit for max IPC (10.8)
                    ticks: {
                        stepSize: 2 // Consistent with results chart
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