import type { PageDefinition } from '../types';

export const about: PageDefinition = {
  title: '關於ANQR',
  description: 'ANQR 是一款免費的 QR 碼生成器，採用客戶端優先的方法 - 在本地生成 QR 碼或使用我們的 API 進行嵌入。',
  lastUpdated: '2026 年 2 月 1 日',
  primaryLinks: [
    { href: '/?lang=${lang}', label: '打開發電機', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '瀏覽學習文章', type: 'learn' },
  ],
  relatedLinks: [
    { href: '/privacy?lang=${lang}', label: '隱私政策', type: 'external' },
    { href: '/terms?lang=${lang}', label: '服務條款', type: 'external' },
  ],
  sections: [
    {
      heading: '什麼是ANQR？',
      paragraphs: ['ANQR（發音為"anchor"）是一款免費的二維碼生成器，可以為 URL、文本、Wi-Fi 憑證、聯繫人卡片、日曆事件等創建可掃描的代碼。', '它專為需要強大的 QR 工具而無需註冊的個人、小型企業、營銷人員和開發人員而構建。客戶端優先的設計意味著默認情況下，QR 碼在瀏覽器中本地生成，並具有用於專業嵌入和集成的可選服務器 API。'],
    },
    {
      heading: '主要特點',
      bullets: ['在瀏覽器中立即生成二維碼 - 無需帳戶。', '自定義顏色、模塊樣式、取景器圖案並添加圖像疊加層。', '以多種格式導出：PNG、SVG、WebP 和動畫 GIF。', '糾錯級別、QR 版本、編碼模式和掩碼選擇的高級控制。', '掃描安全指南和實時預覽有助於保持代碼在打印和屏幕上的可讀性。', '用於專業嵌入的服務器端 API，具有完整的參數支持。', '加載後即可離線工作 - 它是一個可以在任何地方運行的靜態網絡應用程序。'],
    },
    {
      heading: 'ANQR 的工作原理',
      paragraphs: ['ANQR 在您的瀏覽器中運行，並將您的輸入編碼為具有里德-所羅門糾錯功能的標準 QR 矩陣，然後將其呈現為您選擇的格式。', '默認情況下，生成發生在瀏覽器本地。對於專業用途，您還可以使用服務器端 API 通過 URL 參數生成 QR 碼 - 非常適合嵌入網站、電子郵件或自動化工作流程。', '當您添加疊加或動畫時，ANQR 會平衡樣式與掃描可靠性，以便結果保持可掃描性。', 'ANQR 側重於靜態代碼（數據位於 QR 內部）。如果您需要動態代碼（可編輯目標），您可以對自己的重定向 URL 或短鏈接進行編碼。'],
    },
    {
      heading: '誰運營 ANQR？',
      paragraphs: [`email@anqr.link`],
    },
    {
      heading: '廣告以及我們如何保持免費',
      paragraphs: ['ANQR 可免費使用並由廣告支持。我們可能會通過 Google AdSense 和/或其他廣告合作夥伴展示廣告。', '廣告提供商可能會使用 cookie 或類似技術根據您的興趣和瀏覽活動來個性化廣告。您可以在設備設置中以及通過 Google 廣告設置管理廣告偏好設置，並在我們的隱私政策中了解更多信息。', '我們不會出售您編碼為二維碼的內容。廣告有助於支付運行和改進項目的成本。'],
    },
    {
      heading: '開放標準',
      paragraphs: ['ANQR 根據 ISO/IEC 18004 標準生成 QR 碼，旨在實現掃描儀、相機和打印工作流程的廣泛兼容性。'],
    },
    {
      heading: '商標公告',
      paragraphs: ['QR Code® 是 DENSO WAVE INCORPORATED 的註冊商標。 ANQR 不隸屬於 DENSO WAVE INCORPORATED，也不受其認可或贊助。'],
    },
    {
      heading: '反饋和貢獻',
      paragraphs: ['我們歡迎反饋、錯誤報告和功能建議。請通過電子郵件或聯繫頁面聯繫我們 - 我們會閱讀每條消息，但回复時間可能會有所不同。'],
    },
  ],
};

export default about;
