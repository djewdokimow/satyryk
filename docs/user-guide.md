# Satyryk — User Guide

Satyryk is a notebook for comedians: it stores your jokes together with their
version history and lets you build setlists for your shows. The app runs in the
browser and saves all data **locally on your device** (localStorage) — nothing
is ever sent to any server.

*Polish version: [instrukcja-obslugi.md](instrukcja-obslugi.md)*

---

## Table of contents

1. [Getting started](#getting-started)
2. [Jokes](#jokes)
3. [The joke editor](#the-joke-editor)
4. [Versions and the version tree](#versions-and-the-version-tree)
5. [Inline comments](#inline-comments)
6. [Reactions](#reactions)
7. [Setlists](#setlists)
8. [Stage view and printing](#stage-view-and-printing)
9. [Import and export (backups)](#import-and-export-backups)
10. [Language and shortcuts](#language-and-shortcuts)
11. [Where is my data?](#where-is-my-data)

---

## Getting started

When you open the app, the top bar shows two tabs — **Jokes** and **Setlists** —
and a **PL / EN** language switch on the right.

Starting from scratch? Click **"Load demo"** and the app will add a sample set of
jokes and setlists so you can look around. You can remove the demo at any time
(see [Delete all](#import-and-export-backups)).

---

## Jokes

The **Jokes** tab is your material library. Each joke appears as a card showing
its title, status, version count and tags.

**Search and filters:**
- The search box filters jokes by title.
- Filter buttons show jokes by status. The statuses and what they mean:

| Status | Meaning |
|--------|---------|
| **idea** | a loose idea, not written yet |
| **draft** | a first pass at the text |
| **working** | being worked on and tested |
| **polished** | ready for the stage |
| **retired** | no longer in use |

**Create a joke:** click **"New joke"** (on mobile, use the round **+** button in
the bottom-right corner).

---

## The joke editor

Clicking a joke card opens the editor. Here you'll find:

- **Title** — click and type.
- **Status** — click one of the colored buttons to set it.
- **Tags** — comma-separated (e.g. `work, family, absurd`).
- **Versions** — tabs for each version of the text (see below).
- **Text** — the actual content of the selected version.
- **Notes** — your remarks about the version (italic, not part of the joke itself).
- **Duration (⏱)** — the estimated length of the version, e.g. `2:30` (min:sec)
  or `3` (treated as minutes). Used later to total up a setlist's length.

**Saving is automatic** — there is no "Save" button; every change is stored
immediately.

**Undo changes:** the **Undo / Redo** buttons at the top (or `Ctrl+Z` /
`Ctrl+Shift+Z`). History covers up to the last 50 steps.

**Delete a joke:** the **Delete** button at the top (with confirmation).

---

## Versions and the version tree

This is the heart of Satyryk. Every joke can have multiple versions of its text.

- **Add version** (`+`) — creates a new, empty version.
- **Branch** — creates a new version **copied from the current one** and linked to
  it as a "child". This lets you try an alternative punchline without losing the
  original.
- **Label** — you can name each version (defaults to `v1`, `v2`…).
- **Delete version** — if you delete a version that had branches, its "children"
  are re-attached to its parent (nothing is orphaned in the tree).

The **tree view** (the ⎇ **Show tree** button) displays the branching structure —
you can see which version grew from which. Clicking a node jumps to that version.

---

## Inline comments

In a version's text field, **select a fragment** — a **💬 Add comment** button
appears. Type a remark (e.g. "shorten this", "stronger word") and confirm (Enter).

- Commented fragments are **highlighted in yellow** in the text.
- All comments are listed below the text field.
- Remove a comment with the **✕** next to it.

It works like comments in a document editor, but pinned to a specific spot in a
specific version of a joke.

---

## Reactions

Above each version's text is a row of emoji reactions (by default 🔥 💀 😂 🤔 ❌ 👌).
Click one to tag the version — handy for quick assessment ("this one always lands").

You can change the emoji set: click the pencil icon **✎** next to the reactions
and enter your own emoji separated by spaces. The change applies across the whole
app.

---

## Setlists

The **Setlists** tab is for arranging material for a specific show.

1. Click **"New setlist"** and give it a title.
2. Optionally set the **show time** (🎤, e.g. a "20 min" slot).
3. From the **"Add jokes"** panel on the right, click jokes to add them to the
   list. The panel has its own search and status filter.
4. For each joke, choose **which version** you'll perform (if it has several).
5. **Segues:** the **"Add segue"** button inserts a bridging note between jokes
   (e.g. "call back to the previous bit").
6. Reorder with the **▲ / ▼** arrows; remove items with **✕**.

**Time totalling:** if every joke in the setlist has a duration filled in, Satyryk
shows the combined time (`~`). If any is missing a duration, it shows `?`.

Clicking a joke in the list expands its preview; from there you can also jump to
editing that joke.

---

## Stage view and printing

A setlist has two extra views:

- **Cards** — jokes as tiles; clicking one opens a full-text preview. Good for
  quickly browsing before a show.
- **Full text** — the whole setlist as continuous text, read top to bottom.

From the full-text view you can click **"Print / PDF"**. In the print dialog you
choose whether to:
- show joke titles,
- include notes,
- include segues,
- preserve double spacing (blank lines),
- add the show time at the top.

The preview updates live. The **"Print / PDF"** button opens a print-ready version
(you can save it as a PDF via the browser's print dialog).

---

## Import and export (backups)

Because your data lives only in your browser, **make backups**. The app will
remind you once a day with a discreet notification (💾).

On the **Jokes** page you have these buttons (hidden under the **☰** menu on
mobile):

- **Export all** — downloads a `satyryk-export-YYYY-MM-DD.json` file with all
  jokes and setlists.
- **Export selected** — opens a dialog where you choose:
  - which joke statuses to include,
  - all versions or the latest only,
  - which setlists to include (and optionally only the jokes from those setlists),
  - whether to "pretty-print" the file (indentation — more readable, larger file).
- **Import JSON** — loads one or more `.json` files. Imported jokes and setlists
  are **appended** to the existing ones (import merges, it does not overwrite).
- **Delete all** — erases all jokes and setlists (with confirmation). This is
  irreversible, so export first.

> **Tip:** export/import is also how you move material between devices or browsers —
> export here, import there.

---

## Language and shortcuts

- **Language:** the **PL / EN** switch in the top-right corner. It changes the
  interface (it does not translate your jokes).
- **Keyboard shortcuts** (in the joke editor, when the cursor is not in a text
  field):
  - `Ctrl+Z` — undo
  - `Ctrl+Shift+Z` — redo

---

## Where is my data?

Everything is saved in your browser's **localStorage**, under the key
`satyryk_v1`. This means:

- your data **never leaves** your device,
- it is tied to a **specific browser on a specific device**,
- **clearing your browser data** ("site data" / history) **will delete** it,
- private/incognito mode usually won't keep data after you close the window.

That's why the only true backup is the **exported JSON file** — keep it somewhere
safe.
