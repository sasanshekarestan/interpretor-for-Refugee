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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emphasis/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-surface rounded-2xl shadow-hamyar border border-edge w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-edge flex items-center justify-between bg-page">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-page flex items-center justify-center text-primary">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-ink text-base">Website Visitor & Usage Evaluation</h2>
              <p className="text-xs text-ink-muted">Real-time metrics for academic and pilot study evaluation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="p-1.5 text-ink-muted hover:text-ink hover:bg-page rounded-lg transition"
              title="Refresh Stats / به روزرسانی آمار"
              aria-label="Refresh Stats / به روزرسانی آمار"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-ink-muted hover:text-ink-muted hover:bg-page rounded-lg transition"
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
            <div className="bg-page p-4 rounded-xl border border-edge">
              <div className="flex items-center justify-between text-primary mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Pageviews</span>
                <Globe2 className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-ink">
                {isLoading ? '...' : (stats?.totalVisits || 0)}
              </div>
              <span className="text-xs text-primary font-medium">All visits recorded</span>
            </div>

            {/* Unique Visitors */}
            <div className="bg-page p-4 rounded-xl border border-edge">
              <div className="flex items-center justify-between text-primary mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Unique Visitors</span>
                <Users className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-ink">
                {isLoading ? '...' : (stats?.uniqueVisitors || 0)}
              </div>
              <span className="text-xs text-primary font-medium">Individual devices</span>
            </div>

            {/* Total Translations */}
            <div className="bg-page p-4 rounded-xl border border-edge">
              <div className="flex items-center justify-between text-primary mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Interpreted</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-ink">
                {isLoading ? '...' : (stats?.totalTranslations || 0)}
              </div>
              <span className="text-xs text-primary font-medium">Translations done</span>
            </div>

            {/* Voice vs Text */}
            <div className="bg-attention-bg p-4 rounded-xl border border-attention">
              <div className="flex items-center justify-between text-attention mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider">Voice Sessions</span>
                <Mic className="w-4 h-4" />
              </div>
              <div className="text-2xl font-black text-ink">
                {isLoading ? '...' : (stats?.voiceTranslations || 0)}
              </div>
              <span className="text-xs text-attention font-medium">{stats?.textTranslations || 0} via text typing</span>
            </div>
          </div>

          {/* Traffic Breakdown */}
          <div className="border border-edge rounded-xl p-4 bg-surface">
            <h3 className="text-sm font-bold text-ink mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Traffic Sources & Platform Split
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-page rounded-lg border border-edge flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-muted font-medium">Wix Embedded Site Views</div>
                  <div className="text-lg font-bold text-ink">{stats?.wixEmbedViews || 0}</div>
                </div>
                <span className="text-xs font-semibold bg-page text-primary px-2 py-1 rounded">
                  Embedded
                </span>
              </div>
              <div className="p-3 bg-page rounded-lg border border-edge flex items-center justify-between">
                <div>
                  <div className="text-xs text-ink-muted font-medium">Direct Standalone Visits</div>
                  <div className="text-lg font-bold text-ink">{stats?.directVisits || 0}</div>
                </div>
                <span className="text-xs font-semibold bg-page text-primary px-2 py-1 rounded">
                  Direct Link
                </span>
              </div>
            </div>
          </div>

          {/* Evaluation Information note */}
          <div className="bg-page border border-edge rounded-xl p-4 text-xs text-primary space-y-2">
            <div className="font-semibold flex items-center gap-1.5 text-primary">
              <ShieldCheck className="w-4 h-4 text-primary" />
              Evaluation & Ethics Note
            </div>
            <p className="leading-relaxed">
              Every visitor loading the widget (whether through the Wix site or direct launch) increments the visitor count and unique device token anonymously. No audio files or personal biometric data are stored, ensuring full compliance with GDPR and ethical research guidelines.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-edge bg-page flex items-center justify-between text-xs text-ink-muted">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Updated live on every user interaction</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-primary hover:bg-primary-press text-on-primary font-medium rounded-lg transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
