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
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    suggestedMin: -2, // Slightly below the minimum IPC (-0.9)
                    suggestedMax: 12, // Slightly above the maximum IPC (10.8)
                    ticks: {
                        stepSize: 2 // Ticks every 2% for readability
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