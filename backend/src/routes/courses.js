import express from 'express';
import Course from '../models/Course.js';
import Progress from '../models/Progress.js';
import User from '../models/User.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { ingestCourseContent } from '../services/rag/tutorService.js';
import { uploadPDF } from '../middleware/upload.js';


function reIngestCourse(course) {
  const content = course.lessons
    .filter((l) => l.content)
    .map((l) => `## ${l.title}\n${l.content}`)
    .join('\n\n');
  if (content.trim()) {
    ingestCourseContent(course._id.toString(), content).catch((err) =>
      console.error('RAG ingest error:', err.message)
    );
  }
}

const router = express.Router();




router.get('/', async (req, res) => {
  try {
    const { category, level, search, instructor } = req.query;
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (instructor) filter.instructor = instructor;

    const courses = await Course.find(filter)
      .populate('instructor', 'name avatar speciality')
      .select('-lessons.content -lessons.pdfData -lessons.transcript -vectorIds')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ courses, total: courses.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isPublished: true });
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});



router.get('/search', protect, async (req, res) => {
  try {
    const { q } = req.query;
    if (!q?.trim()) return res.json({ results: [] });

    const regex = new RegExp(q.trim(), 'i');

    const courses = await Course.find({
      isPublished: true,
      $or: [
        { title: regex },
        { description: regex },
        { category: regex },
        { tags: regex },
        { 'lessons.title': regex },
        { 'lessons.content': regex },
      ],
    })
      .populate('instructor', 'name avatar')
      .select('title description thumbnail category level lessons instructor enrolledStudents')
      .limit(20);


    const results = [];
    for (const course of courses) {

      if (regex.test(course.title) || regex.test(course.description) || regex.test(course.category)) {
        results.push({
          type: 'course',
          courseId: course._id,
          title: course.title,
          subtitle: `${course.category} · ${course.level} · ${course.enrolledStudents?.length || 0} étudiants`,
          thumbnail: course.thumbnail,
          instructor: course.instructor?.name,
        });
      }

      for (const lesson of course.lessons) {
        if (regex.test(lesson.title) || regex.test(lesson.content)) {

          const text = lesson.content || '';
          const idx = text.search(regex);
          const excerpt = idx >= 0
            ? '...' + text.slice(Math.max(0, idx - 40), idx + 80).replace(/\n/g, ' ') + '...'
            : '';
          results.push({
            type: 'lesson',
            courseId: course._id,
            lessonId: lesson._id,
            title: lesson.title,
            subtitle: `Dans : ${course.title}`,
            excerpt,
            thumbnail: course.thumbnail,
          });
        }
      }
    }

    res.json({ results: results.slice(0, 25) });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.post('/:id/lessons/:lessonId/translate', protect, async (req, res) => {
  try {
    const { targetLang } = req.body;
    if (!targetLang) return res.status(400).json({ message: 'targetLang requis' });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });


    let lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      lesson = course.lessons.find(l => String(l._id) === req.params.lessonId);
    }
    if (!lesson) return res.status(404).json({ message: 'Leçon non trouvée', lessonId: req.params.lessonId });

    const content = lesson.content;
    if (!content?.trim()) {
      return res.status(400).json({ message: 'Cette leçon n\'a pas de contenu texte à traduire' });
    }

    const langNames = { ar: 'Arabic', en: 'English', fr: 'French', es: 'Spanish', de: 'German', zh: 'Chinese' };
    const langName = langNames[targetLang] || targetLang;

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) return res.status(500).json({ message: 'GROQ_API_KEY non configurée' });


    const trimmedContent = content.length > 12000 ? content.slice(0, 12000) + '\n\n[contenu tronqué]' : content;

    const prompt = `Translate the following educational course lesson content to ${langName}. Keep all technical terms accurate. Preserve paragraph structure. Return ONLY the translated text, no explanations or headers.\n\n${trimmedContent}`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `You are a professional educational translator. Translate accurately to ${langName}. Return only the translated text.` },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 8192,
      }),
    });

    const groqData = await response.json();

    if (!response.ok) {
      console.error('Groq API error:', JSON.stringify(groqData));
      return res.status(502).json({ message: 'Erreur API Groq', detail: groqData?.error?.message });
    }

    const translated = groqData?.choices?.[0]?.message?.content;
    if (!translated) {
      console.error('Groq empty response:', JSON.stringify(groqData));
      return res.status(502).json({ message: 'Réponse vide' });
    }

    res.json({ translated, targetLang });
  } catch (error) {
    console.error('Translation error:', error.message);
    res.status(500).json({ message: 'Erreur traduction', error: error.message });
  }
});




