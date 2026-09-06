/**
 * One meaning per colour.
 *
 * Every colour used inside Form Companion comes from this file. If a new
 * meaning is needed, it gets a name here first — a raw Tailwind colour class
 * in a Form Companion component is a bug, not a shortcut.
 *
 *   primary   the action to take now — one per screen, nothing else is blue
 *   done      answered / complete
 *   attention check this before you write it on the paper form
 *   fault     failed, or will delete something
 *   (slate)   everything structural: surfaces, borders, text
 */

/**
 * The document's own colour, and never the app's. It appears inside a rendered
 * form because the form is printed in it, not because we chose it.
 */
export const NHS_BLUE = '#005EB8';

export const t = {
  // The single primary action. The same teal as the rest of the app: this used
  // to be NHS blue, from when Form Companion was trying to look like the paper
  // it sits next to, which made the app and the document hard to tell apart.
  primary: 'bg-primary text-on-primary hover:bg-primary-press',
  primaryText: 'text-primary',
  primaryRing: 'focus-visible:ring-[#0E6E64]',

  // Answered. There is no separate success colour: a second green beside a
  // teal brand reads as an accident, so done is the brand plus a tick.
  done: 'bg-primary text-on-primary',
  doneText: 'text-primary',
  doneSoft: 'bg-teal-50 text-teal-900 border-teal-200',
  doneFill: 'bg-primary',

  // Check this before writing it down.
  attention: 'bg-amber-50 text-amber-900 border-amber-300',
  attentionText: 'text-amber-700',

  // Failed, or destructive.
  fault: 'bg-rose-600 text-white hover:bg-rose-700',
  faultSoft: 'bg-rose-50 text-rose-800 border-rose-200',
  faultText: 'text-rose-700',

  // Structure.
  bar: 'bg-white border-slate-200',
  surface: 'bg-white border-slate-200',
  sunken: 'bg-slate-100',
  mat: 'bg-slate-800', // the dark mat a white page sits on, as in any PDF reader
  body: 'text-slate-900',
  muted: 'text-slate-600',
  faint: 'text-slate-400',
  line: 'border-slate-200',

  // Shared shapes.
  focus: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0E6E64]',
  tapTarget: 'min-h-[48px]',
} as const;

/** Chrome above the document on a phone is capped at this. Asserted in tests. */
export const APP_BAR_HEIGHT = 56;
