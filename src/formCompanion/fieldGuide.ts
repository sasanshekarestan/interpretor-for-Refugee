import { useEffect, useState } from 'react';
import { FormQuestion, UserLanguage } from '../types';
import { RenderedField } from '../components/OfficialPdfViewer';
import { cachedFieldGuide, cachedPageGuide } from '../data/guideCache';

/**
 * Guidance keyed to the real boxes on the paper form.
 *
 * A fillable UK form already names every box it contains and says where it
 * sits on the page, so the app can follow the person's finger across the
 * actual document instead of asking them to walk a separate list of
 * questions. Where we have hand-written Persian guidance for a box we use it;
 * anything else is explained on demand and remembered.
 */

export interface FieldExplanation {
  labelFa: string;
  meaningFa: string;
  whatToWriteFa: string;
  exampleAnswer?: string;
  cautionFa?: string;
  /** Where this came from, so the panel can be honest about it. */
  source: 'written' | 'ai';
}

/** "3.1 P1 Surname of family name" -> part 3, reference 3.1, plain label. */
export interface ParsedFieldName {
  part?: string;
  reference?: string;
  label: string;
  choice?: string;
}

const CHOICE_WORDS = /\b(yes|no)\b\s*$/i;

export const parseFieldName = (raw: string): ParsedFieldName => {
  let name = (raw || '').trim();

  // Names run words into numbers and often lead with the widget kind rather
  // than the question number: "Check Box1.1 - NHS Prescriptions".
  name = name.replace(/([A-Za-z])(\d)/g, '$1 $2');
  name = name.replace(/^check\s*box\s*/i, '').replace(/^(text|tx|btn)\s*[:.-]?\s*/i, '');

  const refMatch = name.match(/(\d+)\.(\d+)([a-z])?/);
  const reference = refMatch ? refMatch[0] : undefined;
  const part = refMatch ? refMatch[1] : undefined;

  let label = name;
  if (reference) label = label.slice(label.indexOf(reference) + reference.length);
  label = label.replace(/^[\s.:*-]+/, '').replace(/\s+/g, ' ').trim();

  let choice: string | undefined;
  const choiceMatch = label.match(CHOICE_WORDS);
  if (choiceMatch) {
    choice = choiceMatch[1].toLowerCase() === 'yes' ? 'بله' : 'خیر';
    label = label.replace(CHOICE_WORDS, '').replace(/[\s.:-]+$/, '').trim();
  }

  label = label.replace(/\bcheck box\b/gi, '').replace(/\s+/g, ' ').trim();

  return { part, reference, label: label || name, choice };
};

/**
 * Written guidance we already hold, matched to the boxes it describes.
 * A question's `fieldKey` maps to the patterns its boxes' names follow, so a
 * tap on the paper finds the Persian text a person wrote for it.
 */
const WRITTEN_FIELD_PATTERNS: Record<string, RegExp[]> = {
  hc1_refund_ticks: [/\b1\.1\b/],
  hc1_has_partner: [/\b1\.2\b/],
  hc1_part1_details: [/\b1\.3\b/],
  hc1_part2_children: [/\b2\.\d/],
  hc1_part4_savings: [/\b4\.\d/],
  hc1_part5_income: [/\b5\.\d/],
  hc1_part6_work: [/\b6\.\d/],
  hc1_part7_housing: [/\b7\.\d/],
  hc1_declaration: [/\b10[ab]?\b/],
};

/**
 * The written question that covers this box, if we have one.
 * Field names run words into numbers ("Check Box1.1 - NHS Prescriptions"), so
 * they are spaced out before matching; otherwise "1.1" hides inside "Box1.1".
 */
export const writtenGuidanceFor = (
  field: RenderedField,
  questions: FormQuestion[]
): FormQuestion | undefined => {
  const spaced = (field.name || '').replace(/([A-Za-z])(\d)/g, '$1 $2');
  for (const question of questions) {
    const patterns = WRITTEN_FIELD_PATTERNS[question.fieldKey];
    if (patterns && patterns.some((p) => p.test(spaced))) return question;
  }
  return undefined;
};

const cacheKey = (formId: string, fieldName: string, lang: UserLanguage) =>
  `field_guide_${formId}_${lang}_${fieldName}`.slice(0, 180);

