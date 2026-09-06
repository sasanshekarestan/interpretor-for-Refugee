import React, { useState, useEffect, useRef } from 'react';
import { SavedDocument, UserLanguage } from '../types';
import { FolderLock, Plus, FileText, Trash2, Upload, ExternalLink, Smartphone, AlertTriangle } from 'lucide-react';
import {
  StoredDocument,
  listDocuments,
  saveDocument,
  getFile,
  deleteDocument,
  clearAllDocuments,
  formatBytes,
} from '../utils/documentStore';

interface DocumentOrganiserViewProps {
  userLanguage: UserLanguage;
}

/** Every category in both languages, so the filter is not English-only. */
const CATEGORIES: { id: SavedDocument['category']; fa: string; en: string }[] = [
  { id: 'home_office', fa: 'اداره مهاجرت', en: 'Home Office' },
  { id: 'nhs', fa: 'سلامت و درمان', en: 'NHS and health' },
  { id: 'housing', fa: 'مسکن', en: 'Housing' },
  { id: 'benefits', fa: 'کمک‌هزینه', en: 'Benefits' },
  { id: 'legal', fa: 'حقوقی', en: 'Legal' },
  { id: 'identity', fa: 'مدارک هویتی', en: 'Identity' },
  { id: 'education', fa: 'آموزش', en: 'Education' },
  { id: 'other', fa: 'سایر', en: 'Other' },
];

const labelFor = (id: SavedDocument['category']) =>
  CATEGORIES.find((c) => c.id === id) || CATEGORIES[CATEGORIES.length - 1];

/**
 * My Documents.
 *
 * This screen used to be a mockup wearing the app's clothes: two example
 * letters written into the source, and a save button that put a row in React
 * state and forgot it on reload. It also sat outside the design system, with
 * a three-stop gradient header, slate greys the rest of the app had left
 * behind, twelve-pixel instructions, and category chips only in English.
 *
 * It keeps real files now, in IndexedDB, on the person's own device. Nothing
 * is uploaded. That is the point rather than a limitation: the privacy notice
 * promises that nothing reaches the Home Office, a caseworker or a landlord,
 * and the promise is strongest when there is nowhere for anything to go. The
 * screen says so plainly, in Persian first, because a person needs to know
 * both that their letters are private and that they will not follow them to a
 * new phone.
 */
