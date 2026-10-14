import 'server-only';

const prohibitedPromptPatterns: Array<[RegExp, string]> = [
  [/\b(child|children|kid|kids|minor|underage|under\s*18|schoolgirl|schoolboy|teen(?:age|aged)?\s*(?:girl|boy|person)?|young[- ]looking)\b/i, 'minor or youth-coded content'],
  [/\b(real person|real woman|real man|celebrity|public figure|lookalike|deepfake|my ex|my coworker|my teacher)\b/i, 'sexual or intimate depictions of identifiable real people'],
  [/\b(non[- ]consensual|without (?:her|his|their) consent|revenge porn|hidden camera|upskirt|forced sex|sexual assault|rape|sexual violence|choking|strangulation|bestiality|necrophilia|incest|trafficking)\b/i, 'non-consensual or prohibited sexual content'],
];

export function assertAdultFictionPrompt(prompt: string) {
  const normalized = prompt.normalize('NFKC').slice(0, 5000);
  for (const [pattern, category] of prohibitedPromptPatterns) {
    if (pattern.test(normalized)) throw new Error(`CONTENT_POLICY_BLOCK:${category}`);
  }
  return normalized;
}
