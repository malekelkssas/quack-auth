---
sidebar_position: 5
---

# Theme & design

The FE uses a retro **"duck pond"** pixel-art design language. The Nx/shadcn neutral
tokens were fully replaced with a **single dark duck theme** (the `.dark` block was
dropped — there is no light/dark switch).

## Tokens & fonts (`apps/FE/src/styles.css`)

Fonts load via a Google Fonts `@import` at the top of `styles.css`:

- **[Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P)** — pixel display font.
- **[VT323](https://fonts.google.com/specimen/VT323)** — retro body font (set as the `body` font).

The `:root` shadcn tokens are replaced with the duck pond palette:

```css
--background: #1a0a2e;
--card: #0f0f23;
--foreground: #e0e0ff;
--primary: #f5c842;
--primary-foreground: #0f0f23;
--muted-foreground: #8888bb;
--border: #333366;
--input: #0a0a1a;
--ring: #f5c842;
--destructive: #ff6b6b;
```

Named duck tokens and toast colors are added alongside:

```css
--duck-navy: #1a0a2e;
--duck-amber: #f5c842;
--grass-green: #4a9429;
--sky-blue: #87ceeb;
--cream: #fffbeb;

/* toast variants */
--success: #4ade80;
--warning: #f5c842;
--error: #ff6b6b;
```

`@theme inline` is extended with matching `--color-*` entries plus font tokens so
Tailwind utilities like `font-pixel` / `font-body` work:

```css
@theme inline {
  --font-pixel: 'Press Start 2P';
  --font-body: 'VT323';
  /* --color-* for the duck tokens above */
}
```

A `bob` keyframe animation and a `.pixelated` (`image-rendering: pixelated`) helper
are added for sprite/duck visuals. `apps/FE/index.html` `<title>` is a duck title.

## Sprite assets (`apps/FE/public/sprites/`)

Vite serves `public/` at the site root, so sprites resolve at `/sprites/...`.

Both sheets are 1236x202, 6 evenly-spaced frames (~206x202 per frame).

| File           | Sprite                                  |
| -------------- | --------------------------------------- |
| `duckling.png` | Yellow duckling — 6-frame walking sheet |
| `mallard.png`  | Green-headed mallard — 6-frame sheet    |

## Duck visuals (`apps/FE/src/components/duck/`)

| Component         | Purpose                                                                                              |
| ----------------- | ---------------------------------------------------------------------------------------------------- |
| `DuckCanvas.tsx`  | Canvas sprite animation; both sheets configured as 6 frames; modes `duckling` \| `mallard` \| `both` |
| `StarField.tsx`   | Animated starfield canvas background                                                                 |
| `PixelField.tsx`  | Duck-styled form field (label + icon + input) so RHF fields match the theme                          |
| `PixelButton.tsx` | Retro pixel button                                                                                   |

The pixel form primitives keep react-hook-form fields on-theme without fighting
shadcn defaults — see [Forms](./07-forms.md).
