import React, { useState, useEffect } from 'react';
import { Calendar, ArrowRight, Check, Sparkles } from 'lucide-react';
import {
  SHAMSI_MONTHS_FA,
  shamsiToGregorian,
  formatUkDateDetailed,
  faToEnDigits,
} from '../utils/dateConverter';

interface ShamsiDateConverterWidgetProps {
  onSelectGregorianDate: (ukDateFormatted: string) => void;
  compact?: boolean;
}

export const ShamsiDateConverterWidget: React.FC<ShamsiDateConverterWidgetProps> = ({
  onSelectGregorianDate,
  compact = false,
}) => {
  const [shamsiYear, setShamsiYear] = useState<string>('1373');
  const [shamsiMonth, setShamsiMonth] = useState<number>(5); // Mordad default
  const [shamsiDay, setShamsiDay] = useState<string>('24');
  const [convertedResult, setConvertedResult] = useState<{
    formatted: string;
    textEn: string;
    textFa: string;
  } | null>(null);

  useEffect(() => {
    calculateConversion();
  }, [shamsiYear, shamsiMonth, shamsiDay]);

  const calculateConversion = () => {
    const cleanY = faToEnDigits(shamsiYear).trim();
    const cleanD = faToEnDigits(shamsiDay).trim();

    const y = parseInt(cleanY, 10);
    const d = parseInt(cleanD, 10);

    if (y >= 1300 && y <= 1410 && d >= 1 && d <= 31 && shamsiMonth >= 1 && shamsiMonth <= 12) {
      const { gy, gm, gd } = shamsiToGregorian(y, shamsiMonth, d);
      const res = formatUkDateDetailed(gy, gm, gd);
      setConvertedResult(res);
    } else {
      setConvertedResult(null);
    }
  };

  const handleApply = () => {
    if (convertedResult) {
      onSelectGregorianDate(convertedResult.formatted);
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-indigo-50/50 p-4 sm:p-5 rounded-3xl border border-teal-200/80 shadow-xs space-y-3 font-farsi dir-rtl">
      <div className="flex items-center justify-between text-right">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">
              مبدل خودکار تاریخ تولد (شمسی به میلادی)
            </h4>
            <p className="text-[11px] text-teal-800">
              اگر تاریخ تولد خود را به شمسی می‌دانید، اینجا انتخاب کنید تا به تاریخ میلادی بریتانیا تبدیل شود:
            </p>
          </div>
        </div>
        <span className="text-[10px] font-bold px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full border border-teal-200 shrink-0">
          Shamsi ➔ UK Date
        </span>
      </div>

      {/* Date Pickers Grid */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {/* Day */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700">روز:</label>
          <input
            type="number"
            min={1}
            max={31}
            value={shamsiDay}
            onChange={(e) => setShamsiDay(e.target.value)}
            placeholder="مثلا ۲۴"
            className="w-full px-3 py-2 text-center font-bold text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 dir-ltr"
          />
        </div>

        {/* Month */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700">ماه:</label>
          <select
            value={shamsiMonth}
            onChange={(e) => setShamsiMonth(parseInt(e.target.value, 10))}
            className="w-full px-2 py-2 text-xs font-bold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 font-farsi text-slate-800"
          >
            {SHAMSI_MONTHS_FA.map((m) => (
              <option key={m.id} value={m.id}>
                {m.id} - {m.fa} ({m.afghani})
              </option>
            ))}
          </select>
        </div>

        {/* Year */}
        <div className="space-y-1">
          <label className="block text-[11px] font-bold text-slate-700">سال شمسی:</label>
          <input
            type="number"
            min={1300}
            max={1410}
            value={shamsiYear}
            onChange={(e) => setShamsiYear(e.target.value)}
            placeholder="مثلا ۱۳۷۳"
            className="w-full px-3 py-2 text-center font-bold text-sm bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 dir-ltr"
          />
        </div>
      </div>

      {/* Real-time Output Banner */}
      {convertedResult ? (
        <div className="p-3 bg-white rounded-2xl border border-teal-300 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="space-y-0.5 text-right w-full sm:w-auto">
            <span className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>معادل تاریخ میلادی بریتانیا:</span>
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-base font-black text-slate-900 font-mono tracking-wider">
                {convertedResult.formatted}
              </span>
              <span className="text-xs text-slate-600 font-medium">
                ({convertedResult.textFa} / {convertedResult.textEn})
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApply}
            className="w-full sm:w-auto px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
          >
            <Check className="w-4 h-4" />
            <span>درج این تاریخ در فرم</span>
          </button>
        </div>
      ) : (
        <div className="text-center text-xs text-slate-500 py-1">
          لطفا سال شمسی ۴ رقمی (مانند ۱۳۷۰) و روز را به درستی وارد کنید.
        </div>
      )}
    </div>
  );
};
