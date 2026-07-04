# Satyryk 🎤

A browser-based notebook for comedians. Keep your jokes with full version history,
comment on individual lines, track material status, and build timed setlists for
your shows. Everything is stored locally in your browser — no account, no server.

**Live app:** https://djewdokimow.github.io/satyryk

## 📖 User guide

- **English:** [docs/user-guide.md](docs/user-guide.md)
- **Polski:** [docs/instrukcja-obslugi.md](docs/instrukcja-obslugi.md)

## Features

- 🌳 **Version history & branching** — every joke can have multiple versions
  arranged in a tree, so you never lose an older take on a punchline.
- 📊 **Status tracking** — idea → draft → working → polished → retired.
- 💬 **Inline comments** — pin notes to specific fragments of the text.
- 🎤 **Setlist builder** — arrange jokes, add segues, pick versions, and see the
  total running time.
- 🖨️ **Stage view & print/PDF** — a clean, readable view for performing or printing.
- 🔥 **Reactions** — tag versions with custom emoji.
- 🌍 **Bilingual (PL / EN)** and fully responsive.
- 💾 **Local-first** — data stays in your browser; export/import via JSON for backups.

## Development

```bash
npm install
npm run dev      # start the dev server
npm run build    # production build
npm run deploy   # build and publish to GitHub Pages
```
