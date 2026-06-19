import React from 'react';
import { X } from 'lucide-react';
import { AnalyticsAnswerDetail, EnrichedSurveyResponse } from '../../types';

interface Props {
  open: boolean;
  title: string;
  subtitle?: string;
  loading: boolean;
  mode: 'all' | 'category' | 'question';
  enrichedResponses?: EnrichedSurveyResponse[];
  answerDetails?: AnalyticsAnswerDetail[];
  onClose: () => void;
}

const scoreColor = (score: number) =>
  score >= 4 ? 'text-green-600' : score >= 3 ? 'text-yellow-600' : 'text-red-500';

const ResponseDetailsModal: React.FC<Props> = ({
  open,
  title,
  subtitle,
  loading,
  mode,
  enrichedResponses = [],
  answerDetails = [],
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 bg-black/40" aria-label="Close" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-3xl max-h-[85vh] bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col"
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 flex-1">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
            </div>
          )}

          {!loading && mode === 'all' && enrichedResponses.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No submitted responses yet.</p>
          )}

          {!loading && mode !== 'all' && answerDetails.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-8">No responses found.</p>
          )}

          {!loading && mode === 'all' && enrichedResponses.length > 0 && (
            <div className="space-y-4">
              {enrichedResponses.map(response => (
                <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{response.userName}</p>
                      <p className="text-xs text-gray-500">{response.userEmail}</p>
                    </div>
                    {response.submittedAt && (
                      <p className="text-xs text-gray-500">
                        Submitted {new Date(response.submittedAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    {response.answers.map(answer => (
                      <div key={answer.questionId} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="flex justify-between gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">{answer.categoryName}</p>
                            <p className="font-medium text-gray-800">{answer.questionText}</p>
                          </div>
                          <span className={`font-semibold shrink-0 ${scoreColor(answer.rating)}`}>
                            {answer.rating}/5
                          </span>
                        </div>
                        {answer.comment && (
                          <p className="text-sm text-gray-600 mt-1 italic">&ldquo;{answer.comment}&rdquo;</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && mode !== 'all' && answerDetails.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-2 pr-4 font-medium">Employee</th>
                    {mode === 'category' && <th className="py-2 pr-4 font-medium">Question</th>}
                    <th className="py-2 pr-4 font-medium">Rating</th>
                    <th className="py-2 font-medium">Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {answerDetails.map((detail, idx) => (
                    <tr key={`${detail.surveyResponseId}-${detail.questionId}-${idx}`} className="border-b border-gray-100">
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-900">{detail.userName}</p>
                        <p className="text-xs text-gray-500">{detail.userEmail}</p>
                      </td>
                      {mode === 'category' && (
                        <td className="py-3 pr-4 text-gray-700">{detail.questionText}</td>
                      )}
                      <td className={`py-3 pr-4 font-semibold ${scoreColor(detail.rating)}`}>{detail.rating}/5</td>
                      <td className="py-3 text-gray-600">{detail.comment || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailsModal;
