const translations = {
  ko: {
    nav_column: "칼럼",
    nav_portfolio: "포트폴리오",
    nav_community: "커뮤니티",
    portfolio_title: "KooKy의 포트폴리오 (2025.06.30 기준)",
    swipeHint: "←→ 스와이프하면 차트를 넘길 수 있어요",
    category: "분류",
    assetName: "이름",
    ticker: "티커",
    amount: "금액",
    ratio: "비중",
    sector: "섹터",
    labels_sector: ["현금/채권", "테크", "산업재", "금융", "소비재/서비스", "기타"],
    labels_category: ["현금성", "미국", "한국", "기타"],
    labels_amount: [
      "원화", "달러", "미국채", "미국채ETF", "테슬라", "애플", "GE버노바", "제이피모건", "골드만삭스",
      "쿠팡", "인튜이티브서지컬", "알파벳A", "GE에어로스페이스", "TSMC", "두산에너빌리티", "CJ",
      "SK하이닉스", "SK텔레콤", "SK이노베이션", "현대중공업", "현대차", "삼성전자", "두산로보틱스",
      "한화에어로스페이스", "현대모템", "LIG넥스원", "LG에너지솔루션", "LG이노텍", "삼성SDI",
      "오뚜기", "비바리퍼블리카", "금", "금ETF(IAU)", "금ETF(KRX)", "비트코인"],
    total: "총합: ₩{{amount}}원",
    exchangeRate: "환율: 1 USD ≒ {{rate}}원 (출처: Frankfurter.app)",
    lastUpdated: "업데이트: {{date}}"
  },
  en: {
    nav_column: "Column",
    nav_portfolio: "Portfolio",
    nav_community: "Community",
    portfolio_title: "KooKy's Portfolio (as of 2025.06.30)",
    swipeHint: "←→ Swipe to change charts",
    category: "Category",
    assetName: "Name",
    ticker: "Ticker",
    amount: "Amount",
    ratio: "Weight",
    sector: "Sector",
    labels_sector: ["Cash/Bond", "Tech", "Industrials", "Finance", "Consumer", "Others"],
    labels_category: ["Cash", "USA", "Korea", "Others"],
    labels_amount: [
      "KRW", "USD", "UST10Y", "IEF", "Tesla", "Apple", "GE Vernova", "JPMorgan", "Goldman Sachs",
      "Coupang", "Intuitive Surgical", "Alphabet A", "GE Aerospace", "TSMC", "Doosan Enerbility", "CJ",
      "SK Hynix", "SK Telecom", "SK Innovation", "Hyundai Heavy Industries", "Hyundai Motor", "Samsung Electronics", "Doosan Robotics",
      "Hanwha Aerospace", "Hyundai Mobis", "LIG Nex1", "LG Energy Solution", "LG Innotek", "Samsung SDI",
      "Ottogi", "Viva Republica", "Gold", "Gold ETF (IAU)", "Gold ETF (KRX)", "Bitcoin"],
    total: "Total: ${{amount}}",
    exchangeRate: "Exchange Rate: 1 USD ≒ ₩{{rate}} (Source: Frankfurter.app)",
    lastUpdated: "Last updated: {{date}}"
  }
};

  const chartTitles = {
  sectorChart: {
    ko: '섹터별 자산 비중',
    en: 'Asset Allocation by Sector'
  },
  amountChart: {
    ko: '금액별 자산 비중',
    en: 'Asset Allocation by Amount'
  },
  categoryChart: {
    ko: '분류별 자산 비중',
    en: 'Asset Allocation by Category'
  }
};

let exchangeRate = 1390; // 기본값
let currentLang = 'ko'; // 기본 언어

async function fetchExchangeRate() {
  try {
    const res = await fetch('https://api.frankfurter.app/latest?from=KRW&to=USD');
    const data = await res.json();
    const usd = data?.rates?.USD;
    if (usd) {
      exchangeRate = 1 / usd; // 1 USD ≒ N KRW
      console.log("환율 업데이트:", exchangeRate.toFixed(2), "KRW/USD");
    }
  } catch (err) {
    console.error('Frankfurter 환율 불러오기 실패:', err);
  }
}

const chartIds = ['sectorChart', 'amountChart', 'categoryChart'];
let currentChartIndex = 0;
