import { sanitizePlainText } from './plain-text.sanitize';

describe('sanitizePlainText', () => {
  it('strips script tags and content', () => {
    expect(sanitizePlainText("<script>alert('xss')</script>")).toBe('');
    expect(sanitizePlainText('before<script>alert(1)</script>after')).toBe(
      'beforeafter',
    );
  });

  it('strips img tags with onerror handlers', () => {
    expect(sanitizePlainText('<img onerror=alert(1) src=x>')).toBe('');
    expect(sanitizePlainText('safe<img onerror="alert(1)" src="x">name')).toBe(
      'safename',
    );
  });

  it('strips nested HTML tags', () => {
    expect(sanitizePlainText('<b><i>hello</i></b>')).toBe('hello');
    expect(sanitizePlainText('<div><p><span>nested</span></p></div>')).toBe(
      'nested',
    );
  });

  it('strips entity-encoded markup', () => {
    expect(sanitizePlainText('&lt;script&gt;alert(1)&lt;/script&gt;')).toBe('');
  });

  it('leaves plain text unchanged', () => {
    expect(sanitizePlainText('Jane Doe')).toBe('Jane Doe');
    expect(sanitizePlainText("O'Brien & Co.")).toBe("O'Brien & Co.");
  });
});