export const DocumentOrganiserView: React.FC<DocumentOrganiserViewProps> = () => {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<'all' | SavedDocument['category']>('all');

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SavedDocument['category']>('home_office');
  const [newNotesFa, setNewNotesFa] = useState('');
  const [newNotesEn, setNewNotesEn] = useState('');
  const [confirmingClear, setConfirmingClear] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = () =>
    listDocuments()
      .then((docs) => {
        setDocuments(docs);
        setStoreError(null);
      })
      .catch(() =>
        setStoreError(
          'این مرورگر نمی‌تواند مدارک را ذخیره کند. / This browser cannot store documents.'
        )
      )
      .finally(() => setLoading(false));

  useEffect(() => {
    refresh();
  }, []);

  const handleFileChosen = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setPendingFile(file);
    // The filename is usually the best title anyone will type, so it is the
    // starting point rather than an empty box.
    setNewTitle(file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!pendingFile || !newTitle.trim()) return;
    try {
      await saveDocument(
        {
          title: newTitle.trim(),
          category: newCategory,
          filename: pendingFile.name,
          notes: newNotesEn.trim() || undefined,
          notesFa: newNotesFa.trim() || undefined,
        },
        pendingFile
      );
      setPendingFile(null);
      setNewTitle('');
      setNewNotesEn('');
      setNewNotesFa('');
      refresh();
    } catch {
      setStoreError('ذخیره نشد. / The document could not be saved.');
    }
  };

  /** Opens the stored copy in a new tab, which is what a phone does best. */
  const handleOpen = async (doc: StoredDocument) => {
    const blob = await getFile(doc.id);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener');
    // Long enough for the tab to take it, then the memory goes back.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleDelete = async (id: string) => {
    await deleteDocument(id);
    refresh();
  };

  const handleClearAll = async () => {
    await clearAllDocuments();
    setConfirmingClear(false);
    refresh();
  };

  const filtered = documents.filter(
    (d) => selectedCategory === 'all' || d.category === selectedCategory
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* The introduction, on the emphasis surface: it explains rather than
          acts, so it should not look like the controls under it. */}
      <div
        dir="rtl"
        className="bg-emphasis text-on-emphasis rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-white/10 border border-white/20 shrink-0 mt-0.5">
            <FolderLock className="w-5 h-5" />
          </div>
          <div className="space-y-1 min-w-0">
            <h2 className="font-farsi text-xl sm:text-2xl font-bold leading-tight">مدارک من</h2>
            <p className="text-sm font-semibold text-on-emphasis-muted">My documents</p>
            <p className="font-farsi text-sm text-on-emphasis-muted leading-relaxed pt-1">
              نامه‌ها و مدارک خود را در یک جا نگه دارید تا هر وقت لازم شد پیدایشان کنید.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0">
          <button
            id="btn-add-document"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[48px] w-full sm:w-auto px-5 rounded-2xl bg-on-emphasis text-emphasis
                       hover:bg-on-emphasis-muted font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span className="font-farsi">افزودن مدرک</span>
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf,application/pdf,.doc,.docx"
        onChange={handleFileChosen}
        className="hidden"
      />

      {/* What is actually true about where these files live. It is not a
          disclaimer in small print: it is the thing a person most needs to
          know, and it cuts both ways. */}
      <div className="bg-surface border border-edge border-l-4 border-l-primary rounded-lg p-4 sm:p-5">
        <div className="flex items-start gap-3">
          <Smartphone className="w-5 h-5 text-primary shrink-0 mt-1" aria-hidden="true" />
          <div className="min-w-0 flex-1 space-y-4">
            <div dir="rtl" className="space-y-1">
              <h3 className="font-farsi font-bold text-lg text-ink leading-tight">
                مدارک شما فقط روی همین دستگاه می‌ماند
              </h3>
              <p className="font-farsi text-base text-ink-muted leading-relaxed">
                این فایل‌ها به هیچ سروری فرستاده نمی‌شود و ما به آن‌ها دسترسی نداریم. یعنی روی
                گوشی یا رایانهٔ دیگر دیده نمی‌شوند، و اگر تاریخچهٔ مرورگر را پاک کنید از بین
                می‌روند. اگر دستگاه را با کسی شریک هستید، در پایان کار همه را پاک کنید.
              </p>
            </div>
            <div className="space-y-1 border-t border-edge pt-3">
              <h4 className="font-bold text-base text-ink">These stay on this device</h4>
              <p className="text-base text-ink-muted leading-relaxed">
                Nothing is uploaded and we cannot see these files. They will not appear on another
                phone or computer, and clearing your browser data deletes them. On a shared device,
                clear everything when you finish.
              </p>
            </div>
          </div>
        </div>
      </div>

      {storeError && (
        <div role="alert" className="bg-fault-bg border border-fault rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-fault shrink-0 mt-0.5" />
          <p className="text-base text-fault leading-relaxed">{storeError}</p>
        </div>
      )}

      {/* Category filter, in both languages. It was English only, which on a
          screen for Persian readers made the filter unusable by the people it
          was for. */}
      <div className="flex flex-wrap items-center gap-2" dir="rtl">
        <button
          onClick={() => setSelectedCategory('all')}
          aria-pressed={selectedCategory === 'all'}
          className={`min-h-[44px] px-4 rounded-full text-sm font-semibold transition shrink-0 border ${
            selectedCategory === 'all'
              ? 'bg-primary text-on-primary border-primary'
              : 'bg-surface text-ink border-edge-control hover:bg-page'
          }`}
        >
          <span className="font-farsi">همه</span>
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            aria-pressed={selectedCategory === cat.id}
            aria-label={`${cat.fa} / ${cat.en}`}
            className={`min-h-[44px] px-4 rounded-full text-sm font-semibold transition shrink-0 border whitespace-nowrap ${
              selectedCategory === cat.id
                ? 'bg-primary text-on-primary border-primary'
                : 'bg-surface text-ink border-edge-control hover:bg-page'
            }`}
          >
            <span className="font-farsi">{cat.fa}</span>
          </button>
        ))}
      </div>

      {/* The documents */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center bg-surface rounded-3xl border border-edge">
            <p className="font-farsi text-base text-ink-muted">در حال باز کردن مدارک…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center bg-surface rounded-3xl border border-edge space-y-3">
            <FileText className="w-8 h-8 mx-auto text-ink-muted" aria-hidden="true" />
            <p dir="rtl" className="font-farsi text-base font-bold text-ink">
              {documents.length === 0
                ? 'هنوز مدرکی ذخیره نکرده‌اید.'
                : 'در این دسته مدرکی نیست.'}
            </p>
            <p className="text-sm text-ink-muted">
              {documents.length === 0
                ? 'Nothing saved yet. Add a letter or a document to keep it here.'
                : 'Nothing in this category.'}
            </p>
          </div>
        ) : (
          filtered.map((doc) => {
            const cat = labelFor(doc.category);
            return (
              <div
                key={doc.id}
                className="bg-surface rounded-3xl p-5 border border-edge space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full bg-teal-50 text-primary border border-teal-200">
                      <span className="font-farsi">{cat.fa}</span>
                      <span className="text-ink-muted"> · {cat.en}</span>
                    </span>
                    <h3 className="font-bold text-ink text-base break-words">
                      <bdi>{doc.title}</bdi>
                    </h3>
                    <p className="text-sm text-ink-muted">
                      {new Date(doc.dateUploaded).toLocaleDateString('en-GB')} ·{' '}
                      {formatBytes(doc.sizeBytes)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    aria-label={`حذف ${doc.title} / Delete ${doc.title}`}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center text-ink-muted
                               hover:text-fault hover:bg-fault-bg rounded-xl transition shrink-0"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {(doc.notesFa || doc.notes) && (
                  <div className="p-3 bg-page rounded-2xl border border-edge space-y-1.5">
                    {doc.notesFa && (
                      <p dir="rtl" className="font-farsi text-sm text-ink leading-relaxed">
                        {doc.notesFa}
                      </p>
                    )}
                    {doc.notes && (
                      <p className="text-sm text-ink-muted leading-relaxed">{doc.notes}</p>
                    )}
                  </div>
                )}

                <button
                  onClick={() => handleOpen(doc)}
                  className="min-h-[44px] px-4 rounded-xl border border-edge-control text-ink
                             hover:bg-page transition text-sm font-semibold flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="font-farsi">باز کردن</span>
                  <span className="text-ink-muted">Open</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Clear everything. On a borrowed phone this is the most important
          control on the screen, so it is on the screen rather than buried in
          settings. Two steps, because it cannot be undone. */}
      {documents.length > 0 && (
        <div className="bg-surface border border-edge rounded-3xl p-5 space-y-3">
          {confirmingClear ? (
            <div className="space-y-3">
              <p dir="rtl" className="font-farsi text-base font-bold text-ink leading-relaxed">
                همهٔ {documents.length} مدرک برای همیشه پاک شود؟ این کار برگشت‌پذیر نیست.
              </p>
              <p className="text-sm text-ink-muted">
                Delete all {documents.length} documents permanently? This cannot be undone.
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleClearAll}
                  className="min-h-[48px] px-5 rounded-2xl bg-fault text-white font-bold text-sm transition hover:opacity-90"
                >
                  <span className="font-farsi">بله، همه را پاک کن</span>
                </button>
                <button
                  onClick={() => setConfirmingClear(false)}
                  className="min-h-[48px] px-5 rounded-2xl border border-edge-control text-ink font-semibold text-sm hover:bg-page transition"
                >
                  <span className="font-farsi">انصراف</span>
                  <span className="text-ink-muted"> · Cancel</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setConfirmingClear(true)}
              className="min-h-[48px] px-5 py-2 rounded-2xl border border-edge-control text-ink hover:bg-page transition flex items-center gap-2.5"
            >
              <Trash2 className="w-4 h-4 shrink-0" />
              {/* Stacked, so the two languages do not interleave on a narrow
                  phone, where this button was reading as four broken words. */}
              <span className="text-left leading-tight">
                <span className="block font-farsi font-bold text-sm">پاک کردن همهٔ مدارک</span>
                <span className="block text-xs text-ink-muted">Delete everything</span>
              </span>
            </button>
          )}
        </div>
      )}

      {/* Save sheet, once a file has been chosen */}
      {pendingFile && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-3xl max-w-md w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div dir="rtl" className="space-y-1">
              <h3 className="font-farsi font-bold text-ink text-lg">ذخیرهٔ مدرک</h3>
              <p className="text-sm text-ink-muted">Save this document</p>
            </div>

            <div className="flex items-center gap-2 p-3 bg-page rounded-2xl border border-edge">
              <Upload className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm text-ink truncate">
                <bdi>{pendingFile.name}</bdi>
              </span>
              <span className="text-sm text-ink-muted shrink-0">
                {formatBytes(pendingFile.size)}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <label htmlFor="doc-title" className="block mb-1">
                  <span className="font-farsi font-bold text-base text-ink">نام مدرک</span>
                  <span className="text-sm text-ink-muted"> · Document name</span>
                </label>
                <input
                  id="doc-title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full min-h-[48px] p-3 rounded-xl border border-edge-control bg-surface text-ink text-base"
                />
              </div>

              <div>
                <label htmlFor="doc-category" className="block mb-1">
                  <span className="font-farsi font-bold text-base text-ink">دسته</span>
                  <span className="text-sm text-ink-muted"> · Category</span>
                </label>
                <select
                  id="doc-category"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SavedDocument['category'])}
                  className="w-full min-h-[48px] p-3 rounded-xl border border-edge-control bg-surface text-ink text-base"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.fa} · {c.en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="doc-notes-fa" className="block mb-1">
                  <span className="font-farsi font-bold text-base text-ink">یادداشت به فارسی</span>
                  <span className="text-sm text-ink-muted"> · optional</span>
                </label>
                <textarea
                  id="doc-notes-fa"
                  dir="rtl"
                  value={newNotesFa}
                  onChange={(e) => setNewNotesFa(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-edge-control bg-surface text-ink font-farsi text-base"
                />
              </div>

              <div>
                <label htmlFor="doc-notes-en" className="block mb-1">
                  <span className="font-bold text-base text-ink">Note in English</span>
                  <span className="text-sm text-ink-muted"> · optional</span>
                </label>
                <textarea
                  id="doc-notes-en"
                  value={newNotesEn}
                  onChange={(e) => setNewNotesEn(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-edge-control bg-surface text-ink text-base"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 pt-1">
              <button
                onClick={() => setPendingFile(null)}
                className="min-h-[48px] px-5 rounded-2xl border border-edge-control text-ink font-semibold text-sm hover:bg-page transition"
              >
                <span className="font-farsi">انصراف</span>
                <span className="text-ink-muted"> · Cancel</span>
              </button>
              <button
                id="btn-save-document"
                onClick={handleSave}
                disabled={!newTitle.trim()}
                className="min-h-[48px] px-5 rounded-2xl bg-primary text-on-primary font-bold text-sm
                           transition hover:bg-primary-press disabled:opacity-50"
              >
                <span className="font-farsi">ذخیره</span>
                <span className="opacity-80"> · Save</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
