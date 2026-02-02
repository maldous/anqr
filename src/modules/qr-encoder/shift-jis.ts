/**
 * Shift-JIS Encoder Module
 * Provides full Shift-JIS encoding for Japanese text in QR codes
 * Supports: ASCII, half-width katakana, hiragana, katakana, kanji, punctuation, symbols
 *
 * Note: This module covers common kanji (~200 characters). For characters not in
 * the mapping table, a '?' replacement character is used. For full JIS X 0208
 * coverage, consider using the Kanji encoding mode which handles this natively.
 */

import { createLogger } from '../../lib/logger';

const _log = createLogger('ENCODER');

// Hiragana (U+3041 - U+3096) -> Shift-JIS (0x829F - 0x82F1)
const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3096;

// Katakana (U+30A1 - U+30F6) -> Shift-JIS (0x8340 - 0x8396)
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;

// Half-width Katakana (U+FF61 - U+FF9F) -> Shift-JIS (0xA1 - 0xDF) - single byte
const HW_KATAKANA_START = 0xff61;
const HW_KATAKANA_END = 0xff9f;
const HW_KATAKANA_SJIS_START = 0xa1;

// Full-width ASCII (U+FF01 - U+FF5E)
const FULLWIDTH_ASCII_START = 0xff01;
const FULLWIDTH_ASCII_END = 0xff5e;

// Full-width ASCII and punctuation mappings
const FULLWIDTH_MAP: Record<number, number> = {
  // Full-width space
  12288: 0x8140,
  // Full-width punctuation
  12289: 0x8141, // 、
  12290: 0x8142, // 。
  65292: 0x8143, // ，
  65294: 0x8144, // ．
  12539: 0x8145, // ・
  65306: 0x8146, // ：
  65307: 0x8147, // ；
  65311: 0x8148, // ？
  65281: 0x8149, // ！
  12443: 0x814a, // ゛
  12444: 0x814b, // ゜
  180: 0x814c, // ´
  65344: 0x814d, // ｀
  168: 0x814e, // ¨
  65342: 0x814f, // ＾
  65507: 0x8150, // ￣
  65343: 0x8151, // ＿
  // Brackets
  12308: 0x816b, // 〔
  12309: 0x816c, // 〕
  12304: 0x816d, // 【
  12305: 0x816e, // 】
  12298: 0x8171, // 《
  12299: 0x8172, // 》
  12300: 0x8175, // 「
  12301: 0x8176, // 」
  12302: 0x8177, // 『
  12303: 0x8178, // 』
  65288: 0x8169, // （
  65289: 0x816a, // ）
  65339: 0x816f, // ［
  65341: 0x8170, // ］
  65371: 0x816f, // ｛
  65373: 0x8170, // ｝
  // Symbols
  12291: 0x8156, // 〃
  20189: 0x8157, // 仝
  12293: 0x8158, // 々
  12294: 0x8159, // 〆
  12295: 0x815a, // 〇
  12540: 0x815b, // ー (prolonged sound mark)
  8213: 0x815c, // ―
  8208: 0x815d, // ‐
  65295: 0x815e, // ／
  65340: 0x815f, // ＼
  12316: 0x8160, // 〜
  8214: 0x8161, // ‖
  65372: 0x8162, // ｜
  8230: 0x8163, // …
  8229: 0x8164, // ‥
  8216: 0x8165, // '
  8217: 0x8166, // '
  8220: 0x8167, // "
  8221: 0x8168, // "
  // Math symbols
  65291: 0x817b, // ＋
  65293: 0x817c, // －
  177: 0x817d, // ±
  215: 0x817e, // ×
  247: 0x8180, // ÷
  65309: 0x8181, // ＝
  8800: 0x8182, // ≠
  65308: 0x8183, // ＜
  65310: 0x8184, // ＞
  8806: 0x8185, // ≦
  8807: 0x8186, // ≧
  8734: 0x8187, // ∞
  8756: 0x8188, // ∴
  // Currency and special
  65509: 0x818f, // ￥
  65284: 0x8190, // ＄
  65504: 0x8191, // ￠
  65505: 0x8192, // ￡
  65285: 0x8193, // ％
  65283: 0x8194, // ＃
  65286: 0x8195, // ＆
  65290: 0x8196, // ＊
  65312: 0x8197, // ＠
  // Arrows
  8592: 0x81a9, // ←
  8593: 0x81aa, // ↑
  8594: 0x81a8, // →
  8595: 0x81ab, // ↓
  // Greek letters (common)
  913: 0x839f, // Α
  914: 0x83a0, // Β
  915: 0x83a1, // Γ
  916: 0x83a2, // Δ
  917: 0x83a3, // Ε
  918: 0x83a4, // Ζ
  919: 0x83a5, // Η
  920: 0x83a6, // Θ
  921: 0x83a7, // Ι
  922: 0x83a8, // Κ
  923: 0x83a9, // Λ
  924: 0x83aa, // Μ
  925: 0x83ab, // Ν
  926: 0x83ac, // Ξ
  927: 0x83ad, // Ο
  928: 0x83ae, // Π
  929: 0x83af, // Ρ
  931: 0x83b0, // Σ
  932: 0x83b1, // Τ
  933: 0x83b2, // Υ
  934: 0x83b3, // Φ
  935: 0x83b4, // Χ
  936: 0x83b5, // Ψ
  937: 0x83b6, // Ω
  945: 0x83bf, // α
  946: 0x83c0, // β
  947: 0x83c1, // γ
  948: 0x83c2, // δ
  949: 0x83c3, // ε
  950: 0x83c4, // ζ
  951: 0x83c5, // η
  952: 0x83c6, // θ
  953: 0x83c7, // ι
  954: 0x83c8, // κ
  955: 0x83c9, // λ
  956: 0x83ca, // μ
  957: 0x83cb, // ν
  958: 0x83cc, // ξ
  959: 0x83cd, // ο
  960: 0x83ce, // π
  961: 0x83cf, // ρ
  963: 0x83d0, // σ
  964: 0x83d1, // τ
  965: 0x83d2, // υ
  966: 0x83d3, // φ
  967: 0x83d4, // χ
  968: 0x83d5, // ψ
  969: 0x83d6, // ω
};

