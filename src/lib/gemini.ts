import { GoogleGenAI } from "@google/genai";
import type { LearningStage } from "./quota";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

export function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

const STAGE_GUIDANCE: Record<LearningStage, string> = {
  BEGINNER:
    "Уровень ученика: Начальный (A1–A2). Объясняй просто, давай ударения (знак ´ или заглавную ударную гласную), базовую грамматику, жи-ши/ча-ща, род, настоящее время и простые примеры.",
  INTERMEDIATE:
    "Уровень ученика: Средний (B1). Фокус на 6 падежах, видах глагола (НСВ/СВ), глаголах движения, приставках пре-/при- и связной разговорной речи.",
  ADVANCED:
    "Уровень ученика: Продвинутый (B2–C1). Фокус на причастных и деепричастных оборотах, орфографии н/нн, управлении глаголов, деловой и публицистической стилистике.",
  EXPERT:
    "Уровень ученика: Эксперт (C2). Фокус на тонкой пунктуации (тире/двоеточие), фразеологизмах, интонационных конструкциях (ИК-1..ИК-7), риторике и стилистических оттенках.",
};

export function extractJsonFromText<T>(raw: string): T | null {
  try {
    return JSON.parse(raw) as T;
  } catch {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as T;
    } catch {
      return null;
    }
  }
}

export async function generateTutorReply(params: {
  stage: LearningStage;
  mode: "GRAMMAR" | "QUIZ" | "SPEAKING";
  prompt: string;
  uiLocale: "ru" | "en";
}): Promise<string> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const modePrompt =
    params.mode === "GRAMMAR"
      ? "Ты — внимательный AI-репетитор по русскому языку (режим грамматики и правописания). Разбирай правила, исправляй ошибки, объясняй орфографию и давай 1–2 коротких примера."
      : params.mode === "QUIZ"
      ? "Ты — AI-репетитор по русскому языку (режим квизов и задач). Дай интерактивное задание или мини-квиз по теме запроса ученика, а если ученик уже дал ответ — оцени его, объясни правило и предложи следующий вопрос."
      : "Ты — разговорный AI-репетитор по русскому языку (режим Speaking). Отвечай естественно на русском языке, поддерживай живой диалог по уровню ученика, мягко переформулируй неточности в скобках и задай 1 вовлекающий вопрос для продолжения беседы.";

  const languageNote =
    params.uiLocale === "en"
      ? "Provide Russian examples in Cyrillic with English explanations where helpful."
      : "Отвечай преимущественно на русском языке, ясно и доброжелательно.";

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: params.prompt,
    config: {
      systemInstruction: `${modePrompt}\n${STAGE_GUIDANCE[params.stage]}\n${languageNote}`,
      temperature: 0.5,
    },
  });

  return response.text ?? "Не удалось получить ответ от модели.";
}

export interface GrammarCheckResult {
  correctedText: string;
  isCorrect: boolean;
  summary: string;
  issues: {
    original: string;
    correction: string;
    category: string;
    rule: string;
  }[];
  followUpDrill: string;
}

