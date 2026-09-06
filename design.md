# Hamyar design system

This file decides what the interface does and does not do. It is the reference
for every visual change: if something here and something in the code disagree,
this file wins and the code changes.

It is written for Hamyar specifically. It is not a general web design system and
should not be reused as one, because almost every decision below follows from
who is using the app rather than from taste.

---

## Who this is for

Every rule in this file traces back to one of these.

- **They read Persian or Dari, and little English.** Persian leads. English is
  present for the person on the other side of the desk: the nurse, the
  caseworker, the receptionist.
- **They are often frightened.** Someone opens this app because a letter arrived
  or an appointment went wrong. The interface should lower the temperature, not
  raise it. This is why the brand colour is a deep teal rather than a blue: it
  reads as care rather than administration, and it is calmer to arrive at.
- **They are on a cheap phone, frequently an old Android, often with a dim or
  cracked screen, sometimes on very little data.** Design for 360px and a poor
  screen, then let it grow.
- **They may have limited literacy in any script**, and a fair number have
  uncorrected vision because they have not registered with an optician here.
  Small type is not a style choice, it is an exclusion.
- **This app must not look like a government service.** The privacy notice
  promises that nothing reaches the Home Office, a caseworker or a landlord. An
  interface that resembles an official service quietly contradicts that promise
  before anyone reads it, and frightens exactly the people it is meant to serve.

---

## Principles

Each of these forbids something. A principle that forbids nothing is decoration.

1. **One thing per screen.** A person under stress can hold one instruction. If
   a screen has two primary actions, it has none.
2. **Colour means something or it is grey.** Five colours carry meaning in this
   app. Everything else is neutral. Decorative colour is banned.
3. **Persian first, always.** Not translated afterwards, not smaller, not
   secondary. If only one language fits, it is Persian.
4. **The document is the interface.** In Form Companion the person's own form
   owns the screen and the app furniture stands down. App chrome never competes
   with an official document.
5. **Say what happened.** Silence and spinners are not states. Every failure
   names itself in both languages, and says whether the fault is theirs or ours.

---

## Colour

### Roles

Five colours carry meaning. Nothing else is coloured.

| Role | Means | Never used for |
| --- | --- | --- |
| Primary | The app acting: buttons, links, progress, done | Backgrounds, decoration |
| Attention | Read this before you continue | Ordinary emphasis |
| Fault | Something went wrong | Anything working correctly |
| Neutral | Structure, text, borders, surfaces | Meaning of any kind |
| Document | Only inside a rendered official form | The app's own interface |

There is no separate success colour. Done is the primary plus a tick. A second
green beside a teal brand reads as an accident, and one fewer colour is one
fewer thing to learn.

### Tokens

Contrast ratios are measured, not estimated. Every text value clears WCAG 2.2
AA at 4.5:1, and every control boundary clears 3:1.

**Light**

```
--page              #F4F6F5   page ground, slightly desaturated to cut glare
--surface           #FFFFFF   cards, sheets, inputs
--text              #1A2320   14.8:1 on page
--text-muted        #55625E    5.9:1 on page
--border            #D5DCDA   decorative separation only
--border-control    #7C8B86    3.3:1 on page, required on inputs and controls
--primary           #0E6E64    5.6:1 on page, 6.1:1 under white text
--primary-press     #0A544C
--attention         #8A5A00    5.5:1 on page
--attention-bg      #FFF4D6    5.4:1 under attention text
--fault             #B3261E    6.0:1 on page, 6.5:1 under white text
--fault-bg          #FDECEA    5.7:1 under fault text
```

**Dark**

```
--page              #121614
--surface           #1A201E
--text              #E8EDEB   15.4:1 on page
--text-muted        #9AA8A4    7.4:1 on page
--border            #2C3634
--border-control    #606D69    3.4:1 on page
--primary           #4FBFB0    8.2:1 on page, 6.5:1 under #0B2E2A text
--primary-press     #6FD3C4
--attention         #E8B04B    9.3:1 on page
--attention-bg      #2B2413
--fault             #F0938B    8.0:1 on page
--fault-bg          #2E1917
```

Dark is a first-class theme, not an inversion. Both palettes are defined in
full, in that order, and no colour is ever declared only inside a media query.

### Rules

- `#005EB8` does not appear in the interface. It survives only inside rendered
  documents, where it belongs to the NHS and not to us.
- Neutrals carry a slight green bias so they sit with the teal. A pure grey next
  to a teal reads as unconsidered.
- Never encode meaning in colour alone. Fault carries an icon and words, done
  carries a tick, attention carries a heading.
- Focus is a solid `#FFD54A` ring with a `2px` `#1A2320` outline outside it. The
  dark outline is what makes it visible on a light ground, where yellow alone
  reaches only 1.3:1.

---

## Typography

### Faces

- **Persian and Dari: Vazirmatn.** Already loaded and applied. Do not replace it.
- **English: Vazirmatn's Latin.** One family across both languages, so a
  bilingual line does not change texture halfway through.
- **Numbers in tables and timers: `font-variant-numeric: tabular-nums`.**

### Scale

Sizes in px. **16px is the floor for anything a user must read.** Below that,
mobile Safari zooms the page on focus and Arabic script loses the marks that
carry its meaning.

