import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: '隱私政策',
  description: 'ANQR 收集的信息、其使用方式以及您根據適用隱私法享有的權利。',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: '服務條款', type: 'external' }],
  sections: [
    {
      heading: '總結',
      paragraphs: ['ANQR 是一種採用客戶端優先方法的 QR 代碼生成器。我們不要求您創建帳戶。默認情況下，QR 碼是在您的瀏覽器本地生成的 - 我們無權訪問您編碼的內容。', '對於專業用途，ANQR 提供了服務器端 API，可根據 URL 參數生成 QR 碼。使用 API 時，您的 QR 內容會在我們的服務器上進行處理以呈現圖像，但不會存儲或記錄。', '我們使用 Google AdSense 進行廣告，並可能使用分析服務。這些服務通過 cookie 和類似技術收集信息。本政策解釋了收集哪些數據、如何使用這些數據以及您的權利。'],
    },
    {
      heading: '我們收集的信息',
      bullets: ['您提供的信息：如果您通過電子郵件或我們的聯繫表格聯繫我們，我們會收集您的姓名、電子郵件地址和消息內容。', '自動收集的信息：我們的託管提供商 (Netlify)、廣告合作夥伴和分析服務可能會收集：IP 地址、瀏覽器類型和版本、操作系統、設備類型、引用 URL、訪問的頁面、網站停留時間和大致地理位置。', '第三方 cookie：我們的廣告合作夥伴 (Google AdSense) 使用 cookie 和類似技術來提供和衡量廣告。 ANQR 本身不設置任何第一方 cookie。'],
    },
    {
      heading: 'Cookie 和第三方技術',
      paragraphs: ['ANQR 不設置任何第一方 cookie。您的偏好設置（例如深色模式）存儲在您的設備本地，不會傳輸到任何服務器。', '但是，我們的廣告合作夥伴 (Google AdSense) 和託管提供商可能會使用 cookie 和類似的跟踪技術：'],
      bullets: ['廣告 cookie（第三方）：由 Google AdSense 和廣告合作夥伴設置，用於提供相關廣告、衡量廣告效果並了解用戶興趣。這些 cookie 可能會跟踪您在不同網站上的活動。', '分析 cookie（第三方）：我們的託管提供商或分析服務可能會使用它來收集匿名使用數據。'],
    },
    {
      heading: 'Google AdSense 和廣告',
      paragraphs: ['我們通過 Google AdSense 展示廣告。 Google 及其合作夥伴使用 cookie 根據您在此網站和其他網站上的瀏覽歷史記錄提供廣告（基於興趣的廣告）。', '了解 Google 如何使用您的信息：https://policies.google.com/technologies/partner-sites', '管理廣告個性化：https://adssettings.google.com', '通過網絡廣告計劃選擇退出：https://optout.networkadvertising.org', '通過數字廣告聯盟選擇退出：https://optout.aboutads.info'],
    },
    {
      heading: '我們如何使用信息',
      bullets: ['回复您的詢問並提供支持。', '通過我們的廣告合作夥伴展示相關廣告。', '分析網站使用情況並改進我們的服務。', '檢測、預防和解決欺詐、濫用和安全問題。', '遵守法律義務。'],
    },
    {
      heading: '第三方服務',
      bullets: ['Google AdSense：接收數據以提供和衡量廣告。', '分析提供商：接收匿名使用數據。', 'Netlify（託管）：處理請求並可能記錄 IP 地址。', '我們不會出售您的個人信息。但是，根據 CCPA，與廣告合作夥伴共享數據可能被視為"銷售"（見下文）。'],
    },
    {
      heading: '數據保留',
      bullets: ['聯繫提交：最長 2 年。', '服務器日誌：最長 30 天（託管提供商）。', '分析數據：最長 26 個月（匿名）。', '廣告 cookie：通常為 13 個月（因合作夥伴而異）。'],
    },
    {
      heading: '您在 GDPR 下的權利（歐洲經濟區用戶）',
      paragraphs: ['如果您位於歐洲經濟區，則根據《通用數據保護條例》，您擁有以下權利：'],
      bullets: ['訪問權：索取我們持有的有關您的個人數據的副本。', '更正權：要求更正不准確的數據。', '刪除權：請求刪除您的數據（"被遺忘權"）。', '限制處理的權利：請求限制我們如何使用您的數據。', '數據可移植性權利：以可移植格式請求您的數據。', '反對權：反對處理，包括直接營銷。', '撤回同意的權利：在處理基於同意的情況下隨時撤回同意。', '提出投訴的權利：向您的數據保護機構提出投訴。'],
    },
    {
      heading: 'GDPR 法律依據',
      paragraphs: ['我們根據以下基礎處理數據： (a) 同意 - 個性化廣告（由我們的廣告合作夥伴管理）； (b) 合法利益 - 用於分析、安全和改進； (c) 合同 - 回應詢問。', '要行使您的權利，請聯繫 email@anqr.link。我們會在 30 天內回复。'],
    },
    {
      heading: '您根據 CCPA 享有的權利（加利福尼亞州用戶）',
      bullets: ['知情權：索取有關所收集數據、來源、目的和第三方的信息。', '刪除權：請求刪除您的個人信息。', '選擇退出的權利：選擇退出個人信息的"出售"（與廣告合作夥伴共享可能符合條件）。', '不受歧視的權利：我們不會因您行使權利而歧視您。'],
    },
    {
      heading: '收集的 CCPA 類別',
      paragraphs: ['類別：標識符（IP 地址、設備 ID）、互聯網活動（瀏覽、廣告交互）、地理位置（近似）、推論（瀏覽興趣）。', '要行使權利或選擇退出：email@anqr.link 或調整 cookie 設置。'],
    },
    {
      heading: '國際轉賬',
      paragraphs: ['您的信息可能會被轉移到具有不同數據保護法的國家/地區，包括美國。我們使用適當的保障措施，例如標準合同條款。'],
    },
    {
      heading: '兒童隱私',
      paragraphs: ['ANQR 不針對 13 歲以下（或歐洲經濟區 16 歲）以下的兒童。我們不會故意收集兒童的數據。如果您認為兒童已提供信息，請聯繫 email@anqr.link。'],
    },
    {
      heading: '安全性',
      paragraphs: ['我們使用適當的技術和組織措施來保護數據，包括 HTTPS 加密。然而，沒有任何互聯網傳輸是 100% 安全的。'],
    },
    {
      heading: '請勿追踪',
      paragraphs: ['在可行的情況下，我們尊重"不跟踪"瀏覽器信號，但廣告合作夥伴可能不會響應 DNT。'],
    },
    {
      heading: '本政策的變更',
      paragraphs: ['我們可能會定期更新本政策。 "最後更新"日期表示最新版本。重大變更可以通過網站橫幅傳達。'],
    },
    {
      heading: '聯繫我們',
      paragraphs: ['對於隱私問題或行使您的權利：email@anqr.link 或使用我們的聯繫頁面。我們會在 30 天內回复隱私請求。'],
    },
    {
      heading: '完整的隱私政策',
      paragraphs: ['本頁提供了我們的隱私慣例的摘要。如需完整的、具有法律約束力的隱私政策，其中包含有關數據處理、您的權利以及我們在 GDPR、CCPA 和其他隱私法下的義務的完整詳細信息，請查看我們由 iubenda 託管的完整政策。'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: '查看 iubenda 上的完整隱私政策',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
