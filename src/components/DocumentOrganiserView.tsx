import React, { useState } from 'react';
import { SavedDocument, UserLanguage } from '../types';
import { FolderLock, Plus, FileText, Calendar, Lock, Trash2, Tag, Upload, Download } from 'lucide-react';

interface DocumentOrganiserViewProps {
  userLanguage: UserLanguage;
}

const SAMPLE_DOCUMENTS: SavedDocument[] = [
  {
    id: 'doc_1',
    title: 'Home Office Bail Notification Letter',
    category: 'home_office',
    dateUploaded: Date.now() - 86400000 * 5,
    filename: 'home_office_bail.pdf',
    notes: 'Letter confirming reporting conditions and next appointment date.',
    relatedForm: 'Reporting Bail',
  },
  {
    id: 'doc_2',
    title: 'NHS GP Registration Confirmation',
    category: 'nhs',
    dateUploaded: Date.now() - 86400000 * 15,
    filename: 'gp_registration.pdf',
    notes: 'Letter confirming registration with local GP surgery and NHS Number.',
    relatedForm: 'NHS GP',
  },
];

export const DocumentOrganiserView: React.FC<DocumentOrganiserViewProps> = ({ userLanguage }) => {
  const [documents, setDocuments] = useState<SavedDocument[]>(SAMPLE_DOCUMENTS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Home Office');
  const [newSummaryEn, setNewSummaryEn] = useState('');
  const [newSummaryFa, setNewSummaryFa] = useState('');

  const handleAddDocument = () => {
    if (!newTitle.trim()) return;
    const doc: SavedDocument = {
      id: 'doc_' + Date.now(),
      title: newTitle,
      category: 'home_office',
      dateUploaded: Date.now(),
      filename: `${newTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`,
      notes: newSummaryEn || newTitle,
    };

    setDocuments((prev) => [doc, ...prev]);
    setShowAddModal(false);
    setNewTitle('');
    setNewSummaryEn('');
    setNewSummaryFa('');
  };

  const handleDelete = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = documents.filter((d) => selectedCategory === 'all' || d.category === selectedCategory);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 text-teal-300 text-xs font-semibold">
            <FolderLock className="w-3.5 h-3.5" />
            <span>My Documents & History</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2">
            <span>📁 Document Organiser</span>
            <span className="text-teal-300 font-farsi font-normal">| مدیریت مدارک من</span>
          </h2>
          <p className="text-xs text-slate-300 max-w-xl">
            Save summaries of your scanned letters, form entries, and legal documents securely in one place.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Save new document</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {['all', 'Home Office', 'NHS', 'Housing', 'Benefits', 'Legal'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition shrink-0 ${
              selectedCategory === cat ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Documents Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 text-slate-500 space-y-2">
            <FileText className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-bold">No documents in this category yet.</p>
          </div>
        ) : (
          filtered.map((doc) => (
            <div key={doc.id} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800">
                    {doc.category}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base">{doc.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Saved: {new Date(doc.dateUploaded).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                  title="Delete document record"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">Summary / Notes:</p>
                <p>{doc.notes || doc.filename}</p>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                <Lock className="w-3.5 h-3.5 text-teal-600" />
                <span>Private document stored locally on device.</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Save New Document Record</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Document Title:</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Home Office Interview Invitation"
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Category:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300"
                >
                  <option value="Home Office">Home Office</option>
                  <option value="NHS">NHS</option>
                  <option value="Housing">Housing</option>
                  <option value="Benefits">Benefits</option>
                  <option value="Legal">Legal</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">English Summary:</label>
                <textarea
                  value={newSummaryEn}
                  onChange={(e) => setNewSummaryEn(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">خلاصه به فارسی:</label>
                <textarea
                  value={newSummaryFa}
                  onChange={(e) => setNewSummaryFa(e.target.value)}
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-300 font-farsi dir-rtl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleAddDocument}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold"
              >
                Save Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
