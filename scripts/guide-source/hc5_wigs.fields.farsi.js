/** The boxes on hc5_wigs, from the shared HC5 descriptions. */
import { hc5Fields } from './hc5-common.fields.farsi.js';

export default hc5Fields({
  paidFor: 'کلاه‌گیس یا پوشش پارچه‌ای',
  who: 'کلاه‌گیس یا پوشش پارچه‌ای پزشکی گرفته است',
  extra: [[/^check box2[456]$|and the charge for nhs wig|please send this form to the organisation/i, { labelFa: 'فقط برای اداره', meaningFa: 'این کادر در قسمت Part 5 است و مال کارمند اداره است.', whatToWriteFa: 'چیزی ننویسید.' }]],
});
