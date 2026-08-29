import React from 'react';
import { AppTab } from '../types';
import { 
  Home, 
  Mic, 
  FileText, 
  CheckSquare, 
  PenTool, 
  BookOpen, 
  FolderLock, 
  MoreHorizontal 
} from 'lucide-react';

interface NavigationTabsProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: AppTab; labelEn: string; labelFa: string; icon: React.ReactNode; color: string }[] = [
    { 
      id: 'home', 
      labelEn: 'Home', 
      labelFa: 'خانه', 
      icon: <Home className="w-4 h-4" />,
      color: 'text-teal-600'
    },
    { 
      id: 'interpreter', 
      labelEn: 'Interpreter', 
      labelFa: 'مترجم زنده', 
      icon: <Mic className="w-4 h-4" />,
      color: 'text-teal-600'
    },
    { 
      id: 'letter_scanner', 
      labelEn: 'Letter Reader', 
      labelFa: 'فهمیدن نامه', 
      icon: <FileText className="w-4 h-4" />,
      color: 'text-indigo-600'
    },
    { 
      id: 'form_companion', 
      labelEn: 'Form Companion', 
      labelFa: 'تکمیل فرم', 
      icon: <CheckSquare className="w-4 h-4" />,
      color: 'text-indigo-600'
    },
    { 
      id: 'message_writer', 
      labelEn: 'Message Writer', 
      labelFa: 'نوشتن پیام', 
      icon: <PenTool className="w-4 h-4" />,
      color: 'text-amber-600'
    },
    { 
      id: 'phrases', 
      labelEn: 'UK Terms & Phrases', 
      labelFa: 'اصطلاحات UK', 
      icon: <BookOpen className="w-4 h-4" />,
      color: 'text-teal-600'
    },
    { 
      id: 'documents', 
      labelEn: 'My Documents', 
      labelFa: 'مدارک من', 
      icon: <FolderLock className="w-4 h-4" />,
      color: 'text-slate-600'
    },
    { 
      id: 'more', 
      labelEn: 'More', 
      labelFa: 'بیشتر', 
      icon: <MoreHorizontal className="w-4 h-4" />,
      color: 'text-slate-600'
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-[61px] sm:top-[73px] z-20 shadow-2xs print:hidden w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto px-2 sm:px-6 w-full">
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-2 w-full overscroll-x-contain">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-nav-${tab.id}`}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition shrink-0 whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span className={isActive ? 'text-white' : tab.color}>
                  {tab.icon}
                </span>
                <div className="flex items-center gap-1.5">
                  <span>{tab.labelEn}</span>
                  <span className={`font-farsi font-normal opacity-90 ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                    ({tab.labelFa})
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
