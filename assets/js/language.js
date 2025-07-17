// ✅ 브라우저 기본 언어 또는 기본값 설정
window.currentLang = (navigator.language || navigator.userLanguage).startsWith('en') ? 'en' : 'ko';

function loadStockCharts(lang) {
  const container = document.getElementById('stock-charts');
  if (!container) return;

  container.innerHTML = `
    <div class="row justify-content-center g-4">
      <div class="col-md-6 col-12">
        <div class="border rounded p-2">
          <iframe src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=${lang}#%7B%22symbol%22%3A%22SP%3ASPX%22%2C%22width%22%3A%22auto%22%2C%22height%22%3A220%2C%22locale%22%3A%22${lang}%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%7D"
                  style="width: 100%; height: 220px;" frameborder="0" allowtransparency="true" scrolling="no"></iframe>
        </div>
      </div>
      <div class="col-md-6 col-12">
        <div class="border rounded p-2">
          <iframe src="https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=${lang}#%7B%22symbol%22%3A%22KRX%3AKOSPI%22%2C%22width%22%3A%22auto%22%2C%22height%22%3A220%2C%22locale%22%3A%22${lang}%22%2C%22dateRange%22%3A%221D%22%2C%22colorTheme%22%3A%22light%22%2C%22isTransparent%22%3Afalse%2C%22autosize%22%3Atrue%7D"
                  style="width: 100%; height: 220px;" frameborder="0" allowtransparency="true" scrolling="no"></iframe>
        </div>
      </div>
    </div>
  `;
}

// ✅ Giscus 위젯 재로딩
function reloadGiscus(lang) {
  const container = document.getElementById('giscus-container');
  if (!container) return;

  container.innerHTML = '';

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

// ✅ 언어 적용 함수
function setLanguage(lang) {
  window.currentLang = lang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const translated = translations?.[lang]?.[key];
    if (translated) {
      el.textContent = translated.replace('{{amount}}', '').replace('{{date}}', '');
    }
  });

  const elKo = document.getElementById('portfolio-ko');
  const elEn = document.getElementById('portfolio-en');

  if (lang === 'ko') {
    if (elKo) elKo.style.display = '';
    if (elEn) elEn.style.display = 'none';
    if (typeof initDataTableKo === 'function' && !isKoInitialized) {
      initDataTableKo();
      isKoInitialized = true;
    } else {
      dataTableKo?.columns?.adjust().draw();
    }
  } else {
    if (elKo) elKo.style.display = 'none';
    if (elEn) elEn.style.display = '';
    if (typeof initDataTableEn === 'function' && !isEnInitialized) {
      initDataTableEn();
      isEnInitialized = true;
    } else {
      dataTableEn?.columns?.adjust().draw();
    }
  }

  // ✅ 현재 언어 강조 (네비게이션 + 상단 버튼 공통 처리)
  ['lang', 'nav-lang'].forEach(prefix => {
    ['ko', 'en'].forEach(code => {
      const el = document.getElementById(`${prefix}-${code}`);
      if (el) {
        el.classList.toggle('active-lang', code === lang);
      }
    });
  });

  updateChartTitle?.(lang);
  updateSwipeHints?.();
  updateTotal?.(lang);
  updateExchangeRate?.(lang);
  updateLastUpdated?.(lang);

  if (window.location.pathname.includes('community')) {
    reloadGiscus(lang);
  }
  
  if (typeof loadStockCharts === 'function') {
  loadStockCharts(lang);
  }  
  
}

// ✅ 총합 갱신
function updateTotal(lang) {
  const totalEl = document.getElementById("totalAmount");
  if (!totalEl) return;

  const tableId = lang === 'ko' ? 'portfolio-ko' : 'portfolio-en';
  const table = document.getElementById(tableId);
  if (!table) return;

  let sum = 0;
  table.querySelectorAll('tbody tr').forEach(row => {
    const amountText = row.children[3]?.dataset.amount || row.children[3]?.textContent.replace(/[^\d]/g, '');
    const amount = parseInt(amountText, 10);
    if (!isNaN(amount)) sum += amount;
  });

  const formatted = lang === 'ko'
    ? sum.toLocaleString('ko-KR')
    : (sum / exchangeRate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  totalEl.textContent = translations?.[lang]?.total?.replace('{{amount}}', formatted) || '';
}

// ✅ 차트 제목 갱신
function updateChartTitle(lang) {
  if (typeof Chart === 'undefined') return;

  const isMobile = window.innerWidth <= 600;
  const ids = typeof chartIds !== 'undefined' ? chartIds : [];
  ids.forEach(id => {
    const chart = Chart.getChart(id);
    if (chart?.options?.plugins?.title) {
      chart.options.plugins.title.text = chartTitles?.[id]?.[lang] || '';
      chart.options.plugins.title.font.size = isMobile ? 18 : 22;
      chart.update('none');
    }
  });
}

// ✅ 스와이프 힌트 갱신
function updateSwipeHints() {
  const ids = typeof chartIds !== 'undefined' ? chartIds : [];
  ids.forEach(chartId => {
    const hintEl = document.getElementById(`${chartId}-swipe-hint`);
    if (hintEl) {
      hintEl.textContent = translations?.[window.currentLang]?.swipeHint || '';
    }
  });
}

// ✅ 환율 텍스트 갱신
function updateExchangeRate(lang) {
  const rateEl = document.getElementById("exchangeRateText");
  if (!rateEl || !exchangeRate || isNaN(exchangeRate)) return;

  const rateText = translations?.[lang]?.exchangeRate?.replace('{{rate}}',
    Math.round(exchangeRate).toLocaleString(lang === 'ko' ? 'ko-KR' : 'en-US')
  );

  rateEl.textContent = rateText || '';
}

// ✅ 마지막 업데이트 날짜 표시
function updateLastUpdated(lang) {
  const dateEl = document.getElementById("lastUpdated");
  if (!dateEl) return;

  const date = new Date().toLocaleDateString(lang === 'ko' ? 'ko-KR' : 'en-US');
  const text = translations?.[lang]?.lastUpdated?.replace('{{date}}', date);
  dateEl.textContent = text || '';
}

// ✅ 언어 버튼 이벤트 등록
function registerLanguageSwitcherEvents() {
  document.getElementById('lang-ko')?.addEventListener('click', () => setLanguage('ko'));
  document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));
  document.getElementById('nav-lang-ko')?.addEventListener('click', () => setLanguage('ko'));
  document.getElementById('nav-lang-en')?.addEventListener('click', () => setLanguage('en'));
}

// ✅ 초기 실행
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(window.currentLang);
  registerLanguageSwitcherEvents();
});

// ✅ 전역 등록
(() => {
  window.setLanguage = setLanguage;
  window.registerLanguageSwitcherEvents = registerLanguageSwitcherEvents;
  window.reloadGiscus = reloadGiscus;
})();
