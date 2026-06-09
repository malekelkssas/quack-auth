/**
 * Isomorphic plain-text sanitizer — no Node-only dependencies so the shared
 * DTOs that use it (e.g. `Signup.name`) can be bundled by the browser (FE
 * forms) and run on the server (NestJS) with identical behavior.
 */

/** Tags whose inner content must be dropped entirely, not just the tags. */
const NON_TEXT_TAGS = ['script', 'style', 'textarea', 'title', 'option'];

const NON_TEXT_BLOCK = new RegExp(
  `<(${NON_TEXT_TAGS.join('|')})\\b[^>]*>[\\s\\S]*?<\\/\\1\\s*>`,
  'gi',
);

/** Opening non-text tag with no matching close — drop it and the rest. */
const DANGLING_NON_TEXT = new RegExp(
  `<(${NON_TEXT_TAGS.join('|')})\\b[\\s\\S]*$`,
  'i',
);

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) =>
      String.fromCodePoint(parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) =>
      String.fromCodePoint(parseInt(dec, 10)),
    )
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

function stripHtml(value: string): string {
  return value
    .replace(NON_TEXT_BLOCK, '')
    .replace(DANGLING_NON_TEXT, '')
    .replace(/<[^>]*>/g, '')
    .replace(/<[^>]*$/g, '');
}

/** Strip HTML tags, scripts, and event handlers — plain text only. */
export function sanitizePlainText(value: string): string {
  let current = value;

  for (let pass = 0; pass < 3; pass++) {
    current = decodeHtmlEntities(current);
    const stripped = stripHtml(current);
    if (stripped === current) {
      return decodeHtmlEntities(stripped);
    }
    current = stripped;
  }

  return decodeHtmlEntities(stripHtml(current));
}
