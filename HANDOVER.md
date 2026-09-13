# Hamyar: state of play

Last updated 13 September 2026, at commit `36408b3`.

This is the file to read when picking the project up cold, in a new chat or a
new session. It says what exists, what is deliberately absent, what is waiting
on a person rather than on code, and why the awkward decisions were made the way
they were. `CLAUDE.md` holds the working rules, `design.md` holds the interface
rules, and this file holds the history that makes both make sense.

---

## What Hamyar is

A bilingual Farsi and Dari to British English web app for refugees and asylum
seekers in the UK. It does five things, and each of them replaces a moment where
someone would otherwise need an interpreter they cannot get.

| Screen | What it replaces |
|---|---|
| Live interpreter | Two people who cannot speak to each other at a GP desk |
| Letter reader | An official letter nobody in the house can read |
| Form companion | Filling in an NHS or Home Office form with no help |
| Message writer | Writing to a landlord, a school, a caseworker |
| My documents | A carrier bag of paperwork with no order in it |

Owner: Mehr Health CIC, a PIF TICK certified Community Interest Company.
Repository: `sasanshekarestan/interpretor-for-Refugee`.
Deployed on Vercel at `interpretor-for-refugee.vercel.app`.

---

## Waiting on Sasan

Nothing in this list is a code problem, and none of it can be done from a
session.

1. **`VITE_GA_MEASUREMENT_ID` is not set in Vercel.** Until it is, the cookie
   notice never appears and there are no visitor numbers at all. It needs a GA4
   property first (Admin, then Data Streams, for the `G-XXXXXXXXXX` value), then
   the variable added to Production and Preview, then a **redeploy**, because
   Vite bakes `VITE_*` values in at build time. Saving the variable alone does
   nothing.
2. **Wales and Scotland versions of the HC forms**, deferred pending funding.
   The four HC5 forms currently in the library are the England ones and are
   labelled as such.

---

## Open offers, not yet taken up

- A cookieless server-side visitor counter alongside Google Analytics. Worth
  doing before any funding bid quotes usage numbers, because GA only ever sees
  the people who pressed Accept. The real total will be higher than the reported
  one and there is currently no way to say by how much, which is an awkward
  position to be in when a funder asks.

---

## Known gaps, all deliberate

- **Twenty boxes in HC5(O) are not cached.** In the PDF they are named
  `Check Box3` through `Check Box18`, with nothing in the document to say what
  any of them is. Guessing which one is the war pension box and writing a
  confident Persian explanation of a guess would be worse than the current
  behaviour, which is a short pause while the model reads the page.
- **GP registration (GMS1) has no AcroForm fields at all.** The page level
  guidance is cached for all eight pages, so a person is never stuck, but
  tapping an individual box still calls the model because there is no box to
  identify.
- **No accounts, anywhere.** See the decision log below.

---

## Decision log

These are the ones that would otherwise be reopened by someone arriving fresh
and reasoning from first principles.

**Device-only storage for My Documents.** September 2026. Sasan noticed a letter
appearing in a different browser and read it as a privacy leak. It was not: My
Documents was a pure mockup with two hardcoded sample documents, present
identically for everyone. Sign-in with Google, Apple and Facebook was assessed
as the fix and rejected in favour of IndexedDB on the device. The reasoning is
that asking someone to attach a Google identity to a stored record of their
asylum paperwork asks them to trust a promise this app cannot make for them.
Support workers were the argument for accounts and it is a real one, but it does
not outweigh this. The trade is stated plainly on screen: these stay on this
device, and clearing the browser clears them.

**Opt-in cookie consent with Accept and Reject the same size.** UK law requires
opt-in before an analytics cookie is set, and the ICO requires that refusing is
as easy as agreeing. A single OK button would have been an announcement rather
than consent, and would have left Mehr Health relying on a banner that does not
do the job it appears to do. Nothing loads before an answer, the choice can be
changed later under Privacy and data, and the whole app works after a refusal.

**The standard cookie wording was shortened.** Sasan supplied the usual industry
sentence, which includes "and personalize content". Hamyar personalises nothing:
no profiling, no recommendations, nothing that differs per person. Claiming
otherwise in a privacy notice is a false statement about the product, made to
precisely the people most frightened of being profiled. That phrase is removed
and `cookie-test.mjs` fails if it ever comes back.

**The guidance cache exists in the repo, not in a hidden store.** These files are
the words a frightened person reads. Keeping them visible means they can be read
and corrected by hand, and the generator skips anything already written, so a
hand correction stays corrected.

**Four separate HC5 forms rather than one combined card.** The NHS made them four
separate papers with four separate posting addresses. Someone holding the dental
one should not be reading about optical vouchers.

**The back button is a named destination, not an arrow.** It is the most used
control on any website and it was inert. It is now a teal bordered pill, 51px
tall, that says where it is going in both languages.

---

## What changed in the September 2026 session

Fifteen commits, all merged and pushed. In rough order:

- A distinctive, working back control (`BackBar.tsx`) and one source of truth for
  tab labels (`tabLabels.ts`).
- SPA navigation rebuilt on `history.pushState` and `popstate`, with
  `scrollRestoration = 'manual'` and a `useLayoutEffect` that scrolls to the top
  of a new screen. This fixed the phone bug where tapping a card opened the next
  page already scrolled to its bottom.
- A larger desktop hero and four home cards with consistent icon treatment.
- A global cursor rule in `index.css`, so every interactive element shows the
  hand on desktop and no disabled control promises a press. `cursor-test.mjs`
  walks five screens and reads the computed cursor off everything it finds.
- A new emphasis surface (`--hamyar-emphasis`, dark teal, 12.1:1 under white)
  replacing an off-system slate. The official forms block, the live interpreter
  introduction, the letter reader panel and the form library hero all sit on it
  now, all right to left, all Persian first.
- `dir-rtl`, a class that never existed, removed from fourteen places including
  three Persian textareas.
- My Documents rewritten from mockup to real IndexedDB storage, with bilingual
  categories, an on-screen notice about what device-only means, and a two-step
  delete everything.
- Form library cards given a hierarchy: code chip, Persian title, purpose,
  action, then the English title and issuer.
- Favicons generated at build time from the wordmark's own H glyph
  (`build-favicons.mjs`), plus a web manifest and a proper document title.
- GP registration added with all eight pages of guidance cached.
- Four HC5 refund forms added, each its own section, each with its own cached
  guidance, sharing hand-written Persian through `hc5-common.*.js`.
- A cookie notice, Consent Mode v2, a consent gated GA loader, and a cookie
  policy that folds away rather than pushing the buttons off a phone screen.

---

## Traps

Three of these cost real time. They are written down so they cost less next
time.

1. **Rebuild before testing the guidance cache.** A new `guide-cache` JSON file
   that is not in `dist/` is served by the SPA fallback as `index.html`, with
   content type `text/html`, and the app quietly asks the model instead. The
   symptom is a passing eye test and a failing cache test.
2. **Never run a whitespace tidy with a regex across `.tsx` files.** One during
   the `dir-rtl` sweep stripped indentation inside template literal class names
   and had to be reverted wholesale. Remove the exact token and one adjacent
   space, nothing else.
3. **A fixed position notice with padding is a tap trap.** The cookie notice's
   bottom padding, which lifts it clear of the phone navigation, sat invisibly
   over the entire tab bar and swallowed every tap on it. The wrapper is
   `pointer-events-none` and only the card is `pointer-events-auto`. Two
   unrelated test suites timing out is what found it.
