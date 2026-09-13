/**
 * Names for the colours Form Companion uses. Not a second palette.
 *
 * This file used to hold its own values: the NHS's blue exported as NHS_BLUE
 * and used nowhere, the brand teal typed out by hand three times for focus
 * rings, and every structural colour expressed as a raw Tailwind slate. That
 * made two sources of truth for one
 * design system, which is how the app ended up with a teal that was right in
 * one half and approximated in the other.
 *
 * Every entry below now resolves to a token from tokens.css, so there is one
 * place to change a colour and this file only decides which token carries
 * which meaning inside Form Companion:
 *
 *   primary   the action to take now, one per screen
 *   done      answered, complete
 *   attention check this before you write it on the paper form
 *   fault     failed, or will delete something
 *   structure surfaces, borders, text
 *
 * A raw Tailwind colour class in a Form Companion component is still a bug,
 * not a shortcut. tests/design-guard.mjs counts them.
 */

export const t = {
  // The single primary action. The same teal as the rest of the app: this used
  // to be NHS blue, from when Form Companion was trying to look like the paper
  // it sits next to, which made the app and the document hard to tell apart.
  primary: 'bg-primary text-on-primary hover:bg-primary-press',
  primaryText: 'text-primary',
  primaryRing: 'focus-visible:ring-primary',

  // Answered. There is no separate success colour: a second green beside a
  // teal brand reads as an accident, so done is the brand plus a tick.
  done: 'bg-primary text-on-primary',
  doneText: 'text-primary',
  doneSoft: 'bg-surface text-primary border-primary',
  doneFill: 'bg-primary',

  // Check this before writing it down.
  attention: 'bg-attention-bg text-attention border-attention',
  attentionText: 'text-attention',

  // Failed, or destructive.
  fault: 'bg-fault text-on-primary hover:opacity-90',
  faultSoft: 'bg-fault-bg text-fault border-fault',
  faultText: 'text-fault',

  // Structure.
  bar: 'bg-surface border-edge',
  surface: 'bg-surface border-edge',
  sunken: 'bg-page',
  // The dark mat a white page sits on, as in any PDF reader. design.md:
  // "the surround goes near-black so the paper reads as paper".
  mat: 'bg-emphasis',
  body: 'text-ink',
  muted: 'text-ink-muted',
  faint: 'text-ink-muted',
  line: 'border-edge',

  // Shared shapes. The focus ring is the system's, defined once in index.css.
  focus: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary',
  tapTarget: 'min-h-[48px]',
} as const;

/** Chrome above the document on a phone is capped at this. Asserted in tests. */
export const APP_BAR_HEIGHT = 56;
