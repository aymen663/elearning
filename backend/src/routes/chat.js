import express from 'express';
import { askTutor } from '../services/rag/tutorService.js';
import Course from '../models/Course.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();


router.post('/:courseId', protect, async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    const { courseId } = req.params;

    if (!question?.trim()) {
      return res.status(400).json({ message: 'Question requise' });
    }


    const course = await Course.findById(courseId).select('title lessons');
    const fallbackContext = course
      ? course.lessons
        .filter((l) => l.content?.trim())
        .map((l) => `## ${l.title}\n${l.content}`)
        .join('\n\n---\n\n')
      : '';

    const result = await askTutor(courseId, question, history, fallbackContext);

    res.json({
      answer: result.answer,
      sources: result.sources,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Erreur chat IA:', error?.message || error);

    const msg = (error?.message || '').toLowerCase();


    let friendlyMsg = '⚠️ Le tuteur IA rencontre un problème temporaire.';

    if (msg.includes('gemini_api_key') || msg.includes('manquant')) {
      friendlyMsg = '⚠️ Clé API Gemini manquante. Ajoutez `GEMINI_API_KEY` dans `backend/.env`.';
    } else if (msg.includes('api_key_invalid') || msg.includes('invalid api key') || msg.includes('403')) {
      friendlyMsg = '⚠️ Clé API Gemini invalide. Vérifiez votre clé dans `backend/.env`.';
    } else if (msg.includes('quota') || msg.includes('429') || msg.includes('resource_exhausted')) {
      friendlyMsg = '⚠️ Quota Gemini temporairement dépassé. Réessayez dans quelques instants.';
    } else if (msg.includes('not found') || msg.includes('does not exist') || msg.includes('available models')) {
      friendlyMsg = '⚠️ Modèle Gemini indisponible. Vérifiez votre clé API sur [aistudio.google.com](https://aistudio.google.com).';
    }

    res.status(200).json({
      answer: friendlyMsg,
      sources: [],
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