| Step | Latin | Persian | Line height | Used for |
| --- | --- | --- | --- | --- |
| Caption | 14 | 15 | 1.5 / 1.8 | Timestamps, counts, non-essential meta |
| Body | 17 | 19 | 1.5 / 1.9 | Everything a person reads |
| Lead | 19 | 21 | 1.5 / 1.9 | Instructions, the question being asked |
| Title | 24 | 26 | 1.3 / 1.6 | Screen and card headings |
| Display | 30 | 32 | 1.2 / 1.5 | One per screen at most |

Persian sits one step larger with more leading throughout. This is not
generosity, it is legibility: Arabic script hangs its meaning on marks that
disappear first when type gets small or tight.

Nothing below 14px exists. Caption is for meta only and never carries an
instruction.

---

## Direction and bilingual layout

No off-the-shelf design system covers this, and it is where the current
interface fails most visibly.

- **One language per block.** Never two languages on one line. A heading is a
  Persian block with an English block beneath it, each with its own `dir` and
  alignment. `Talk to someone / گفتگو با کسی` is banned: two reading directions
  meet in the middle and neither language gets a clean start.
- **Persian block first, English second and smaller.**
- **Logical properties only.** `margin-inline-start`, `padding-inline-end`,
  `inset-inline-start`. Never `left` or `right` in layout. Both frontends we
  borrow from are LTR-only, so this part is ours to get right.
- **Wrap mixed content in `<bdi>`.** Names, addresses, reference numbers and
  phone numbers routinely mix scripts, and without `<bdi>` the bidi algorithm
  reorders them into nonsense.
- **Never truncate Persian with a middle or start ellipsis.** Truncation cuts
  the wrong end under RTL. Wrap to two lines instead.
- **Latin technical strings stay LTR inside an RTL block**: form names, NHS
  numbers, postcodes, email addresses, URLs.
- **Dates are Gregorian**, because every UK form is, and are written
  `dd/mm/yyyy`. Where a Shamsi equivalent helps, it goes beside, never instead.

---

## Space, size and shape

- **Spacing scale:** 4, 8, 12, 16, 24, 32, 48, 64. Nothing between.
- **Layout uses `gap`**, not per-element margins.
- **One radius: 8px.** The single exception is a status pill, which is fully
  round because that shape means "status" and nothing else does.
- **One shadow**, and a border is preferred to it. Border, fill, radius and
  shadow each say "separate object", so spending all four on every block flattens
  the hierarchy until nothing stands out.
- **Tap targets are 44px minimum**, reached with padding, never by inflating the
  icon. WCAG 2.2 requires 24px; 44px is what a cold hand on a bus can hit.
- **Content is 100% wide below 480px** with 16px side padding. No card inside a
  card inside a card.

---

## Components

- **Button.** One primary per screen. Full width on phones. Label says what
  happens: `شروع گفتگو`, not `ادامه`. Never an emoji inside it.
- **Icon.** Lucide only, one size per context, 20px in body text and 24px in
  navigation. Icons are decoration unless labelled; every icon-only control
  carries an `aria-label` in both languages.
- **Card.** Border, no shadow, 8px radius, 16px padding. Cards do not nest.
- **Notice.** Three kinds and no more: attention, fault, and quiet information.
  Each is a left-edge rule plus a heading, in both languages.
- **Navigation.** Five destinations at most in a fixed bottom bar, thumb height.
  Everything else lives behind "More". Nothing important is reachable only by a
  sideways swipe.
- **Document surface.** The form fills the screen, chrome retreats, the surround
  goes near-black so the paper reads as paper. This already exists in Form
  Companion and is the standard the rest of the app is held to.

---

## What we never do

Written as a list because each of these is currently in the code, and each has
to be removed rather than restyled.

- Emoji anywhere in the interface. They render differently on every device and
  screen readers announce their full names.
- Gradients. Flat fills only.
- Two languages sharing one line.
- Text below 14px, or below 16px for anything that must be read.
- More than one radius, one shadow, or five meaningful colours.
- A floating control that overlaps content.
- Flags used to mean languages. A flag is a country. Name the language.
- Colour as the only signal of state.
- Anything that makes Hamyar resemble an NHS or Home Office service.

---

## Accessibility floor

These are commitments we can be held to, and they are worth stating in a
funding bid because they are checkable.

- WCAG 2.2 AA throughout. Text 4.5:1, controls and boundaries 3:1.
- Every interactive element reachable and operable by keyboard, with a visible
  focus state.
- Every control labelled in Persian and English.
- The app remains usable at 200% browser zoom without horizontal scrolling.
- No information conveyed by colour alone.
- Motion respects `prefers-reduced-motion`.

---

## Where this came from

Honest provenance, because it matters if anyone asks.

- **Structure, discipline and the accessibility floor** follow the NHS digital
  service manual and the GOV.UK Design System. Both are the most heavily tested
  public service design systems available, built for people in stressful
  situations on poor equipment, which describes our users exactly.
- **Nothing branded is borrowed.** Both systems license their components but
  exclude branding, meaning logos and fonts. We take the method and none of the
  identity.
- **The palette is ours**, developed from the Digipezeshk teal `#009688`, which
  was deepened to `#0E6E64` because the original fails contrast at 3.67:1 under
  white text and could not legally be used for buttons or links.
- **The bilingual and right-to-left rules are entirely ours.** No public design
  system covers them.
