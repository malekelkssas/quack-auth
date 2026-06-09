import sanitizeHtml from 'sanitize-html';

const STRIP_HTML_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
};

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(?:39|x27);/gi, "'");
}

function stripHtml(value: string): string {
  return sanitizeHtml(value, STRIP_HTML_OPTIONS);
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