/**
 * Common Kanji Unicode to Shift-JIS mapping
 * This covers the most frequently used kanji characters (JIS Level 1)
 * Format: Unicode code point -> Shift-JIS two-byte value
 *
 * Note: Duplicates have been removed. Each kanji appears only once.
 */
const KANJI_MAP: Record<number, number> = {
  // Numbers
  19968: 0x88ea, // 一
  20108: 0x93f1, // 二
  19977: 0x8e4f, // 三
  22235: 0x8e6c, // 四
  20116: 0x8cdc, // 五
  20845: 0x985a, // 六
  19971: 0x8eb5, // 七
  20843: 0x94aa, // 八
  20061: 0x8be3, // 九
  21313: 0x8f5c, // 十
  30334: 0x9553, // 百
  21315: 0x90e7, // 千
  19975: 0x969c, // 万
  20740: 0x89ad, // 億

  // Time/Calendar
  26085: 0x93fa, // 日
  26376: 0x8c8e, // 月
  28779: 0x89ce, // 火
  27700: 0x9085, // 水
  26408: 0x96d8, // 木
  37329: 0x8be0, // 金
  22303: 0x9379, // 土
  24180: 0x944e, // 年
  26178: 0x8e9e, // 時
  20998: 0x95aa, // 分
  31186: 0x9562, // 秒
  20170: 0x8da1, // 今
  26152: 0x8dfa, // 昨
  26126: 0x96be, // 明

  // People/Body
  20154: 0x906c, // 人
  30007: 0x926a, // 男
  22899: 0x8f97, // 女
  23376: 0x8e71, // 子
  27597: 0x95ea, // 母
  29238: 0x9583, // 父
  21451: 0x9746, // 友
  25163: 0x8ee8, // 手
  36275: 0x91ab, // 足
  30446: 0x96da, // 目
  32819: 0x8ea8, // 耳
  21475: 0x8cfb, // 口
  40763: 0x9540, // 鼻
  24515: 0x9053, // 心

  // Nature
  23665: 0x8e52, // 山
  24029: 0x90ec, // 川
  28023: 0x8a43, // 海
  31354: 0x8bf3, // 空
  38632: 0x8941, // 雨
  39080: 0x9597, // 風
  38634: 0x90e1, // 雪
  33457: 0x89d4, // 花
  33609: 0x9190, // 草
  27193: 0x8ef7, // 樹
  26519: 0x97d1, // 林
  26862: 0x9058, // 森

  // Actions
  35211: 0x8ca9, // 見
  32862: 0x95b7, // 聞
  35328: 0x8cbe, // 言
  35501: 0x93c7, // 読
  26360: 0x8f91, // 書
  35441: 0x9862, // 話
  39135: 0x9048, // 食
  39154: 0x88f9, // 飲
  36208: 0x9196, // 走
  27497: 0x95e0, // 歩
  31435: 0x97a7, // 立
  24231: 0x8dc0, // 座
  23517: 0x9051, // 寝
  36215: 0x8b4e, // 起
  20316: 0x8dec, // 作
  20351: 0x8e67, // 使
  25345: 0x8e9d, // 持
  21462: 0x8ee6, // 取
  20986: 0x8f6f, // 出
  20837: 0x93fc, // 入
  34892: 0x8d73, // 行
  26469: 0x9788, // 来
  24112: 0x8b41, // 帰
  24453: 0x91d2, // 待
  20250: 0x89ef, // 会
  30693: 0x926d, // 知
  24605: 0x8e76, // 思
  32771: 0x8d6c, // 考
  20449: 0x904d, // 信
  24859: 0x88a4, // 愛

  // Places/Buildings
  23478: 0x89c6, // 家
  24215: 0x9358, // 店
  39365: 0x8977, // 駅
  23398: 0x8a77, // 学
  26657: 0x8d5a, // 校
  31038: 0x8ed0, // 社
  22269: 0x8d91, // 国
  24066: 0x8e73, // 市
  30010: 0x92ac, // 町
  26449: 0x91ba, // 村
  36947: 0x93b9, // 道
  27211: 0x8bb4, // 橋

  // Objects
  36554: 0x8e4d, // 車
  38651: 0x9364, // 電
  26412: 0x967b, // 本
  26032: 0x9056, // 新
  32025: 0x8e86, // 紙
  31558: 0x954d, // 筆
  37549: 0x929e, // 銭
  37347: 0x91e3, // 釣

  // Adjectives
  22823: 0x91e5, // 大
  23567: 0x8f8f, // 小
  39640: 0x8d82, // 高
  20302: 0x92e1, // 低
  38263: 0x92b7, // 長
  30701: 0x925a, // 短
  33391: 0x97c7, // 良
  24746: 0x88ab, // 悪
  21476: 0x8cc3, // 古
  22810: 0x91bd, // 多
  23569: 0x8fad, // 少
  24375: 0x8bad, // 強
  24369: 0x8ee3, // 弱
  26263: 0x88c3, // 暗
  28201: 0x89b7, // 温
  23506: 0x8aa6, // 寒
  29105: 0x944d, // 熱
  20919: 0x97e2, // 冷

  // Colors
  36196: 0x90d4, // 赤
  38738: 0x90c2, // 青
  30333: 0x9492, // 白
  40658: 0x8d95, // 黒
  32209: 0x97ce, // 緑
  40644: 0x89a9, // 黄

  // Position/Direction
  20013: 0x9286, // 中
  22806: 0x8a4f, // 外
  19978: 0x8fe3, // 上
  19979: 0x89ba, // 下
  24038: 0x8db6, // 左
  21491: 0x8945, // 右
  21069: 0x914f, // 前
  24460: 0x8ce3, // 後
  21271: 0x967b, // 北
  21335: 0x93ec, // 南
  26481: 0x938c, // 東
  35199: 0x90bc, // 西
  20869: 0x93e0, // 内

  // Common abstract concepts
  29289: 0x95a8, // 物
  20107: 0x8e96, // 事
  32773: 0x8ed2, // 者
  25152: 0x8f8a, // 所
  26041: 0x95fb, // 方
  27671: 0x8b43, // 気
  21147: 0x97cd, // 力
  21517: 0x96bc, // 名
  27425: 0x8e9f, // 次
  21021: 0x8f89, // 初
  26368: 0x8dc5, // 最
  26411: 0x9696, // 末
  20808: 0x90e6, // 先
  27096: 0x9798, // 様
  24335: 0x8eae, // 式
  24615: 0x90ab, // 性
  21270: 0x89bb, // 化
  29992: 0x9770, // 用
  24471: 0x93be, // 得
  22833: 0x8eb8, // 失
  21487: 0x89c2, // 可
  19981: 0x9573, // 不
  28961: 0x96b3, // 無
  26377: 0x974c, // 有
  20840: 0x9153, // 全
  37096: 0x9594, // 部
  21322: 0x94bc, // 半
  27491: 0x90b3, // 正
  35492: 0x8ce0, // 誤
  30495: 0x905e, // 真
  20605: 0x8b55, // 偽
  22987: 0x8e6e, // 始
  32066: 0x8f49, // 終
  32154: 0x91b1, // 続
  27490: 0x8e7e, // 止
  21205: 0x93ae, // 動
  38745: 0x90c3, // 静
  22793: 0x95cf, // 変
  21516: 0x93af, // 同
  21029: 0x95ca, // 別
  29305: 0x93c1, // 特
  26222: 0x9581, // 普
  36890: 0x92ca, // 通
  20849: 0x8ba4, // 共
  31169: 0x8e84, // 私
  20844: 0x8cf6, // 公
  20491: 0x8cc2, // 個
  22243: 0x9263, // 団
  20307: 0x91cc, // 体
  32676: 0x8c51, // 群
  38598: 0x8f57, // 集
  21512: 0x8d87, // 合
  35299: 0x89f0, // 解
  32080: 0x8c8b, // 結
  38283: 0x8a4a, // 開
  38281: 0x95c2, // 閉
  29983: 0x90b6, // 生
  27515: 0x8e80, // 死
  20581: 0x8c92, // 健
  24247: 0x8d4e, // 康
  30149: 0x9561, // 病
  21307: 0x88e3, // 医
  34220: 0x96f2, // 薬

  // Question words
  20309: 0x89bd, // 何
  35504: 0x924e, // 誰
};

