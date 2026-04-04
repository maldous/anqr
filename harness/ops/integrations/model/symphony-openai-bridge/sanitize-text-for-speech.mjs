import { SPEECH_EMOJI_RE } from "./speech-emoji-re.mjs";

export function sanitizeTextForSpeech(text) {
  if (!text || !text.trim()) return "";
  let s = text;

  // 1. Fenced code blocks → brief note
  s = s.replace(/```[\s\S]*?```/g, " (code omitted) ");

  // 2. HTML tags
  s = s.replace(/<[^>]+>/g, "");

  // 3. Markdown links [text](url) → keep link text
  s = s.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");

  // 4. Inline code — keep simple short names, drop complex code
  s = s.replace(/`([^`]+)`/g, (match, content) => {
    if (content.length < 30 && !/[{}();=<>/\\|&]/.test(content)) return content;
    return "code";
  });

  // 5. URLs → "a link"
  s = s.replace(/https?:\/\/[^\s)]+/g, "a link");

  // 6. File paths → just the filename
  s = s.replace(/(?:\.{0,2}\/[\w.-]+){2,}/g, (match) => {
    const parts = match.split("/");
    const filename = parts[parts.length - 1];
    return filename && /\.\w+$/.test(filename) ? filename : "a file";
  });

  // 7. Markdown formatting
  s = s.replace(/^#{1,6}\s+/gm, "");
  s = s.replace(/\*{1,3}([^*]+)\*{1,3}/g, "$1");
  s = s.replace(/_{1,2}([^_]+)_{1,2}/g, "$1");
  s = s.replace(/~~([^~]+)~~/g, "$1");
  s = s.replace(/^[\s]*[-*+]\s+/gm, "");
  s = s.replace(/^[\s]*\d+\.\s+/gm, "");
  s = s.replace(/^>\s*/gm, "");
  s = s.replace(/^\|.*\|$/gm, "");
  s = s.replace(/^[-|:\s]+$/gm, "");

  // 8. Technical symbols → natural language
  s = s.replace(/=>/g, " goes to ");
  s = s.replace(/->/g, " to ");
  s = s.replace(/===?/g, " equals ");
  s = s.replace(/!==?/g, " not equals ");
  s = s.replace(/\|\|/g, " or ");
  s = s.replace(/&&/g, " and ");
  s = s.replace(/::/g, " ");

  // 9. Emoji
  s = s.replace(SPEECH_EMOJI_RE, " ");

  // 10. Special chars that sound bad when read aloud
  s = s.replace(/(\w)_(\w)/g, "$1 $2");
  s = s.replace(/[{}<>[\]\\|~`]+/g, "");
  s = s.replace(/_{2,}/g, "");

  // 11. Collapse whitespace
  s = s.replace(/\s+/g, " ").trim();

  // 12. Clean dangling punctuation
  s = s.replace(/\s+([?!.,:;])/g, "$1");

  // 13. Truncate at a natural sentence boundary
  const MAX_SPEECH_LENGTH = 500;
  if (s.length > MAX_SPEECH_LENGTH) {
    const cut = s.slice(0, MAX_SPEECH_LENGTH);
    const sentenceEnd = cut.lastIndexOf(". ");
    if (sentenceEnd > MAX_SPEECH_LENGTH * 0.5) {
      s = cut.slice(0, sentenceEnd + 1);
    } else {
      const wordEnd = cut.lastIndexOf(" ");
      s = cut.slice(0, wordEnd > 0 ? wordEnd : MAX_SPEECH_LENGTH) + "...";
    }
  }

  return s.trim();
}
