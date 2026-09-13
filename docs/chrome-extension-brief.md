# Hamyar Form Companion: Chrome extension brief

Written 13 September 2026 for the chat that will build it. Read `CLAUDE.md` and
`HANDOVER.md` first, because everything about tone, language, colour and privacy
carries over unchanged.

This brief deliberately opens with the things that could make the project a
waste of money, because they are cheaper to settle now than after a month of
building.

---

## Five questions to settle before writing any code

**1. Chrome extensions do not run on Android.** Hamyar's primary users are on
cheap Android phones. Chrome on Android supports no extensions at all, and it is
not on Google's roadmap. So this extension cannot serve the people the web app
serves. It can only serve someone at a desktop computer.

That is not automatically a reason not to build it. Sasan has said more than
once that support workers are a real audience, and support workers do sit at
desktops, filling forms on behalf of people who cannot. But the project has to
be honestly named as a **support worker and caseworker tool**, in the funding
bid as much as in the listing. A bid that implies refugees will install it will
not survive a careful reader.

**2. Most of the forms Hamyar covers are PDFs, not web pages.** Of the eleven
forms in `src/data/officialForms.ts`, the NHS and Home Office ones are printed
paper that people download, print and post. An extension that annotates web
pages cannot help with any of those, and the web app already handles them
better.

Before building, list the forms that genuinely exist as fill-in web pages:
Universal Credit, some council housing portals, school admissions in some
boroughs, the NHS e-Referral Service, GP online registration in England. Count
them. If the answer is three, the extension is a three form tool, and that is
worth knowing before rather than after.

**3. The API key cannot ship in the extension.** Anything in an extension bundle
is readable by anyone who installs it. So the extension must call the existing
Hamyar backend, which means `api/index.ts` gains a public caller it did not have
before. That needs, at minimum, CORS restricted to the extension's own ID, a
rate limit, and an honest look at what happens when someone finds the endpoint
and scripts it. Cost control is a real risk here, not a theoretical one.

**4. Reading a government form page is sensitive, and the privacy promise has to
hold.** Hamyar's whole position is that nothing reaches the Home Office, a
caseworker or a landlord. An extension that can read the page a person is
filling in is, technically, the most invasive thing in the project. The design
constraint that follows: send the **field label only**, never the value the
person has typed, never the page content in bulk, never anything identifying.
Store nothing. Say so in the listing, in the options page and in the Persian.

**5. The Chrome Web Store will ask why.** Broad host permissions get scrutiny
and slow reviews. Ask for named domains (`*.gov.uk`, `*.nhs.uk`, the specific
council portals) rather than `<all_urls>`, and write the permission
justification and privacy policy before submitting rather than during review.
A public privacy policy URL is mandatory. Mehr Health has a site for it.

---

## What it should do, if it goes ahead

One job, done properly, in the spirit of "one thing per screen".

A person, or more likely a support worker, is on a real government form in the
browser. The extension puts a small Hamyar mark next to each field. Clicking it
opens a panel with, in Persian first:

- what this field is actually asking for, in plain language;
- what to write if you are an asylum seeker specifically, which is where the
  official guidance is usually silent and where Hamyar earns its place;
- the English term, so the person can say it aloud at a desk.

Plus one page level control: explain this whole page, the same call the web app
already makes.

Nothing is filled in automatically. The extension explains, it does not act. An
extension that types into a Home Office form on someone's behalf is a different
and much heavier product, with a liability question attached.

---

## What already exists to reuse

Do not rebuild any of this.

**Endpoints in `api/index.ts`:**

```
POST /api/form/explain-field      one box, Persian explanation
POST /api/form/explain-page       a whole page
POST /api/form/chat               follow-up questions in Persian
POST /api/form/parse-answer       turns a spoken or typed Persian answer into the English the form wants
```

**The guidance cache**, `public/guide-cache/<formId>.farsi.json`. Already served
as static files. If a web form matches a form already cached, the extension can
fetch that file once and answer instantly and free, exactly as the web app does.
This is the single biggest cost saving available and it is already built.

**The design system**: `src/tokens.css` and `design.md`. The extension must look
like Hamyar. Same teal, same emphasis surface, same Persian-first hierarchy,
same Vazirmatn. Copy the tokens file rather than inventing a second palette.

**`src/formCompanion/fieldGuide.ts`**, the existing mapping of field to
explanation, and `src/data/officialForms.ts`, the form metadata.

---

## Technical shape

- Manifest V3. The service worker sleeps, so hold no state in it that matters.
- No remote code execution is allowed under MV3, so everything ships in the
  bundle and only data crosses the wire.
- Content script for the field detection and the marks; a side panel or a
  shadow-DOM panel for the explanation, so host page CSS cannot break it.
- Field detection: `<label for>`, `aria-label`, `aria-labelledby`, then the
  nearest preceding text node, in that order. GOV.UK forms are unusually well
  marked up, which helps a lot; council portals are not.
- Build it as a separate repository. It shares an API and a palette with the web
  app, not a build. Mixing them makes both harder to deploy.

---

## Suggested order of work

1. Answer question 2 above: count the forms that are genuinely web pages. One
   afternoon, no code, and it decides whether the rest happens.
2. A throwaway prototype against one form only, probably GP online registration
   or Universal Credit, with the explanation hardcoded. Prove the field
   detection works on a real page before building anything around it.
3. CORS, rate limiting and an extension-only auth token on the existing
   endpoints. Do this before anything is public.
4. The real extension: detection, panel, Persian, cache lookup, options page.
5. Store listing, privacy policy, permission justification, screenshots.

Steps 1 and 3 are the ones most likely to be skipped and most expensive to skip.
