function createPieChart(ctxId, dataMap) {
  const canvas = document.getElementById(ctxId);
  if (!canvas) return null;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  // ✅ 기존 차트 제거 (이 부분이 없으면 데이터가 반영되지 않음)
  const existingChart = Chart.getChart(ctxId);
  if (existingChart) existingChart.destroy();

  // ✅ 문자열 금액을 숫자로 변환 (예: "10490784" → 10490784)
  const entries = Object.entries(dataMap)
    .map(([label, value]) => ({
      label,
      value: typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : value
    }))
    .sort((a, b) => b.value - a.value);

  const labels = entries.map(e => e.label);
  const values = entries.map(e => e.value);
  const title = chartTitles?.[ctxId]?.[currentLang] || '';
  const isMobile = window.innerWidth <= 600;

  // ✅ 숨김 상태라면 먼저 보이도록 잠시 강제 표시 후 생성
  const originalDisplay = canvas.style.display;
  if (originalDisplay === 'none') {
    canvas.style.display = 'block';
  }

  const chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56',
          '#4BC0C0', '#9966FF', '#999999'
        ],
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
              const lang = window.currentLang || 'ko';
              const value = ctx.raw;
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const percent = ((value / total) * 100).toFixed(1);
              if (lang === 'ko') {
                const formattedValue = value.toLocaleString('ko-KR');
                return `${ctx.label}: ₩${formattedValue} (${percent}%)`;
              } else {
                const rate = typeof exchangeRate === 'number' && exchangeRate > 0 ? exchangeRate : 1390;
                const usdValue = value / rate;
                const formattedValue = usdValue.toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                return `${ctx.label}: $${formattedValue} (${percent}%)`;
              }
            }
          }
        }
      }
    },
    plugins: [
      ChartDataLabels,
      {
        id: 'mobileHint',
        afterDraw(chart) {
          if (window.innerWidth > 600) return;
          const { ctx } = chart;
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

  // ✅ 다시 원래 display 상태 복원
  canvas.style.display = originalDisplay;

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
