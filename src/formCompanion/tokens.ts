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

export const NHS_BLUE = '#005EB8';

export const t = {
  // The single primary action.
  primary: 'bg-[#005EB8] text-white hover:bg-[#004a92] active:bg-[#003d78]',
  primaryText: 'text-[#005EB8]',
  primaryRing: 'focus-visible:ring-[#005EB8]',

  // Answered / complete.
  done: 'bg-emerald-600 text-white',
  doneText: 'text-emerald-700',
  doneSoft: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  doneFill: 'bg-emerald-500',

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
  focus: 'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#005EB8]',
  tapTarget: 'min-h-[48px]',
} as const;

/** Chrome above the document on a phone is capped at this. Asserted in tests. */
export const APP_BAR_HEIGHT = 56;
