import React, { useMemo } from 'react';
import { X, ListOrdered } from 'lucide-react';
import { Survey } from '../../types';

interface Props {
  open: boolean;
  survey: Survey | null;
  onClose: () => void;
}

const SurveyQuestionsModal: React.FC<Props> = ({ open, survey, onClose }) => {
  const groupedQuestions = useMemo(() => {
    if (!survey) return [];
    const sorted = [...survey.questions].sort((a, b) => a.questionOrder - b.questionOrder);
    const groups = new Map<string, { description?: string; questions: typeof sorted }>();
    sorted.forEach(q => {
      const cat = q.category.name;
      if (!groups.has(cat)) {
        groups.set(cat, { description: q.category.description, questions: [] });
      }
      groups.get(cat)!.questions.push(q);
    });
    return Array.from(groups.entries());
  }, [survey]);

  if (!open || !survey) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-2xl max-h-[85vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div className="min-w-0 pr-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ListOrdered size={20} className="text-primary-600 shrink-0" />
              Survey Questions
            </h3>
            <p className="text-sm font-medium text-gray-800 mt-1">{survey.title}</p>
            {survey.description && (
              <p className="text-sm text-gray-500 mt-1">{survey.description}</p>
            )}
            <p className="text-xs text-gray-400 mt-2">
              {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} · {survey.status}
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1 space-y-6">
          {groupedQuestions.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No questions in this survey.</p>
          ) : (
            groupedQuestions.map(([category, { description, questions }]) => (
              <div key={category} className="rounded-lg border border-gray-100 bg-gray-50/50 p-4">
                <h4 className="text-sm font-semibold text-primary-700">{category}</h4>
                {description && (
                  <p className="text-xs text-gray-500 mt-1 mb-3">{description}</p>
                )}
                {!description && <div className="mb-3" />}
                <ol className="space-y-3">
                  {questions.map((q, idx) => (
                    <li key={q.id} className="flex gap-3 text-sm bg-white rounded-lg border border-gray-100 px-3 py-2.5">
                      <span className="text-gray-400 font-medium shrink-0 w-5">{idx + 1}.</span>
                      <span className="text-gray-800 leading-relaxed">{q.questionText}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SurveyQuestionsModal;