const readCache = (key: string): FieldExplanation | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as FieldExplanation) : null;
  } catch (_) {
    return null;
  }
};

/**
 * Explain one box, from written guidance where we have it and from the
 * assistant otherwise. Explanations are kept, so a page costs its questions
 * once and then works offline.
 */
export const useFieldExplanation = (args: {
  formId: string;
  formTitle: string;
  field: RenderedField | null;
  pageText: string;
  questions: FormQuestion[];
  userLanguage: UserLanguage;
}) => {
  const { formId, formTitle, field, pageText, questions, userLanguage } = args;
  const [explanation, setExplanation] = useState<FieldExplanation | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  useEffect(() => {
    if (!field) {
      setExplanation(null);
      setStatus('idle');
      return;
    }

    // Written for this exact box, and shipped with the app. This comes first
    // because it is the most specific thing we have: the guidance below is
    // matched by part number, so one entry has to cover every box in a part,
    // while this describes the single box under the person's finger.
    const shared = cachedFieldGuide(formId, userLanguage === 'dari' ? 'dari' : 'farsi', field.name);
    if (shared) {
      setExplanation({ ...shared, source: 'written' });
      setStatus('idle');
      return;
    }

    const written = writtenGuidanceFor(field, questions);
    if (written) {
      const isDari = userLanguage === 'dari';
      setExplanation({
        labelFa: written.shortLabelFa || (isDari ? written.dariTranslation : written.farsiTranslation),
        meaningFa: isDari
          ? written.superSimpleExplanationDari || written.explanationFa
          : written.superSimpleExplanationFa || written.explanationFa,
        whatToWriteFa: written.whatTypeInfoNeeded,
        exampleAnswer: written.concreteExampleAnswer || written.exampleFormat,
        cautionFa: written.legalAidNotice,
        source: 'written',
      });
      setStatus('idle');
      return;
    }

    // Then whatever this device has already paid for.
    const key = cacheKey(formId, field.name, userLanguage);
    const cached = readCache(key);
    if (cached) {
      setExplanation(cached);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    setExplanation(null);
    setStatus('loading');

    fetch('/api/form/explain-field', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldName: field.name,
        fieldType: field.type,
        pageContext: pageText,
        formTitle,
        userLanguage,
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('explain failed');
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        const result: FieldExplanation = {
          labelFa: data.labelFa || '',
          meaningFa: data.meaningFa || '',
          whatToWriteFa: data.whatToWriteFa || '',
          exampleAnswer: data.exampleAnswer || '',
          cautionFa: data.cautionFa || '',
          source: 'ai',
        };
        setExplanation(result);
        setStatus('idle');
        try {
          localStorage.setItem(key, JSON.stringify(result));
        } catch (_) {}
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [field, pageText, formId, formTitle, questions, userLanguage]);

  return { explanation, status };
};

const pageCacheKey = (formId: string, pageIndex: number, lang: UserLanguage) =>
  `page_guide_${formId}_${lang}_${pageIndex}`;

/**
 * Explain a whole page of a form.
 *
 * A page of a fixed form reads the same for everyone, so the answer is looked
 * for in the shipped cache first, then in this device's own, and only then
 * asked for - and kept once it has been.
 */
export const explainPage = async (args: {
  formId: string;
  formTitle: string;
  pageIndex: number;
  pageText: string;
  userLanguage: UserLanguage;
}): Promise<{ answerFa: string; fromCache: boolean }> => {
  const { formId, formTitle, pageIndex, pageText, userLanguage } = args;

  const shared = cachedPageGuide(formId, userLanguage === 'dari' ? 'dari' : 'farsi', pageIndex);
  if (shared) return { answerFa: shared, fromCache: true };

  const key = pageCacheKey(formId, pageIndex, userLanguage);
  try {
    const stored = localStorage.getItem(key);
    if (stored) return { answerFa: stored, fromCache: true };
  } catch (_) {}

  const res = await fetch('/api/form/explain-page', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formTitle, pageNumber: pageIndex + 1, pageText, userLanguage }),
  });
  if (!res.ok) throw new Error('explain page failed');

  const data = await res.json();
  const answerFa = String(data.answerFa || '').trim();
  if (!answerFa) throw new Error('empty page explanation');

  try {
    localStorage.setItem(key, answerFa);
  } catch (_) {}

  return { answerFa, fromCache: false };
};