/**
 * Hiragana to Shift-JIS mapping
 * Hiragana range: U+3041 to U+3096 (86 characters)
 * Shift-JIS range: 0x829F to 0x82F1
 *
 * The mapping handles the 0x7F gap in Shift-JIS (skips 0x827F)
 */
function hiraganaToShiftJIS(codePoint: number): number[] {
  if (codePoint < HIRAGANA_START || codePoint > HIRAGANA_END) {
    return [0x3f]; // Not hiragana
  }

  const offset = codePoint - HIRAGANA_START;
  // Hiragana starts at 0x829F in Shift-JIS
  // But Shift-JIS skips 0x7F in the low byte, so we need to adjust
  let sjis = 0x829f + offset;

  // If low byte is >= 0x7F, we need to add 1 to skip the gap
  const lowByte = sjis & 0xff;
  if (lowByte >= 0x7f) {
    sjis += 1;
  }

  return [(sjis >> 8) & 0xff, sjis & 0xff];
}

/**
 * Katakana to Shift-JIS mapping
 * Katakana range: U+30A1 to U+30F6 (86 characters)
 * Shift-JIS range: 0x8340 to 0x8396
 *
 * The mapping handles the 0x7F gap and the transition at 0x839F
 */
function katakanaToShiftJIS(codePoint: number): number[] {
  if (codePoint < KATAKANA_START || codePoint > KATAKANA_END) {
    return [0x3f]; // Not katakana
  }

  const offset = codePoint - KATAKANA_START;
  // Katakana starts at 0x8340 in Shift-JIS
  let sjis = 0x8340 + offset;

  // Handle the 0x7F gap: if low byte would be >= 0x7F, add 1
  let lowByte = sjis & 0xff;
  if (lowByte >= 0x7f) {
    sjis += 1;
    lowByte = sjis & 0xff;
  }

  // Handle transition from 0x83xx to 0x84xx range
  // After 0x839E comes 0x8440 (not 0x839F because that's in Greek range)
  if ((sjis & 0xff00) === 0x8300 && lowByte > 0x9e) {
    const extraOffset = lowByte - 0x9e - 1;
    sjis = 0x8440 + extraOffset;
  }

  return [(sjis >> 8) & 0xff, sjis & 0xff];
}

