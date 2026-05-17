const GREETINGS_RE = /\b(hello|hi|hey)\b/i;
const THANKS_RE = /\b(thanks|thank you)\b/i;
const QUESTIONS_RE = /\b(who are you|what are you|what can you do)\b/i;
const ACKS_RE = /\b(ok|okay|are you there)\b/i;
const TEST_RE = /\b(test|ping)\b/i;
const HELP_RE = /\b(help)\b/i;

export function isSimpleChat(text) {
  return GREETINGS_RE.test(text) || THANKS_RE.test(text) || QUESTIONS_RE.test(text) || ACKS_RE.test(text) || TEST_RE.test(text) || HELP_RE.test(text);
}
