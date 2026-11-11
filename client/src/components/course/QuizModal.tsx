import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Award, ArrowRight } from 'lucide-react';
import { Modal } from '../common/Modal.js';
import API from '../../services/api.js';
import { Quiz } from '../../types/index.js';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  quiz: Quiz | null;
  onSuccess: () => void;
}

export const QuizModal: React.FC<QuizModalProps> = ({ isOpen, onClose, quiz, onSuccess }) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen || !quiz) return null;

  const handleSelectOption = (qIndex: number, optionIndex: number) => {
    if (result) return; // locked after submission
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIndex]: optionIndex,
    }));
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < quiz.questions.length) {
      setError('Please answer all questions before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersArray = quiz.questions.map((_, i) => selectedAnswers[i]);
      const res = await API.post(`/progress/quiz/${quiz._id}/submit`, {
        answers: answersArray,
      });

      if (res.data.success) {
        setResult(res.data);
        onSuccess();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setResult(null);
    setError('');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Quiz: ${quiz.title}`} maxWidth="2xl">
      <div className="space-y-6">
        {quiz.description && (
          <p className="text-xs text-slate-500 leading-relaxed">{quiz.description}</p>
        )}

        {error && (
          <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold">
            {error}
          </div>
        )}

        {result ? (
          <div className="py-6 text-center space-y-4">
            <div
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                result.passed ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'
              }`}
            >
              {result.passed ? (
                <CheckCircle2 className="w-10 h-10" />
              ) : (
                <XCircle className="w-10 h-10" />
              )}
            </div>

            <div>
              <span className="text-4xl font-black text-slate-900">{result.score}%</span>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">
                Passing Score: {result.passingScore}%
              </p>
            </div>

            <p className="text-sm font-semibold text-slate-700 max-w-md mx-auto">
              {result.feedback}
            </p>

            <div className="pt-4 flex items-center justify-center gap-3">
              {!result.passed && (
                <button
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                >
                  Try Again
                </button>
              )}
              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-brand shadow-md transition"
              >
                Close & Continue
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {quiz.questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <p className="text-sm font-bold text-slate-800">
                  {qIndex + 1}. {q.question}
                </p>

                <div className="space-y-2">
                  {q.options.map((opt, optIndex) => {
                    const isSelected = selectedAnswers[qIndex] === optIndex;
                    return (
                      <button
                        key={optIndex}
                        type="button"
                        onClick={() => handleSelectOption(qIndex, optIndex)}
                        className={`w-full text-left p-3 rounded-xl text-xs font-medium transition flex items-center justify-between border ${
                          isSelected
                            ? 'bg-purple-50 border-purple-500 text-purple-900 font-semibold shadow-sm'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span>{opt}</span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-purple-600 bg-purple-600' : 'border-slate-300'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 text-xs font-bold text-white bg-gradient-brand hover:opacity-95 shadow-md shadow-purple-500/20 rounded-xl transition disabled:opacity-50"
              >
                {submitting ? 'Evaluating...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