/**
 * Convert a single Unicode character to Shift-JIS bytes
 * @param codePoint Unicode code point
 * @returns Array of bytes (1 or 2 bytes)
 */
function unicodeToShiftJIS(codePoint: number): number[] {
  // ASCII (0x00 - 0x7F) - direct mapping
  if (codePoint < 0x80) {
    return [codePoint];
  }

  // Half-width Katakana (single byte 0xA1-0xDF)
  if (codePoint >= HW_KATAKANA_START && codePoint <= HW_KATAKANA_END) {
    return [HW_KATAKANA_SJIS_START + (codePoint - HW_KATAKANA_START)];
  }

  // Hiragana
  if (codePoint >= HIRAGANA_START && codePoint <= HIRAGANA_END) {
    return hiraganaToShiftJIS(codePoint);
  }

  // Katakana
  if (codePoint >= KATAKANA_START && codePoint <= KATAKANA_END) {
    return katakanaToShiftJIS(codePoint);
  }

  // Full-width punctuation and symbols
  if (FULLWIDTH_MAP[codePoint] !== undefined) {
    const sjis = FULLWIDTH_MAP[codePoint];
    return [(sjis >> 8) & 0xff, sjis & 0xff];
  }

  // Full-width ASCII (U+FF01 - U+FF5E)
  if (codePoint >= FULLWIDTH_ASCII_START && codePoint <= FULLWIDTH_ASCII_END) {
    const offset = codePoint - FULLWIDTH_ASCII_START;

    // Map based on character type
    if (offset === 0) return [0x81, 0x49]; // ！

    // Full-width digits 0-9 (U+FF10-U+FF19) -> 0x824F-0x8258
    if (offset >= 0x0f && offset <= 0x18) {
      return [0x82, 0x4f + (offset - 0x0f)];
    }

    // Full-width uppercase A-Z (U+FF21-U+FF3A) -> 0x8260-0x8279
    if (offset >= 0x20 && offset <= 0x39) {
      const charOffset = offset - 0x20;
      let lowByte = 0x60 + charOffset;
      // Skip 0x7F
      if (lowByte >= 0x7f) lowByte += 1;
      return [0x82, lowByte];
    }

    // Full-width lowercase a-z (U+FF41-U+FF5A) -> 0x8281-0x829A
    if (offset >= 0x40 && offset <= 0x59) {
      const charOffset = offset - 0x40;
      const lowByte = 0x81 + charOffset;
      // Skip 0x7F (already past it for lowercase)
      return [0x82, lowByte];
    }
  }

  // Kanji lookup
  if (KANJI_MAP[codePoint] !== undefined) {
    const sjis = KANJI_MAP[codePoint];
    return [(sjis >> 8) & 0xff, sjis & 0xff];
  }

  // For unmapped characters, use the replacement character
  // Using '?' (0x3F) as fallback
  return [0x3f];
}