router.get('/instructor/my', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    // Use aggregation to compute stats server-side and exclude heavy fields
    const courses = await Course.find({ instructor: req.user._id })
      .select('-lessons.content -lessons.pdfData -vectorIds -lessons.transcript')
      .sort({ createdAt: -1 })
      .lean();

    const stats = {
      totalCourses: courses.length,
      publishedCourses: courses.filter((c) => c.isPublished).length,
      totalStudents: courses.reduce((s, c) => s + (c.enrolledStudents?.length || 0), 0),
      totalLessons: courses.reduce((s, c) => s + (c.lessons?.length || 0), 0),
    };

    res.json({ courses, stats });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});



router.get('/:id', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name avatar bio speciality');

    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });


    const isInstructor = course.instructor._id.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isEnrolled = course.enrolledStudents.includes(req.user._id);

    if (!isInstructor && !isAdmin && !course.isPublished) {
      return res.status(403).json({ message: 'Cours non disponible' });
    }


    const progress = await Progress.findOne({
      student: req.user._id,
      course: course._id,
    });


    let completionPercentage = 0;
    if (progress && course.lessons.length > 0) {
      completionPercentage = Math.round(
        (progress.completedLessons.length / course.lessons.length) * 100
      );
    }

    res.json({
      course,
      progress: progress ? { ...progress.toObject(), completionPercentage } : null,
      isEnrolled,
      isInstructor,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });
    if (!course.isPublished) return res.status(400).json({ message: 'Cours non disponible' });

    if (course.enrolledStudents.includes(req.user._id)) {
      return res.status(400).json({ message: 'Déjà inscrit' });
    }

    course.enrolledStudents.push(req.user._id);
    await course.save();


    await Progress.create({ student: req.user._id, course: course._id });


    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { enrolledCourses: course._id },
    });

    res.json({ message: 'Inscription réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.delete('/:id/unenroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    course.enrolledStudents = course.enrolledStudents.filter(
      (s) => s.toString() !== req.user._id.toString()
    );
    await course.save();

    await Progress.deleteOne({ student: req.user._id, course: course._id });
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { enrolledCourses: course._id },
    });

    res.json({ message: 'Désinscription réussie' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});




router.post('/', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.create({
      ...req.body,
      instructor: req.user._id,
    });

    reIngestCourse(course);
    res.status(201).json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.put('/:id', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });


    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { title, description, category, level, thumbnail, isPublished } = req.body;
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (category !== undefined) course.category = category;
    if (level !== undefined) course.level = level;
    if (thumbnail !== undefined) course.thumbnail = thumbnail;
    if (isPublished !== undefined) course.isPublished = isPublished;

    await course.save();
    res.json({ course });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.delete('/:id', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    await Progress.deleteMany({ course: course._id });
    await course.deleteOne();

    res.json({ message: 'Cours supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});




router.post('/:id/lessons', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const { title, content, pdfUrl, duration } = req.body;
    const order = course.lessons.length + 1;
    course.lessons.push({ title, content, pdfUrl, duration: duration || 0, order });
    await course.save();


    reIngestCourse(course);

    res.status(201).json({ course, lesson: course.lessons[course.lessons.length - 1] });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.put('/:id/lessons/:lessonId', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) return res.status(404).json({ message: 'Leçon non trouvée' });

    const { title, content, pdfUrl, duration } = req.body;
    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (pdfUrl !== undefined) lesson.pdfUrl = pdfUrl;
    if (duration !== undefined) lesson.duration = duration;

    await course.save();


    reIngestCourse(course);

    res.json({ course, lesson });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});


router.delete('/:id/lessons/:lessonId', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }

    course.lessons = course.lessons.filter(
      (l) => l._id.toString() !== req.params.lessonId
    );

    course.lessons.forEach((l, i) => { l.order = i + 1; });
    await course.save();

    res.json({ message: 'Leçon supprimée', course });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});




