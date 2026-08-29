import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Users, 
  Mic, 
  Type as TypeIcon, 
  Globe2, 
  TrendingUp, 
  RefreshCw, 
  X, 
  Calendar, 
  Clock, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

interface AnalyticsData {
  totalVisits: number;
  uniqueVisitors: number;
  totalTranslations: number;
  voiceTranslations: number;
  textTranslations: number;
  wixEmbedViews: number;
  directVisits: number;
  firstSeenTimestamp: number;
  lastVisitTimestamp: number;
  dailyVisits: Record<string, number>;
}

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/analytics/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch analytics', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-800">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-base">Website Visitor & Usage Evaluation</h2>
              <p className="text-xs text-slate-500">Real-time metrics for academic and pilot study evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg transition"
              title="Refresh Stats / به روزرسانی آمار"
              aria-label="Refresh Stats / به روزرسانی آمار"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
              title="Close Analytics Modal / بستن پنجره آمار"
              aria-label="Close Analytics Modal / بستن پنجره آمار"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Total Visits */}
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50/40 p-4 rounded-xl border border-teal-100/80">
              <div className="flex items-center justify-between text-teal-700 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pageviews</span>
                <Globe2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.totalVisits || 0)}
              </div>
              <span className="text-[11px] text-teal-800/80 font-medium">All visits recorded</span>
            </div>

            {/* Unique Visitors */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 rounded-xl border border-blue-100/80">
              <div className="flex items-center justify-between text-blue-700 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.uniqueVisitors || 0)}
              </div>
              <span className="text-[11px] text-blue-800/80 font-medium">Individual devices</span>
            </div>

            {/* Total Translations */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50/40 p-4 rounded-xl border border-purple-100/80">
              <div className="flex items-center justify-between text-purple-700 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Interpreted</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.totalTranslations || 0)}
              </div>
              <span className="text-[11px] text-purple-800/80 font-medium">Translations done</span>
            </div>

            {/* Voice vs Text */}
            <div className="bg-gradient-to-br from-amber-50 to-orange-50/40 p-4 rounded-xl border border-amber-100/80">
              <div className="flex items-center justify-between text-amber-700 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Voice Sessions</span>
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {isLoading ? '...' : (stats?.voiceTranslations || 0)}
              </div>
              <span className="text-[11px] text-amber-800/80 font-medium">{stats?.textTranslations || 0} via text typing</span>
            </div>
          </div>

          {/* Traffic Breakdown */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white">
            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Traffic Sources & Platform Split
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Wix Embedded Site Views</div>
                  <div className="text-lg font-bold text-slate-800">{stats?.wixEmbedViews || 0}</div>
                </div>
                <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2 py-1 rounded">
                  Embedded
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Direct Standalone Visits</div>
                  <div className="text-lg font-bold text-slate-800">{stats?.directVisits || 0}</div>
                </div>
                <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  Direct Link
                </span>
              </div>
            </div>
          </div>

          {/* Evaluation Information note */}
          <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-4 text-xs text-teal-900 space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-teal-950">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              Evaluation & Ethics Note
            </div>
            <p className="leading-relaxed">
              Every visitor loading the widget (whether through the Wix site or direct launch) increments the visitor count and unique device token anonymously. No audio files or personal biometric data are stored, ensuring full compliance with GDPR and ethical research guidelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated live on every user interaction</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
