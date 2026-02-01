import type { PageDefinition } from '../types';
import { LAST_UPDATED } from '../constants';

export const privacy: PageDefinition = {
  title: '隐私政策',
  description: 'ANQR 收集的信息、其使用方式以及您根据适用隐私法享有的权利。',
  lastUpdated: LAST_UPDATED,
  relatedLinks: [{ href: '/terms?lang=${lang}', label: '服务条款', type: 'external' }],
  sections: [
    {
      heading: '总结',
      paragraphs: ['ANQR 是一种采用客户端优先方法的 QR 代码生成器。我们不要求您创建帐户。默认情况下，QR 码是在您的浏览器本地生成的 - 我们无权访问您编码的内容。', '对于专业用途，ANQR 提供了服务器端 API，可根据 URL 参数生成 QR 码。使用 API 时，您的 QR 内容会在我们的服务器上进行处理以呈现图像，但不会存储或记录。', '我们使用 Google AdSense 进行广告，并可能使用分析服务。这些服务通过 cookie 和类似技术收集信息。本政策解释了收集哪些数据、如何使用这些数据以及您的权利。'],
    },
    {
      heading: '我们收集的信息',
      bullets: ['您提供的信息：如果您通过电子邮件或我们的联系表格联系我们，我们会收集您的姓名、电子邮件地址和消息内容。', '自动收集的信息：我们的托管提供商 (Netlify)、广告合作伙伴和分析服务可能会收集：IP 地址、浏览器类型和版本、操作系统、设备类型、引用 URL、访问的页面、网站停留时间和大致地理位置。', '第三方 cookie：我们的广告合作伙伴 (Google AdSense) 使用 cookie 和类似技术来提供和衡量广告。 ANQR 本身不设置任何第一方 cookie。'],
    },
    {
      heading: 'Cookie 和第三方技术',
      paragraphs: ['ANQR 不设置任何第一方 cookie。您的偏好设置（例如深色模式）存储在您的设备本地，不会传输到任何服务器。', '但是，我们的广告合作伙伴 (Google AdSense) 和托管提供商可能会使用 cookie 和类似的跟踪技术：'],
      bullets: ['广告 cookie（第三方）：由 Google AdSense 和广告合作伙伴设置，用于提供相关广告、衡量广告效果并了解用户兴趣。这些 cookie 可能会跟踪您在不同网站上的活动。', '分析 cookie（第三方）：我们的托管提供商或分析服务可能会使用它来收集匿名使用数据。'],
    },
    {
      heading: 'Google AdSense 和广告',
      paragraphs: ['我们通过 Google AdSense 展示广告。 Google 及其合作伙伴使用 cookie 根据您在此网站和其他网站上的浏览历史记录提供广告（基于兴趣的广告）。', '了解 Google 如何使用您的信息：https://policies.google.com/technologies/partner-sites', '管理广告个性化：https://adssettings.google.com', '通过网络广告计划选择退出：https://optout.networkadvertising.org', '通过数字广告联盟选择退出：https://optout.aboutads.info'],
    },
    {
      heading: '我们如何使用信息',
      bullets: ['回复您的询问并提供支持。', '通过我们的广告合作伙伴展示相关广告。', '分析网站使用情况并改进我们的服务。', '检测、预防和解决欺诈、滥用和安全问题。', '遵守法律义务。'],
    },
    {
      heading: '第三方服务',
      bullets: ['Google AdSense：接收数据以提供和衡量广告。', '分析提供商：接收匿名使用数据。', 'Netlify（托管）：处理请求并可能记录 IP 地址。', '我们不会出售您的个人信息。但是，根据 CCPA，与广告合作伙伴共享数据可能被视为销售（见下文）。'],
    },
    {
      heading: '数据保留',
      bullets: ['联系提交：最长 2 年。', '服务器日志：最长 30 天（托管提供商）。', '分析数据：最长 26 个月（匿名）。', '广告 cookie：通常为 13 个月（因合作伙伴而异）。'],
    },
    {
      heading: '您在 GDPR 下的权利（欧洲经济区用户）',
      paragraphs: ['如果您位于欧洲经济区，则根据《通用数据保护条例》，您拥有以下权利：'],
      bullets: ['访问权：索取我们持有的有关您的个人数据的副本。', '更正权：要求更正不准确的数据。', '删除权：请求删除您的数据（被遗忘权）。', '限制处理的权利：请求限制我们如何使用您的数据。', '数据可移植性权利：以可移植格式请求您的数据。', '反对权：反对处理，包括直接营销。', '撤回同意的权利：在处理基于同意的情况下随时撤回同意。', '提出投诉的权利：向您的数据保护机构提出投诉。'],
    },
    {
      heading: 'GDPR 法律依据',
      paragraphs: ['我们根据以下基础处理数据： (a) 同意 - 个性化广告（由我们的广告合作伙伴管理）； (b) 合法利益 - 用于分析、安全和改进； (c) 合同 - 回应询问。', '要行使您的权利，请联系 email@anqr.link。我们会在 30 天内回复。'],
    },
    {
      heading: '您根据 CCPA 享有的权利（加利福尼亚州用户）',
      bullets: ['知情权：索取有关所收集数据、来源、目的和第三方的信息。', '删除权：请求删除您的个人信息。', '选择退出的权利：选择退出个人信息的出售（与广告合作伙伴共享可能符合条件）。', '不受歧视的权利：我们不会因您行使权利而歧视您。'],
    },
    {
      heading: '收集的 CCPA 类别',
      paragraphs: ['类别：标识符（IP 地址、设备 ID）、互联网活动（浏览、广告交互）、地理位置（近似）、推论（浏览兴趣）。', '要行使权利或选择退出：email@anqr.link 或调整 cookie 设置。'],
    },
    {
      heading: '国际转账',
      paragraphs: ['您的信息可能会被转移到具有不同数据保护法的国家/地区，包括美国。我们使用适当的保障措施，例如标准合同条款。'],
    },
    {
      heading: '儿童隐私',
      paragraphs: ['ANQR 不针对 13 岁以下（或欧洲经济区 16 岁）以下的儿童。我们不会故意收集儿童的数据。如果您认为儿童提供了信息，请联系 email@anqr.link。'],
    },
    {
      heading: '安全性',
      paragraphs: ['我们使用适当的技术和组织措施来保护数据，包括 HTTPS 加密。然而，没有任何互联网传输是 100% 安全的。'],
    },
    {
      heading: '请勿追踪',
      paragraphs: ['在可行的情况下，我们尊重不跟踪浏览器信号，但广告合作伙伴可能不会响应 DNT。'],
    },
    {
      heading: '本政策的变更',
      paragraphs: ['我们可能会定期更新本政策。 最后更新日期表示最新版本。重大变更可以通过网站横幅传达。'],
    },
    {
      heading: '联系我们',
      paragraphs: ['如有隐私问题或行使您的权利：email@anqr.link 或使用我们的联系页面。我们会在 30 天内回复隐私请求。'],
    },
    {
      heading: '完整的隐私政策',
      paragraphs: ['本页提供了我们的隐私惯例的摘要。如需完整的、具有法律约束力的隐私政策，其中包含有关数据处理、您的权利以及我们在 GDPR、CCPA 和其他隐私法下的义务的完整详细信息，请查看我们由 iubenda 托管的完整政策。'],
      links: [
        {
          href: 'https://www.iubenda.com/privacy-policy/70266922',
          label: '查看 iubenda 上的完整隐私政策',
          type: 'external',
        },
      ],
    },
  ],
};

export default privacy;