router.post(
  '/:id/lessons/:lessonId/upload-pdf',
  protect,
  restrictTo('instructor', 'admin'),
  uploadPDF.single('pdf'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Aucun fichier PDF reçu' });

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

      if (
        req.user.role !== 'admin' &&
        course.instructor.toString() !== req.user._id.toString()
      ) {
        return res.status(403).json({ message: 'Non autorisé' });
      }

      const lesson = course.lessons.id(req.params.lessonId);
      if (!lesson) return res.status(404).json({ message: 'Leçon non trouvée' });



      const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(req.file.buffer);
      const extractedText = data.text.trim();

      if (!extractedText) {
        return res.status(422).json({ message: 'Le PDF ne contient pas de texte extractible (PDF scanné ?)' });
      }


      lesson.content = extractedText;
      lesson.pdfData = req.file.buffer;
      lesson.pdfName = req.file.originalname;

      lesson.pdfUrl = `/api/courses/${req.params.id}/lessons/${req.params.lessonId}/pdf`;
      await course.save();


      reIngestCourse(course);

      res.json({
        message: `PDF ingéré avec succès (${data.numpages} page(s), ${extractedText.length} caractères extraits)`,
        lesson,
        charCount: extractedText.length,
        pages: data.numpages,
      });
    } catch (error) {
      console.error('PDF upload error:', error);
      res.status(500).json({ message: 'Erreur lors du traitement du PDF', error: error.message });
    }
  }
);



router.get('/:id/lessons/:lessonId/pdf', async (req, res) => {
  try {
    const token = req.query.token
      || (req.headers.authorization?.startsWith('Bearer ')
          ? req.headers.authorization.split(' ')[1]
          : null);

    if (!token) return res.status(401).json({ message: 'Non autorisé – Token manquant' });

    const { default: jwt } = await import('jsonwebtoken');
    const jwksClient = (await import('jwks-rsa')).default;

    const KC_URL   = process.env.KEYCLOAK_URL   || 'http://localhost:8080';
    const KC_REALM = process.env.KEYCLOAK_REALM || 'elearning';

    const client = jwksClient({
      jwksUri: `${KC_URL}/realms/${KC_REALM}/protocol/openid-connect/certs`,
      cache: true,
      cacheMaxAge: 600_000,
    });

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded) return res.status(401).json({ message: 'Token invalide' });

    const key = await new Promise((resolve, reject) =>
      client.getSigningKey(decoded.header.kid, (err, k) =>
        err ? reject(err) : resolve(k.getPublicKey())
      )
    );

    jwt.verify(token, key, { algorithms: ['RS256'] });

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson || !lesson.pdfData) {
      return res.status(404).json({ message: 'PDF non disponible pour cette leçon' });
    }

    const filename = lesson.pdfName || 'cours.pdf';
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(lesson.pdfData);
  } catch (error) {
    console.error('[PDF route]', error.message);
    res.status(401).json({ message: 'Non autorisé', error: error.message });
  }
});



router.get('/:id/students', protect, restrictTo('instructor', 'admin'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('enrolledStudents', 'name email avatar createdAt');

    if (!course) return res.status(404).json({ message: 'Cours non trouvé' });

    if (
      req.user.role !== 'admin' &&
      course.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Non autorisé' });
    }


    const studentsWithProgress = await Promise.all(
      course.enrolledStudents.map(async (student) => {
        const progress = await Progress.findOne({
          student: student._id,
          course: course._id,
        });
        const completionPercentage = progress && course.lessons.length > 0
          ? Math.round((progress.completedLessons.length / course.lessons.length) * 100)
          : 0;
        return { ...student.toObject(), completionPercentage, progress };
      })
    );

    res.json({ students: studentsWithProgress, total: studentsWithProgress.length });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

export default router;
