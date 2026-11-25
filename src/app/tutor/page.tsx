"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Bot,
  Crown,
  Headphones,
  HelpCircle,
  Lock,
  MessageSquare,
  Mic,
  Send,
  SpellCheck2,
  Square,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { QuotaStatusCard } from "@/components/quota-status-card";
import { useApp } from "@/components/providers";
import { STAGES } from "@/lib/curriculum";
import type { LearningStage } from "@/lib/quota";
import type {
  GrammarCheckResult,
  ListeningExercise,
  PronunciationResult,
} from "@/lib/gemini";

function speakRussian(text: string, rate = 0.95) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ru-RU";
  u.rate = rate;
  window.speechSynthesis.speak(u);
}

function TutorStudioContent() {
  const searchParams = useSearchParams();
  const { locale, t, user, quota, setQuotaState, loadingAuth } = useApp();

  const initialMode = searchParams.get("mode") || "grammar";
  const initialPhrase =
    searchParams.get("phrase") ||
    "Широкая машина проехала мимо тихой рощи.";

  const [mode, setMode] = useState(initialMode);
  const [stage, setStage] = useState<LearningStage>("BEGINNER");
  const [apiError, setApiError] = useState<string | null>(null);

  // Grammar & Error Breakdown state
  const [grammarInput, setGrammarInput] = useState(
    "Я вчера ходил в магазын и купил красивую яблоко."
  );
  const [grammarLoading, setGrammarLoading] = useState(false);
  const [grammarResult, setGrammarResult] = useState<GrammarCheckResult | null>(
    null
  );

  // Chat (Quiz & Speaking) state
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatMessages, setChatMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Pronunciation state
  const [targetPhrase, setTargetPhrase] = useState(initialPhrase);
  const [recording, setRecording] = useState(false);
  const [pronLoading, setPronLoading] = useState(false);
  const [pronResult, setPronResult] = useState<PronunciationResult | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Listening state
  const [listeningTopic, setListeningTopic] = useState("Путешествие на поезде");
  const [listeningLoading, setListeningLoading] = useState(false);
  const [listeningEx, setListeningEx] = useState<ListeningExercise | null>(null);
  const [listeningRate, setListeningRate] = useState(0.95);
  const [listeningAnswers, setListeningAnswers] = useState<Record<number, number>>({});
  const [dictationInput, setDictationInput] = useState("");
  const [listeningChecked, setListeningChecked] = useState(false);

  useEffect(() => {
    if (user?.preferredLevel) {
      setStage(user.preferredLevel);
    }
  }, [user?.preferredLevel]);

  const isPro = user?.plan === "PRO";

  const runGrammarCheck = async (deepAnalysis: boolean) => {
    setApiError(null);
    setGrammarLoading(true);
    try {
      const res = await fetch("/api/tutor/grammar-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: grammarInput,
          stage,
          deepAnalysis,
          uiLocale: locale,
        }),
      });
      const data = await res.json();
      if (data.quota) setQuotaState(data.quota);
      if (!res.ok) {
        setApiError(data.message || data.error || "Request failed");
        return;
      }
      setGrammarResult(data.analysis);
    } catch {
      setApiError("Network error");
    } finally {
      setGrammarLoading(false);
    }
  };

  const sendChat = async (chatMode: "QUIZ" | "SPEAKING") => {
    if (!chatPrompt.trim()) return;
    setApiError(null);
    const promptText = chatPrompt.trim();
    setChatMessages((prev) => [...prev, { role: "user", text: promptText }]);
    setChatPrompt("");
    setChatLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: chatMode,
          stage,
          prompt: promptText,
          uiLocale: locale,
        }),
      });
      const data = await res.json();
      if (data.quota) setQuotaState(data.quota);
      if (!res.ok) {
        setApiError(data.message || data.error || "Request failed");
        return;
      }
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", text: data.reply },
      ]);
      if (chatMode === "SPEAKING") {
        speakRussian(data.reply, 0.95);
      }
    } catch {
      setApiError("Network error");
    } finally {
      setChatLoading(false);
    }
  };

  const startRecording = async () => {
    setApiError(null);
    setPronResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (ev) => {
        if (ev.data.size > 0) chunksRef.current.push(ev.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((tr) => tr.stop());
        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const dataUrl = String(reader.result || "");
          const base64 = dataUrl.split(",")[1] || "";
          if (!base64) return;
          setPronLoading(true);
          try {
            const res = await fetch("/api/tutor/pronunciation", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                stage,
                targetPhrase,
                audioBase64: base64,
                mimeType: mimeType.split(";")[0],
                uiLocale: locale,
              }),
            });
            const data = await res.json();
            if (!res.ok) {
              setApiError(data.message || data.error || "Pronunciation error");
              return;
            }
            setPronResult(data.result);
          } catch {
            setApiError("Network error");
          } finally {
            setPronLoading(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      setApiError(
        locale === "ru"
          ? "Нет доступа к микрофону. Разрешите доступ в браузере."
          : "Microphone access denied."
      );
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const loadListening = async () => {
    setApiError(null);
    setListeningChecked(false);
    setListeningAnswers({});
    setDictationInput("");
    setListeningLoading(true);
    try {
      const res = await fetch("/api/tutor/listening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage,
          topic: listeningTopic,
          uiLocale: locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApiError(data.message || data.error || "Listening error");
        return;
      }
      setListeningEx(data.exercise);
    } catch {
      setApiError("Network error");
    } finally {
      setListeningLoading(false);
    }
  };

  const renderProGate = (title: string) => (
    <Card className="border-[#499BED]/50">
      <CardHeader>
        <Badge className="w-fit bg-[#499BED] text-[#031725] font-heading gap-1">
          <Crown className="h-3.5 w-3.5" /> Pro
        </Badge>
        <CardTitle className="font-heading text-xl pt-1">{title}</CardTitle>
        <CardDescription className="text-base">
          {t.tutor.proLockDesc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Link href="/billing">
          <Button className="font-heading gap-2">
            <Crown className="h-4 w-4" />
            {t.quota.upgradePro}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-3xl font-bold">{t.tutor.title}</h1>
            <Badge variant="outline" className="font-heading text-xs">
              {t.tutor.modelLabel}
            </Badge>
          </div>
          <p className="text-muted-foreground text-sm">
            {locale === "ru"
              ? "Выберите этап обучения и режим практики"
              : "Pick your learning stage and practice mode"}
          </p>
        </div>

        <div className="w-56">
          <Select
            value={stage}
            onValueChange={(v) => setStage(v as LearningStage)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STAGES.map((st) => (
                <SelectItem key={st.id} value={st.id}>
                  {locale === "ru" ? st.titleRu : st.titleEn} ({st.cefr})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!loadingAuth && !user && (
        <Card className="border-[#499BED]/50">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="text-base">
              {locale === "ru"
                ? "Войдите в аккаунт (доступен быстрый Demo Free / Demo Pro), чтобы общаться с AI-репетитором."
                : "Sign in (Demo Free / Demo Pro available) to interact with the AI tutor."}
            </div>
            <Link href="/login">
              <Button className="font-heading">
                {locale === "ru" ? "Войти" : "Sign in"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {user && quota && <QuotaStatusCard />}

      {apiError && (
        <Card className="border-destructive/60 bg-destructive/10">
          <CardContent className="flex items-center gap-3 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{apiError}</span>
          </CardContent>
        </Card>
      )}

      <Tabs value={mode} onValueChange={setMode} className="space-y-5">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-1 p-1">
          <TabsTrigger value="grammar" className="font-heading text-xs gap-1.5 py-2">
            <SpellCheck2 className="h-3.5 w-3.5" />
            {t.tutor.modes.grammar}
          </TabsTrigger>
          <TabsTrigger value="quiz" className="font-heading text-xs gap-1.5 py-2">
            <HelpCircle className="h-3.5 w-3.5" />
            {t.tutor.modes.quiz}
          </TabsTrigger>
          <TabsTrigger value="pronunciation" className="font-heading text-xs gap-1.5 py-2">
            {!isPro && <Lock className="h-3 w-3" />}
            <Mic className="h-3.5 w-3.5" />
            {t.tutor.modes.pronunciation}
          </TabsTrigger>
          <TabsTrigger value="speaking" className="font-heading text-xs gap-1.5 py-2">
            {!isPro && <Lock className="h-3 w-3" />}
            <MessageSquare className="h-3.5 w-3.5" />
            {t.tutor.modes.speaking}
          </TabsTrigger>
          <TabsTrigger value="listening" className="font-heading text-xs gap-1.5 py-2">
            {!isPro && <Lock className="h-3 w-3" />}
            <Headphones className="h-3.5 w-3.5" />
            {t.tutor.modes.listening}
          </TabsTrigger>
          <TabsTrigger value="errors" className="font-heading text-xs gap-1.5 py-2">
            {!isPro && <Lock className="h-3 w-3" />}
            <Bot className="h-3.5 w-3.5" />
            {t.tutor.modes.errors}
          </TabsTrigger>
        </TabsList>

        {/* 1. Grammar & Spelling (Free + Pro) */}
        <TabsContent value="grammar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                {t.tutor.modes.grammar}
              </CardTitle>
              <CardDescription>
                {locale === "ru"
                  ? "Введите русское предложение для проверки орфографии, окончаний и базовой грамматики."
                  : "Enter a Russian sentence to check spelling, endings, and core grammar."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={3}
                value={grammarInput}
                onChange={(e) => setGrammarInput(e.target.value)}
              />
              <Button
                disabled={!user || grammarLoading}
                onClick={() => runGrammarCheck(false)}
                className="font-heading gap-2"
              >
                <SpellCheck2 className="h-4 w-4" />
                {grammarLoading
                  ? "..."
                  : locale === "ru"
                  ? "Проверить грамматику и правописание"
                  : "Check Grammar & Spelling"}
              </Button>

              {grammarResult && (
                <div className="space-y-3 rounded-xl border border-border bg-muted/40 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-heading text-xs uppercase text-muted-foreground">
                      {locale === "ru" ? "Исправленный вариант" : "Corrected"}
                    </span>
                    <Badge variant={grammarResult.isCorrect ? "default" : "secondary"}>
                      {grammarResult.isCorrect ? "OK" : "Исправлено"}
                    </Badge>
                  </div>
                  <p className="text-lg font-semibold">
                    {grammarResult.correctedText}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {grammarResult.summary}
                  </p>
                  {grammarResult.issues.map((issue, idx) => (
                    <div
                      key={idx}
                      className="rounded-lg border border-border bg-card p-3 text-sm space-y-1"
                    >
                      <div className="font-heading text-xs text-[#499BED]">
                        {issue.category}: «{issue.original}» → «{issue.correction}»
                      </div>
                      <p>{issue.rule}</p>
                    </div>
                  ))}
                  <div className="text-sm pt-1">
                    <strong className="font-heading">
                      {locale === "ru" ? "Мини-задача: " : "Follow-up drill: "}
                    </strong>
                    {grammarResult.followUpDrill}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Quizzes & Tasks (Free + Pro) */}
        <TabsContent value="quiz" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="font-heading text-lg">
                {t.tutor.modes.quiz}
              </CardTitle>
              <CardDescription>
                {locale === "ru"
                  ? "Попросите AI-репетитора сгенерировать квиз или задачу по любой теме этапа."
                  : "Ask the AI tutor to generate a quiz or grammar task for your current stage."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {[
                  "Дай квиз из 3 вопросов на падежи",
                  "Придумай задачу на правописание приставок пре-/при-",
                  "Проверь меня по видам глагола НСВ и СВ",
                ].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => setChatPrompt(preset)}
                    className="font-heading text-xs"
                  >
                    {preset}
                  </Button>
                ))}
              </div>

              <div className="max-h-80 overflow-y-auto space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                {chatMessages.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    {locale === "ru"
                      ? "Диалог пуст. Выберите подсказку выше или напишите запрос."
                      : "No messages yet. Pick a prompt above or write your own."}
                  </p>
                )}
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl p-3 text-sm whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "ml-8 bg-primary text-primary-foreground"
                        : "mr-8 bg-card border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <Input
                  value={chatPrompt}
                  onChange={(e) => setChatPrompt(e.target.value)}
                  placeholder={
                    locale === "ru"
                      ? "Напишите тему квиза или ответ..."
                      : "Enter quiz topic or answer..."
                  }
                />
                <Button
                  disabled={!user || chatLoading}
                  onClick={() => sendChat("QUIZ")}
                  className="font-heading gap-1.5"
                >
                  <Send className="h-4 w-4" />
                  {chatLoading ? "..." : locale === "ru" ? "Отправить" : "Send"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Pronunciation (Pro only) */}
        <TabsContent value="pronunciation">
          {!isPro ? (
            renderProGate(t.tutor.modes.pronunciation)
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Mic className="h-5 w-5 text-[#499BED]" />
                  {locale === "ru"
                    ? "Проверка произношения (Gemini 3.5 Flash-Lite Audio)"
                    : "Pronunciation Evaluation (Gemini 3.5 Flash-Lite Audio)"}
                </CardTitle>
                <CardDescription>
                  {locale === "ru"
                    ? "Запишите фразу в микрофон — модель оценит ударения, редукцию гласных и мягкость согласных."
                    : "Record your voice — the model evaluates stress, vowel reduction, and palatalization."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="font-heading text-xs uppercase text-muted-foreground">
                    {locale === "ru" ? "Эталонная фраза" : "Target Phrase"}
                  </label>
                  <div className="flex gap-2">
                    <Input
                      value={targetPhrase}
                      onChange={(e) => setTargetPhrase(e.target.value)}
                    />
                    <Button
                      variant="outline"
                      onClick={() => speakRussian(targetPhrase, 0.9)}
                      className="font-heading gap-1.5"
                    >
                      <Volume2 className="h-4 w-4" />
                      {locale === "ru" ? "Образец" : "Listen"}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!recording ? (
                    <Button
                      disabled={pronLoading}
                      onClick={startRecording}
                      className="font-heading gap-2"
                    >
                      <Mic className="h-4 w-4" />
                      {pronLoading
                        ? locale === "ru"
                          ? "Анализ аудио..."
                          : "Analyzing audio..."
                        : locale === "ru"
                        ? "Записать голос"
                        : "Record Voice"}
                    </Button>
                  ) : (
                    <Button
                      variant="destructive"
                      onClick={stopRecording}
                      className="font-heading gap-2"
                    >
                      <Square className="h-4 w-4" />
                      {locale === "ru"
                        ? "Остановить и оценить"
                        : "Stop & Evaluate"}
                    </Button>
                  )}
                </div>

                {pronResult && (
                  <div className="space-y-3 rounded-xl border border-[#499BED]/40 bg-muted/40 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-heading text-sm font-semibold">
                        {locale === "ru" ? "Оценка произношения" : "Score"}
                      </span>
                      <Badge className="bg-[#499BED] text-[#031725] font-heading text-base">
                        {pronResult.score} / 100
                      </Badge>
                    </div>
                    <p className="text-sm">
                      <strong>
                        {locale === "ru" ? "Распознано: " : "Heard: "}
                      </strong>
                      {pronResult.transcript}
                    </p>
                    <p className="text-sm">{pronResult.stressFeedback}</p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      {pronResult.phoneticTips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                    {pronResult.wordBreakdown.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {pronResult.wordBreakdown.map((w, i) => (
                          <Badge
                            key={i}
                            variant={
                              w.status === "accurate" ? "secondary" : "destructive"
                            }
                            title={w.note}
                          >
                            {w.word}: {w.note}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 4. Speaking (Pro only) */}
        <TabsContent value="speaking">
          {!isPro ? (
            renderProGate(t.tutor.modes.speaking)
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  {t.tutor.modes.speaking}
                </CardTitle>
                <CardDescription>
                  {locale === "ru"
                    ? "Свободная разговорная практика по-русски с голосовой озвучкой ответов AI."
                    : "Conversational Russian practice with AI voice playback."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="max-h-80 overflow-y-auto space-y-3 rounded-xl border border-border bg-muted/30 p-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`rounded-xl p-3 text-sm whitespace-pre-wrap flex items-start justify-between gap-2 ${
                        msg.role === "user"
                          ? "ml-8 bg-primary text-primary-foreground"
                          : "mr-8 bg-card border border-border"
                      }`}
                    >
                      <span>{msg.text}</span>
                      {msg.role === "assistant" && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => speakRussian(msg.text)}
                          className="shrink-0 h-7 w-7"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={chatPrompt}
                    onChange={(e) => setChatPrompt(e.target.value)}
                    placeholder={
                      locale === "ru"
                        ? "Расскажите репетитору о своём дне или выберите тему..."
                        : "Start a Russian conversation..."
                    }
                  />
                  <Button
                    disabled={chatLoading}
                    onClick={() => sendChat("SPEAKING")}
                    className="font-heading gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {chatLoading ? "..." : locale === "ru" ? "Ответить" : "Speak"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 5. Listening (Pro only) */}
        <TabsContent value="listening">
          {!isPro ? (
            renderProGate(t.tutor.modes.listening)
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg flex items-center gap-2">
                  <Headphones className="h-5 w-5 text-[#499BED]" />
                  {t.tutor.modes.listening}
                </CardTitle>
                <CardDescription>
                  {locale === "ru"
                    ? "Сгенерируйте аудио-сюжет на русском под ваш уровень, прослушайте с нужной скоростью и ответьте на вопросы."
                    : "Generate a Russian listening passage tailored to your stage with speed controls."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Input
                    className="max-w-sm"
                    value={listeningTopic}
                    onChange={(e) => setListeningTopic(e.target.value)}
                    placeholder={
                      locale === "ru" ? "Тема аудирования" : "Listening topic"
                    }
                  />
                  <Button
                    disabled={listeningLoading}
                    onClick={loadListening}
                    className="font-heading"
                  >
                    {listeningLoading
                      ? "..."
                      : locale === "ru"
                      ? "Создать аудио-урок"
                      : "Generate Listening"}
                  </Button>
                </div>

                {listeningEx && (
                  <div className="space-y-4 rounded-xl border border-border bg-muted/30 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-heading text-lg font-bold">
                        {listeningEx.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        {[0.8, 0.95, 1.15].map((r) => (
                          <Button
                            key={r}
                            size="sm"
                            variant={listeningRate === r ? "default" : "outline"}
                            onClick={() => setListeningRate(r)}
                            className="font-heading text-xs"
                          >
                            {r}x
                          </Button>
                        ))}
                        <Button
                          onClick={() =>
                            speakRussian(listeningEx.script, listeningRate)
                          }
                          className="font-heading gap-1.5"
                        >
                          <Volume2 className="h-4 w-4" />
                          {locale === "ru" ? "Слушать" : "Play Audio"}
                        </Button>
                      </div>
                    </div>

                    {listeningEx.questions.map((q, qIdx) => (
                      <div key={qIdx} className="space-y-2 pt-2">
                        <div className="font-heading text-sm font-semibold">
                          {qIdx + 1}. {q.question}
                        </div>
                        <div className="grid gap-1.5">
                          {q.options.map((opt, optIdx) => {
                            const picked = listeningAnswers[qIdx] === optIdx;
                            const correct = optIdx === q.correctIndex;
                            return (
                              <button
                                key={opt}
                                type="button"
                                onClick={() =>
                                  setListeningAnswers((prev) => ({
                                    ...prev,
                                    [qIdx]: optIdx,
                                  }))
                                }
                                className={`text-left rounded-lg border px-3 py-2 text-sm ${
                                  listeningChecked && correct
                                    ? "border-[#499BED] bg-[#499BED]/20 font-semibold"
                                    : listeningChecked && picked && !correct
                                    ? "border-destructive bg-destructive/15"
                                    : picked
                                    ? "border-[#499BED] bg-primary/10"
                                    : "border-border bg-card"
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="space-y-2 pt-2">
                      <label className="font-heading text-xs uppercase text-muted-foreground">
                        {locale === "ru"
                          ? "Диктант (запишите ключевую фразу на слух)"
                          : "Dictation (type the key sentence)"}
                      </label>
                      <Input
                        value={dictationInput}
                        onChange={(e) => setDictationInput(e.target.value)}
                      />
                    </div>

                    <Button
                      onClick={() => setListeningChecked(true)}
                      className="font-heading"
                    >
                      {locale === "ru" ? "Проверить ответы" : "Check Answers"}
                    </Button>

                    {listeningChecked && (
                      <div className="rounded-lg border border-border bg-card p-3 text-sm space-y-1">
                        <div className="font-heading text-xs uppercase text-muted-foreground">
                          {locale === "ru" ? "Полный скрипт" : "Full Transcript"}
                        </div>
                        <p>{listeningEx.script}</p>
                        <p className="text-xs text-[#499BED]">
                          {locale === "ru" ? "Диктант: " : "Dictation target: "}
                          {listeningEx.dictationTarget}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 6. Deep Error Breakdown (Pro only) */}
        <TabsContent value="errors">
          {!isPro ? (
            renderProGate(t.tutor.modes.errors)
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="font-heading text-lg">
                  {t.tutor.modes.errors}
                </CardTitle>
                <CardDescription>
                  {locale === "ru"
                    ? "Глубокий диагностический разбор ошибок (падежи, виды глагола, пунктуация, стилистика) с тренировочным заданием."
                    : "Deep diagnostic breakdown across cases, aspect, punctuation, and style."}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  rows={4}
                  value={grammarInput}
                  onChange={(e) => setGrammarInput(e.target.value)}
                />
                <Button
                  disabled={grammarLoading}
                  onClick={() => runGrammarCheck(true)}
                  className="font-heading gap-2"
                >
                  <Bot className="h-4 w-4" />
                  {grammarLoading
                    ? "..."
                    : locale === "ru"
                    ? "Выполнить глубокий разбор ошибок"
                    : "Run Deep Error Breakdown"}
                </Button>

                {grammarResult && (
                  <div className="space-y-3 rounded-xl border border-[#499BED]/40 bg-muted/40 p-4">
                    <p className="text-base font-semibold">
                      {grammarResult.correctedText}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {grammarResult.summary}
                    </p>
                    {grammarResult.issues.map((issue, idx) => (
                      <div
                        key={idx}
                        className="rounded-lg border border-border bg-card p-3 text-sm space-y-1"
                      >
                        <Badge variant="outline" className="font-heading text-xs">
                          {issue.category}
                        </Badge>
                        <div>
                          «{issue.original}» → <strong>«{issue.correction}»</strong>
                        </div>
                        <p className="text-muted-foreground">{issue.rule}</p>
                      </div>
                    ))}
                    <div className="rounded-lg bg-[#022E5B] text-[#DAEAFF] p-3 text-sm">
                      <strong className="font-heading">
                        {locale === "ru"
                          ? "Персональный тренажёр: "
                          : "Targeted Drill: "}
                      </strong>
                      {grammarResult.followUpDrill}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-6xl px-4 py-12 font-heading text-muted-foreground">
          Загрузка AI-студии...
        </div>
      }
    >
      <TutorStudioContent />
    </Suspense>
  );
}
