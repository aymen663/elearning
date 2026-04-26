'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { quizAPI } from '@/lib/api';
import Sidebar from '@/components/layout/Sidebar';
import { Brain, ArrowLeft, Loader2, CheckCircle, XCircle, RefreshCw, Trophy } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function QuizPage() {
    const { id } = useParams();
    const [step, setStep] = useState('config');
    const [config, setConfig] = useState({ topic: '', difficulty: 1, count: 5 });
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateQuiz = async () => {
        setLoading(true);
        try {
            const { data } = await quizAPI.generate(id, config);


            if (data.error || !Array.isArray(data.questions) || data.questions.length === 0) {
                toast.error(data.message || 'Le quiz n\'a pas pu être généré. Réessayez.');
                return;
            }

            setQuestions(data.questions);
            setAnswers({});
            setStep('quiz');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Erreur génération du quiz. Vérifiez que le cours a du contenu.');
        }
        finally { setLoading(false); }
    };

    const submitQuiz = async () => {
        if (Object.keys(answers).length < questions.length) {
            toast.error('Répondez à toutes les questions');
            return;
        }
        setLoading(true);
        try {
            const answerArray = questions.map((_, i) => answers[i]);
            const { data } = await quizAPI.submit(id, { answers: answerArray, questions });
            setResults(data);
            setStep('results');
        } catch { toast.error('Erreur soumission'); }
        finally { setLoading(false); }
    };

    return (
        <Sidebar>
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link href={`/courses/${id}`} className="btn-ghost px-3 py-2"><ArrowLeft className="w-4 h-4" /></Link>
                    <div>
                        <h1 className="page-title flex items-center gap-2"><Brain className="w-6 h-6 text-teal-400" /> Quiz adaptatif</h1>
                    </div>
                </div>

                {step === 'config' && (
                    <div className="card space-y-5">
                        <p className="text-slate-400 text-sm">Configurez votre quiz personnalisé basé sur le contenu du cours.</p>
                        <div>
                            <label className="input-label">Sujet (optionnel)</label>
                            <input className="input" placeholder="ex: les boucles, la récursivité..." value={config.topic}
                                onChange={(e) => setConfig(prev => ({ ...prev, topic: e.target.value }))} />
                        </div>
                        <div>
                            <label className="input-label">Difficulté</label>
                            <div className="flex gap-3">
                                {[{ v: 1, l: 'Débutant' }, { v: 2, l: 'Intermédiaire' }, { v: 3, l: 'Avancé' }].map(({ v, l }) => (
                                    <button key={v} onClick={() => setConfig(prev => ({ ...prev, difficulty: v }))}
                                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${config.difficulty === v ? 'bg-teal-600 border-teal-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="input-label">Nombre de questions</label>
                            <div className="flex gap-3">
                                {[3, 5, 10].map((n) => (
                                    <button key={n} onClick={() => setConfig(prev => ({ ...prev, count: n }))}
                                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all
                      ${config.count === n ? 'bg-teal-600 border-teal-500 text-white' : 'border-white/10 text-slate-400 hover:text-white'}`}>
                                        {n} questions
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={generateQuiz} disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Génération IA en cours...' : 'Générer le quiz'}
                        </button>
                    </div>
                )}

                {step === 'quiz' && (
                    <div className="space-y-5">
                        {questions.map((q, qi) => (
                            <div key={qi} className="card">
                                <p className="font-medium text-white mb-4 text-sm">
                                    <span className="text-teal-400 font-bold">Q{qi + 1}.</span> {q.question}
                                </p>
                                <div className="space-y-2">
                                    {q.options.map((opt, oi) => (
                                        <button key={oi} onClick={() => setAnswers({ ...answers, [qi]: oi })}
                                            className={`w-full text-left p-3 rounded-xl border text-sm transition-all
                        ${answers[qi] === oi
                                                    ? 'bg-teal-600/20 border-teal-500 text-white'
                                                    : 'border-white/[0.08] text-slate-300 hover:border-teal-500/40 hover:bg-white/[0.03]'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button onClick={submitQuiz} disabled={loading} className="btn-primary w-full justify-center py-3">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            {loading ? 'Correction...' : 'Soumettre mes réponses'}
                        </button>
                    </div>
                )}

                {step === 'results' && results && (
                    <div className="space-y-5">
                        <div className="card text-center py-8">
                            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${results.score >= 70 ? 'bg-emerald-500/20' : 'bg-amber-500/20'}`}>
                                <Trophy className={`w-10 h-10 ${results.score >= 70 ? 'text-emerald-400' : 'text-amber-400'}`} />
                            </div>
                            <p className="text-4xl font-bold text-white mb-1">{results.score}%</p>
                            <p className="text-slate-400 text-sm">{results.correct} / {results.total} correctes</p>
                            <p className="text-xs text-slate-500 mt-2">Recommandation : <span className="text-teal-400 font-medium">{results.nextRecommendation}</span></p>
                        </div>

                        {results.results?.map((r, i) => (
                            <div key={i} className={`card border ${r.isCorrect ? 'border-emerald-500/20' : 'border-red-500/20'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        {r.isCorrect ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white mb-2">{r.question}</p>
                                        <p className="text-xs text-slate-400">{r.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex gap-3">
                            <button onClick={() => setStep('config')} className="btn-secondary flex-1 justify-center">
                                <RefreshCw className="w-4 h-4" /> Nouveau quiz
                            </button>
                            <Link href={`/courses/${id}`} className="btn-ghost flex-1 justify-center">Retour au cours</Link>
                        </div>
                    </div>
                )}
            </div>
        </Sidebar>
    );
}
