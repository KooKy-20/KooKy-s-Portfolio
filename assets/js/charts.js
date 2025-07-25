function createPieChart(ctxId, dataMap) {
  const canvas = document.getElementById(ctxId);
  if (!canvas) return null; // canvas 없으면 chart 생성 X

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const entries = Object.entries(dataMap)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const labels = entries.map(e => e.label);
  const values = entries.map(e => e.value);
  const title = chartTitles?.[ctxId]?.[currentLang] || '';

  const isMobile = window.innerWidth <= 600;

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#999999'],
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      layout: { padding: 30 },
      plugins: {
        title: {
          display: true,
          text: title,
          font: { size: isMobile ? 18 : 22, weight: 'bold' },
          padding: { bottom: 40 },
          color: '#111'
        },
        legend: { display: false },
        datalabels: {
          color: '#000',
          font: { size: isMobile ? 12 : 15 },
          anchor: 'center',
          align: 'end',
          textStrokeColor: '#fff',
          textStrokeWidth: 3,
          formatter: (value, ctx) => {
            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
            const percent = ((value / total) * 100).toFixed(1);
            return `${ctx.chart.data.labels[ctx.dataIndex]} (${percent}%)`;
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const value = ctx.raw.toLocaleString();
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((ctx.raw / total) * 100).toFixed(1);
              return `${ctx.label}: ₩${value} (${percent}%)`;
            }
          }
        }
      }
    },
    plugins: [
      ChartDataLabels,
      {
        id: 'customHint',
        afterDraw(chart) {
          if (window.innerWidth > 600) return;
          const { ctx, chartArea } = chart;
          const text = translations?.[currentLang]?.swipeHint || '';
          ctx.save();
          ctx.font = '13px sans-serif';
          ctx.fillStyle = '#666';
          ctx.textAlign = 'center';
          ctx.fillText(text, chart.width / 2, 70);
          ctx.restore();
        }
      }
    ]
  });

  return chart;
}

function showChart(index) {
  if (!Array.isArray(chartIds) || !chartIds.length) return;

  chartIds.forEach((id, i) => {
    const canvas = document.getElementById(id);
    if (canvas) {
      canvas.style.display = (i === index) ? 'block' : 'none';
    }

    const hint = document.getElementById(`${id}-swipe-hint`);
    if (hint) {
      hint.style.display = (i === index && window.innerWidth <= 600) ? 'block' : 'none';
    }
  });

  const visibleId = chartIds[index];
  const chartInstance = Chart.getChart(visibleId);
  if (chartInstance) {
    setTimeout(() => {
      chartInstance.resize();
    }, 10);
  }

  currentChartIndex = index;
  updateChartTitle?.(currentLang);
}

function setupChartNavigation() {
  const prevBtn = document.getElementById('prevChart');
  const nextBtn = document.getElementById('nextChart');
  if (!prevBtn || !nextBtn || !Array.isArray(chartIds) || chartIds.length === 0) return;

  prevBtn.addEventListener('click', () => {
    const nextIndex = (currentChartIndex - 1 + chartIds.length) % chartIds.length;
    showChart(nextIndex);
  });

  nextBtn.addEventListener('click', () => {
    const nextIndex = (currentChartIndex + 1) % chartIds.length;
    showChart(nextIndex);
  });
}
