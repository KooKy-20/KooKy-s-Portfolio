function setLanguage(lang) {
  currentLang = lang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang][key]) {
      el.textContent = translations[lang][key]
        .replace('{{amount}}', '')
        .replace('{{date}}', '');
    }
  });

  if (lang === 'ko') {
    document.getElementById('portfolio-ko').style.display = '';
    document.getElementById('portfolio-en').style.display = 'none';
    if (!isKoInitialized) {
      initDataTableKo();
      isKoInitialized = true;
    } else {
      dataTableKo.columns.adjust().draw();
    }
  } else {
    document.getElementById('portfolio-ko').style.display = 'none';
    document.getElementById('portfolio-en').style.display = '';
    if (!isEnInitialized) {
      initDataTableEn();
      isEnInitialized = true;
    } else {
      dataTableEn.columns.adjust().draw();
    }
  }
  
  updateChartTitle(lang); 
  updateSwipeHints();

  // ✅ 차트의 데이터레이블 레이블도 언어에 맞게 갱신
  const chartLabelMap = {
    sectorChart: 'labels_sector',
    amountChart: 'labels_amount',
    categoryChart: 'labels_category'
  };
  
  for (const chartId of chartIds) {
    const chart = Chart.getChart(chartId);
    if (!chart) continue;
  
    const labelKeyBase = chartLabelMap[chartId];
    const oldLabels = chart.data.labels;
  
    const fromList = lang === 'ko'
      ? translations.en[labelKeyBase]
      : translations.ko[labelKeyBase];
  
    const toList = lang === 'ko'
      ? translations.ko[labelKeyBase]
      : translations.en[labelKeyBase];
  
    const translatedLabels = oldLabels.map(label => {
      const idx = fromList?.indexOf(label);
      return idx >= 0 ? toList[idx] : label;
    });
  
    chart.data.labels = translatedLabels;
    chart.update();
  }

  // ✅ 네비게이션 바 언어 강조 처리도 추가
  ['lang', 'nav-lang'].forEach(prefix => {
    document.getElementById(`${prefix}-ko`)?.classList.remove('active-lang');
    document.getElementById(`${prefix}-en`)?.classList.remove('active-lang');
    document.getElementById(`${prefix}-${lang}`)?.classList.add('active-lang');
  });
    
  updateTotal(lang);
  updateExchangeRate(lang);
  updateLastUpdated(lang);
}

function updateTotal(lang) {
  const tableId = lang === 'ko' ? 'portfolio-ko' : 'portfolio-en';
  let sum = 0;
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    const amountText = row.children[3]?.dataset.amount || row.children[3]?.textContent.replace(/[^\d]/g, '');
    const amount = parseInt(amountText, 10);
    if (!isNaN(amount)) sum += amount;
  });

  let formatted;
  if (lang === 'ko') {
    formatted = sum.toLocaleString('ko-KR');
  } else {
    const usd = sum / exchangeRate;
    formatted = usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  document.getElementById("totalAmount").textContent =
    translations[lang].total.replace('{{amount}}', formatted);
}

function updateChartTitle(lang) {
  const isMobile = window.innerWidth <= 600;
  chartIds.forEach(id => {
    const chart = Chart.getChart(id);
    if (chart?.options?.plugins?.title) {
      chart.options.plugins.title.text = chartTitles[id]?.[lang] || '';
      chart.options.plugins.title.font.size = isMobile ? 18 : 22; // ← 여기에도 반영
      chart.update('none');
    }
  });
}

  function updateSwipeHints() {
  for (const chartId of chartIds) {
    const hintEl = document.getElementById(`${chartId}-swipe-hint`);
    if (hintEl) {
      hintEl.textContent = translations[currentLang]?.swipeHint || '';
    }
  }
}

function updateExchangeRate(lang) {
if (!exchangeRate || isNaN(exchangeRate)) return;

const rateText = translations[lang].exchangeRate.replace('{{rate}}',
  Math.round(exchangeRate).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')
);

document.getElementById("exchangeRateText").textContent = rateText;
}
  
function updateLastUpdated(lang) {
  const date = new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US');
  document.getElementById("lastUpdated").textContent =
    translations[lang].lastUpdated.replace('{{date}}', date);
}
