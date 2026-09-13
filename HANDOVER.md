# Hamyar: state of play

Last updated 13 September 2026.

> **Corrected twice in one day.** The first version of this file said the design
> system had landed, when it had reached about half the app. The second version
> said so honestly and set out the work. That work is now done, and the numbers
> below come from `tests/design-guard.mjs` rather than from anyone's memory,
> which is the point of having built it.

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

## The design system

Finished on 13 September 2026, in five commits, one screen or one sweep each.
`tests/design-guard.mjs` measures it on every `npm test`, so the answer never
again depends on somebody's memory of a session.

| | Start of the day | Now |
| --- | --- | --- |
| Off-system neutrals (`slate-`, `gray-`, `zinc-`…) | 778 | 0 |
| Off-system Tailwind colours (`teal-`, `rose-`, `amber-`…) | 536 | 0 |
| Arbitrary type sizes (`text-[13.5px]`) | 47 | 0 |
| Typed arrow glyphs used as icons | 13 | 0 |
| Hardcoded hex values | 14 | 1 |
| Gradients | 7 | 0 |

The one remaining hex is `context.fillStyle = '#ffffff'` in the letter
reader, which paints a white page behind a PDF before rendering it. That is
drawing, not styling, and it should stay.

**Dark mode works now.** Most of the app was hardcoded light, so the dark half
of `tokens.css` had nothing to act on. Every screen renders correctly in dark
for the first time. Nobody asked for this; it fell out of the sweep, and it is
worth knowing before someone reports it as a bug.

### What the sweep also fixed

Colour was the smallest part of it.

- **Type below the floor.** 47 sizes under 14px, one at 10.5px, most of them in
  the letter reader and the form companion. `design.md` sets 16px as the floor
  for anything a person must read, and Persian one step above Latin throughout.
- **English leading the screen.** The letter reader's header, the four home
  cards, the message writer, the terminology library and the settings modal all
  put English first with Persian underneath in smaller, greyer type.
- **Two languages on one line.** "Take a photo | عکس گرفتن", "1. Who are you
  writing to? / گیرنده پیام کیست؟", and every error message in the letter
  reader, which was one string with a pipe in the middle. `design.md` bans this
  outright: two reading directions meet in the middle and neither language gets
  a clean start.
- **Tap targets.** The interpretation card's controls were 24px tall. 44px is
  what a cold hand on a bus can hit.
- **Meaning carried by the wrong colour.** The message writer was amber-branded,
  so every ordinary control on it wore the attention colour. A screen where
  everything warns you warns you about nothing.

### How it was done, if it ever needs doing again

`scripts/map-to-tokens.mjs` rewrites colour utility classes and nothing else,
and never touches a comment, because a comment saying "this used to be
slate-900" has to stay true. What it cannot decide it leaves and lists:
gradients, dark grounds, mid teals. Those were done by hand, per file, with a
screenshot of every screen at 390px and 1280px before anything was committed.

The lesson from the earlier failure on this project still holds: change one
exact kind of token, leave everything else alone, and check with your eyes.

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
- **Three of the eleven forms have no cached guidance**, because they have no
  document to walk. `arc_replacement` and `universal_credit` are online-only
  journeys and are not listed in the app at all. `school_admission` is now a
  guidance card (see the decision log).
- **No accounts, anywhere.** See the decision log below.
- **TypeScript is not in strict mode.** `npm run lint` therefore passes over a
  whole class of mistake, including the optional `pdfPath` that caused the
  School Application bug. Turning it on would produce hundreds of errors at
  once, so it is a job of its own rather than a line in someone else's commit.

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

**School admission is a guidance card, not a form.** 13 September 2026. The
entry declared `public/forms/school-admission.pdf`, which was not in the
repository. The SPA fallback served `index.html` in its place, pdf.js called it
an invalid PDF, and a parent looking for a school place was shown the words
"Invalid PDF structure" in English. There is no national in-year admission
form to add: admissions run council by council, so any single document would be
the wrong one for almost everybody. The card now says that plainly, lists what
the council will ask and what to have ready, and links to the GOV.UK page that
finds their council. `delivery: 'council'` is the new state for this, and
`pdfPath` is optional so that "we do not hold this form" can be said in the
data instead of discovered by a parser.

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

## What changed on 13 September 2026

Five commits, all merged.

**School Application was live and broken.** It declared a PDF that had never
been in the repository, so the SPA fallback served `index.html`, pdf.js called
it an invalid PDF, and a parent looking for a school place was shown the words
"Invalid PDF structure" in English. It is a guidance card now (decision log).

**The PDF viewer's three failure states were written for a developer.** The
missing state printed the static file path above the sentence "place the valid
PDF file at the path above inside the project public directory". Both now say,
Persian then English, that the fault is ours and not the reader's, and that the
questions still work. The exception text stays in the console.

**The test suites moved into `tests/`** with a runner, a static server that
reproduces Vercel's SPA fallback, and a README. They had lived in a session
workspace, which meant only whoever was in that session could run them.

**Two new suites.** `library-test` opens every card in the form library.
`design-guard` measures the design debt and stops it growing.

**The design system, finished.** See the section above.

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
