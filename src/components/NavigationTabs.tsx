import React, { useState } from 'react';
import { AppTab } from '../types';
import { Home, Mic, FileText, CheckSquare, MoreHorizontal, Languages } from 'lucide-react';

interface NavigationTabsProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

// Remember the bilingual choice on the device, so a support worker who turned
// English on does not have to do it again on the next visit. Reading and
// writing are wrapped because private mode and blocked storage both throw.
const NAV_LANG_KEY = 'hamyar_nav_bilingual';
const readBilingual = (): boolean => {
  try {
    return localStorage.getItem(NAV_LANG_KEY) === '1';
  } catch {
    return false;
  }
};
const writeBilingual = (on: boolean) => {
  try {
    localStorage.setItem(NAV_LANG_KEY, on ? '1' : '0');
  } catch {
    /* still honoured for this session */
  }
};

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
 * The labels lead in Persian, because the person holding the phone reads
 * Persian. By default that is all the phone bar shows, since a fifth of a phone
 * screen has room for one word at a readable size. But a support worker at a
 * desk may be looking at the same phone, so a small toggle above the bar adds
 * the short English word under each Persian one. It never removes the Persian,
 * so a Persian reader can always find their way, and the choice is remembered
 * on the device. On a wide screen both languages already show, so the toggle is
 * for phones only.
 */
export const NavigationTabs: React.FC<NavigationTabsProps> = ({ activeTab, onTabChange }) => {
  const [bilingual, setBilingual] = useState<boolean>(readBilingual);

  const toggleBilingual = () => {
    setBilingual((on) => {
      const next = !on;
      writeBilingual(next);
      return next;
    });
  };

  const tabs: {
    id: AppTab;
    short: string;
    shortEn: string;
    fullFa: string;
    fullEn: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'home',
      short: 'خانه',
      shortEn: 'Home',
      fullFa: 'خانه',
      fullEn: 'Home',
      icon: <Home className="w-6 h-6" />,
    },
    {
      id: 'interpreter',
      short: 'مترجم',
      shortEn: 'Talk',
      fullFa: 'مترجم زنده',
      fullEn: 'Live interpreter',
      icon: <Mic className="w-6 h-6" />,
    },
    {
      id: 'letter_scanner',
      short: 'نامه',
      shortEn: 'Letter',
      fullFa: 'فهمیدن نامه',
      fullEn: 'Letter reader',
      icon: <FileText className="w-6 h-6" />,
    },
    {
      id: 'form_companion',
      short: 'فرم',
      shortEn: 'Form',
      fullFa: 'تکمیل فرم',
      fullEn: 'Form companion',
      icon: <CheckSquare className="w-6 h-6" />,
    },
    {
      id: 'more',
      short: 'بیشتر',
      shortEn: 'More',
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

      {/* Phones: under the thumb, where the reach is.
          A slim strip sits on top of the bar with the language toggle in it.
          It adds the short English word under each Persian one, for a support
          worker reading over someone's shoulder, and never takes the Persian
          away. Phones only: a wide screen already shows both. */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-30 print:hidden
                   pb-[env(safe-area-inset-bottom)] bg-surface border-t border-edge"
      >
        {/* Boxed and seated on the bar, so it reads as part of the menu rather
            than as content on the page above it. It cannot sit below the bar:
            the bar is already pinned to the bottom edge of the screen. */}
        <div className="flex justify-center px-3 pt-2 pb-1">
          <button
            id="btn-nav-bilingual"
            onClick={toggleBilingual}
            aria-pressed={bilingual}
            className="min-h-[44px] px-4 flex items-center gap-1.5 rounded-full border border-primary
                       text-primary hover:bg-page transition cursor-pointer"
          >
            <Languages className="w-4 h-4 shrink-0" aria-hidden="true" />
            {bilingual ? (
              <span className="text-xs font-medium">
                <span className="font-farsi">فقط فارسی</span>
                <span className="font-latin"> · Persian menu only</span>
              </span>
            ) : (
              <span className="text-xs font-medium">
                <span className="font-farsi">افزودن انگلیسی به منو</span>
                <span className="font-latin"> · Add English to the menu</span>
              </span>
            )}
          </button>
        </div>

        <nav aria-label="بخش‌های برنامه / Sections">
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
                    className={`w-full min-h-[60px] flex flex-col items-center justify-center gap-0.5 px-1 py-2
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
                    {bilingual && (
                      <span
                        className="font-latin text-xs leading-none opacity-80"
                        aria-hidden="true"
                      >
                        {tab.shortEn}
                      </span>
                    )}
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
      </div>
    </>
  );
};