/**
 * Create a Shift-JIS encoder function for use with qrcode.stringToBytes
 * @returns Function that converts a Unicode string to Shift-JIS byte array
 */
export function createShiftJISEncoder(): (s: string) => number[] {
  return (s: string): number[] => {
    const bytes: number[] = [];

    for (let i = 0; i < s.length; i++) {
      const codePoint = s.codePointAt(i);
      if (codePoint === undefined) continue;

      // Handle surrogate pairs for characters outside BMP
      if (codePoint > 0xffff) {
        i++; // Skip the low surrogate
        // Most Shift-JIS characters are in BMP, use replacement for others
        bytes.push(0x3f);
        continue;
      }

      const sjisBytes = unicodeToShiftJIS(codePoint);
      bytes.push(...sjisBytes);
    }

    return bytes;
  };
}

/**
 * Check if a string can be fully encoded in Shift-JIS without replacements
 * @param s String to check
 * @returns true if all characters have Shift-JIS mappings
 */
export function canEncodeAsShiftJIS(s: string): boolean {
  for (let i = 0; i < s.length; i++) {
    const codePoint = s.codePointAt(i);
    if (codePoint === undefined) continue;

    // Skip surrogate pair low surrogates
    if (codePoint > 0xffff) {
      i++;
      return false; // Characters outside BMP generally not in Shift-JIS
    }

    // ASCII is always supported
    if (codePoint < 0x80) continue;

    // Check if we have a mapping
    if (codePoint >= HW_KATAKANA_START && codePoint <= HW_KATAKANA_END) continue;
    if (codePoint >= HIRAGANA_START && codePoint <= HIRAGANA_END) continue;
    if (codePoint >= KATAKANA_START && codePoint <= KATAKANA_END) continue;
    if (FULLWIDTH_MAP[codePoint] !== undefined) continue;
    if (codePoint >= FULLWIDTH_ASCII_START && codePoint <= FULLWIDTH_ASCII_END) continue;
    if (KANJI_MAP[codePoint] !== undefined) continue;

    // No mapping found
    return false;
  }

  return true;
}

export default { createShiftJISEncoder, canEncodeAsShiftJIS };
