'use client';

import { useState } from 'react';
import { quizAPI } from '@/lib/api';

export default function QuizComponent({ courseId }) {
  const [step, setStep] = useState('config');
  const [config, setConfig] = useState({ difficulty: 1, count: 5, topic: '' });
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [results, setResults] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const { data } = await quizAPI.generate(courseId, config);
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
      setCurrentQ(0);
      setStep('quiz');
    } catch {
      alert('Erreur lors de la génération du quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const selectAnswer = (answerIdx) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answerIdx;
    setAnswers(newAnswers);
  };

  const submitQuiz = async () => {
    setIsLoading(true);
    try {
      const { data } = await quizAPI.submit(courseId, { answers, questions });
      setResults(data);
      setStep('results');
    } catch {
      alert('Erreur soumission');
    } finally {
      setIsLoading(false);
    }
  };

  const difficultyLabels = ['', '🟢 Débutant', '🟡 Intermédiaire', '🔴 Avancé'];

  if (step === 'config') {
    return (
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <h2 className="text-xl font-bold text-gray-800">🧠 Générer un Quiz</h2>

        <div>
          <label className="text-sm font-medium text-gray-700">Sujet (optionnel)</label>
          <input
            value={config.topic}
            onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))}
            placeholder="Ex: Les boucles en Python..."
            className="mt-1 w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Niveau de difficulté</label>
          <div className="flex gap-3 mt-2">
            {[1, 2, 3].map((d) => (
              <button
                key={d}
                onClick={() => setConfig(prev => ({ ...prev, difficulty: d }))}
                className={`flex-1 py-2 rounded-lg text-sm font-medium border transition ${config.difficulty === d
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'border-gray-300 text-gray-700 hover:border-teal-400'
                  }`}
              >
                {difficultyLabels[d]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Nombre de questions : {config.count}</label>
          <input
            type="range" min={3} max={10} value={config.count}
            onChange={(e) => setConfig(prev => ({ ...prev, count: +e.target.value }))}
            className="w-full mt-2"
          />
        </div>

        <button
          onClick={generateQuiz}
          disabled={isLoading}
          className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
        >
          {isLoading ? '⏳ Génération en cours...' : '🚀 Générer le Quiz'}
        </button>
      </div>
    );
  }

  if (step === 'quiz') {
    const q = questions[currentQ];
    return (
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div>
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentQ + 1} / {questions.length}</span>
            <span>{Math.round(((currentQ + 1) / questions.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-teal-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <p className="text-gray-800 font-medium text-lg">{q.question}</p>

        <div className="space-y-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => selectAnswer(i)}
              className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition ${answers[currentQ] === i
                  ? 'border-teal-600 bg-teal-50 text-teal-700 font-medium'
                  : 'border-gray-200 hover:border-teal-300'
                }`}
            >
              {opt}
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          {currentQ > 0 && (
            <button
              onClick={() => setCurrentQ(currentQ - 1)}
              className="flex-1 border border-gray-300 py-2 rounded-xl text-sm hover:bg-gray-50"
            >
              ← Précédent
            </button>
          )}
          {currentQ < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQ(currentQ + 1)}
              disabled={answers[currentQ] === null}
              className="flex-1 bg-teal-600 text-white py-2 rounded-xl text-sm disabled:opacity-50"
            >
              Suivant →
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={answers.includes(null) || isLoading}
              className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              {isLoading ? '⏳...' : '✅ Terminer le Quiz'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="bg-white rounded-xl border p-6 space-y-6">
        <div className="text-center">
          <div className={`text-5xl font-bold ${results.score >= 70 ? 'text-green-600' : 'text-red-500'}`}>
            {results.score}%
          </div>
          <p className="text-gray-500 mt-1">{results.correct}/{results.total} bonnes réponses</p>
          <div className={`mt-2 text-sm px-3 py-1 rounded-full inline-block ${results.score >= 80 ? 'bg-green-100 text-green-700' :
              results.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
            }`}>
            Niveau recommandé : {results.nextRecommendation}
          </div>
        </div>

        <div className="space-y-4">
          {results.results.map((r, i) => (
            <div key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <p className="font-medium text-sm text-gray-800">{r.question}</p>
              <p className={`text-sm mt-1 ${r.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {r.isCorrect ? '✅' : '❌'} {questions[i].options[r.yourAnswer]}
              </p>
              {!r.isCorrect && (
                <p className="text-xs text-gray-600 mt-1">Bonne réponse : {questions[i].options[r.correctAnswer]}</p>
              )}
              <p className="text-xs text-gray-500 mt-1 italic">{r.explanation}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStep('config')}
          className="w-full border border-teal-600 text-teal-600 py-3 rounded-xl font-semibold hover:bg-teal-50"
        >
          🔄 Nouveau Quiz
        </button>
      </div>
    );
  }
}
