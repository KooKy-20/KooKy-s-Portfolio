window.addEventListener('load', async () => {
  // ✅ 헤더 먼저 로드
  await fetch('header.html')
    .then(res => res.text())
    .then(html => {
      const placeholder = document.getElementById('header-placeholder');
      if (placeholder) {
        placeholder.innerHTML = html;

        const path = location.pathname.split("/").pop();
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
          const href = link.getAttribute('href');
          if (href === path || (path === '' && href === 'index.html')) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          }
        });

        // ✅ 언어 버튼 이벤트 등록 + 언어 적용
        if (typeof window.registerLanguageSwitcherEvents === 'function') {
          window.registerLanguageSwitcherEvents();
        }
        if (typeof window.setLanguage === 'function') {
          window.setLanguage(window.currentLang);
        }
      }
    });

  await fetchExchangeRate();

  // 모바일이면 버튼 그룹 제거
  const btnGroup = document.querySelector('.chart-button-group');
  if (window.innerWidth <= 600 && btnGroup) {
    btnGroup.remove();
  }

  // 포트폴리오 테이블이 없는 경우 chart 관련 코드 건너뛰기
  const rows = document.querySelectorAll('#portfolio-ko tbody tr');
  if (rows.length > 0) {
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
console.log({
  nameMap,
  categoryMap,
  sectorMap
});

    if (typeof createPieChart === 'function') {
      window.amountChart = createPieChart('amountChart', nameMap);
      window.categoryChart = createPieChart('categoryChart', categoryMap);
      window.sectorChart = createPieChart('sectorChart', sectorMap);
    }

    if (typeof showChart === 'function') {
      showChart(0);
    }
    if (typeof setupChartNavigation === 'function') {
      setupChartNavigation();
    }
  }

  // ✅ 언어 다시 적용 (차트 제목 등 포함)
  if (typeof window.setLanguage === 'function') {
    window.setLanguage(window.currentLang);
  }

  // ✅ 스와이프 이벤트 (차트 영역 있는 경우만)
  const slider = document.getElementById('chartSlider');
  if (slider) {
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
  }
});
