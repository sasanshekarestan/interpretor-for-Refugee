# Hamyar

A bilingual Farsi and Dari to British English web app for refugees and asylum
seekers in the UK. Built and owned by Mehr Health CIC (Sasan Shekarestan,
director). Live at https://interpretor-for-refugee.vercel.app, footer points to
mehrhealth.co.uk.

Before changing anything, read these two files. They are short and they are the
point of this repo.

- `design.md` decides what the interface does and does not do. If `design.md`
  and the code disagree, `design.md` wins and the code changes.
- `HANDOVER.md` is the state of play: what is built, what is deliberately not
  built, what is waiting on Sasan, and why each decision was taken.

---

## Who this is for

People who read Persian or Dari and little English, often frightened, often on
an old Android with a dim or cracked screen and very little data. Every rule
below follows from that rather than from taste. A change that is prettier and
harder to use is a regression.

---

## Hard rules

1. **Persian leads.** English is present for the person on the other side of the
   desk: the nurse, the caseworker, the receptionist. Never English first, never
   Persian in smaller or lighter type. If only one language fits, it is Persian.
2. **Right to left is the default.** Put `dir="rtl"` on the container. For a run
   of Latin text inside it, use `dir="ltr"` plus the `.font-latin` class, which
   escapes the inherited Vazirmatn. Wrap inline Latin in `<bdi>`. There is no
   `dir-rtl` class and there never was; a phantom of that name survived in
   fourteen places across eight files and did nothing at all.
3. **Colour means something or it is grey.** The whole palette is in
   `src/tokens.css` as `--hamyar-*` custom properties, with the contrast ratio
   written next to each one. Never introduce a colour that is not there. Never
   hardcode a hex value in a component.
4. **Nothing leaves the device that does not have to.** No accounts, no login,
   no server-side storage of anyone's documents or conversations. My Documents
   is IndexedDB on the device and stays that way. This was decided deliberately
   in September 2026 after Google and Apple sign-in were assessed and rejected:
   the people using this app have good reasons not to attach their identity to a
   record of their asylum paperwork.
5. **Do not make this look like a government service.** The privacy notice
   promises that nothing reaches the Home Office, a caseworker or a landlord. An
   interface that resembles an official service contradicts that promise before
   anyone reads it.
6. **Say what happened.** Spinners and silence are not states. Every failure
   names itself in both languages and says whose fault it is.
7. **Never claim something the app does not do.** This applies to notices and
   copy as much as to code. The standard cookie wording was shortened because it
   said the app personalises content, and it does not.

---

## Stack

- React 19, Vite 6, TypeScript.
- Tailwind 4 with CSS-first `@theme`. There is **no `tailwind.config` file**.
  Tokens are declared in `src/tokens.css` and become utilities from there.
- Express backend in a single file, `api/index.ts` (about 1,600 lines), deployed
  as a Vercel function. Needs `GEMINI_API_KEY`.
- `pdfjs-dist` (legacy build) reads AcroForm widgets out of the official PDFs.
- `lucide-react` for icons, `motion` for the little movement there is.

### Commands

```
npm run dev          # tsx api/index.ts, serves the app and the API together
npm run build        # vite build, then esbuild the server
npm run lint         # tsc --noEmit. There is no ESLint.
npm run guide-cache -- <formId> [--dari]    # writes a form's cached guidance
```

### Environment

`.env.example` is current. `GEMINI_API_KEY` is required.
`VITE_GA_MEASUREMENT_ID` is optional and **build time**: setting it in Vercel
without redeploying changes nothing, because Vite bakes `VITE_*` values into the
bundle at build. With it unset the cookie notice never appears and no request is
ever made to Google, which is the correct behaviour for a local build or a fork.

---

## Layout

```
src/
  App.tsx                  navigation, home page, the eight tabs
  tokens.css               the entire palette, light and dark
  index.css                fonts, .font-latin, global cursor rule
  types.ts                 AppTab and the shared shapes
  components/              one file per screen or modal
  formCompanion/           the form filling flow, its own small system
  data/officialForms.ts    the form library: eleven forms, their sections
  utils/documentStore.ts   IndexedDB, two stores: metadata and blobs
  utils/analytics.ts       consent gate and the GA loader
public/
  forms/*.pdf              the official documents themselves
  guide-cache/*.json       pre-written Persian guidance per form
scripts/
  build-guide-cache.mjs    walks a PDF and writes its guidance file
  build-favicons.mjs       extracts the H from the wordmark at build time
  guide-source/            hand-written Persian used by the cache builder
```

Tabs are `home`, `interpreter`, `letter_scanner`, `form_companion`,
`message_writer`, `phrases`, `documents`, `more`. Their bilingual labels live in
one place, `src/components/tabLabels.ts`, and `BackBar` reads them so the back
control can name where it is going in both languages.

---

## The guidance cache

An official form asks the same question of the first person and the ten
thousandth, so paying the model to describe box 3.1 every time is slow, costly
and needs a connection. `public/guide-cache/<formId>.farsi.json` holds the
explanations for every page and every box of one form. The app fetches it when
the form opens and answers instantly from it. Anything missing still falls back
to the model, so a partial file makes the app slower, never broken.

These files are the words a frightened person actually reads. They are kept in
the repo rather than a hidden cache precisely so they can be read and corrected
by hand, and the generator skips anything already written.

Two known gaps, both deliberate, both explained in `HANDOVER.md`: twenty boxes
in HC5(O) and the whole of the GP registration form, which has no AcroForm
fields at all.

---

## Testing

Playwright suites live outside the repo, in the session workspace, and are run
against a local build at 390px (phone) and 1280px (desktop). They stub the API
with `page.route()` so that anything answered by the model shows up as the
literal string `FROM_THE_MODEL`.

Eleven suites: `back-test`, `cursor-test`, `docs-test`, `favicon-test`,
`gp-cache-test`, `hc5-test`, `cookie-test`, `error-test`, `speech-test`,
`export-test`, `cache-test`.

Every suite except `cookie-test` seeds the cookie choice before the page loads,
or the notice sits over the bottom of the screen and eats the taps being tested:

```js
await page.addInitScript(() => {
  try { localStorage.setItem('hamyar_cookie_choice', 'rejected'); } catch (_) {}
});
```

Run all of them before delivering anything. Two real bugs were caught this way
that no amount of reading would have found: a cookie banner whose invisible
padding killed the entire mobile navigation, and a guidance cache that silently
served `index.html` because the build had not been rerun.

---

## Delivering work

The sandbox has no credentials for Sasan's GitHub. Work is delivered as a git
bundle and merged on his Mac:

```
git bundle create hamyar-<topic>.bundle main        # in the sandbox
# deliver the file, then on the Mac:
git fetch <bundle> HEAD:hamyar-incoming
git merge --ff-only hamyar-incoming
```

Then Sasan pushes, because only he can. Two things go wrong repeatedly and are
worth checking first: stale `.git/*.lock` files on the Mac block the merge, and
deleting them needs a fresh permission request each session.

Commit messages in this repo are a plain sentence about what changed for the
person using the app, not a conventional-commits prefix. "The cookie policy
folds away" rather than "fix(ui): collapse policy".
