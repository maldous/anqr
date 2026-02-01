import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const guide: PageDefinition = {
  title: 'ANQR 用户指南',
  description: '使用 ANQR 创建 QR 码的完整指南。',
  lastUpdated: LAST_UPDATED,
  breadcrumb: ['Guide'],
  primaryLinks: [
    { href: '/?lang=${lang}', label: '打开发电机', type: 'generator' },
    { href: '/learn?lang=${lang}', label: '浏览学习文章', type: 'learn' },
    { href: '/examples?lang=${lang}', label: '查看二维码示例', type: 'example' },
  ],
  sections: [
    // Getting Started (sections 0-1)
    {
      heading: '开始使用',
      paragraphs: [
        'ANQR 是一种采用客户端优先方法的 QR 代码生成器。默认情况下，二维码是在您的浏览器本地生成的 - 无需帐户，并且您的数据保持私密。对于专业嵌入，您还可以使用服务器端 API。',
        '该界面具有三个界面级别：基本、高级和专业。使用标题中的选项卡选择您的级别。每个级别都会解锁额外的功能，同时保持界面专注于您的需求。',
      ],
      bullets: [
        '基本：使用纯文本/URL 内容和图像叠加简单创建 QR 码。',
        '高级：QR 编码选项、渲染样式、动画、输出格式、扩展内容类型和叠加自定义。',
        '专业：水印、元数据、分享、安全分析、支付二维码、企业特性。',
      ],
      links: [{ href: '/?lang=${lang}', label: '打开发电机', type: 'generator' }],
    },
    {
      heading: '快速入门',
      paragraphs: ['要创建您的第一个二维码：'],
      bullets: [
        '1. 从内容类型下拉列表中选择内容类型（URL、文本、WiFi 等）。',
        '2. 在提供的字段中输入您的数据。',
        '3. （可选）自定义颜色、样式并添加覆盖图像。',
        '4. 单击导出以将 QR 码下载为 PNG、GIF、WebP 或 SVG。',
      ],
      links: [
        { href: '/?lang=${lang}', label: '直接在 ANQR 生成器中尝试此配置。', type: 'generator' },
      ],
    },
    // Basic Features (sections 2-4)
    {
      heading: '基本特点',
      paragraphs: [
        '基本级别提供了一个简化的界面，用于创建带有有效负载内容和图像覆盖的 QR 码。这是最简单的入门方法。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '内容类型（基本）',
      paragraphs: [
        '纯文本：对任何文本进行编码，直至 QR 码容量限制。非常适合短消息、代码或标识符。',
        'URL：对网址进行编码。扫描二维码将打开 URL。支持 http:// 和 https:// 协议。',
      ],
    },
    {
      heading: '图像叠加（基本）',
      paragraphs: ['上传图像（JPG、PNG、GIF、WebP）以与您的 QR 码混合。基本叠加功能包括：'],
      bullets: [
        '从文件上传：从您的设备中选择图像。',
        '从 URL 加载：输入图像 URL（必须允许 CORS）。',
        '中心徽标：将图像置于中心，依靠纠错。',
        '混合：图像与 QR 图案的简单 Alpha 混合。',
        '强度：控制叠加层对 QR 码的影响程度 (0-100%)。',
        '颜色模式：全彩、灰度或黑白。',
        '保留查找器图案：保持角图案不被修改，以实现可靠的扫描。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=basic#overlay',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-5', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    // Advanced Features (sections 5-40)
    {
      heading: '高级功能',
      paragraphs: [
        '高级级别解锁 QR 编码选项、渲染样式、动画、输出格式、扩展内容类型和高级叠加自定义。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'QR 编码设置',
      paragraphs: [
        '版本：QR 码有 1-40 版本，较高版本可容纳更多数据，但也更大。设置为 0（自动）可让 ANQR 选择适合您内容的最小版本。',
        '纠错：确定 QR 码在保持可扫描的同时可以承受多少损坏。',
      ],
      bullets: [
        'L（低）：7% 纠错 - 最小尺寸，最少冗余。',
        'M（中）：15% 误差修正 - 平衡选项。',
        'Q（四分位数）：25% 纠错 - 适合打印代码。',
        'H（高）：30% 纠错 - 最适合具有覆盖或恶劣条件下的代码。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#qr-encoding',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '安静区（边缘）',
      paragraphs: [
        '安静区域是二维码周围的空白区域。扫描仪需要这个边距来检测代码的开始位置。标准推荐至少4个模块。减少到 4 以下可能会导致扫描问题。',
      ],
    },
    {
      heading: '模块风格',
      paragraphs: ['模块是构成 QR 码的各个方块。 ANQR 提供五种样式：'],
      bullets: [
        '方形：经典的 QR 外观，带有尖角。',
        '圆角：软化边角，打造更友好的外观。',
        '点：现代美学的圆形模块。',
        '菱形：45° 旋转方形，呈现独特图案。',
        '连接：模块相邻时合并，形成有机形状。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '查找器图案样式',
      paragraphs: ['查找器图案是 QR 角上的三个大方块，可帮助扫描仪定位代码。可用款式：'],
      bullets: [
        '方形：标准方角。',
        '圆角：与圆角模块风格相匹配的软化角。',
        '圆形：用于点式代码的圆形查找器图案。',
      ],
    },
    {
      heading: '对齐和时序模式',
      paragraphs: [
        '对齐图案出现在较大的 QR 码（版本 2+）中，以帮助纠正失真。计时图案是连接取景器图案的交替线。',
      ],
      bullets: ['对齐方式：匹配查找器、方形、圆形或圆形。', '计时风格：匹配模块、实线或虚线。'],
    },
    {
      heading: '颜色',
      paragraphs: [
        '前景：QR 模块的颜色。黑色 (#000000) 是标准颜色，但任何深色都可以。',
        '背景：背景颜色。白色 (#ffffff) 是标准配置。确保与前景有足够的对比度。',
        '透明背景：完全删除背景以在彩色表面上使用。确保表面提供足够的对比度。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '模块尺寸和间隙',
      paragraphs: [
        '模块大小：控制每个模块渲染的大小（以像素为单位）。值越大，代码越大，越容易扫描。',
        '模块间隙：以百分比形式增加模块之间的空间。小间隙 (5-15%) 可以提高某些条件下的可扫描性，但间隙过大会降低可靠性。',
      ],
    },
    {
      heading: '输出设置',
      paragraphs: ['格式：根据用例选择导出格式。'],
      bullets: [
        'PNG：无损光栅格式，适合大多数用途。最适合印刷和数字。',
        'WebP：文件大小较小的现代格式。适合网络使用。',
        'GIF：动画 QR 码必需。支持透明度。',
        'SVG：无限缩放的矢量格式。最适合大字体或需要编辑代码时。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-3', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '输出尺寸',
      paragraphs: [
        '宽度/高度：设置输出尺寸（以像素为单位）。对于打印，根据 DPI 进行计算（例如，1 英寸处的 300 DPI = 300 像素）。尺寸越大，远距离扫描越可靠。',
      ],
    },
    {
      heading: '动画设置（高级）',
      paragraphs: ['控制动画二维码行为：'],
      bullets: [
        '速度：动画帧速率（以毫秒为单位）。',
        '循环：连续或单次播放动画。',
        'Bounce：乒乓球动画方向。',
        '开始帧：从特定帧开始动画。',
        '最大帧数：限制动画中的总帧数。',
        '帧步：跳过帧以获得更快的动画。',
        '插值：帧之间无、交叉淡入淡出或变形。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#animation',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-4', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '内容类型（高级）',
      paragraphs: ['高级级别解锁额外的有效负载格式：'],
      bullets: [
        '电话号码 (tel:)：创建可呼叫的电话链接。',
        '电子邮件 (mailto:)：打开带有可选主题和正文的电子邮件客户端。',
        'SMS：预先填写到电话号码的短信。',
        'vCard：包含姓名、组织、电话、电子邮件、地址的完整联系人卡。',
        'MeCard：在日本流行的紧凑型联系人格式。',
        'BizCard：传统名片格式。',
        '地理位置：在地图中打开的 GPS 坐标。',
        'WiFi：自动连接的网络凭据（SSID、密码、安全类型）。',
        '日历事件：带有标题、位置、日期/时间的 iCalendar 格式。',
        '活动回复：链接到活动注册页面。',
        '日历订阅：订阅 ICS/WebCal 源。',
        '文件/文档 URL：可下载文件的直接链接。',
        '云存储链接：Google Drive、Dropbox、OneDrive 等的链接。',
        '社交资料：LinkedIn、Twitter、Instagram 等的链接。',
        '消息链接：WhatsApp、Telegram、Signal 深层链接。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '高级叠加功能',
      paragraphs: ['附加叠加功能：'],
      bullets: [
        '裁剪：启用裁剪以选择图像的方形区域。',
        '半色调：基于图像亮度的经典印刷式点图案。',
        '抖动：误差扩散抖动以实现详细再现。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#overlay',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '叠加混合模式（高级）',
      paragraphs: ['高级级别的其他混合模式：'],
      bullets: [
        '子像素：将每个模块划分为子像素以获得更高的细节。',
        '蓝色噪声：使用蓝色噪声抖动实现无伪影图案。',
        '马赛克：基于平铺的效果，保留图像结构。',
        '间隙填充：将图像放置在模块之间的间隙中。',
        '亮度：根据图像亮度改变模块尺寸。',
        '双色调：将图像映射为两种颜色以形成鲜明的对比。',
      ],
    },
    {
      heading: '叠加强度',
      paragraphs: [
        '控制叠加层对 QR 码的影响程度 (0-100%)。较高的值显示更多图像细节，但可能会降低可扫描性。从 70% 左右开始，然后根据测试进行调整。',
      ],
      links: [
        { href: '/learn?lang=${lang}#section-5', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '色彩模式',
      paragraphs: ['叠加图像的处理方式：'],
      bullets: ['全彩：保留原始图像颜色。', '灰度：转换为黑白色调。', '黑白：高对比度二进制转换。'],
    },
    {
      heading: '保留查找器模式',
      paragraphs: ['启用后，保持三个角点查找器图案不被覆盖层修改。强烈建议进行可靠的扫描。'],
    },
    {
      heading: '图像预处理',
      paragraphs: ['在混合之前对叠加图像应用滤镜。这些调整可以改善图像在最终 QR 码中的显示方式。'],
      bullets: [
        '亮度（-100 至 +100）：使图像变亮或变暗。',
        '对比度（-100 至 +100）：增加或减少色调范围。',
        'Gamma（0.2 至 3.0）：非线性亮度调整。低于 1 的值会使中间色调变亮，高于 1 会使中间色调变暗。',
        '饱和度（-100 至 +100）：颜色强度。 -100 为灰度，+100 为过饱和。',
        '色相旋转（0-360°）：围绕色轮移动所有颜色。',
        '模糊（0-20px）：柔化图像细节。',
        '锐化 (0-100%)：增强边缘和细节。',
        '海报化（0-16 级）：降低海报效果的颜色级别。',
        '阈值 (0-255)：在截止点转换为二值黑/白。',
        '边缘检测：Sobel 或 Canny 算法仅显示边缘。',
        '反转：反转所有颜色。',
      ],
    },
    {
      heading: '贴合模式',
      paragraphs: ['叠加图像如何适合二维码区域：'],
      bullets: [
        '封面：图像填充整个区域，根据需要进行裁剪。',
        '包含：整个图像可见，可能有边距。',
        '拉伸：图像扭曲以精确填充。',
      ],
    },
    {
      heading: '变换选项',
      paragraphs: ['旋转：以 90° 增量旋转叠加层。', '翻转 X/Y：水平或垂直镜像图像。'],
    },
    {
      heading: '抖动算法',
      paragraphs: [
        '抖动将连续色调图像转换为 QR 码可以表示的图案。使用抖动、蓝色噪声或真实抖动混合模式时可用。',
      ],
      bullets: [
        '误差扩散：经典的弗洛伊德-斯坦伯格风格。将量化误差传播到相邻像素。',
        '有序 (Bayer)：对规则模式使用阈值矩阵。',
        '簇点：模拟半色调打印。',
        'Void & Cluster：优化有序抖动。',
        '蓝色噪声：视觉上令人愉悦的随机图案。',
        '蓝色噪声阈值：使用蓝色噪声纹理进行抖动的阈值。',
        '白噪声：随机阈值抖动。',
        '高斯/三角噪声：具有不同分布的噪声。',
        '蓝色噪声+误差扩散：两种技术的混合。',
        '屏蔽蓝色噪声：类似屏幕的蓝色噪声模式。',
        '感知：亮度加权以获得更好的视觉效果。',
        '边缘感知：在抖动过程中保留图像边缘。',
        '自适应阈值：局部自适应阈值。',
        '时间蓝色噪声：对于动画 GIF，每帧的模式各不相同。',
      ],
    },
    {
      heading: '扩散核',
      paragraphs: ['使用误差扩散抖动时，选择误差的分布方式：'],
      bullets: [
        'Floyd-Steinberg：经典的 4 邻域扩散。不错的一般选择。',
        'Jarvis-Judice-Ninke：12-邻居，更平滑但更慢。',
        'Stucki：与JJN类似，只是权重不同。',
        'Burkes：简化的 JJN，更快。',
        'Sierra：平衡质量和速度的内核系列。',
        '阿特金森：光漫射，保留细节，但可能有颗粒感。',
      ],
    },
    {
      heading: '抖动强度',
      paragraphs: [
        '控制应用的抖动量 (0-100%)。较低的值保留更多的原始图案，较高的值显示更多的图像细节。',
      ],
    },
    {
      heading: '子像素设置',
      paragraphs: ['使用子像素混合模式时：'],
      bullets: [
        '网格大小：每个模块 2×2、3×3 或 4×4 子像素。更高=更多细节。',
        '中心规则：严格要求中心子像素与模块匹配。半色调中心允许变化。',
        '中性色：用于未确定的子像素的颜色。',
        'Finder Override：如何渲染查找器图案（实体或风格化）。',
      ],
    },
    {
      heading: '半色调设置',
      paragraphs: ['使用半色调混合模式时：'],
      bullets: [
        '单元尺寸：每个模块或 N×N 网格。',
        '点形状：圆形、方形或线形。',
        '亮度曲线：线性、S 曲线或伽玛。',
      ],
    },
    {
      heading: '双色调颜色',
      paragraphs: ['使用双色调混合模式时，设置阴影颜色（黑暗区域）和高光颜色（明亮区域）。'],
    },
    {
      heading: 'GIF 动画设置',
      paragraphs: ['使用动画 GIF 叠加时：'],
      bullets: [
        '使用帧延迟：尊重原始 GIF 时序。',
        '最大 FPS：限制帧速率 (1-60 fps)。',
        '处置处理：尊重或简化框架处置方法。',
      ],
    },
    {
      heading: '高级渲染选项',
      paragraphs: ['附加渲染控件：'],
      bullets: [
        '间隙模式：无、插入、描边或负空间间隙样式。',
        '圆角半径：模块的圆角百分比。',
        '梯度：模块上无、线性、径向或圆锥梯度。',
        '眼睛外部/内部样式：取景器图案环的独立样式。',
        '点旋转：旋转菱形/点模块。',
        '眼睛比例：调整取景器图案的大小。',
        '框架样式：添加装饰框架（圆形框架、贴纸、标签）。',
        '框架文本：添加扫描我！等文本到帧。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#render',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '高级 QR 编码',
      paragraphs: ['微调 QR 编码：'],
      bullets: [
        '编码模式：自动、数字、字母数字、字节/UTF-8 或汉字。',
        '强制执行最小静区：确保至少 4 个模块余量。',
        '屏蔽模式：自动（最佳），或手动选择模式 0-7 来控制模块分配。不同的模式在编码相同的数据时会产生不同的视觉外观。',
        '字符编码：ISO-8859-1（默认为 Latin-1）、UTF-8（包括表情符号的完整 Unicode）或 Shift-JIS（日语）。根据您的内容的字符要求进行选择。',
      ],
    },
    {
      heading: '高级输出选项',
      paragraphs: ['附加导出设置：'],
      bullets: [
        '文件名：下载的自定义文件名。',
        'GIF 调色板大小：GIF 输出中的 2-256 种颜色。',
        'GIF 量化器：Median Cut、NeuQuant 或 Octree 色彩还原。',
        'GIF 抖动：关闭、Floyd-Steinberg 或有序。',
        'GIF 透明颜色：将颜色设置为透明。',
        'SVG True Vector：使用路径而不是嵌入光栅。',
        'SVG 形状精度：像素或精确路径渲染。',
        'SVG 嵌入光栅叠加：包括叠加作为嵌入图像。',
        '背景覆盖：在输出中强制使用特定的背景颜色。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#output',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '验证选项',
      paragraphs: ['输入处理设置：'],
      bullets: [
        '验证输入：编码前检查内容格式。',
        '修剪空白：删除前导/尾随空格。',
        '标准化换行符：将所有行结尾转换为 LF。',
        '最大长度保护：如果内容超出 QR 容量，则发出警告。',
      ],
    },
    // Professional Features (sections 41-56)
    {
      heading: '专业特色',
      paragraphs: ['专业级添加了水印、元数据、共享选项、安全分析、支付二维码和企业功能。'],
      links: [
        {
          href: '/?lang=${lang}&tab=professional',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '水印',
      paragraphs: ['为您的二维码添加水印：'],
      bullets: [
        '种类：文本、图像或图案水印。',
        '位置：中心、角落、边缘、后面或安静区域。',
        '不透明度：水印透明度（0-100%）。',
        '混合模式：正常、正片叠底、滤色或叠加混合。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#watermark',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '元数据',
      paragraphs: ['在导出的文件中嵌入元数据：'],
      bullets: [
        '标题、作者、版权、许可证、描述字段。',
        '创建时间：嵌入生成时间戳。',
        '自定义键值：添加任意元数据对。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#metadata',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '分享',
      paragraphs: ['分享一下你的二维码配置：'],
      bullets: [
        '直接链接：使用您当前的设置生成可共享的 URL。',
        '嵌入 HTML：获取网站的嵌入代码。',
        '编码参数：包含共享 URL 中的所有设置。',
        '注意：本地文件中的叠加图像无法通过 URL 共享。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-7', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '安全分析',
      paragraphs: ['确保 QR 码保持可扫描：'],
      bullets: [
        '安全模式：关闭、平衡或严格扫描要求。',
        '最小模块尺寸：每个模块的最小像素尺寸。',
        '最小安静区：最小保证金模块。',
        '锁定查找器/计时/对齐/格式/版本：保护特定元素。',
        'ECC 的最大叠加强度：基于纠错级别的自动强度限制。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#safety',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-5', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '内容类型（专业）',
      paragraphs: ['专业级增加支付和企业内容类型：'],
      bullets: [
        'EPC/SEPA (EU)：欧洲银行转账二维码，包含 IBAN、BIC、金额、参考。',
        'UPI（印度）：带有 VPA、收款人姓名、金额的统一支付接口。',
        'PayNow（新加坡）：使用UEN或手机号码进行新加坡快速支付。',
        'PromptPay（泰国）：泰国国家支付系统。',
        'PIX（巴西）：使用 PIX 密钥进行巴西即时付款。',
        '加密货币：比特币、以太坊、莱特币支付地址，金额可选。',
        '营销活动链接：具有完整 UTM 参数（营销标签）跟踪的 URL。',
        '短链接：与动态/可跟踪 QR 码的 URL 缩短器一起使用。',
        'GS1 数字链接：带有 GTIN、序列号、批次、有效期的产品标识。',
        '应用程序深度链接：具有自定义方案的 iOS/Android 应用程序深度链接。',
        '自定义格式：未经格式化或验证的原始数据。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-2', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    // Payment Standards (Language-Relevant) - section 42
    {
      heading: '高级模式下与语言相关的付款',
      paragraphs: [
        '使用高级模式时，ANQR 会自动显示与您所选语言相关的付款方式。例如，越南语用户看到 VietQR，泰国语用户看到 PromptPay，印度语用户看到 UPI 和 BharatQR。全球支付方式（加密货币、PayPal、Cash App）适用于所有语言。专业模式解锁所有支付标准，无论语言如何。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=advanced#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '欧洲支付标准',
      bullets: [
        'EPC/SEPA（欧盟）：欧洲银行转账二维码遵循 EPC 二维码标准。支持 IBAN、BIC（国内可选）、欧元金额以及结构化或非结构化付款参考。在 SEPA 区域使用，包括欧盟国家以及瑞士、挪威、冰岛、列支敦士登、摩纳哥和圣马力诺。',
        'Swiss QR-bill: Swiss payment standard following SIX Implementation Guidelines.支持瑞士法郎和欧元、二维码参考 (QRR)、债权人参考 (ISO 11649)、结构化债权人/债务人地址和账单信息。自 2022 年起瑞士发票需要提供。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '印度支付标准',
      bullets: [
        'UPI（印度）：遵循 NPCI 深度链接规范的统一支付接口。支持VPA（虚拟支付地址）、收款人姓名、印度卢比金额、交易备注、参考ID、商户类别代码和交易模式。',
        'BharatQR（印度）：支持 UPI 和卡支付的统一 QR 标准。将 UPI VPA 与卡 PAN 相结合，以实现最大兼容性。包括商家名称、城市、MCC、GST 详细信息和发票/参考号。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '东南亚支付标准',
      bullets: [
        'PayNow（新加坡）：使用 EMVCo QR 规范和 SGQR 配置文件的新加坡快速支付系统。支持 UEN（商业登记）、手机号码或 NRIC 作为代理标识符。包括金额可编辑性标志和到期日期。',
        'PromptPay（泰国）：遵循泰国银行 EMV 配置文件的泰国国家支付系统。支持手机号码、身份证、税号、电子钱包ID、账单支付等多种参考字段。',
        'QRIS（印度尼西亚）：快速响应代码印度尼西亚标准。基于EMV的国家支付标准，支持商户ID、NMID（国家商户ID）、商户标准分类和便利费（固定或百分比）。',
        'DuitNow（马来西亚）：马来西亚即时支付系统。支持多种代理类型，包括身份证号码、手机号码、护照号码、军队身份证号码和商业登记号码。',
        'VietQR (Vietnam): Vietnamese interbank transfer standard.需要银行 BIN（NAPAS 标识）和帐号。支持不同传输类型的多个服务代码（QRPUSH、QRIBFTTA、QRIBFTTC）。',
        'QR Ph（菲律宾）：菲律宾 InstaPay 和 PESONet 的 QR 支付标准。使用带有商户标识的帐号进行 P2M（个人对商户）交易。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '东亚支付标准',
      bullets: [
        'TWQR（台湾）：台湾二维码支付标准。支持商户 ID、税号和新台币金额。',
        'HKQR/FPS（香港）：香港快速支付系统二维码。支持FPS ID、手机号码或电子邮件作为付款标识符。 Amounts in HKD.',
        'JPQR（日本）：日本统一二维码支付标准。使用商店 ID 来识别日元金额的商户。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '其他地区支付标准',
      bullets: [
        'PIX（巴西）：遵循 BR 代码规范的巴西中央银行即时支付系统。支持 PIX 密钥（CPF、CNPJ、电子邮件、电话或随机密钥）、商家名称/城市、交易 ID 和 BRL 金额。',
        'AusPayNet/NPP PayID（澳大利亚）：澳大利亚新支付平台 PayID 系统。支持 PayID 类型（电子邮件、手机、ABN、组织 ID）或传统 BSB + 帐号。商户名称是可选的，因为付款人可以从 NPP 查找中看到注册名称。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '加密货币支付',
      bullets: [
        '比特币/莱特币 (BIP-21)：标准加密货币支付 URI，包含钱包地址、可选金额和标签。与所有主要的比特币和莱特币钱包兼容。',
        '闪电网络（BOLT11）：闪电网络支付发票。粘贴 BOLT11 编码的发票字符串，以最低的费用进行即时比特币付款。',
        '以太坊 (EIP-681)：支持本机 ETH 传输和 ERC-20 代币传输的以太坊交易请求 URI。包括用于多网络支持（Mainnet、Polygon、BSC、Arbitrum、Optimism、Avalanche）的链 ID、gas 参数和合约函数调用。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '支付链接服务',
      bullets: [
        'PayPal.Me：带有用户名和可选预填金额的 PayPal 付款链接。收件人可以通过 PayPal 余额、银行卡或银行账户付款。',
        '现金应用程序：现金应用程序付款链接使用 $cashtag 和可选金额。在美国流行的点对点支付。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '通用 EMV 二维码',
      bullets: [
        'EMV 通用：为未特别列出的支付方案创建自定义 EMV 商家呈现模式二维码。配置商家名称、城市、国家/地区代码 (ISO 3166-1)、货币代码（ISO 4217 数字）、MCC、小费/便利费选项和其他数据字段。对于测试或自定义集成很有用。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#payload',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    // Professional Overlay/Render sections (continued)
    {
      heading: '叠加混合模式（专业）',
      paragraphs: ['专业级别的其他混合模式：'],
      bullets: [
        '像素化：像素化叠加效果。',
        '轮廓：仅显示轮廓的边缘检测叠加。',
        '波浪：波浪形失真效果。',
        '子像素大小：基于图像的可变子像素大小。',
        '真实抖动：具有有序矩阵选择的高级抖动。',
        '极端：最大图像可见度，可能会影响可扫描性。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '保护设置',
      paragraphs: ['细粒度控制哪些 QR 元素免受覆盖修改：'],
      bullets: [
        '保留计时：保持计时模式不被修改。',
        '保留对齐方式：保持对齐方式不变。',
        'Protect Format Info：屏蔽格式信息模块。',
        '保护版本信息：屏蔽版本信息模块。',
      ],
    },
    {
      heading: 'ECC 感知模式',
      paragraphs: ['根据纠错能力智能分配叠加强度。系统分析哪些模块可以修改，同时保持可扫描性。'],
      bullets: [
        '风险预算：使用纠错能力的百分比（0-100%）。',
        '更高的预算=更明显的覆盖，但可扫描性风险更高。',
        '较低的预算=更安全的扫描但不那么明显的覆盖。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#overlay',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '专业渲染选项',
      paragraphs: ['高级渲染控件：'],
      bullets: [
        '清晰边缘：使用像素化图像渲染来获得清晰的模块边缘。',
        '像素对齐：地板、圆形或天花板像素对齐。',
        '每个模块的颜色模式：纯色、按亮度、按位置、按叠加、按簇。',
        '调色板：为每个模块着色定义自定义调色板。',
        '对比度保护：确保颜色之间的最小对比度。',
        '最小对比度：WCAG 式对比度要求（1:1 至 21:1）。',
        '额外边界模块：安静区域之外的额外边界。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#render',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '专业输出选项',
      paragraphs: ['企业导出设置：'],
      bullets: [
        'DPI：设置打印分辨率（72-600 DPI）。建议打印时使用 300 DPI。',
        '包括静区：在输出维度中切换静区。',
        '导出为附加文件：与主要格式一起生成 PDF。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#output',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: '动画设置（专业）',
      paragraphs: ['其他专业动画功能：'],
      bullets: [
        '临时抖动：关闭、蓝色噪声或闪烁安全每帧抖动。',
        '图案：无、脉冲、波浪、扫描线、闪光或漂移效果。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#animation',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
        { href: '/learn?lang=${lang}#section-4', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    // API Reference (sections 57-69)
    {
      heading: 'API参考',
      paragraphs: [
        'ANQR 提供服务器端 API，用于通过 URL 参数生成 QR 码。这非常适合在网站、电子邮件、文档或自动化工作流程中嵌入 QR 码，而无需客户端 JavaScript。',
        '基本网址：https://anqr.link/api/qr',
      ],
      links: [{ href: '/examples?lang=${lang}', label: '查看二维码示例', type: 'example' }],
    },
    {
      heading: '基本参数',
      paragraphs: ['必填和常用参数（参数名不翻译）：'],
      bullets: [
        'data（必填）：要在 QR 码中编码的内容。 URL 对特殊字符进行编码。',
        'size：图像大小（以像素为单位）（默认值：400，最大：2000）。如果未指定 w/h，则使用。',
        'w、h：输出宽度和高度（以像素为单位）。覆盖尺寸参数。',
        'format：输出格式 - png、webp 或 gif（默认值：png）。',
        'ec：纠错级别 - L、M、Q 或 H（默认值：H）。',
        'fg：前景色为十六进制，不带#（默认值：000000）。',
        'bg：背景颜色为十六进制，不带#（默认值：ffffff）。',
        '透明：设置为 1 表示透明背景。',
        'margin：模块中的安静区域（默认值：4）。',
      ],
    },
    {
      heading: '造型参数',
      paragraphs: ['模块和模式样式：'],
      bullets: [
        'style：模块样式-方形、圆形、圆点、菱形、相连。',
        'Finder：Finder 图案样式 - 方形、圆形、圆形。',
        'align：对齐图案样式 - match_finder、方形、圆形、圆形。',
        '计时：计时模式样式 - match_module、实线、虚线。',
        'radius：圆角半径百分比 0-100。',
        '间隙：模块间隙百分比0-50。',
        'gapMode：间隙模式 - 无、插入、描边、负空间。',
        'eyeOuter、eyeInner：眼睛样式 - 方形、圆形、圆形。',
        'eyeScale：眼睛比例百分比（默认值：100）。',
        'grad：渐变类型 - 无、线性、径向、圆锥形。',
        'gradAngle：线性渐变的渐变角度。',
        'gradStops：渐变停止点为 color1,pos1,color2,pos2,...（例如 ff0000,0,0000ff,1）。',
      ],
    },
    {
      heading: '叠加参数',
      paragraphs: ['图像叠加选项（叠加图像在服务器端获取）：'],
      bullets: [
        'img：覆盖图像的 URL（必须可公开访问）。',
        '模式：叠加模式 - 中心、半色调、混合、亮度、马赛克、抖动、蓝噪声、子像素。',
        '强度：叠加强度 0-100（默认值：100）。',
        'colorMode：叠加颜色模式 - 彩色、灰度、黑白。',
        '贴合：覆盖层如何贴合 - 覆盖、包含、拉伸。',
        'rot：以度为单位的叠加旋转。',
        'FlipX、flipY：设置为 1 翻转叠加。',
        'keepFinders：保留查找器模式（默认值：1）。',
        'keepTiming、keepAlign：设置为 1 以保留计时/对齐模式。',
      ],
    },
    {
      heading: '预处理参数',
      paragraphs: ['应用于叠加的图像预处理：'],
      bullets: [
        '亮度：调整 -100 至 100（默认值：0）。',
        '对比度：调整 -100 到 100（默认值：0）。',
        'gamma：值 0.1 到 3（默认值：1）。',
        '饱和度：调整 -100 至 100（默认值：0）。',
        '色调：色调旋转度数。',
        '模糊：以像素为单位模糊。',
        '锐化：锐化量 0-100。',
        '海报化：海报化级别。',
        '阈值：二进制阈值 0-255。',
        '边缘：边缘检测 - 关闭、sobel、canny。',
        'invert：设置为 1 以反转颜色。',
      ],
    },
    {
      heading: '水印参数',
      paragraphs: ['为生成的二维码添加水印：'],
      bullets: [
        'wmEn：设置为 1 以启用水印。',
        'wmKind：水印类型 - 文本、图像、图案。',
        'wmText：水印文本（URL 编码）。',
        'wmImg：水印图像的 URL。',
        'wmPos：位置 - 中心、角落、边缘、后面、quiet_zone。',
        'wmOpacity：不透明度 0-100（默认值：50）。',
        'wmBlend：混合模式 - 正常、正片叠底、滤色、叠加。',
      ],
    },
    {
      heading: '动画参数',
      paragraphs: ['对于动画 GIF 输出（需要 format=gif）：'],
      bullets: [
        'animPattern：动画模式 - 无、脉冲、波形、扫描线、闪光、漂移、颜色循环。',
        'animFrames：帧数 1-60（默认值：24）。',
        'animSpeed：帧延迟（以毫秒为单位）10-1000（默认值：100）。',
        'animSeed：动画的随机种子。',
        'easing：动画缓动 - 线性、ease_in、ease_out、ease_in_out、bounce。',
      ],
    },
    {
      heading: '输出参数',
      paragraphs: ['输出格式选项：'],
      bullets: [
        '质量：WebP 质量 0-1（默认值：0.9）。',
        'webpQ：WebP 质量 0-100（默认值：90）。',
        'gifColors：GIF 调色板大小 2-256（默认值：256）。',
        'dpi：PNG 的输出 DPI（默认值：72）。',
        'metaTitle、metaAuthor、metaCopy、metaDesc：PNG 元数据字段。',
      ],
    },
    // Crop Parameters
    {
      heading: '作物参数',
      paragraphs: ['叠加图像裁剪选项：'],
      bullets: [
        'cropEn：启用叠加裁剪 0/1（默认值：0）。',
        'cropX：裁剪中心 X 作为分数 0-1（默认值：0.5）。',
        'cropY：裁剪中心 Y 作为分数 0-1（默认值：0.5）。',
        'cropSize：裁剪大小作为图像 0-1 的一部分（默认值：1）。',
      ],
    },
    // Safety Lock Parameters
    {
      heading: '安全锁参数',
      paragraphs: ['控制哪些 QR 元素免受覆盖修改：'],
      bullets: [
        'lockF：锁定查找器模式 0/1（默认值：1）。',
        'lockT：锁定时序模式 0/1（默认值：1）。',
        'lockA：锁定对齐模式 0/1（默认值：1）。',
        'lockFmt：锁定格式信息0/1（默认值：1）。',
        'lockV：锁定版本信息0/1（默认：1）。',
        'safeMode：安全模式 - 关闭、平衡、严格（默认值：关闭）。',
        'safeMinPx：最小模块大小（以像素为单位）（默认值：2）。',
        'safeMinQz：最小静区模块数（默认值：4）。',
      ],
    },
    // Auto-tuning Parameters
    {
      heading: '自整定参数',
      paragraphs: ['自动优化设置：'],
      bullets: [
        'autoVer：自动选取 QR 版本 0/1（默认值：1）。',
        'autoEcc：自动选择 ECC 级别 0/1（默认值：0）- 仅服务器端提示。',
        'autoReduce：[仅限客户端] 自动降低强度直到可扫描 - 需要扫描验证循环。',
      ],
    },
    // Additional Animation Parameters
    {
      heading: '附加动画参数',
      paragraphs: ['GIF 输出的扩展动画控件：'],
      bullets: [
        '循环：动画连续循环0/1（默认值：1）。',
        '弹跳：乒乓动画方向0/1（默认值：0）。',
        '反向：反向播放动画 0/1（默认值：0）。',
        'colorCycle：启用颜色循环效果 0/1（默认值：0）。',
        'interp：帧插值 - 无、交叉淡入淡出、变形（默认值：无）。',
        'tempDither：临时抖动 - 关闭、blue_noise、flicker_safe（默认值：关闭）。',
        'startF：动画开始帧（默认值：0）。',
        'maxF：渲染的最大帧数（默认值：0 = 自动）。',
        'stepF：帧步长间隔（默认值：1）。',
        '抖动：[仅限客户端] 模块抖动（以像素为单位）- 需要每帧 QR 重新生成。',
      ],
    },
    // Dithering Parameters
    {
      heading: '抖动参数',
      paragraphs: ['控制叠加处理的抖动算法：'],
      bullets: [
        'ditherKind：抖动算法 - error_diffusion、ordered_bayer、blue_noise 等（默认：ordered_bayer）。',
        'fusionKernel：误差扩散内核 - floyd_steinberg、jarvis_judice_ninke、sticki、burkes、sierra、atkinson（默认值：floyd_steinberg）。',
        'ditherStrength：抖动强度 0-100（默认值：50）。',
        'serpentine：蛇形抖动 0/1（默认值：0）。',
        '矩阵：有序抖动矩阵 - bayer2、bayer4、bayer8（默认值：bayer4）。',
        'bnTile：蓝色噪声图块大小（默认值：64）。',
        'bnSeed：蓝噪声随机种子（默认值：0）。',
        'colorDither：颜色抖动 - 无、per_channel、感知（默认值：无）。',
      ],
    },
    // Subpixel Parameters
    {
      heading: '子像素参数',
      paragraphs: ['子像素混合模式的设置：'],
      bullets: [
        'spGrid：子像素网格大小 - 2x2、3x3、4x4（默认值：3x3）。',
        'spCenter：中心规则 - 严格，halftone_center（默认值：严格）。',
        'spNeutral：不带#的中性色十六进制（默认值：808080）。',
        'spFinder：Finder 覆盖 - 实心、风格化（默认值：实心）。',
      ],
    },
    // Halftone Parameters
    {
      heading: '半色调参数',
      paragraphs: ['半色调混合模式的设置：'],
      bullets: [
        'htCell：半色调单元大小 - per_module 或 nxn 网格（默认值：per_module）。',
        'htDot：点形状 - 圆形、方形、直线（默认：圆形）。',
        'htCurve：亮度曲线 - 线性、S 曲线、伽马（默认值：线性）。',
        'duo1：双色调阴影颜色十六进制，不带#（默认值：000000）。',
        'duo2：双色调突出显示颜色十六进制，不带 #（默认值：ffffff）。',
      ],
    },
    // ECC-Aware Mode Parameters
    {
      heading: 'ECC 感知模式参数',
      paragraphs: ['基于纠错能力的智能叠加分发：'],
      bullets: [
        'eccAware：启用 ECC 感知模式 0/1（默认值：0）。',
        'eccRisk：风险预算百分比 0-100（默认值：50）。',
        'eccMap：权重图 - distance_to_finders、block_heatmap、empirical_scan_heatmap（默认值：distance_to_finders）。',
      ],
    },
    // Frame Parameters
    {
      heading: '机架参数',
      paragraphs: ['装饰框设置：'],
      bullets: [
        '框架：框架样式 - 无、圆角框架、贴纸、标签（默认值：无）。',
        'frameText：要在框架中显示的文本（URL 编码）。',
      ],
    },
    // Per-Module Color Parameters
    {
      heading: '每个模块的颜色参数',
      paragraphs: ['单独的模块着色选项：'],
      bullets: [
        'modColor：颜色模式-solid、by_brightness、by_position、by_overlay、by_cluster（默认值：solid）。',
        'cGuard：对比度保护 0/1（默认值：0）。',
        'minContrast：最小对比度 1-21（默认值：4.5）。',
        '调色板：调色板模式的逗号分隔的十六进制颜色。',
        'PaletteMode：调色板分布 - 位置、亮度、对角线、径向、随机、行、列（默认：位置）。',
      ],
    },
    // GIF Overlay Parameters
    {
      heading: 'GIF 叠加参数',
      paragraphs: ['动画 GIF 叠加图像的设置：'],
      bullets: [
        'ovType：叠加类型 - 静态、gif、apng、webp_anim、视频（默认值：静态）。',
        'ovFramePick：帧选择 - all、every_n、max_frames、duration_limit（默认值：all）。',
        'gifDelays：使用原始 GIF 帧延迟 0/1（默认值：1）。',
        'gifDispH：GIF 处理处理 - 尊重、简化（默认值：尊重）。',
      ],
    },
    // Per-ECC Intensity Limits
    {
      heading: '每个 ECC 强度限制',
      paragraphs: ['每个纠错级别的最大叠加强度：'],
      bullets: [
        'maxIntL：ECC L 0-100 的最大强度（默认值：100）。',
        'maxIntM：ECC M 0-100 的最大强度（默认值：100）。',
        'maxIntQ：ECC Q 0-100 的最大强度（默认值：100）。',
        'maxIntH：ECC H 0-100 的最大强度（默认值：100）。',
      ],
    },
    // QA Simulation Parameters (Client-Only)
    {
      heading: 'QA 模拟参数（仅限客户端）',
      paragraphs: ['这些参数被解析为 URL 兼容性，但仅在浏览器中有效：'],
      bullets: [
        'qaContrast：启用对比度检查 0/1 - 需要交互式验证。',
        'qaBlur：模拟像素模糊 - 仅用于交互式测试。',
        'qaNoise：模拟噪音水平 - 仅用于交互式测试。',
        'qaHeatmap：显示可读性热图 0/1 - 需要画布覆盖 UI。',
      ],
    },
    // Client-Only Parameters
    {
      heading: '仅限客户端参数',
      paragraphs: [
        '大多数 API 参数在服务器端得到完全支持。标记为 [CLIENT-ONLY] 的参数将被解析以实现 URL 兼容性，但需要浏览器功能：',
      ],
      bullets: [
        '抖动：模块抖动需要随机性地进行每帧 QR 再生。',
        'autoReduce：自动降低强度需要迭代扫描测试。',
        'qaContrast、qaBlur、qaNoise、qaHeatmap：QA 模拟需要交互式画布验证。',
      ],
    },
    // Additional Output Parameters
    {
      heading: '附加输出参数',
      paragraphs: ['扩展输出和导出设置：'],
      bullets: [
        'fname：下载的自定义文件名（默认值：anqr-qrcode）。',
        'inclQz：在输出维度 0/1 中包括静区（默认值：1）。',
        'bgOver：背景颜色覆盖十六进制，不带#（覆盖bg参数）。',
        'fmtExtra：附加格式输出 - 无、eps、animated_webp（默认值：无）。注：eps 为[部分]。',
        'svgPrec：SVG 形状精度 - 像素，精确（默认值：像素）。 [部分] SVG 输出受限于服务器端。',
        'svgEmbed：在 SVG 0/1 中嵌入光栅叠加（默认值：1）。 [部分] SVG 输出受限于服务器端。',
        'modulePx：模块像素大小（默认：根据大小自动计算）。',
        'border：安静区域之外的额外边框模块（默认值：0）。',
        '清晰：启用清晰/像素化图像渲染 0/1（默认值：1）。',
        'snap：像素捕捉模式 - 地板、圆形、天花板（默认：地板）。',
      ],
    },
    // Pattern Preservation Parameters
    {
      heading: '模式保存参数',
      paragraphs: ['控制哪些结构元素免受覆盖：'],
      bullets: [
        'keepFinders：保留查找器模式 0/1（默认值：1）。',
        'keepTiming：保留计时模式 0/1（默认值：0）。',
        'keepAlign：保留对齐模式 0/1（默认值：0）。',
        'ProtectFmt：保护格式信息模块0/1（默认值：0）。',
        'ProtectVer：保护版本信息模块0/1（默认值：0）。',
      ],
    },
    {
      heading: '用法示例',
      paragraphs: [
        '基本二维码：',
        'https://anqr.link/api/qr?data=https://example.com',
        '具有自定义颜色的样式 QR 码：',
        'https://anqr.link/api/qr?data=Hello&size=300&fg=1e40af&bg=ffffff&style=rounded&radius=30',
        '带有叠加图像的二维码：',
        'https://anqr.link/api/qr?data=https://example.com&ec=H&img=https://example.com/logo.png&mode=halftone&intensity=70',
        'GIF 动画：',
        'https://anqr.link/api/qr?data=Hello&format=gif&animPattern=pulse&animFrames=24&easing=ease_in_out',
      ],
      links: [{ href: '/examples?lang=${lang}', label: '查看二维码示例', type: 'example' }],
    },
    {
      heading: '嵌入二维码',
      paragraphs: ['在专业模式下，共享功能会生成可嵌入的 HTML 和 URL。嵌入的工作原理如下：'],
      bullets: [
        '共享链接：创建 ANQR 应用程序的 URL，并将所有设置编码为 URL 参数。收件人可以查看和修改二维码。',
        '嵌入图像：生成指向服务器 API 的 <img> 标记。 QR 码在服务器端呈现并作为图像使用。',
        '嵌入 Markdown：为文档和自述文件创建 Markdown 图像语法。',
        '直接 API URL：用于应用程序、脚本或其他集成的原始 API URL。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
    {
      heading: 'HTML 示例',
      paragraphs: [
        '要将 QR 码嵌入您的网站：',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=200" alt="二维码" />',
        '对于响应式大小调整：',
        '<img src="https://anqr.link/api/qr?data=https://yoursite.com&size=400" alt="QR 码" style="max-width: 100%; height: auto;" />',
        '服务器缓存具有长缓存标头的响应，因此对同一 URL 的重复请求速度很快。',
      ],
    },
    {
      heading: '分享网址格式',
      paragraphs: [
        '当您在专业模式下单击共享时，ANQR 会将您当前的设置编码为 URL 参数。格式为：',
        'https://anqr.link/?data=...&ec=H&style=rounded&...',
        '这些参数镜像 API 参数，因此您可以通过将基本路径从 / 更改为 /api/qr 并根据需要调整 w/h 参数，将共享 URL 转换为 API URL。',
        '注意：从本地文件上传的叠加图像无法通过 URL 共享 - 只有基于 URL 的叠加（img 参数）在共享链接和 API 调用中起作用。',
      ],
    },
    {
      heading: '速率限制和使用',
      paragraphs: [
        '该 API 可免费使用，数量合理。对于需要保证正常运行时间的大批量使用或商业应用，请联系我们。',
        'API 响应包括积极的缓存标头。为了获得最佳性能，请在您的端缓存响应或对相同的 QR 码一致使用相同的 URL。',
      ],
    },
    // Best Practices & Troubleshooting (sections 70+)
    {
      heading: '最佳实践',
      paragraphs: ['请遵循以下准则以获得可靠的 QR 码：'],
      bullets: [
        '在打印之前，请务必使用多个扫描仪应用程序测试您的 QR 码。',
        '添加叠加层时使用错误纠正 H（高）。',
        '保留至少 4 个模块的静区（边缘）。',
        '确保前景和背景之间的高对比度。',
        '对于打印，至少使用 300 DPI 并以实际打印尺寸进行测试。',
        '使用叠加时启用保留查找器图案。',
        '从较低的覆盖强度开始并逐渐增加。',
        '对于室外使用，请考虑更大的模块尺寸和更高的纠错能力。',
      ],
      links: [
        { href: '/learn?lang=${lang}', label: '浏览学习文章', type: 'learn' },
        { href: '/examples?lang=${lang}', label: '查看二维码示例', type: 'example' },
      ],
    },
    {
      heading: '故障排除',
      paragraphs: ['常见问题及解决方案：'],
      bullets: [
        'QR 无法扫描：降低覆盖强度、增加纠错、检查对比度。',
        '代码太大：减少内容长度、使用 URL 缩短器、降低版本。',
        '输出模糊：增加模块大小，使用 PNG 而不是压缩格式。',
        '颜色看起来不对：检查颜色对比度，尝试灰度叠加模式。',
        'GIF 无动画：确保使用 GIF 格式输出，检查帧数。',
        '图像覆盖未加载：检查远程图像上的 CORS 权限。',
      ],
      links: [
        { href: '/learn?lang=${lang}#section-5', label: '查看相关指南和示例', type: 'learn' },
      ],
    },
    {
      heading: '键盘快捷键',
      paragraphs: ['ANQR 支持标准键盘快捷键。使用 Ctrl/Cmd+S 触发导出（当聚焦于预览时）。'],
    },
    {
      heading: '共享和嵌入',
      paragraphs: [
        '在专业模式下，单击共享按钮以复制包含您当前设置的 URL。收件人可以打开此 URL 以查看您的确切配置。注意：本地文件中的叠加图像无法通过 URL 共享。',
      ],
      links: [
        {
          href: '/?lang=${lang}&tab=professional#share',
          label: '直接在 ANQR 生成器中尝试此配置。',
          type: 'generator',
        },
      ],
    },
  ],
  relatedLinks: [
    { href: '/learn?lang=${lang}', label: '浏览学习文章', type: 'learn' },
    { href: '/examples?lang=${lang}', label: '查看二维码示例', type: 'example' },
    { href: '/gallery?lang=${lang}', label: '查看二维码示例', type: 'gallery' },
    { href: '/?lang=${lang}', label: '打开发电机', type: 'generator' },
  ],
};

export default guide;
