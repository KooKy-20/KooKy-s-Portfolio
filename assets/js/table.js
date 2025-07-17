function preserveAmountData(tableId) {
  document.querySelectorAll(`#${tableId} tbody tr`).forEach(row => {
    const cell = row.children[3];
    if (cell && !cell.dataset.amount) {
      const raw = cell.textContent.replace(/[^\d]/g, '');
      if (!isNaN(raw) && raw !== '') {
        cell.dataset.amount = raw;
      }
    }
  });
}

function getAmountRenderFn(tableId) {
  return function(data, type, row, meta) {
    const cell = $(`#${tableId}`).DataTable().cell(meta.row, meta.col).node();
    const raw = cell?.dataset?.amount || data;
    if (type !== 'display') return raw;
    const number = parseInt(raw, 10);
    if (isNaN(number)) return data;

    const isKo = tableId === 'portfolio-ko';
    if (isKo) {
      return number.toLocaleString('ko-KR', {
        style: 'currency',
        currency: 'KRW'
      });
    } else {
      const usd = number / exchangeRate;
      return usd.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }
  };
}

// ✅ 이미 전역에 선언되어 있다고 가정하고 let/var 제거
function initDataTableKo() {
  preserveAmountData('portfolio-ko');
  if ($.fn.DataTable.isDataTable('#portfolio-ko')) {
    $('#portfolio-ko').DataTable().destroy();
  }
  dataTableKo = $('#portfolio-ko').DataTable({
    paging: false,
    searching: false,
    info: false,
    responsive: false,
    order: [[3, "desc"]],
    columnDefs: [{
      targets: 3,
      render: getAmountRenderFn('portfolio-ko')
    }]
  });
}

function initDataTableEn() {
  preserveAmountData('portfolio-en');
  if ($.fn.DataTable.isDataTable('#portfolio-en')) {
    $('#portfolio-en').DataTable().destroy();
  }
  dataTableEn = $('#portfolio-en').DataTable({
    paging: false,
    searching: false,
    info: false,
    responsive: false,
    order: [[3, "desc"]],
    columnDefs: [{
      targets: 3,
      render: getAmountRenderFn('portfolio-en')
    }]
  });
}
