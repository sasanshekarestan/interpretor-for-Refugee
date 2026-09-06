import React from 'react';
import { AppTab } from '../types';
import { Home, Mic, FileText, CheckSquare, MoreHorizontal } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

/**
 * Where to go, under the thumb.
 *
 * This was eight destinations in a strip across the top that scrolled
 * sideways. At 390px it showed two and a half of them, and nothing on screen
 * suggested the rest existed, so a person who never swiped never learned the
 * app could help with their forms.
 *
 * Four destinations and More now, at the bottom where a thumb already rests.
 * Everything that was cut is still reachable through More.
 *
 * The labels are Persian only, and short. There is room in a fifth of a phone
 * screen for one word at a readable size or two words at an unreadable one,
 * and the people using this read Persian. The full name of each destination is
 * on the screen it opens, and in the label a screen reader announces.
 */
export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: {
    id: AppTab;
    short: string;
    fullFa: string;
    fullEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'home',
      short: 'خانه',
      fullFa: 'خانه',
      fullEn: 'Home',
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'interpreter',
      short: 'مترجم',
      fullFa: 'مترجم زنده',
      fullEn: 'Live interpreter',
      icon: <Mic className="w-6 h-6" />,
    },
    {
      id: 'letter_scanner',
      short: 'نامه',
      fullFa: 'فهمیدن نامه',
      fullEn: 'Letter reader',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 'form_companion',
      short: 'فرم',
      fullFa: 'تکمیل فرم',
      fullEn: 'Form companion',
      icon: <CheckSquare className="w-6 h-6" />,
    },
    {
      id: 'more',
      short: 'بیشتر',
      fullFa: 'بیشتر',
      fullEn: 'More',
      icon: <MoreHorizontal className="w-6 h-6" />,
    },
  ];

  return (
    <>
      {/* Wide screens: a row under the header, which is where a person looks
          for a menu on a desktop. A bar pinned to the bottom of a large window
          is a long way from the content and reads as a phone app that has been
          stretched. There is room here for the full name of each destination,
          so it gets it. */}
      <nav
        className="hidden md:block bg-surface border-b border-edge print:hidden"
        aria-label="بخش‌های برنامه / Sections"
      >
        <ul className="max-w-6xl mx-auto flex items-stretch gap-1 px-6">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id}>
                <button
                  id={`tab-nav-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${tab.fullFa} / ${tab.fullEn}`}
                  className={`min-h-[56px] flex items-center gap-2.5 px-4 border-b-2 transition cursor-pointer
                    ${
                      isActive
                        ? 'border-primary text-primary'
                        : 'border-transparent text-ink-muted hover:text-ink'
                    }`}
                >
                  <span aria-hidden="true">{tab.icon}</span>
                  <span className="text-left leading-tight">
                    <span
                      className={`block font-farsi text-base ${isActive ? 'font-bold' : 'font-medium'}`}
                    >
                      {tab.fullFa}
                    </span>
                    <span className="block text-xs opacity-80">{tab.fullEn}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Phones: under the thumb, where the reach is. */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-edge print:hidden
                   pb-[env(safe-area-inset-bottom)]"
        aria-label="بخش‌های برنامه / Sections"
      >
        <ul className="flex items-stretch">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="flex-1">
                <button
                  id={`tab-nav-mobile-${tab.id}`}
                  onClick={() => onTabChange(tab.id)}
                  aria-current={isActive ? 'page' : undefined}
                  aria-label={`${tab.fullFa} / ${tab.fullEn}`}
                  className={`w-full min-h-[60px] flex flex-col items-center justify-center gap-1 px-1 py-2
                    transition cursor-pointer
                    ${isActive ? 'text-primary' : 'text-ink-muted hover:text-ink'}`}
                >
                  {/* Marked by weight and a rule, not by colour alone. */}
                  <span aria-hidden="true">{tab.icon}</span>
                  <span
                    className={`font-farsi text-xs leading-none ${isActive ? 'font-bold' : 'font-medium'}`}
                  >
                    {tab.short}
                  </span>
                  <span
                    aria-hidden="true"
                    className={`block h-0.5 w-6 rounded-full ${isActive ? 'bg-primary' : 'bg-transparent'}`}
                  />
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
};
