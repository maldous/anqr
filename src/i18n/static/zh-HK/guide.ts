import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR 用戶指南',
  description: '使用 ANQR 創建 QR 碼的完整指南。',
  lastUpdated: '2026 年 2 月 1 日',
  breadcrumb: ['指南'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: '打開發電機', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '瀏覽學習文章', type: 'learn' },
    { href: '/examples?lang=${lang}', label: '查看二維碼示例', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: '開始使用',
      paragraphs: [
        'ANQR 是一種採用客戶端優先方法的 QR 代碼生成器。默認情況下，二維碼是在您的瀏覽器本地生成的 - 無需帳戶，並且您的數據保持私密。對於專業嵌入，您還可以使用服務器端 API。',
        '該界面具有三個界面級別：基本、高級和專業。使用標題中的選項卡選擇您的級別。每個級別都會解鎖額外的功能，同時保持界面專注於您的需求。',
      ],
      bullets: [
        '基本：使用純文本/URL 內容和圖像疊加簡單創建 QR 碼。',
        '高級：QR 編碼選項、渲染樣式、動畫、輸出格式、擴展內容類型和疊加自定義。',
        '專業：水印、元數據、分享、安全分析、支付二維碼、企業特性。',
      ],
      links: [{ href: '/?lang=${lang}', label: '打開發電機', type: 'generator' }],
    },
    {
      heading: '快速入門',
      paragraphs: ['要創建您的第一個二維碼：'],
      bullets: [
        '1. 從內容類型下拉列表中選擇內容類型（URL、文本、WiFi 等）。',
        '2. 在提供的字段中輸入您的數據。',
        '3. （可選）自定義顏色、樣式並添加覆蓋圖像。',
        '4. 單擊"導出"以將 QR 碼下載為 PNG、GIF、WebP 或 SVG。',
      ],
      links: [
        { href: '/?lang=${lang}', label: '直接在 ANQR 生成器中嘗試此配置。', type: 'generator' },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: '基本特點',
      paragraphs: [
        '基本級別提供了一個簡化的界面，用於創建帶有有效負載內容和圖像覆蓋的 QR 碼。這是最簡單的入門方法。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '內容類型（基本）',
      paragraphs: [
        '純文本：對任何文本進行編碼，直至 QR 碼容量限制。非常適合短消息、代碼或標識符。',
        'URL：對網址進行編碼。掃描二維碼將打開 URL。支持 http:// 和 https:// 協議。',
      ],
    },
    {
      heading: '圖像疊加（基本）',
      paragraphs: ['上傳圖像（JPG、PNG、GIF、WebP）以與您的二維碼混合。基本疊加功能包括：'],
      bullets: [
        '從文件上傳：從您的設備中選擇圖像。',
        '從 URL 加載：輸入圖像 URL（必須允許 CORS）。',
        '中心徽標：將圖像置於中心，依靠糾錯。',
        '混合：圖像與 QR 圖案的簡單 Alpha 混合。',
        '強度：控制疊加層對 QR 碼的影響程度 (0-100%)。',
        '顏色模式：全彩、灰度或黑白。',
        '保留查找器圖案：保持角圖案不被修改，以實現可靠的掃描。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-5', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: '高級功能',
      paragraphs: [
        '高級級別解鎖 QR 編碼選項、渲染樣式、動畫、輸出格式、擴展內容類型和高級疊加自定義。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR 編碼設置',
      paragraphs: [
        '版本：QR 碼有 1-40 版本，較高版本可容納更多數據，但也更大。設置為 0（自動）可讓 ANQR 選擇適合您內容的最小版本。',
        '糾錯：確定 QR 碼在保持可掃描的同時可以承受多少損壞。',
      ],
      bullets: [
        'L（低）：7% 糾錯 - 最小尺寸，最少冗餘。',
        'M（中）：15% 誤差修正 - 平衡選項。',
        'Q（四分位數）：25% 糾錯 - 適合打印代碼。',
        'H（高）：30% 糾錯 - 最適合具有覆蓋或惡劣條件下的代碼。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '安靜區（邊緣）',
      paragraphs: [
        '安靜區域是二維碼周圍的空白區域。掃描儀需要這個邊距來檢測代碼的開始位置。標準推薦至少4個模塊。減少到 4 以下可能會導致掃描問題。',
      ],
    },
    {
      heading: '模塊風格',
      paragraphs: ['模塊是構成 QR 碼的各個方塊。 ANQR 提供五種樣式：'],
      bullets: [
        '方形：經典的 QR 外觀，帶有尖角。',
        '圓角：軟化邊角，打造更友好的外觀。',
        '點：現代美學的圓形模塊。',
        '菱形：45° 旋轉方形，呈現獨特圖案。',
        '連接：模塊相鄰時合併，形成有機形狀。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '查找器圖案樣式',
      paragraphs: ['查找器圖案是 QR 角上的三個大方塊，可幫助掃描儀定位代碼。可用款式：'],
      bullets: [
        '方形：標準方角。',
        '圓角：與圓角模塊風格相匹配的軟化角。',
        '圓形：用於點式代碼的圓形查找器圖案。',
      ],
    },
    {
      heading: '對齊和時序模式',
      paragraphs: [
        '對齊圖案出現在較大的 QR 碼（版本 2+）中，以幫助糾正失真。計時圖案是連接取景器圖案的交替線。',
      ],
      bullets: ['對齊方式：匹配查找器、方形、圓形或圓形。', '計時風格：匹配模塊、實線或虛線。'],
    },
    {
      heading: '顏色',
      paragraphs: [
        '前景：QR 模塊的顏色。黑色 (#000000) 是標準顏色，但任何深色都可以。',
        '背景：背景顏色。白色 (#ffffff) 是標準配置。確保與前景有足夠的對比度。',
        '透明背景：完全刪除背景以在彩色表面上使用。確保表面提供足夠的對比度。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '模塊尺寸和間隙',
      paragraphs: [
        '模塊大小：控制每個模塊渲染的大小（以像素為單位）。值越大，代碼越大，越容易掃描。',
        '模塊間隙：以百分比形式增加模塊之間的空間。小間隙 (5-15%) 可以提高某些條件下的可掃描性，但間隙過大會降低可靠性。',
      ],
    },
    {
      heading: '輸出設置',
      paragraphs: ['格式：根據用例選擇導出格式。'],
      bullets: [
        'PNG：無損光柵格式，適合大多數用途。最適合印刷和數字。',
        'WebP：文件大小較小的現代格式。適合網絡使用。',
        'GIF：動畫 QR 碼必需。支持透明度。',
        'SVG：無限縮放的矢量格式。最適合大字體或需要編輯代碼時。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-3', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '輸出尺寸',
      paragraphs: [
        '寬度/高度：設置輸出尺寸（以像素為單位）。對於打印，根據 DPI 進行計算（例如，1 英寸處的 300 DPI = 300 像素）。尺寸越大，遠距離掃描越可靠。',
      ],
    },
    {
      heading: '動畫設置（高級）',
      paragraphs: ['控制動畫二維碼行為：'],
      bullets: [
        '速度：動畫幀速率（以毫秒為單位）。',
        '循環：連續或單次播放動畫。',
        'Bounce：乒乓球動畫方向。',
        '開始幀：從特定幀開始動畫。',
        '最大幀數：限制動畫中的總幀數。',
        '幀步：跳過幀以獲得更快的動畫。',
        '插值：幀之間無、交叉淡入淡出或變形。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-4', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '內容類型（高級）',
      paragraphs: ['高級級別解鎖額外的有效負載格式：'],
      bullets: [
        '電話號碼 (tel:)：創建可呼叫的電話鏈接。',
        '電子郵件 (mailto:)：打開帶有可選主題和正文的電子郵件客戶端。',
        'SMS：預先填寫到電話號碼的短信。',
        'vCard：包含姓名、組織、電話、電子郵件、地址的完整聯繫人卡。',
        'MeCard：在日本流行的緊湊型聯繫人格式。',
        'BizCard：傳統名片格式。',
        '地理位置：在地圖中打開的 GPS 坐標。',
        'WiFi：自動連接的網絡憑據（SSID、密碼、安全類型）。',
        '日曆事件：帶有標題、位置、日期/時間的 iCalendar 格式。',
        '活動回复：鏈接到活動註冊頁面。',
        '日曆訂閱：訂閱 ICS/WebCal 源。',
        '文件/文檔 URL：可下載文件的直接鏈接。',
        '雲存儲鏈接：Google Drive、Dropbox、OneDrive 等的鏈接。',
        '社交資料：LinkedIn、Twitter、Instagram 等的鏈接。',
        '消息鏈接：WhatsApp、Telegram、Signal 深層鏈接。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '高級疊加功能',
      paragraphs: ['附加疊加功能：'],
      bullets: [
        '裁剪：啟用裁剪以選擇圖像的方形區域。',
        '半色調：基於圖像亮度的經典印刷式點圖案。',
        '抖動：誤差擴散抖動以實現詳細再現。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '疊加混合模式（高級）',
      paragraphs: ['高級級別的其他混合模式：'],
      bullets: [
        '子像素：將每個模塊劃分為子像素以獲得更高的細節。',
        '藍色噪聲：使用藍色噪聲抖動實現無偽影圖案。',
        '馬賽克：基於平舖的效果，保留圖像結構。',
        '間隙填充：將圖像放置在模塊之間的間隙中。',
        '亮度：根據圖像亮度改變模塊尺寸。',
        '雙色調：將圖像映射為兩種顏色以形成鮮明的對比。',
      ],
    },
    {
      heading: '疊加強度',
      paragraphs: [
        '控制疊加層對 QR 碼的影響程度 (0-100%)。較高的值顯示更多圖像細節，但可能會降低可掃描性。從 70% 左右開始，然後根據測試進行調整。',
      ],
      links: [
        { href: '/learn?lang=${lang}#section-5', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '色彩模式',
      paragraphs: ['疊加圖像的處理方式：'],
      bullets: ['全彩：保留原始圖像顏色。', '灰度：轉換為黑白色調。', '黑白：高對比度二進制轉換。'],
    },
    {
      heading: '保留查找器模式',
      paragraphs: ['啟用後，保持三個角點查找器圖案不被覆蓋層修改。強烈建議進行可靠的掃描。'],
    },
    {
      heading: '圖像預處理',
      paragraphs: ['在混合之前對疊加圖像應用濾鏡。這些調整可以改善圖像在最終 QR 碼中的顯示方式。'],
      bullets: [
        '亮度（-100 至 +100）：使圖像變亮或變暗。',
        '對比度（-100 至 +100）：增加或減少色調範圍。',
        'Gamma（0.2 至 3.0）：非線性亮度調整。低於 1 的值會使中間色調變亮，高於 1 會使中間色調變暗。',
        '飽和度（-100 至 +100）：顏色強度。 -100 為灰度，+100 為過飽和。',
        '色相旋轉（0-360°）：圍繞色輪移動所有顏色。',
        '模糊（0-20px）：柔化圖像細節。',
        '銳化 (0-100%)：增強邊緣和細節。',
        '海報化（0-16 級）：降低海報效果的顏色級別。',
        '閾值 (0-255)：在截止點轉換為二值黑/白。',
        '邊緣檢測：Sobel 或 Canny 算法僅顯示邊緣。',
        '反轉：反轉所有顏色。',
      ],
    },
    {
      heading: '貼合模式',
      paragraphs: ['疊加圖像如何適合二維碼區域：'],
      bullets: [
        '封面：圖像填充整個區域，根據需要進行裁剪。',
        '包含：整個圖像可見，可能有邊距。',
        '拉伸：圖像扭曲以精確填充。',
      ],
    },
    {
      heading: '變換選項',
      paragraphs: ['旋轉：以 90° 增量旋轉疊加層。', '翻轉 X/Y：水平或垂直鏡像圖像。'],
    },
    {
      heading: '抖動算法',
      paragraphs: [
        '抖動將連續色調圖像轉換為 QR 碼可以表示的圖案。使用抖動、藍色噪聲或真實抖動混合模式時可用。',
      ],
      bullets: [
        '誤差擴散：經典的弗洛伊德-斯坦伯格風格。將量化誤差傳播到相鄰像素。',
        '有序 (Bayer)：對規則模式使用閾值矩陣。',
        '簇點：模擬半色調打印。',
        'Void & Cluster：優化有序抖動。',
        '藍色噪聲：視覺上令人愉悅的隨機圖案。',
        '藍色噪聲閾值：使用藍色噪聲紋理進行抖動的閾值。',
        '白噪聲：隨機閾值抖動。',
        '高斯/三角噪聲：具有不同分佈的噪聲。',
        '藍色噪聲+誤差擴散：兩種技術的混合。',
        '屏蔽藍色噪聲：類似屏幕的藍色噪聲模式。',
        '感知：亮度加權以獲得更好的視覺效果。',
        '邊緣感知：在抖動過程中保留圖像邊緣。',
        '自適應閾值：局部自適應閾值。',
        '時間藍色噪聲：對於動畫 GIF，每幀的模式各不相同。',
      ],
    },
    {
      heading: '擴散核',
      paragraphs: ['使用誤差擴散抖動時，選擇誤差的分佈方式：'],
      bullets: [
        'Floyd-Steinberg：經典的 4 鄰域擴散。不錯的一般選擇。',
        'Jarvis-Judice-Ninke：12-鄰居，更平滑但更慢。',
        'Stucki：與JJN類似，只是權重不同。',
        'Burkes：簡化的 JJN，更快。',
        'Sierra：平衡質量和速度的內核系列。',
        '阿特金森：光漫射，保留細節，但可能有顆粒感。',
      ],
    },
    {
      heading: '抖動強度',
      paragraphs: [
        '控制應用的抖動量 (0-100%)。較低的值保留更多的原始圖案，較高的值顯示更多的圖像細節。',
      ],
    },
    {
      heading: '子像素設置',
      paragraphs: ['使用子像素混合模式時：'],
      bullets: [
        '網格大小：每個模塊 2×2、3×3 或 4×4 子像素。更高=更多細節。',
        '中心規則：嚴格要求中心子像素與模塊匹配。半色調中心允許變化。',
        '中性色：用於未確定的子像素的顏色。',
        'Finder Override：如何渲染查找器圖案（實體或風格化）。',
      ],
    },
    {
      heading: '半色調設置',
      paragraphs: ['使用半色調混合模式時：'],
      bullets: [
        '單元尺寸：每個模塊或 N×N 網格。',
        '點形狀：圓形、方形或線形。',
        '亮度曲線：線性、S 曲線或伽瑪。',
      ],
    },
    {
      heading: '雙色調顏色',
      paragraphs: ['使用雙色調混合模式時，設置陰影顏色（黑暗區域）和高光顏色（明亮區域）。'],
    },
    {
      heading: 'GIF 動畫設置',
      paragraphs: ['使用動畫 GIF 疊加時：'],
      bullets: [
        '使用幀延遲：尊重原始 GIF 時序。',
        '最大 FPS：限制幀速率 (1-60 fps)。',
        '處置處理：尊重或簡化框架處置方法。',
      ],
    },
    {
      heading: '高級渲染選項',
      paragraphs: ['附加渲染控件：'],
      bullets: [
        '間隙模式：無、插入、描邊或負空間間隙樣式。',
        '圓角半徑：模塊的圓角百分比。',
        '梯度：模塊上無、線性、徑向或圓錐梯度。',
        '眼睛外部/內部樣式：取景器圖案環的獨立樣式。',
        '點旋轉：旋轉菱形/點模塊。',
        '眼睛比例：調整取景器圖案的大小。',
        '框架樣式：添加裝飾框架（圓形框架、貼紙、標籤）。',
        '框架文本：添加"掃描我！"等文本到幀。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '高級 QR 編碼',
      paragraphs: ['微調 QR 編碼：'],
      bullets: [
        '編碼模式：自動、數字、字母數字、字節/UTF-8 或漢字。',
        '強制執行最小靜區：確保至少 4 個模塊餘量。',
        '屏蔽模式：自動（最佳），或手動選擇模式 0-7 來控制模塊分配。不同的模式在編碼相同的數據時會產生不同的視覺外觀。',
        '字符編碼：ISO-8859-1（默認為 Latin-1）、UTF-8（包括表情符號的完整 Unicode）或 Shift-JIS（日語）。根據您的內容的字符要求進行選擇。',
      ],
    },
    {
      heading: '高級輸出選項',
      paragraphs: ['附加導出設置：'],
      bullets: [
        '文件名：下載的自定義文件名。',
        'GIF 調色板大小：GIF 輸出中的 2-256 種顏色。',
        'GIF 量化器：Median Cut、NeuQuant 或 Octree 色彩還原。',
        'GIF 抖動：關閉、Floyd-Steinberg 或有序。',
        'GIF 透明顏色：將顏色設置為透明。',
        'SVG True Vector：使用路徑而不是嵌入光柵。',
        'SVG 形狀精度：像素或精確路徑渲染。',
        'SVG 嵌入光柵疊加：包括疊加作為嵌入圖像。',
        '背景覆蓋：在輸出中強制使用特定的背景顏色。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '驗證選項',
      paragraphs: ['輸入處理設置：'],
      bullets: [
        '驗證輸入：編碼前檢查內容格式。',
        '修剪空白：刪除前導/尾隨空格。',
        '標準化換行符：將所有行結尾轉換為 LF。',
        '最大長度保護：如果內容超出 QR 容量，則發出警告。',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: '專業特色',
      paragraphs: ['專業級添加了水印、元數據、共享選項、安全分析、支付二維碼和企業功能。'],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '水印',
      paragraphs: ['為您的二維碼添加水印：'],
      bullets: [
        '種類：文本、圖像或圖案水印。',
        '位置：中心、角落、邊緣、後面或安靜區域。',
        '不透明度：水印透明度（0-100%）。',
        '混合模式：正常、正片疊底、濾色或疊加混合。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '元數據',
      paragraphs: ['在導出的文件中嵌入元數據：'],
      bullets: [
        '標題、作者、版權、許可證、說明字段。',
        '創建時間：嵌入生成時間戳。',
        '自定義鍵值：添加任意元數據對。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '分享',
      paragraphs: ['分享一下你的二維碼配置：'],
      bullets: [
        '直接鏈接：使用您當前的設置生成可共享的 URL。',
        '嵌入 HTML：獲取網站的嵌入代碼。',
        '編碼參數：包含共享 URL 中的所有設置。',
        '注意：本地文件中的疊加圖像無法通過 URL 共享。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-7', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '安全分析',
      paragraphs: ['確保 QR 碼保持可掃描：'],
      bullets: [
        '安全模式：關閉、平衡或嚴格掃描要求。',
        '最小模塊尺寸：每個模塊的最小像素尺寸。',
        '最小安靜區：最小保證金模塊。',
        '鎖定查找器/計時/對齊/格式/版本：保護特定元素。',
        'ECC 的最大疊加強度：基於糾錯級別的自動強度限制。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-5', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '內容類型（專業）',
      paragraphs: ['專業級增加支付和企業內容類型：'],
      bullets: [
        'EPC/SEPA (EU)：歐洲銀行轉賬二維碼，包含 IBAN、BIC、金額、參考。',
        'UPI（印度）：帶有 VPA、收款人姓名、金額的統一支付接口。',
        'PayNow（新加坡）：使用UEN或手機號碼進行新加坡快速支付。',
        'PromptPay（泰國）：泰國國家支付系統。',
        'PIX（巴西）：使用 PIX 密鑰進行巴西即時付款。',
        '加密貨幣：比特幣、以太坊、萊特幣支付地址，金額可選。',
        '營銷活動鏈接：具有完整 UTM 參數（營銷標籤）跟踪的 URL。',
        '短鏈接：與動態/可跟踪 QR 碼的 URL 縮短器一起使用。',
        'GS1 數字鏈接：帶有 GTIN、序列號、批次、有效期的產品標識。',
        '應用程序深度鏈接：具有自定義方案的 iOS/Android 應用程序深度鏈接。',
        '自定義格式：未經格式化或驗證的原始數據。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-2', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: '高級模式下與語言相關的付款',
      paragraphs: [
        '使用高級模式時，ANQR 會自動顯示與您所選語言相關的付款方式。例如，越南語用戶看到 VietQR，泰國語用戶看到 PromptPay，印度語用戶看到 UPI 和 BharatQR。全球支付方式（加密貨幣、PayPal、Cash App）適用於所有語言。專業模式解鎖所有支付標準，無論語言如何。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '歐洲支付標準',
      bullets: [
        'EPC/SEPA（歐盟）：歐洲銀行轉賬二維碼遵循 EPC 二維碼標準。支持 IBAN、BIC（國內可選）、歐元金額以及結構化或非結構化付款參考。在 SEPA 區域使用，包括歐盟國家以及瑞士、挪威、冰島、列支敦士登、摩納哥和聖馬力諾。',
        '瑞士 QR 賬單：遵循六項實施指南的瑞士支付標準。支持瑞士法郎和歐元、二維碼參考 (QRR)、債權人參考 (ISO 11649)、結構化債權人/債務人地址和賬單信息。自 2022 年起瑞士發票需要提供。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '印度支付標準',
      bullets: [
        'UPI（印度）：遵循 NPCI 深度鏈接規範的統一支付接口。支持VPA（虛擬支付地址）、收款人姓名、印度盧比金額、交易備註、參考ID、商戶類別代碼和交易模式。',
        'BharatQR（印度）：支持 UPI 和卡支付的統一 QR 標準。將 UPI VPA 與卡 PAN 相結合，以實現最大兼容性。包括商家名稱、城市、MCC、GST 詳細信息和發票/參考號。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '東南亞支付標準',
      bullets: [
        'PayNow（新加坡）：使用 EMVCo QR 規範和 SGQR 配置文件的新加坡快速支付系統。支持 UEN（商業登記）、手機號碼或 NRIC 作為代理標識符。包括金額可編輯性標誌和到期日期。',
        'PromptPay（泰國）：遵循泰國銀行 EMV 配置文件的泰國國家支付系統。支持手機號碼、身份證、稅號、電子錢包ID、賬單支付等多種參考字段。',
        'QRIS（印度尼西亞）：快速響應代碼印度尼西亞標準。基於EMV的國家支付標準，支持商戶ID、NMID（國家商戶ID）、商戶標準分類和便利費（固定或百分比）。',
        'DuitNow（馬來西亞）：馬來西亞即時支付系統。支持多種代理類型，包括身份證號碼、手機號碼、護照號碼、軍隊身份證號碼和商業登記號碼。',
        'VietQR（越南）：越南銀行間轉賬標準。需要銀行 BIN（NAPAS 標識）和帳號。支持不同傳輸類型的多個服務代碼（QRPUSH、QRIBFTTA、QRIBFTTC）。',
        'QR Ph（菲律賓）：菲律賓 InstaPay 和 PESONet 的 QR 支付標準。使用帶有商戶標識的帳號進行 P2M（個人對商戶）交易。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '東亞支付標準',
      bullets: [
        'TWQR（台灣）：台灣二維碼支付標準。支持商戶 ID、稅號和新台幣金額。',
        'HKQR/FPS（香港）：香港快速支付系統二維碼。支持FPS ID、手機號碼或電子郵件作為付款標識符。金額以港幣計算。',
        'JPQR（日本）：日本統一二維碼支付標準。使用商店 ID 來識別日元金額的商戶。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '其他地區支付標準',
      bullets: [
        'PIX（巴西）：遵循 BR 代碼規範的巴西中央銀行即時支付系統。支持 PIX 密鑰（CPF、CNPJ、電子郵件、電話或隨機密鑰）、商家名稱/城市、交易 ID 和 BRL 金額。',
        'AusPayNet/NPP PayID（澳大利亞）：澳大利亞新支付平台 PayID 系統。支持 PayID 類型（電子郵件、手機、ABN、組織 ID）或傳統 BSB + 帳號。商戶名稱是可選的，因為付款人可以從 NPP 查找中看到註冊名稱。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '加密貨幣支付',
      bullets: [
        '比特幣/萊特幣 (BIP-21)：標準加密貨幣支付 URI，包含錢包地址、可選金額和標籤。與所有主要的比特幣和萊特幣錢包兼容。',
        '閃電網絡（BOLT11）：閃電網絡支付發票。粘貼 BOLT11 編碼的發票字符串，以最低的費用進行即時比特幣付款。',
        '以太坊 (EIP-681)：支持本機 ETH 傳輸和 ERC-20 代幣傳輸的以太坊交易請求 URI。包括用於多網絡支持（Mainnet、Polygon、BSC、Arbitrum、Optimism、Avalanche）的鏈 ID、gas 參數和合約函數調用。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '支付鏈接服務',
      bullets: [
        'PayPal.Me：帶有用戶名和可選預填金額的 PayPal 付款鏈接。收件人可以通過 PayPal 餘額、銀行卡或銀行賬戶付款。',
        '現金應用程序：現金應用程序付款鏈接使用 $cashtag 和可選金額。在美國流行的點對點支付。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '通用 EMV 二維碼',
      bullets: [
        'EMV 通用：為未特別列出的支付方案創建自定義 EMV 商家呈現模式二維碼。配置商家名稱、城市、國家/地區代碼 (ISO 3166-1)、貨幣代碼（ISO 4217 數字）、MCC、小費/便利費選項和其他數據字段。對於測試或自定義集成很有用。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: '疊加混合模式（專業）',
      paragraphs: ['專業級別的其他混合模式：'],
      bullets: [
        '像素化：像素化疊加效果。',
        '輪廓：僅顯示輪廓的邊緣檢測疊加。',
        '波浪：波浪形失真效果。',
        '子像素大小：基於圖像的可變子像素大小。',
        '真實抖動：具有有序矩陣選擇的高級抖動。',
        '極端：最大圖像可見度，可能會影響可掃描性。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '保護設置',
      paragraphs: ['細粒度控制哪些 QR 元素免受覆蓋修改：'],
      bullets: [
        '保留計時：保持計時模式不被修改。',
        '保留對齊方式：保持對齊方式不變。',
        'Protect Format Info：屏蔽格式信息模塊。',
        '保護版本信息：屏蔽版本信息模塊。',
      ],
    },
    {
      heading: 'ECC 感知模式',
      paragraphs: ['根據糾錯能力智能分配疊加強度。系統分析哪些模塊可以修改，同時保持可掃描性。'],
      bullets: [
        '風險預算：使用糾錯能力的百分比（0-100%）。',
        '更高的預算=更明顯的覆蓋，但可掃描性風險更高。',
        '較低的預算=更安全的掃描但不那麼明顯的覆蓋。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '專業渲染選項',
      paragraphs: ['高級渲染控件：'],
      bullets: [
        '清晰邊緣：使用像素化圖像渲染來獲得清晰的模塊邊緣。',
        '像素對齊：地板、圓形或天花板像素對齊。',
        '每個模塊的顏色模式：純色、按亮度、按位置、按疊加、按簇。',
        '調色板：為每個模塊著色定義自定義調色板。',
        '對比度保護：確保顏色之間的最小對比度。',
        '最小對比度：WCAG 式對比度要求（1:1 至 21:1）。',
        '額外邊界模塊：安靜區域之外的額外邊界。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '專業輸出選項',
      paragraphs: ['企業導出設置：'],
      bullets: [
        'DPI：設置打印分辨率（72-600 DPI）。建議打印時使用 300 DPI。',
        '包括靜區：在輸出維度中切換靜區。',
        '導出為附加文件：與主要格式一起生成 PDF。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '動畫設置（專業）',
      paragraphs: ['其他專業動畫功能：'],
      bullets: [
        '臨時抖動：關閉、藍色噪聲或閃爍安全每幀抖動。',
        '圖案：無、脈衝、波浪、掃描線、閃光或漂移效果。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-4', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API參考',
      paragraphs: [
        'ANQR 提供服務器端 API，用於通過 URL 參數生成 QR 碼。這非常適合在網站、電子郵件、文檔或自動化工作流程中嵌入 QR 碼，而無需客戶端 JavaScript。',
        '基本網址：https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: '查看二維碼示例', type: 'example' }],
    },
    {
      heading: '基本參數',
      paragraphs: ['必填和常用參數（參數名不翻譯）：'],
      bullets: [
        'data（必填）：要在 QR 碼中編碼的內容。 URL 對特殊字符進行編碼。',
        'size：圖像大小（以像素為單位）（默認值：400，最大：2000）。如果未指定 w/h，則使用。',
        'w、h：輸出寬度和高度（以像素為單位）。覆蓋尺寸參數。',
        'format：輸出格式 - png、webp 或 gif（默認值：png）。',
        'ec：糾錯級別 - L、M、Q 或 H（默認值：H）。',
        'fg：前景色為十六進制，不帶#（默認值：000000）。',
        'bg：背景顏色為十六進制，不帶#（默認值：ffffff）。',
        '透明：設置為 1 表示透明背景。',
        'margin：模塊中的安靜區域（默認值：4）。',
      ],
    },
    {
      heading: '造型參數',
      paragraphs: ['模塊和模式樣式：'],
      bullets: [
        'style：模塊樣式-方形、圓形、圓點、菱形、相連。',
        'Finder：Finder 圖案樣式 - 方形、圓形、圓形。',
        'align：對齊圖案樣式 - match_finder、方形、圓形、圓形。',
        '計時：計時模式樣式 - match_module、實線、虛線。',
        'radius：圓角半徑百分比 0-100。',
        '間隙：模塊間隙百分比0-50。',
        'gapMode：間隙模式 - 無、插入、描邊、負空間。',
        'eyeOuter、eyeInner：眼睛樣式 - 方形、圓形、圓形。',
        'eyeScale：眼睛比例百分比（默認值：100）。',
        'grad：漸變類型 - 無、線性、徑向、圓錐形。',
        'gradAngle：線性漸變的漸變角度。',
        'gradStops：漸變停止點為 color1,pos1,color2,pos2,...（例如 ff0000,0,0000ff,1）。',
      ],
    },
    {
      heading: '疊加參數',
      paragraphs: ['圖像疊加選項（疊加圖像在服務器端獲取）：'],
      bullets: [
        'img：覆蓋圖像的 URL（必須可公開訪問）。',
        '模式：疊加模式 - 中心、半色調、混合、亮度、馬賽克、抖動、藍噪聲、子像素。',
        '強度：疊加強度 0-100（默認值：100）。',
        'colorMode：疊加顏色模式 - 彩色、灰度、黑白。',
        '貼合：覆蓋層如何貼合 - 覆蓋、包含、拉伸。',
        'rot：以度為單位的疊加旋轉。',
        'FlipX、flipY：設置為 1 翻轉疊加。',
        'keepFinders：保留查找器模式（默認值：1）。',
        'keepTiming、keepAlign：設置為 1 以保留計時/對齊模式。',
      ],
    },
    {
      heading: '預處理參數',
      paragraphs: ['應用於疊加的圖像預處理：'],
      bullets: [
        '亮度：調整 -100 至 100（默認值：0）。',
        '對比度：調整 -100 到 100（默認值：0）。',
        'gamma：值 0.1 到 3（默認值：1）。',
        '飽和度：調整 -100 至 100（默認值：0）。',
        '色調：色調旋轉度數。',
        '模糊：以像素為單位模糊。',
        '銳化：銳化量 0-100。',
        '海報化：海報化級別。',
        '閾值：二進制閾值 0-255。',
        '邊緣：邊緣檢測 - 關閉、sobel、canny。',
        'invert：設置為 1 以反轉顏色。',
      ],
    },
    {
      heading: '水印參數',
      paragraphs: ['為生成的二維碼添加水印：'],
      bullets: [
        'wmEn：設置為 1 以啟用水印。',
        'wmKind：水印類型 - 文本、圖像、圖案。',
        'wmText：水印文本（URL 編碼）。',
        'wmImg：水印圖像的 URL。',
        'wmPos：位置 - 中心、角落、邊緣、後面、quiet_zone。',
        'wmOpacity：不透明度 0-100（默認值：50）。',
        'wmBlend：混合模式 - 正常、正片疊底、濾色、疊加。',
      ],
    },
    {
      heading: '動畫參數',
      paragraphs: ['對於動畫 GIF 輸出（需要 format=gif）：'],
      bullets: [
        'animPattern：動畫模式 - 無、脈衝、波形、掃描線、閃光、漂移、顏色循環。',
        'animFrames：幀數 1-60（默認值：24）。',
        'animSpeed：幀延遲（以毫秒為單位）10-1000（默認值：100）。',
        'animSeed：動畫的隨機種子。',
        'easing：動畫緩動 - 線性、ease_in、ease_out、ease_in_out、bounce。',
      ],
    },
    {
      heading: '輸出參數',
      paragraphs: ['輸出格式選項：'],
      bullets: [
        '質量：WebP 質量 0-1（默認值：0.9）。',
        'webpQ：WebP 質量 0-100（默認值：90）。',
        'gifColors：GIF 調色板大小 2-256（默認值：256）。',
        'dpi：PNG 的輸出 DPI（默認值：72）。',
        'metaTitle、metaAuthor、metaCopy、metaDesc：PNG 元數據字段。',
      ],
    },
    // Crop Parameters
    {
      heading: '作物參數',
      paragraphs: ['疊加圖像裁剪選項：'],
      bullets: [
        'cropEn：啟用疊加裁剪 0/1（默認值：0）。',
        'cropX：裁剪中心 X 作為分數 0-1（默認值：0.5）。',
        'cropY：裁剪中心 Y 作為分數 0-1（默認值：0.5）。',
        'cropSize：裁剪大小作為圖像 0-1 的一部分（默認值：1）。',
      ],
    },
    // Safety Lock Parameters
    {
      heading: '安全鎖參數',
      paragraphs: ['控制哪些 QR 元素免受覆蓋修改：'],
      bullets: [
        'lockF：鎖定查找器模式 0/1（默認值：1）。',
        'lockT：鎖定時序模式 0/1（默認值：1）。',
        'lockA：鎖定對齊模式 0/1（默認值：1）。',
        'lockFmt：鎖定格式信息0/1（默認值：1）。',
        'lockV：鎖定版本信息0/1（默認：1）。',
        'safeMode：安全模式 - 關閉、平衡、嚴格（默認值：關閉）。',
        'safeMinPx：最小模塊大小（以像素為單位）（默認值：2）。',
        'safeMinQz：最小靜區模塊數（默認值：4）。',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: '自整定參數',
      paragraphs: ['自動優化設置：'],
      bullets: [
        'autoVer：自動選取 QR 版本 0/1（默認值：1）。',
        'autoEcc：自動選擇 ECC 級別 0/1（默認值：0）- 僅服務器端提示。',
        'autoReduce：[僅限客戶端] 自動降低強度直到可掃描 - 需要掃描驗證循環。',
      ],
    },
    // Additional Animation Parameters
    {
      heading: '附加動畫參數',
      paragraphs: ['GIF 輸出的擴展動畫控件：'],
      bullets: [
        '循環：動畫連續循環0/1（默認值：1）。',
        '彈跳：乒乓動畫方向0/1（默認值：0）。',
        '反向：反向播放動畫 0/1（默認值：0）。',
        'colorCycle：啟用顏色循環效果 0/1（默認值：0）。',
        'interp：幀插值 - 無、交叉淡入淡出、變形（默認值：無）。',
        'tempDither：臨時抖動 - 關閉、blue_noise、flicker_safe（默認值：關閉）。',
        'startF：動畫開始幀（默認值：0）。',
        'maxF：渲染的最大幀數（默認值：0 = 自動）。',
        'stepF：幀步長間隔（默認值：1）。',
        '抖動：[僅限客戶端] 模塊抖動（以像素為單位）- 需要每幀 QR 重新生成。',
      ],
    },
    // Dithering Parameters
    {
      heading: '抖動參數',
      paragraphs: ['控制疊加處理的抖動算法：'],
      bullets: [
        'ditherKind：抖動算法 - error_diffusion、ordered_bayer、blue_noise 等（默認：ordered_bayer）。',
        'fusionKernel：誤差擴散內核 - floyd_steinberg、jarvis_judice_ninke、sticki、burkes、sierra、atkinson（默認值：floyd_steinberg）。',
        'ditherStrength：抖動強度 0-100（默認值：50）。',
        'serpentine：蛇形抖動 0/1（默認值：0）。',
        '矩陣：有序抖動矩陣 - bayer2、bayer4、bayer8（默認值：bayer4）。',
        'bnTile：藍色噪聲圖塊大小（默認值：64）。',
        'bnSeed：藍噪聲隨機種子（默認值：0）。',
        'colorDither：顏色抖動 - 無、per_channel、感知（默認值：無）。',
      ],
    },
    // Subpixel Parameters
    {
      heading: '子像素參數',
      paragraphs: ['子像素混合模式的設置：'],
      bullets: [
        'spGrid：子像素網格大小 - 2x2、3x3、4x4（默認值：3x3）。',
        'spCenter：中心規則 - 嚴格，halftone_center（默認值：嚴格）。',
        'spNeutral：不帶#的中性色十六進制（默認值：808080）。',
        'spFinder：Finder 覆蓋 - 實心、風格化（默認值：實心）。',
      ],
    },
    // Halftone Parameters
    {
      heading: '半色調參數',
      paragraphs: ['半色調混合模式的設置：'],
      bullets: [
        'htCell：半色調單元大小 - per_module 或 nxn 網格（默認值：per_module）。',
        'htDot：點形狀 - 圓形、方形、直線（默認：圓形）。',
        'htCurve：亮度曲線 - 線性、S 曲線、伽馬（默認值：線性）。',
        'duo1：雙色調陰影顏色十六進制，不帶#（默認值：000000）。',
        'duo2：雙色調突出顯示顏色十六進制，不帶 #（默認值：ffffff）。',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC 感知模式參數',
      paragraphs: ['基於糾錯能力的智能疊加分發：'],
      bullets: [
        'eccAware：啟用 ECC 感知模式 0/1（默認值：0）。',
        'eccRisk：風險預算百分比 0-100（默認值：50）。',
        'eccMap：權重圖 - distance_to_finders、block_heatmap、empirical_scan_heatmap（默認值：distance_to_finders）。',
      ],
    },
    // Frame Parameters
    {
      heading: '機架參數',
      paragraphs: ['裝飾框設置：'],
      bullets: [
        '框架：框架樣式 - 無、圓角框架、貼紙、標籤（默認值：無）。',
        'frameText：要在框架中顯示的文本（URL 編碼）。',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: '每個模塊的顏色參數',
      paragraphs: ['單獨的模塊著色選項：'],
      bullets: [
        'modColor：顏色模式-solid、by_brightness、by_position、by_overlay、by_cluster（默認值：solid）。',
        'cGuard：對比度保護 0/1（默認值：0）。',
        'minContrast：最小對比度 1-21（默認值：4.5）。',
        '調色板：調色板模式的逗號分隔的十六進制顏色。',
        'PaletteMode：調色板分佈 - 位置、亮度、對角線、徑向、隨機、行、列（默認：位置）。',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF 疊加參數',
      paragraphs: ['動畫 GIF 疊加圖像的設置：'],
      bullets: [
        'ovType：疊加類型 - 靜態、gif、apng、webp_anim、視頻（默認值：靜態）。',
        'ovFramePick：幀選擇 - all、every_n、max_frames、duration_limit（默認值：all）。',
        'gifDelays：使用原始 GIF 幀延遲 0/1（默認值：1）。',
        'gifDispH：GIF 處理處理 - 尊重、簡化（默認值：尊重）。',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: '每個 ECC 強度限制',
      paragraphs: ['每個糾錯級別的最大疊加強度：'],
      bullets: [
        'maxIntL：ECC L 0-100 的最大強度（默認值：100）。',
        'maxIntM：ECC M 0-100 的最大強度（默認值：100）。',
        'maxIntQ：ECC Q 0-100 的最大強度（默認值：100）。',
        'maxIntH：ECC H 0-100 的最大強度（默認值：100）。',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA 模擬參數（僅限客戶端）',
      paragraphs: ['這些參數被解析為 URL 兼容性，但僅在瀏覽器中有效：'],
      bullets: [
        'qaContrast：啟用對比度檢查 0/1 - 需要交互式驗證。',
        'qaBlur：模擬像素模糊 - 僅用於交互式測試。',
        'qaNoise：模擬噪音水平 - 僅用於交互式測試。',
        'qaHeatmap：顯示可讀性熱圖 0/1 - 需要畫布覆蓋 UI。',
      ],
    },
    // Client-Only Parameters
    {
      heading: '僅限客戶端參數',
      paragraphs: [
        '大多數 API 參數在服務器端得到完全支持。標記為 [CLIENT-ONLY] 的參數將被解析以實現 URL 兼容性，但需要瀏覽器功能：',
      ],
      bullets: [
        '抖動：模塊抖動需要隨機性地進行每幀 QR 再生。',
        'autoReduce：自動降低強度需要迭代掃描測試。',
        'qaContrast、qaBlur、qaNoise、qaHeatmap：QA 模擬需要交互式畫布驗證。',
      ],
    },
    // Additional Output Parameters
    {
      heading: '附加輸出參數',
      paragraphs: ['擴展輸出和導出設置：'],
      bullets: [
        'fname：下載的自定義文件名（默認值：anqr-qrcode）。',
        'inclQz：在輸出維度 0/1 中包括靜區（默認值：1）。',
        'bgOver：背景顏色覆蓋十六進制，不帶#（覆蓋bg參數）。',
        'fmtExtra：附加格式輸出 - 無、eps、animated_webp（默認值：無）。注：eps 為[部分]。',
        'svgPrec：SVG 形狀精度 - 像素，精確（默認值：像素）。 [部分] SVG 輸出受限於服務器端。',
        'svgEmbed：在 SVG 0/1 中嵌入光柵疊加（默認值：1）。 [部分] SVG 輸出受限於服務器端。',
        'modulePx：模塊像素大小（默認：根據大小自動計算）。',
        'border：安靜區域之外的額外邊框模塊（默認值：0）。',
        '清晰：啟用清晰/像素化圖像渲染 0/1（默認值：1）。',
        'snap：像素捕捉模式 - 地板、圓形、天花板（默認：地板）。',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: '模式保存參數',
      paragraphs: ['控制哪些結構元素免受覆蓋：'],
      bullets: [
        'keepFinders：保留查找器模式 0/1（默認值：1）。',
        'keepTiming：保留計時模式 0/1（默認值：0）。',
        'keepAlign：保留對齊模式 0/1（默認值：0）。',
        'ProtectFmt：保護格式信息模塊0/1（默認值：0）。',
        'ProtectVer：保護版本信息模塊0/1（默認值：0）。',
      ],
    },
    {
      heading: '用法示例',
      paragraphs: [
        '基本二維碼：',
        'https://anqr.link/api/qr?data=https://example.com',
        '具有自定義顏色的樣式 QR 碼：',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        '帶有疊加圖像的二維碼：',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF 動畫：',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: '查看二維碼示例', type: 'example' }],
    },
    {
      heading: '嵌入二維碼',
      paragraphs: ['在專業模式下，共享功能會生成可嵌入的 HTML 和 URL。嵌入的工作原理如下：'],
      bullets: [
        '共享鏈接：創建 ANQR 應用程序的 URL，並將所有設置編碼為 URL 參數。收件人可以查看和修改二維碼。',
        '嵌入圖像：生成指向服務器 API 的 <img> 標記。 QR 碼在服務器端呈現並作為圖像使用。',
        '嵌入 Markdown：為文檔和自述文件創建 Markdown 圖像語法。',
        '直接 API URL：用於應用程序、腳本或其他集成的原始 API URL。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML 示例',
      paragraphs: [
        '要將 QR 碼嵌入您的網站：',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="二維碼" />',
        '對於響應式大小調整：',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR 碼" style="max-width: 100%; height: auto;" />',
        '服務器緩存具有長緩存標頭的響應，因此對同一 URL 的重複請求速度很快。',
      ],
    },
    {
      heading: '分享網址格式',
      paragraphs: [
        '當您在專業模式下單擊"共享"時，ANQR 會將您當前的設置編碼為 URL 參數。格式為：',
        'https://anqr.link/?data=...&ec=H&style=rounded&...',
        '這些參數鏡像 API 參數，因此您可以通過將基本路徑從 / 更改為 /api/qr 並根據需要調整 w/h 參數，將共享 URL 轉換為 API URL。',
        '注意：從本地文件上傳的疊加圖像無法通過 URL 共享 - 只有基於 URL 的疊加（img 參數）在共享鏈接和 API 調用中起作用。',
      ],
    },
    {
      heading: '速率限制和使用情況',
      paragraphs: [
        '該 API 可免費使用，數量合理。對於需要保證正常運行時間的大批量使用或商業應用，請聯繫我們。',
        'API 響應包括積極的緩存標頭。為了獲得最佳性能，請在您的端緩存響應或對相同的 QR 碼一致使用相同的 URL。',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: '最佳實踐',
      paragraphs: ['請遵循以下準則以獲得可靠的 QR 碼：'],
      bullets: [
        '在打印之前，請務必使用多個掃描儀應用程序測試您的 QR 碼。',
        '添加疊加層時使用錯誤糾正 H（高）。',
        '保留至少 4 個模塊的靜區（邊緣）。',
        '確保前景和背景之間的高對比度。',
        '對於打印，至少使用 300 DPI 並以實際打印尺寸進行測試。',
        '使用疊加時啟用保留查找器圖案。',
        '從較低的覆蓋強度開始並逐漸增加。',
        '對於室外使用，請考慮更大的模塊尺寸和更高的糾錯能力。',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: '瀏覽學習文章', type: 'learn' },
        { href: '/examples?lang=${lang}', label: '查看二維碼示例', type: 'example' },
      ],
    },
    {
      heading: '故障排除',
      paragraphs: ['常見問題及解決方案：'],
      bullets: [
        'QR 無法掃描：降低覆蓋強度、增加糾錯、檢查對比度。',
        '代碼太大：減少內容長度、使用 URL 縮短器、降低版本。',
        '輸出模糊：增加模塊大小，使用 PNG 而不是壓縮格式。',
        '顏色看起來不對：檢查顏色對比度，嘗試灰度疊加模式。',
        'GIF 無動畫：確保使用 GIF 格式輸出，檢查幀計數。',
        '圖像覆蓋未加載：檢查遠程圖像上的 CORS 權限。',
      ],
      links: [
        { href: '/learn?lang=${lang}#section-5', label: '查看相關指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '鍵盤快捷鍵',
      paragraphs: ['ANQR 支持標準鍵盤快捷鍵。使用 Ctrl/Cmd+S 觸發導出（當聚焦於預覽時）。'],
    },
    {
      heading: '共享和嵌入',
      paragraphs: [
        '在專業模式下，單擊"共享"按鈕以復制包含您當前設置的 URL。收件人可以打開此 URL 以查看您的確切配置。注意：本地文件中的疊加圖像無法通過 URL 共享。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中嘗試此配置。',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: '瀏覽學習文章', type: 'learn' },
    { href: '/examples?lang=${lang}', label: '查看二維碼示例', type: 'example' },
    { href: '/gallery?lang=${lang}', label: '查看二維碼示例', type: 'gallery' },
    { href: '/?lang=${lang}', label: '打開發電機', type: 'generator' },
  ],
};

export default guide;
