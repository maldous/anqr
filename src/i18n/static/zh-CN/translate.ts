import { LAST_UPDATED } from '../constants';
import type { PageDefinition } from '../types';

export const translate: PageDefinition = {
  title: '帮助翻译 ANQR',
  description: '加入我们的翻译社区，帮助全球用户使用 ANQR。无需编码经验 - 直接从您的浏览器贡献。',
  lastUpdated: LAST_UPDATED,
  primaryLinks: [
    { href: 'https://github.com/maldous/anqr-i18n', label: '打开翻译库', type: 'external' },
    { href: '/?lang=${lang}', label: '打开生成器', type: 'generator' },
  ],
  relatedLinks: [
    { href: '/about?lang=${lang}', label: '关于ANQR', type: 'external' },
    { href: '/contact?lang=${lang}', label: '联系我们', type: 'external' },
  ],
  sections: [
    {
      heading: '为什么要贡献？',
      paragraphs: [
        'ANQR 被世界各地的人们用来为企业、活动、支付和个人项目创建 QR 码。通过提供翻译，您可以帮助喜欢母语的用户使用这个强大的工具。',
        '每一次翻译贡献 - 无论是修复拼写错误还是翻译整个语言 - 都会为社区中的用户带来真正的影响。',
      ],
    },
    {
      heading: '你能翻译什么？',
      paragraphs: ['ANQR 有两种类型的可翻译内容：'],
      bullets: [
        'UI 字符串：整个应用程序中出现的按钮标签、菜单项、工具提示和界面文本。',
        '静态内容：文档页面，包括指南、示例、隐私政策和帮助文章。',
        '两种类型都存储为简单的文本文件，您可以直接在浏览器中编辑 - 无需特殊软件。',
        '翻译在合并之前会经过审核，以确保质量和一致性。',
      ],
    },
    {
      heading: '如何贡献',
      paragraphs: ['贡献很简单，不需要 Git 知识：'],
      bullets: [
        '访问我们在 GitHub 上的公共翻译存储库。',
        '找到您的语言文件（如果您的语言尚不受支持，则创建一个新文件）。',
        '单击铅笔图标可直接在浏览器中进行编辑。',
        '进行更改并单击"建议更改" - GitHub 将自动创建拉取请求。',
        '您的贡献通常会在几天内得到审核和合并。',
      ],
    },
    {
      heading: '翻译指南',
      paragraphs: [
        '翻译时，请保持 {name}、{count} 和 {{variable}} 等占位符不变 - 这些在运行时会替换为动态值。还保留任何类似 HTML 的语法，例如 [[/path|Label]] 格式的链接。',
        '如果您不确定翻译，最好保留英文，而不是提供不正确的翻译。您还可以在 GitHub 上打开问题以寻求澄清。',
      ],
    },
    {
      heading: '目前支持的语言',
      paragraphs: ['ANQR 目前支持 40 多种语言，包括：'],
      bullets: [
        '主要世界语言：英语、中文、西班牙语、阿拉伯语、印地语、葡萄牙语、日语、韩语、法语、德语、俄语等。',
        '东南亚语言：泰语、越南语、印度尼西亚语、菲律宾语、马来语、高棉语、老挝语、缅甸语。',
        '南亚语言：印地语、泰米尔语、泰卢固语、孟加拉语、马拉地语、古吉拉特语、卡纳达语、马拉雅拉姆语、旁遮普语、尼泊尔语。',
      ],
    },
    {
      heading: '认可',
      paragraphs: [
        '所有贡献者都记入我们的存储库中。您的工作帮助成千上万的用户以他们的首选语言访问 ANQR。',
        '感谢我们所有的翻译贡献者帮助让 ANQR 在全球范围内可用！',
      ],
    },
    {
      heading: '有问题吗？',
      paragraphs: [
        '如果您对贡献翻译有疑问，请在我们的 GitHub 存储库上提出问题或通过电子邮件与我们联系。我们很乐意帮助您入门。',
      ],
    },
  ],
};

export default translate;
