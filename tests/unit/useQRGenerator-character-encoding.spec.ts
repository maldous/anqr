import { describe, expect, it } from 'vitest';
import { detectCharacterEncoding } from '../../src/hooks/useQRGenerator';

describe('detectCharacterEncoding', () => {
  it('returns default for empty or Latin-1 content', () => {
    expect(detectCharacterEncoding('')).toBe('default');
    expect(detectCharacterEncoding('hello-123')).toBe('default');
    expect(detectCharacterEncoding('cafe\u00e9')).toBe('default');
  });

  it('returns shift-jis for uniquely Japanese characters', () => {
    expect(detectCharacterEncoding('こんにちは')).toBe('shift-jis');
    expect(detectCharacterEncoding('カタカナ')).toBe('shift-jis');
  });

  it('returns utf8 for shared CJK-only content', () => {
    expect(detectCharacterEncoding('漢字')).toBe('utf8');
    expect(detectCharacterEncoding('你好世界')).toBe('utf8');
  });

  it('returns utf8 for non-CJK non-Latin-1 characters', () => {
    expect(detectCharacterEncoding('emoji 😀')).toBe('utf8');
    expect(detectCharacterEncoding('안녕하세요')).toBe('utf8');
  });
});
