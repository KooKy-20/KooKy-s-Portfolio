
window.addEventListener('DOMContentLoaded', async () => {
  // 네비게이션 메뉴 상태 처리
  const path = location.pathname.split("/").pop();
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  await fetchExchangeRate();

  if (window.innerWidth <= 600) {
    const btnGroup = document.querySelector('.chart-button-group');
    if (btnGroup) btnGroup.remove();
  }

  // 테이블 기반 데이터 정리
  const rows = document.querySelectorAll('#portfolio-ko tbody tr');
  const categoryMap = {}, nameMap = {}, sectorMap = {};
  rows.forEach(row => {
    const category = row.children[0]?.textContent.trim();
    const asset = row.children[1]?.textContent.trim();
    const sector = row.children[5]?.textContent.trim();
    const amount = parseInt(row.children[3]?.textContent.replace(/[^\d]/g, ''), 10);
    if (!isNaN(amount)) {
      categoryMap[category] = (categoryMap[category] || 0) + amount;
      nameMap[asset] = (nameMap[asset] || 0) + amount;
      sectorMap[sector] = (sectorMap[sector] || 0) + amount;
    }
  });

  window.amountChart   = createPieChart('amountChart', nameMap);
  window.categoryChart = createPieChart('categoryChart', categoryMap);
  window.sectorChart   = createPieChart('sectorChart', sectorMap);

  setLanguage('ko');
  updateTotal('ko');
  updateExchangeRate('ko');
  updateLastUpdated('ko');
  showChart(0);
  setupChartNavigation();

  // 터치 스와이프 이벤트 등록
  const slider = document.getElementById('chartSlider');
  let touchStartX = 0, touchEndX = 0;

  slider.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  });

  slider.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const threshold = 50;
    const diff = touchEndX - touchStartX;
    if (Math.abs(diff) < threshold) return;
    const nextIdx = diff > 0 
      ? (currentChartIndex - 1 + chartIds.length) % chartIds.length 
      : (currentChartIndex + 1) % chartIds.length;
    showChart(nextIdx);
  });
});
