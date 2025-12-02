document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('predictionForm');
    const predictBtn = document.getElementById('predictBtn');
    const predValue = document.getElementById('predValue');
    const statusBadge = document.getElementById('statusBadge');
    const statusMessage = document.getElementById('statusMessage');
    const themeToggle = document.getElementById('themeToggle');
    const circlePath = document.querySelector('.circle');
    const barFill = document.querySelector('.bar-fill');
    const efficiencyText = document.querySelector('.efficiency-text');

    // Chart Gradient
    const ctx = document.getElementById('trendChart').getContext('2d');
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0.3)');
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    let trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['-4h', '-3h', '-2h', '-1h', 'Now'],
            datasets: [{
                label: 'Energy Consumption',
                data: [2.1, 2.3, 2.0, 2.5, null],
                borderColor: '#10b981',
                backgroundColor: gradient,
                borderWidth: 3,
                pointBackgroundColor: '#0f172a',
                pointBorderColor: '#10b981',
                pointBorderWidth: 2,
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    titleColor: '#94a3b8',
                    bodyColor: '#f8fafc',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function (context) {
                            return context.parsed.y + ' kWh';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    title: {
                        display: true,
                        text: 'Consumption (kWh)',
                        color: '#94a3b8',
                        font: { size: 13, weight: '700' },
                        padding: { bottom: 5 }
                    },
                    ticks: { color: '#64748b', font: { weight: '600' } }
                },
                x: {
                    grid: { display: false },
                    title: {
                        display: true,
                        text: 'Timeline',
                        color: '#94a3b8',
                        font: { size: 13, weight: '700' },
                        padding: { top: 5 }
                    },
                    ticks: { color: '#64748b', font: { weight: '600' } }
                }
            },
            layout: {
                padding: { bottom: 0 }
            }
        }
    });

    // Theme Toggle
    let isDark = true;
    themeToggle.addEventListener('click', () => {
        isDark = !isDark;
        document.body.setAttribute('data-theme', isDark ? 'dark' : 'light');
        themeToggle.querySelector('.icon').textContent = isDark ? '🌙' : '☀️';

        // Update Chart Colors
        const newColor = isDark ? '#10b981' : '#059669';
        trendChart.data.datasets[0].borderColor = newColor;
        trendChart.data.datasets[0].pointBorderColor = newColor;
        trendChart.options.scales.y.grid.color = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
        trendChart.update();
    });

    // Default Time
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.querySelector('input[name="timestamp"]').value = now.toISOString().slice(0, 16);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        predictBtn.classList.add('loading');
        predictBtn.disabled = true;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Update Main Value
                const pred = parseFloat(result.prediction).toFixed(2);
                predValue.textContent = pred;

                // Update Status
                statusBadge.textContent = result.status;
                statusBadge.className = `badge ${result.status}`;
                statusMessage.textContent = result.message;

                // Animate Circle (Max assumed 5.0 for demo)
                const percentage = Math.min((pred / 5) * 100, 100);
                circlePath.style.strokeDasharray = `${percentage}, 100`;

                // Update Efficiency Bar
                let efficiency = Math.max(0, Math.min(100, (1 - (pred / 5)) * 100));

                barFill.style.width = `${efficiency}%`;
                efficiencyText.textContent = `${Math.round(efficiency)}% Efficiency`;

                // Color code efficiency
                if (efficiency > 70) barFill.style.background = 'var(--success)';
                else if (efficiency > 40) barFill.style.background = 'var(--accent)';
                else barFill.style.background = 'var(--danger)';

                // Update Chart
                const lag1h = parseFloat(data.lag_1h);
                trendChart.data.datasets[0].data = [
                    (lag1h * 0.9).toFixed(2),
                    (lag1h * 1.1).toFixed(2),
                    (lag1h * 0.85).toFixed(2),
                    lag1h,
                    pred
                ];
                trendChart.update();

            } else {
                alert('Error: ' + result.error);
            }
        } catch (error) {
            console.error(error);
            alert('Prediction failed.');
        } finally {
            predictBtn.classList.remove('loading');
            predictBtn.disabled = false;
        }
    });
});
