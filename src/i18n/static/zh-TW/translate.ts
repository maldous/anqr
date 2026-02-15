import type { PageDefinition } from '../types';

export const translate: PageDefinition = {
  title: '幫助翻譯 ANQR',
  description: '加入我們的翻譯社區，幫助全球用戶使用 ANQR。無需編碼經驗 - 直接從您的瀏覽器貢獻。',
  lastUpdated: '2026 年 2 月 1 日',
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: '打開翻譯庫', type: 'external' },
    { href: '/?lang=${lang}', label: '打開生成器', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: '關於ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: '聯繫我們', type: 'external' },
  ],
  sections: [
    {
      heading: '為什麼要貢獻？',
      paragraphs: [
        'ANQR 被世界各地的人們用來為企業、活動、支付和個人項目創建 QR 碼。通過提供翻譯，您可以幫助喜歡母語的用戶使用這個強大的工具。',
        '每一次翻譯貢獻 - 無論是修復拼寫錯誤還是翻譯整個語言 - 都會為社區中的用戶帶來真正的影響。',
      ],
    },
    {
      heading: '你能翻譯什麼？',
      paragraphs: ['ANQR 有兩種類型的可翻譯內容：'],
      bullets: [
        'UI 字符串：整個應用程序中出現的按鈕標籤、菜單項、工具提示和界面文本。',
        '靜態內容：文檔頁面，包括指南、示例、隱私政策和幫助文章。',
        '兩種類型都存儲為簡單的文本文件，您可以直接在瀏覽器中編輯 - 無需特殊軟件。',
        '翻譯在合併之前會經過審核，以確保質量和一致性。',
      ],
    },
    {
      heading: '如何貢獻',
      paragraphs: ['貢獻很簡單，不需要 Git 知識：'],
      bullets: [
        '訪問我們在 GitHub 上的公共翻譯存儲庫。',
        '找到您的語言文件（如果您的語言尚不受支持，則創建一個新文件）。',
        '單擊鉛筆圖標可直接在瀏覽器中進行編輯。',
        '進行更改並單擊"建議更改" - GitHub 將自動創建拉取請求。',
        '您的貢獻通常會在幾天內得到審核和合併。',
      ],
    },
    {
      heading: '翻譯指南',
      paragraphs: [
        '翻譯時，請保持 {name}、{count} 和 {{variable}} 等佔位符不變 - 這些在運行時會替換為動態值。還保留任何類似 HTML 的語法，例如 [[/path|Label]] 格式的鏈接。',
        '如果您不確定翻譯，最好保留英文，而不是提供不正確的翻譯。您還可以在 GitHub 上打開問題以尋求澄清。',
      ],
    },
    {
      heading: '目前支持的語言',
      paragraphs: ['ANQR 目前支持 40 多種語言，包括：'],
      bullets: [
        '主要世界語言：英語、中文、西班牙語、阿拉伯語、印地語、葡萄牙語、日語、韓語、法語、德語、俄語等。',
        '東南亞語言：泰語、越南語、印度尼西亞語、菲律賓語、馬來語、高棉語、老撾語、緬甸語。',
        '南亞語言：印地語、泰米爾語、泰盧固語、孟加拉語、馬拉地語、古吉拉特語、卡納達語、馬拉雅拉姆語、旁遮普語、尼泊爾語。',
      ],
    },
    {
      heading: '認可',
      paragraphs: [
        '所有貢獻者都記入我們的存儲庫中。您的工作幫助成千上萬的用戶以他們的首選語言訪問 ANQR。',
        '感謝我們所有的翻譯貢獻者幫助讓 ANQR 在全球範圍內可用！',
      ],
    },
    {
      heading: '有問題嗎？',
      paragraphs: [
        '如果您對貢獻翻譯有疑問，請在我們的 GitHub 存儲庫上提出問題或通過電子郵件與我們聯繫。我們很樂意幫助您入門。',
      ],
    },
  ],
};

export default translate;
