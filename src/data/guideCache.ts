/**
 * Answers that are the same for everybody.
 *
 * An official form does not change between people: box 3.1 of ASF1 asks the
 * same thing of the first person to open it and the ten-thousandth. Paying the
 * model to describe it again for each of them is waste, and it is also slower
 * and needs a connection.
 *
 * So the explanations for a fixed form are worked out once and kept as plain
 * data in `public/guide-cache/<formId>.<language>.json`. They are free after
 * that, instant, and - because they are ordinary files in the repo - anything
 * clumsy in the Persian can be corrected by hand and stays corrected.
 *
 * They are fetched when a form is opened rather than shipped inside the app,
 * because a single form runs to hundreds of boxes: bundling every form for
 * every language would make the app slow to open for someone on a phone, to
 * pay for guidance on forms they never look at.
 *
 * Populate a form's file with `node scripts/build-guide-cache.mjs <formId>`.
 * Anything missing simply falls back to asking at the time, so a gap is
 * slower rather than broken.
 */

export interface CachedFieldGuide {
  labelFa: string;
  meaningFa: string;
  whatToWriteFa: string;
  exampleAnswer?: string;
  cautionFa?: string;
}

export interface FormGuideCache {
  /** Keyed by the normalised field name or printed line. */
  fields?: Record<string, CachedFieldGuide>;
  /** Keyed by page index, as a string. */
  pages?: Record<string, string>;
}

export type GuideLanguage = 'farsi' | 'dari';

/**
 * Whitespace and case vary between renders of the same words, so keys are
 * normalised on both sides - here and in the generator.
 */
export const guideCacheKey = (text: string): string =>
  (text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .slice(0, 300);

const loaded = new Map<string, FormGuideCache>();
const inFlight = new Map<string, Promise<void>>();

const slot = (formId: string, language: GuideLanguage) => `${formId}.${language}`;

/**
 * Fetch a form's shared guidance, once per session.
 *
 * A form with no file yet is remembered as empty, so a missing file costs one
 * failed request rather than one per tap.
 */
export const loadGuideCache = (formId: string, language: GuideLanguage): Promise<void> => {
  const key = slot(formId, language);
  if (loaded.has(key)) return Promise.resolve();

  const existing = inFlight.get(key);
  if (existing) return existing;

  const request = fetch(`/guide-cache/${formId}.${language}.json`)
    .then((res) => (res.ok ? res.json() : {}))
    .then((data) => {
      loaded.set(key, (data && typeof data === 'object' ? data : {}) as FormGuideCache);
    })
    .catch(() => {
      loaded.set(key, {});
    })
    .finally(() => {
      inFlight.delete(key);
    });

  inFlight.set(key, request);
  return request;
};

export const cachedFieldGuide = (
  formId: string,
  language: GuideLanguage,
  fieldText: string
): CachedFieldGuide | undefined =>
  loaded.get(slot(formId, language))?.fields?.[guideCacheKey(fieldText)];

export const cachedPageGuide = (
  formId: string,
  language: GuideLanguage,
  pageIndex: number
): string | undefined => loaded.get(slot(formId, language))?.pages?.[String(pageIndex)];
