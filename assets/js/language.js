// 브라우저 기본 언어 또는 기본값 설정
window.currentLang = (navigator.language || navigator.userLanguage).startsWith('en') ? 'en' : 'ko';

function reloadGiscus(lang) {
  const container = document.getElementById('giscus-container');
  if (!container) return;

  container.innerHTML = ''; // 기존 위젯 제거

  const giscus = document.createElement('script');
  giscus.src = 'https://giscus.app/client.js';
  giscus.setAttribute('data-repo', 'KooKy-20/KooKy-s-Portfolio');
  giscus.setAttribute('data-repo-id', 'R_kgDOPF8vpA');
  giscus.setAttribute('data-category', 'Guestbook');
  giscus.setAttribute('data-category-id', 'DIC_kwDOPF8vpM4Cs-_2');
  giscus.setAttribute('data-mapping', 'pathname');
  giscus.setAttribute('data-strict', '0');
  giscus.setAttribute('data-reactions-enabled', '1');
  giscus.setAttribute('data-emit-metadata', '0');
  giscus.setAttribute('data-input-position', 'top');
  giscus.setAttribute('data-theme', 'light_high_contrast');
  giscus.setAttribute('data-lang', lang);
  giscus.crossOrigin = 'anonymous';
  giscus.async = true;
  container.appendChild(giscus);
}

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
    document.getElementById('portfolio-ko')?.style?.display = '';
    document.getElementById('portfolio-en')?.style?.display = 'none';
    if (!isKoInitialized) {
      initDataTableKo?.();
      isKoInitialized = true;
    } else {
      dataTableKo?.columns?.adjust().draw();
    }
  } else {
    document.getElementById('portfolio-ko')?.style?.display = 'none';
    document.getElementById('portfolio-en')?.style?.display = '';
    if (!isEnInitialized) {
      initDataTableEn?.();
      isEnInitialized = true;
    } else {
      dataTableEn?.columns?.adjust().draw();
    }
  }

  updateChartTitle?.(lang); 
  updateSwipeHints?.();

  const chartLabelMap = {
    sectorChart: 'labels_sector',
    amountChart: 'labels_amount',
    categoryChart: 'labels_category'
  };

  for (const chartId of chartIds || []) {
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

  ['lang', 'nav-lang'].forEach(prefix => {
    document.getElementById(`${prefix}-ko`)?.classList.remove('active-lang');
    document.getElementById(`${prefix}-en`)?.classList.remove('active-lang');
    document.getElementById(`${prefix}-${lang}`)?.classList.add('active-lang');
  });

  updateTotal?.(lang);
  updateExchangeRate?.(lang);
  updateLastUpdated?.(lang);

  if (window.location.pathname.includes('community')) {
    reloadGiscus(lang);
  }
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
      chart.options.plugins.title.font.size = isMobile ? 18 : 22;
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

// ✅ 새로운 함수: 언어 스위치 버튼 이벤트 등록
function registerLanguageSwitcherEvents() {
  document.getElementById('lang-ko')?.addEventListener('click', () => setLanguage('ko'));
  document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));
  document.getElementById('nav-lang-ko')?.addEventListener('click', () => setLanguage('ko'));
  document.getElementById('nav-lang-en')?.addEventListener('click', () => setLanguage('en'));
}

// ✅ 페이지 로딩 시 초기화
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(window.currentLang); // 언어 초기 적용
  registerLanguageSwitcherEvents(); // 버튼 이벤트 등록
});