export async function analyzeGrammarAndSpelling(params: {
  stage: LearningStage;
  text: string;
  deepAnalysis: boolean;
  uiLocale: "ru" | "en";
}): Promise<GrammarCheckResult> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const depthInstruction = params.deepAnalysis
    ? "Выполни глубокий экспертный разбор ошибок (Pro): морфология, падежные окончания, вид глагола, орфография, пунктуация, стилистика и предложи тренировочное упражнение."
    : "Выполни проверку базовой грамматики и правописания: найди ошибки орфографии и базовой грамматики и кратко объясни правило.";

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Проверь текст ученика:\n"""\n${params.text}\n"""`,
    config: {
      systemInstruction: `Ты — AI-репетитор русского языка. ${STAGE_GUIDANCE[params.stage]} ${depthInstruction} Язык пояснений: ${
        params.uiLocale === "en" ? "English (with Russian examples)" : "Русский"
      }. Верни СТРОГО валидный JSON без markdown-обёртки формата:
{
  "correctedText": "исправленный текст",
  "isCorrect": boolean,
  "summary": "краткий вывод",
  "issues": [{"original": "...", "correction": "...", "category": "орфография|грамматика|пунктуация|стилистика", "rule": "понятное правило"}],
  "followUpDrill": "1 короткое задание для закрепления"
}`,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const parsed = extractJsonFromText<GrammarCheckResult>(response.text ?? "");
  if (parsed) return parsed;

  return {
    correctedText: params.text,
    isCorrect: false,
    summary: response.text ?? "Анализ завершён.",
    issues: [],
    followUpDrill: "Попробуйте составить ещё одно предложение с этой конструкцией.",
  };
}

export interface PronunciationResult {
  score: number;
  transcript: string;
  stressFeedback: string;
  phoneticTips: string[];
  wordBreakdown: { word: string; status: "accurate" | "needs_work"; note: string }[];
}

export async function evaluatePronunciationAudio(params: {
  stage: LearningStage;
  targetPhrase: string;
  audioBase64: string;
  mimeType: string;
  uiLocale: "ru" | "en";
}): Promise<PronunciationResult> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        inlineData: {
          mimeType: params.mimeType,
          data: params.audioBase64,
        },
      },
      {
        text: `Эталонная русская фраза: "${params.targetPhrase}". Прослушай запись ученика, оцени точность произношения, словесное ударение, редукцию гласных (аканье/иканье), мягкость/твёрдость согласных и оглушение звонких на конце слов.`,
      },
    ],
    config: {
      systemInstruction: `Ты — фонетист и AI-репетитор русского языка. ${STAGE_GUIDANCE[params.stage]} Язык комментариев: ${
        params.uiLocale === "en" ? "English" : "Русский"
      }. Верни СТРОГО валидный JSON формата:
{
  "score": number (0..100),
  "transcript": "что именно удалось расслышать на записи",
  "stressFeedback": "комментарий по ударениям и интонации",
  "phoneticTips": ["конкретный фонетический совет 1", "совет 2"],
  "wordBreakdown": [{"word": "слово", "status": "accurate" | "needs_work", "note": "пояснение"}]
}`,
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const parsed = extractJsonFromText<PronunciationResult>(response.text ?? "");
  if (parsed) return parsed;

  return {
    score: 75,
    transcript: params.targetPhrase,
    stressFeedback: response.text ?? "Оценка произношения выполнена.",
    phoneticTips: ["Обратите внимание на чёткость ударных гласных."],
    wordBreakdown: [],
  };
}

export interface ListeningExercise {
  title: string;
  script: string;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  dictationTarget: string;
}

export async function generateListeningExercise(params: {
  stage: LearningStage;
  topic?: string;
  uiLocale: "ru" | "en";
}): Promise<ListeningExercise> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error("GEMINI_API_KEY_MISSING");
  }

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: `Создай задание на аудирование (Listening) по русскому языку. Тема: ${
      params.topic || "повседневная и культурная ситуация"
    }.`,
    config: {
      systemInstruction: `Ты — методист русского языка (Listening). ${STAGE_GUIDANCE[params.stage]} Язык пояснений и вопросов: ${
        params.uiLocale === "en" ? "English questions about Russian audio" : "Русский"
      }. Верни СТРОГО валидный JSON:
{
  "title": "название аудио-сюжета",
  "script": "живой русский текст для озвучивания (3-5 предложений)",
  "questions": [
    {
      "question": "вопрос на понимание",
      "options": ["вариант 1", "вариант 2", "вариант 3", "вариант 4"],
      "correctIndex": 0,
      "explanation": "почему этот ответ верный"
    }
  ],
  "dictationTarget": "1 ключевое предложение из текста для диктанта"
}`,
      responseMimeType: "application/json",
      temperature: 0.6,
    },
  });

  const parsed = extractJsonFromText<ListeningExercise>(response.text ?? "");
  if (parsed) return parsed;

  return {
    title: "Утренний разговор",
    script:
      "Сегодня утром в Москве идёт лёгкий снег, но трамваи ходят точно по расписанию. Елена зашла в кофейню за горячим чаем перед лекцией.",
    questions: [
      {
        question: "Зачем Елена зашла в кофейню?",
        options: [
          "За горячим чаем",
          "Встретить преподавателя",
          "Купить книгу",
          "Укрыться от дождя",
        ],
        correctIndex: 0,
        explanation: "В тексте сказано, что она зашла за горячим чаем перед лекцией.",
      },
    ],
    dictationTarget: "Елена зашла в кофейню за горячим чаем перед лекцией.",
  };
}
