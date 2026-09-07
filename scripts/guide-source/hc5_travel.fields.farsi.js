/** The boxes on hc5_travel, from the shared HC5 descriptions. */
import { hc5Fields } from './hc5-common.fields.farsi.js';

export default hc5Fields({
  paidFor: 'رفت‌وآمد به محل درمان',
  who: 'برای درمان سفر کرده است',
  extra: [[/^refund date - (day|month|year)$/i, { labelFa: 'فقط برای اداره', meaningFa: 'این کادر مال کارمند اداره است.', whatToWriteFa: 'چیزی ننویسید.' }]],
});
