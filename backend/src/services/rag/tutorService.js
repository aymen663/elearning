



async function groqChat(systemPrompt, userMessage) {
  const key = process.env.GROQ_API_KEY;
  if (!key) throw new Error('GROQ_API_KEY manquant');

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Groq HTTP ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}



async function openaiChat(systemPrompt, userMessage) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error('OPENAI_API_KEY manquant');

  const messages = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: userMessage });

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `OpenAI HTTP ${res.status}`);
  }

  const data = await res.json();
  return data?.choices?.[0]?.message?.content || '';
}



async function geminiChat(systemPrompt, userMessage, retries = 1) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY manquant');

  const fullMessage = systemPrompt
    ? `${systemPrompt}\n\n---\n\nQuestion : ${userMessage}`
    : userMessage;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: fullMessage }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `Gemini HTTP ${res.status}`;
    if (res.status === 429 && retries > 0) {
      await new Promise((r) => setTimeout(r, 20000));
      return geminiChat(systemPrompt, userMessage, retries - 1);
    }
    throw new Error(msg);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}



async function aiChat(systemPrompt, userMessage) {
  const providers = [
    { name: 'Groq', fn: () => groqChat(systemPrompt, userMessage), enabled: !!process.env.GROQ_API_KEY },
    { name: 'OpenAI', fn: () => openaiChat(systemPrompt, userMessage), enabled: !!process.env.OPENAI_API_KEY },
    { name: 'Gemini', fn: () => geminiChat(systemPrompt, userMessage), enabled: !!(process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) },
  ];

  const errors = [];
  for (const p of providers) {
    if (!p.enabled) continue;
    try {
      console.log(`🤖 Essai provider: ${p.name}`);
      const result = await p.fn();
      if (result) {
        console.log(`✅ ${p.name} OK`);
        return result;
      }
    } catch (e) {
      console.warn(`⚠️ ${p.name} failed: ${e.message}`);
      errors.push(`${p.name}: ${e.message}`);
    }
  }

  throw new Error(`Tous les providers IA ont échoué. ${errors.join(' | ')}`);
}


const _ingestedCourses = new Set();

export async function ingestCourseContent(courseId, content) {
  if (content?.trim()) {
    _ingestedCourses.add(courseId);
    console.log(`✅ Cours ${courseId} marqué comme disponible (mode direct)`);
    return 1;
  }
  return 0;
}



const TUTOR_SYSTEM = `Tu es un tuteur IA expert et pédagogue. Tu aides les étudiants à comprendre le contenu de leur cours.

Règles :
- Réponds toujours en français sauf si l'étudiant pose sa question dans une autre langue
- Base-toi UNIQUEMENT sur le contenu du cours fourni ci-dessous
- Si tu ne sais pas, dis-le clairement et suggère de revoir le cours
- Utilise des exemples concrets et des analogies pour expliquer
- Adapte le niveau d'explication selon la question
- Utilise du markdown pour structurer ta réponse (listes, gras, etc.)`;

export async function askTutor(courseId, question, chatHistory = [], fallbackContext = '') {
  if (!fallbackContext.trim()) {
    return {
      answer:
        "📚 Ce cours n'a pas encore de contenu textuel dans ses leçons.\n\n**Solution :** L'instructeur doit aller dans *Éditer le cours → Leçons → Ajouter du contenu* et sauvegarder.",
      sources: [],
    };
  }

  const context = fallbackContext.substring(0, 30000);
  const systemPrompt = `${TUTOR_SYSTEM}\n\n---\n\nCONTENU DU COURS :\n${context}`;
  const answer = await aiChat(systemPrompt, question);
  return { answer, sources: ['contenu du cours'] };
}



export async function generateQuiz(courseId, topic = '', difficulty = 1, count = 5, fallbackContext = '') {
  if (!fallbackContext.trim()) {
    throw new Error('Aucun contenu disponible pour générer un quiz');
  }

  const context = fallbackContext.substring(0, 15000);
  const difficultyLabel = ['', 'débutant', 'intermédiaire', 'avancé'][difficulty] || 'intermédiaire';

  const prompt = `Génère exactement ${count} questions QCM de niveau ${difficultyLabel} basées sur le contenu suivant.
${topic ? `Focus sur : ${topic}` : ''}

Contenu :
${context}

Réponds UNIQUEMENT avec du JSON valide (sans texte avant/après, sans bloc markdown) :
{"questions":[{"question":"...","options":["A. ...","B. ...","C. ...","D. ..."],"correctAnswer":0,"explanation":"..."}]}`;

  const raw = await aiChat(
    'Tu es un générateur expert de QCM pédagogiques. Réponds uniquement en JSON valide sans formatage markdown.',
    prompt
  );


  const stripped = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```\s*$/i, '')
    .trim();

  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error('Réponse IA brute:', raw.slice(0, 500));
    throw new Error('Réponse IA invalide — JSON introuvable');
  }

  let parsed;
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error('Erreur parsing JSON:', e.message);
    throw new Error('Réponse IA non parseable en JSON');
  }

  if (!Array.isArray(parsed.questions)) throw new Error('Format de quiz invalide');
  return parsed.questions;
}
