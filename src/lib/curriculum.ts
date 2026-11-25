import type { LearningStage, PlanTier } from "./quota";

export interface QuizQuestion {
  id: string;
  promptRu: string;
  promptEn: string;
  options: string[];
  correctIndex: number;
  explanationRu: string;
  explanationEn: string;
}

export interface SpellingTask {
  id: string;
  instructionRu: string;
  instructionEn: string;
  prompt: string;
  expectedAnswer: string;
  hintRu: string;
  hintEn: string;
}

export interface LessonItem {
  slug: string;
  order: number;
  stage: LearningStage;
  isFreeTier: boolean;
  durationMinutes: number;
  titleRu: string;
  titleEn: string;
  summaryRu: string;
  summaryEn: string;
  topicsRu: string[];
  topicsEn: string[];
  theoryRu: string;
  theoryEn: string;
  examples: { ru: string; translit: string; en: string }[];
  tasks: SpellingTask[];
  quiz: QuizQuestion[];
  proSpeakingPrompt: string;
  proPronunciationPhrase: string;
  proListeningScript: string;
}

export interface StageMetadata {
  id: LearningStage;
  cefr: string;
  titleRu: string;
  titleEn: string;
  subtitleRu: string;
  subtitleEn: string;
  descriptionRu: string;
  descriptionEn: string;
}

export const STAGES: StageMetadata[] = [
  {
    id: "BEGINNER",
    cefr: "A1–A2",
    titleRu: "Начальный",
    titleEn: "Beginner",
    subtitleRu: "Основы кириллицы, фонетики и базовой грамматики",
    subtitleEn: "Cyrillic foundations, phonetics, and core grammar",
    descriptionRu:
      "Алфавит, правила чтения, род существительных, базовые спряжения глаголов и первые живые диалоги.",
    descriptionEn:
      "Alphabet, reading rules, noun gender, present tense conjugations, and essential everyday phrases.",
  },
  {
    id: "INTERMEDIATE",
    cefr: "B1",
    titleRu: "Средний",
    titleEn: "Intermediate",
    subtitleRu: "Система падежей, приставки и виды глагола",
    subtitleEn: "Case system, prefixes, and verbal aspect",
    descriptionRu:
      "Уверенное владение падежами, правописание приставок и безударных гласных, НСВ и СВ, глаголы движения.",
    descriptionEn:
      "Confident use of all six cases, prefix spelling rules, imperfective/perfective aspect, and verbs of motion.",
  },
  {
    id: "ADVANCED",
    cefr: "B2–C1",
    titleRu: "Продвинутый",
    titleEn: "Advanced",
    subtitleRu: "Сложный синтаксис, причастия и стилистика",
    subtitleEn: "Complex syntax, participles, and register",
    descriptionRu:
      "Причастные и деепричастные обороты, правописание Н и НН, деловая переписка и оттенки значений.",
    descriptionEn:
      "Participle clauses, N/NN orthography, formal correspondence, and nuanced semantic distinctions.",
  },
  {
    id: "EXPERT",
    cefr: "C2",
    titleRu: "Эксперт",
    titleEn: "Expert",
    subtitleRu: "Риторика, редкая пунктуация и интонация носителя",
    subtitleEn: "Rhetoric, subtle punctuation, and native intonation",
    descriptionRu:
      "Авторская и сложная пунктуация, идиоматика, интонационные конструкции (ИК) и свободная аргументация.",
    descriptionEn:
      "Nuanced punctuation, idioms, Russian intonation contours, and persuasive academic or literary expression.",
  },
];

export const LESSONS: LessonItem[] = [
  {
    slug: "alphabet-and-ji-shi",
    order: 1,
    stage: "BEGINNER",
    isFreeTier: true,
    durationMinutes: 8,
    titleRu: "Кириллица и золотые правила: ЖИ–ШИ, ЧА–ЩА, ЧУ–ЩУ",
    titleEn: "Cyrillic & Core Spelling: ЖИ–ШИ, ЧА–ЩА, ЧУ–ЩУ",
    summaryRu:
      "Разбираем шипящие согласные, твёрдость и мягкость, а также базовую орфографию.",
    summaryEn:
      "Master sibilant consonants, hard vs. soft sounds, and Russia's first spelling rules.",
    topicsRu: ["Базовая фонетика", "Правописание", "Шипящие"],
    topicsEn: ["Core Phonetics", "Spelling", "Sibilants"],
    theoryRu:
      "В русском языке звуки [ж] и [ш] всегда твёрдые, но исторически после них в сочетаниях ЖИ и ШИ пишется буква И (жизнь, машина). Звуки [ч'] и [щ'] всегда мягкие, поэтому после них пишется А и У (чашка, щука), а не Я и Ю.",
    theoryEn:
      "In Russian, [ж] and [ш] are always hard consonants, yet spelling preserves И in ЖИ/ШИ (жизнь, машина). Conversely, [ч'] and [щ'] are always soft, so they take А and У in ЧА/ЩА and ЧУ/ЩУ (чашка, щука).",
    examples: [
      { ru: "Машина едет быстро.", translit: "Mashina yedet bystro.", en: "The car is driving fast." },
      { ru: "Вкусная чашка чая.", translit: "Vkusnaya chashka chaya.", en: "A tasty cup of tea." },
      { ru: "Я чувствую радость.", translit: "Ya chuvstvuyu radost'.", en: "I feel joy." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Вставьте правильную букву и напишите слово целиком: «ма__на» (и/ы)",
        instructionEn: "Write the complete word with the right vowel: «ма__на» (и/ы)",
        prompt: "ма_на (транспорт)",
        expectedAnswer: "машина",
        hintRu: "После Ш всегда пишется И.",
        hintEn: "Always write И after Ш.",
      },
      {
        id: "t2",
        instructionRu: "Напишите слово правильно: «ч_шка» (а/я)",
        instructionEn: "Spell the word correctly: «ч_шка» (а/я)",
        prompt: "ч_шка",
        expectedAnswer: "чашка",
        hintRu: "ЧА–ЩА пиши с буквой А.",
        hintEn: "ЧА–ЩА is always spelled with А.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какое слово написано без орфографической ошибки?",
        promptEn: "Which word is spelled without any spelling mistake?",
        options: ["жызнь", "жизнь", "жызн", "жызьнь"],
        correctIndex: 1,
        explanationRu: "ЖИ–ШИ пишется с буквой И: жизнь.",
        explanationEn: "ЖИ–ШИ always uses И: жизнь.",
      },
      {
        id: "q2",
        promptRu: "Выберите верное написание слова:",
        promptEn: "Choose the correct spelling:",
        options: ["щюка", "чюдо", "щука", "чяща"],
        correctIndex: 2,
        explanationRu: "ЧУ–ЩУ пишется с буквой У: щука.",
        explanationEn: "ЧУ–ЩУ always uses У: щука.",
      },
    ],
    proSpeakingPrompt: "Расскажите вслух, что вы видите на улице утром, используя слова «машина», «жизнь» и «чашка».",
    proPronunciationPhrase: "Широкая машина проехала мимо тихой рощи.",
    proListeningScript: "Утром я пью горячую чашку чая и смотрю в окно на широкую улицу, где проезжает синяя машина.",
  },
  {
    slug: "noun-gender-pronouns",
    order: 2,
    stage: "BEGINNER",
    isFreeTier: true,
    durationMinutes: 9,
    titleRu: "Род существительных и базовые местоимения",
    titleEn: "Noun Gender & Core Pronouns",
    summaryRu:
      "Как мгновенно определить мужской, женский и средний род по окончанию слова.",
    summaryEn:
      "Instantly identify masculine, feminine, and neuter nouns by their endings.",
    topicsRu: ["Грамматика", "Род", "Местоимения"],
    topicsEn: ["Grammar", "Gender", "Pronouns"],
    theoryRu:
      "Мужской род (он): нулевое окончание (дом, стол, музей). Женский род (она): -а/-я (книга, земля) и часть слов на -ь (ночь). Средний род (оно): -о/-е/-мя (окно, море, время). Исключения вроде «папа», «дядя», «кофе» важно запоминать отдельно.",
    theoryEn:
      "Masculine (он) ends in a consonant or -й (дом, музей). Feminine (она) ends in -а/-я (книга, земля) or certain -ь nouns (ночь). Neuter (оно) ends in -о/-е/-мя (окно, море, время).",
    examples: [
      { ru: "Мой новый стол", translit: "Moy novyy stol", en: "My new table (m.)" },
      { ru: "Моя интересная книга", translit: "Moya interesnaya kniga", en: "My interesting book (f.)" },
      { ru: "Моё большое окно", translit: "Moyo bol'shoye okno", en: "My big window (n.)" },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Напишите правильное местоимение для слова «окно» (мой / моя / моё)",
        instructionEn: "Write the matching possessive pronoun for «окно» (мой / моя / моё)",
        prompt: "___ окно",
        expectedAnswer: "моё",
        hintRu: "Слово «окно» оканчивается на -о, это средний род.",
        hintEn: "«окно» ends in -о, so it is neuter.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "К какому роду относится слово «море»?",
        promptEn: "What gender is the noun «море»?",
        options: ["Мужской", "Женский", "Средний", "Множественное число"],
        correctIndex: 2,
        explanationRu: "Окончание -е указывает на средний род (оно моё).",
        explanationEn: "The -е ending indicates neuter gender.",
      },
      {
        id: "q2",
        promptRu: "Выберите правильное сочетание:",
        promptEn: "Pick the grammatically correct phrase:",
        options: ["моя словарь", "мой тетрадь", "моя книга", "моё улица"],
        correctIndex: 2,
        explanationRu: "«Книга» — женский род, поэтому «моя книга».",
        explanationEn: "«Книга» is feminine, so «моя книга» is correct.",
      },
    ],
    proSpeakingPrompt: "Опишите 3 предмета в вашей комнате с местоимениями «мой», «моя», «моё».",
    proPronunciationPhrase: "Моё окно выходит на тихое синее море.",
    proListeningScript: "В моей комнате стоит деревянный стол, лежит открытая книга и светится большое окно.",
  },
  {
    slug: "present-tense-conjugation",
    order: 3,
    stage: "BEGINNER",
    isFreeTier: true,
    durationMinutes: 10,
    titleRu: "Настоящее время: I и II спряжение глаголов",
    titleEn: "Present Tense: 1st & 2nd Conjugations",
    summaryRu:
      "Окончания -ешь/-ет против -ишь/-ит и орфография безударных личных окончаний.",
    summaryEn:
      "Master -ешь/-ет vs. -ишь/-ит endings and avoid common spelling errors in verbs.",
    topicsRu: ["Глаголы", "Спряжение", "Правописание"],
    topicsEn: ["Verbs", "Conjugation", "Spelling"],
    theoryRu:
      "Глаголы II спряжения в инфинитиве обычно оканчиваются на -ить (говорить → говоришь, говорят) плюс 11 исключений (видеть, смотреть, дышать и др.). Остальные в большинстве относятся к I спряжению (читать → читаешь, читают).",
    theoryEn:
      "2nd conjugation verbs typically end in -ить in the infinitive (говорить → говоришь, говорят), plus 11 exceptions like видеть and смотреть. Most other verbs follow the 1st conjugation (читать → читаешь, читают).",
    examples: [
      { ru: "Ты читаешь по-русски.", translit: "Ty chitayesh' po-russki.", en: "You read Russian." },
      { ru: "Они говорят очень чётко.", translit: "Oni govoryat ochen' chyotko.", en: "They speak very clearly." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Поставьте глагол «говорить» в форму «ты» (настоящее время):",
        instructionEn: "Conjugate «говорить» for «ты» (present tense):",
        prompt: "Ты ___ (говорить)",
        expectedAnswer: "говоришь",
        hintRu: "II спряжение: окончание -ишь (не забудьте Ь).",
        hintEn: "2nd conjugation ends in -ишь (including the soft sign ь).",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какая форма правильная: «Они ___ интересный фильм»?",
        promptEn: "Which form completes «Они ___ интересный фильм»?",
        options: ["смотрю", "смотрят", "смотрит", "смотреют"],
        correctIndex: 1,
        explanationRu: "«Смотреть» — глагол-исключение II спряжения, поэтому «они смотрят».",
        explanationEn: "«Смотреть» is a 2nd conjugation exception: «они смотрят».",
      },
    ],
    proSpeakingPrompt: "Расскажите о своём обычном дне, используя минимум 4 глагола в настоящем времени.",
    proPronunciationPhrase: "Мы каждый день читаем статьи и свободно говорим по-русски.",
    proListeningScript: "Анна много читает утром, а вечером она звонит друзьям и говорит с ними о новых проектах.",
  },
  {
    slug: "prepositional-case-akanye",
    order: 4,
    stage: "BEGINNER",
    isFreeTier: false,
    durationMinutes: 12,
    titleRu: "Предложный падеж и аканье в живой речи",
    titleEn: "Prepositional Case & Vowel Reduction (Аканье)",
    summaryRu:
      "Где? В чём? О ком? + фонетическая практика безударного О (Pro урок).",
    summaryEn:
      "Location and topic with в/на/о plus natural unstressed 'о' pronunciation (Pro).",
    topicsRu: ["Падежи", "Произношение", "Speaking"],
    topicsEn: ["Cases", "Pronunciation", "Speaking"],
    theoryRu:
      "Предложный падеж отвечает на вопросы «о ком? о чём? где?» и всегда употребляется с предлогами (в, на, о, при). Большинство существительных получают окончание -е (в городе, на столе), а слова на -ия/-ие/-ий — окончание -и (в России, в здании).",
    theoryEn:
      "The Prepositional case answers 'where?' or 'about what?' and always requires a preposition (в, на, о). Most nouns take -е (в городе), while -ия/-ие/-ий nouns take -и (в России, в здании).",
    examples: [
      { ru: "Я живу в Москве.", translit: "Ya zhivu v Moskve.", en: "I live in Moscow." },
      { ru: "Мы говорим о музыке.", translit: "My govorim o muzyke.", en: "We are talking about music." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Поставьте слово «здание» в предложный падеж: «Мы в ___»",
        instructionEn: "Put «здание» into the Prepositional case: «Мы в ___»",
        prompt: "Мы в ___ (здание)",
        expectedAnswer: "здании",
        hintRu: "Существительные на -ие в предложном падеже оканчиваются на -ии.",
        hintEn: "Nouns ending in -ие take -ии in the Prepositional case.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Как правильно сказать «about Russia»?",
        promptEn: "How do you say «about Russia»?",
        options: ["о Россие", "о России", "о Россию", "о Россия"],
        correctIndex: 1,
        explanationRu: "Слово «Россия» оканчивается на -ия → в предложном падеже «о России».",
        explanationEn: "«Россия» ends in -ия, so it becomes «о России».",
      },
    ],
    proSpeakingPrompt: "Скажите, в каком городе вы живёте и о чём любите разговаривать с друзьями.",
    proPronunciationPhrase: "В хорошо освещённом городе мы говорили о культуре и истории.",
    proListeningScript: "Сегодня мы встречаемся в новом здании в центре города и разговариваем о современной архитектуре.",
  },
  {
    slug: "accusative-genitive-basics",
    order: 5,
    stage: "INTERMEDIATE",
    isFreeTier: true,
    durationMinutes: 10,
    titleRu: "Винительный и Родительный падежи: одушевлённость и отрицание",
    titleEn: "Accusative & Genitive: Animacy and Negation",
    summaryRu:
      "Различие «вижу дом / вижу брата» и обязательный родительный падеж после «нет».",
    summaryEn:
      "Master animate vs. inanimate accusative endings and mandatory genitive after «нет».",
    topicsRu: ["Падежи", "Грамматика", "Квиз"],
    topicsEn: ["Cases", "Grammar", "Quiz"],
    theoryRu:
      "В винительном падеже у одушевлённых существительных мужского рода форма совпадает с родительным падежом (вижу студента, знаю друга), а у неодушевлённых — с именительным (вижу стол). При отрицании со словом «нет / не было» всегда используется родительный падеж (нет времени, нет билета).",
    theoryEn:
      "In the Accusative case, animate masculine nouns mirror the Genitive (вижу студента), whereas inanimate nouns keep the Nominative form (вижу стол). Negation with «нет» always triggers the Genitive case (нет времени).",
    examples: [
      { ru: "Я вижу своего друга.", translit: "Ya vizhu svoyego druga.", en: "I see my friend." },
      { ru: "У меня нет свободного времени.", translit: "U menya net svobodnogo vremeni.", en: "I have no free time." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Дополните фразу словом «время» в нужном падеже: «Сегодня у меня нет ___»",
        instructionEn: "Fill in «время» in the proper case: «Сегодня у меня нет ___»",
        prompt: "Сегодня у меня нет ___",
        expectedAnswer: "времени",
        hintRu: "Разносклоняемое слово «время» в родительном падеже: времени.",
        hintEn: "The noun «время» becomes «времени» in the Genitive.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Выберите правильный вариант: «В офисе сейчас нет ___»",
        promptEn: "Choose the correct form: «В офисе сейчас нет ___»",
        options: ["директор", "директору", "директора", "директором"],
        correctIndex: 2,
        explanationRu: "После «нет» требуется родительный падеж: директора.",
        explanationEn: "After «нет», use the Genitive case: директора.",
      },
    ],
    proSpeakingPrompt: "Опишите, кого и что вы видите на рабочем месте и чего вам не хватает для отдыха.",
    proPronunciationPhrase: "У нашего нового преподавателя сегодня нет ни минуты свободного времени.",
    proListeningScript: "К сожалению, в кассе уже нет билетов на вечерний поезд, но я вижу свободное место на утренний рейс.",
  },
  {
    slug: "prefixes-pre-pri-and-roots",
    order: 6,
    stage: "INTERMEDIATE",
    isFreeTier: true,
    durationMinutes: 10,
    titleRu: "Правописание приставок ПРЕ-/ПРИ- и корней с чередованием",
    titleEn: "Prefixes ПРЕ-/ПРИ- & Alternating Vowel Roots",
    summaryRu:
      "Смысловое различие «пребывать / прибывать» и безударные гласные в корне.",
    summaryEn:
      "Distinguish semantic prefixes ПРЕ-/ПРИ- and master alternating root vowels.",
    topicsRu: ["Правописание", "Орфография", "Задачи"],
    topicsEn: ["Spelling", "Orthography", "Exercises"],
    theoryRu:
      "Приставка ПРИ- обозначает приближение, присоединение, близость или неполноту действия (приехать, приклеить, приоткрыть). Приставка ПРЕ- означает высшую степень («очень») или близка к «пере-» (прекрасный, преграда). В корнях -лаг-/-лож- перед Г пишется А, перед Ж — О.",
    theoryEn:
      "The prefix ПРИ- conveys approach, attachment, proximity, or incomplete action (приехать, приоткрыть). ПРЕ- conveys 'very' or 'over/across' (прекрасный, преграда). In alternating roots like -лаг-/-лож-, write А before Г and О before Ж.",
    examples: [
      { ru: "Поезд прибывает на первый путь.", translit: "Poyezd pribyvayet na pervyy put'.", en: "The train is arriving on track one." },
      { ru: "Предложение звучит прекрасно.", translit: "Predlozheniye zvuchit prekrasno.", en: "The proposal sounds wonderful." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Напишите слово правильно: «пр_красный» (е/и)",
        instructionEn: "Spell the word correctly: «пр_красный» (е/и)",
        prompt: "пр_красный день",
        expectedAnswer: "прекрасный",
        hintRu: "Значение «очень красивый» → приставка ПРЕ-.",
        hintEn: "Meaning 'very beautiful' takes ПРЕ-.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Выберите правильный вариант: «Турист ___ в город утром»",
        promptEn: "Choose the correct verb: «Турист ___ в город утром»",
        options: ["пребыл", "прибыл", "пребел", "прибел"],
        correctIndex: 1,
        explanationRu: "Приближение (приехал в город) передаётся приставкой ПРИ-: прибыл.",
        explanationEn: "Arrival uses ПРИ-: прибыл.",
      },
    ],
    proSpeakingPrompt: "Составьте 3 предложения с глаголами с приставками ПРИ- и ПРЕ- и объясните их смысл.",
    proPronunciationPhrase: "Скорый поезд прибывает вовремя, несмотря на преграды на пути.",
    proListeningScript: "Делегация прибыла в столицу ранним утром и предложила прекрасный план совместной работы.",
  },
  {
    slug: "verbal-aspect-nsv-sv",
    order: 7,
    stage: "INTERMEDIATE",
    isFreeTier: false,
    durationMinutes: 14,
    titleRu: "Виды глагола: НСВ и СВ в живых диалогах",
    titleEn: "Verbal Aspect: Imperfective vs. Perfective",
    summaryRu:
      "Процесс и повторяемость против результата и однократного действия.",
    summaryEn:
      "Process and repetition vs. single completed result in natural dialogues.",
    topicsRu: ["Виды глагола", "Speaking", "Разбор ошибок"],
    topicsEn: ["Aspect", "Speaking", "Error Analysis"],
    theoryRu:
      "Несовершенный вид (НСВ: делать, читать) описывает процесс, регулярность или сам факт действия. Совершенный вид (СВ: сделать, прочитать) фокусируется на результате, завершении или последовательности событий.",
    theoryEn:
      "Imperfective (НСВ: делать, читать) expresses ongoing process, habit, or general fact. Perfective (СВ: сделать, прочитать) highlights completion, result, or a sequence of events.",
    examples: [
      { ru: "Я долго читал книгу и наконец прочитал её.", translit: "Ya dolgo chital knigu i nakonets prochital yeyo.", en: "I read the book for a long time and finally finished reading it." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Выберите СВ: «Вчера я весь вечер писал отчёт и наконец ___ его»",
        instructionEn: "Write the perfective form of «писать»: «...и наконец ___ его»",
        prompt: "...и наконец ___ его",
        expectedAnswer: "написал",
        hintRu: "Парный глагол совершенного вида к «писать» — «написать».",
        hintEn: "The perfective pair of «писать» is «написать».",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какой глагол подходит к слову «каждый день»?",
        promptEn: "Which verb pairs naturally with «каждый день»?",
        options: ["позвонил", "звоню", "написал", "сделал"],
        correctIndex: 1,
        explanationRu: "Регулярное действие требует несовершенного вида: звоню.",
        explanationEn: "Habitual actions require the imperfective aspect: звоню.",
      },
    ],
    proSpeakingPrompt: "Расскажите о задаче, над которой вы долго работали и успешно её завершили.",
    proPronunciationPhrase: "Он долго решал сложную задачу и к вечеру наконец решил её.",
    proListeningScript: "Мария обычно готовит ужин сама, но вчера она решила не готовить и заказала любимую пасту.",
  },
  {
    slug: "verbs-of-motion",
    order: 8,
    stage: "INTERMEDIATE",
    isFreeTier: false,
    durationMinutes: 14,
    titleRu: "Глаголы движения: идти/ходить и приставки",
    titleEn: "Verbs of Motion & Spatial Prefixes",
    summaryRu:
      "Однонаправленное движение против разнонаправленного + прийти, уйти, зайти.",
    summaryEn:
      "Unidirectional vs. multidirectional motion plus spatial prefixes.",
    topicsRu: ["Глаголы движения", "Listening", "Произношение"],
    topicsEn: ["Motion Verbs", "Listening", "Pronunciation"],
    theoryRu:
      "«Идти / ехать» — движение в одном направлении сейчас (Я иду на работу). «Ходить / ездить» — регулярное движение туда-обратно или без цели (Я хожу в зал по вторникам). Приставки при-, у-, за-, пере- превращают их в точные пространственные сценарии.",
    theoryEn:
      "«Идти / ехать» denote movement in one direction right now. «Ходить / ездить» denote habitual round-trips or wandering. Spatial prefixes (при-, у-, за-, пере-) add arrival, departure, brief stops, and crossing.",
    examples: [
      { ru: "Сейчас я иду в библиотеку.", translit: "Seychas ya idu v biblioteku.", en: "Right now I am walking to the library." },
      { ru: "По пути домой я зашёл в аптеку.", translit: "Po puti domoy ya zashyol v apteku.", en: "On the way home I stopped by the pharmacy." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Вставьте глагол: «Каждое утро я ___ на работу пешком» (иду / хожу)",
        instructionEn: "Choose the right verb: «Каждое утро я ___ на работу пешком» (иду / хожу)",
        prompt: "Каждое утро я ___ на работу",
        expectedAnswer: "хожу",
        hintRu: "Регулярное повторяющееся действие требует «хожу».",
        hintEn: "A repeated habit requires «хожу».",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какая приставка означает «ненадолго остановиться по пути»?",
        promptEn: "Which prefix means 'to stop by briefly on the way'?",
        options: ["у-", "за-", "вы-", "пере-"],
        correctIndex: 1,
        explanationRu: "Глагол «зайти» обозначает короткий визит по пути.",
        explanationEn: "«Зайти» means to drop by briefly.",
      },
    ],
    proSpeakingPrompt: "Опишите свой утренний маршрут на работу или учёбу с глаголами движения.",
    proPronunciationPhrase: "По дороге в университет я зашёл за кофе и быстро перешёл площадь.",
    proListeningScript: "Обычно Алексей ездит в центр на метро, но сегодня он решил пройтись пешком и зайти в книжный магазин.",
  },
  {
    slug: "instrumental-and-dative-abstract",
    order: 9,
    stage: "ADVANCED",
    isFreeTier: false,
    durationMinutes: 15,
    titleRu: "Творительный и Дательный падежи в абстрактных конструкциях",
    titleEn: "Instrumental & Dative in Abstract Constructions",
    summaryRu:
      "Безличные конструкции («мне кажется», «нам удалось») и управление глаголов.",
    summaryEn:
      "Impersonal dative expressions and abstract instrumental verb government.",
    topicsRu: ["Синтаксис", "Разбор ошибок", "Деловая речь"],
    topicsEn: ["Syntax", "Error Analysis", "Formal Speech"],
    theoryRu:
      "На уровне B2–C1 дательный падеж формирует безличные оценки состояния («мне необходимо», «ему не хватает»), а творительный выражает профессию, инструмент, способ действия и управление ключевых глаголов («обладать талантом», «являться примером», «гордиться успехом»).",
    theoryEn:
      "At B2–C1, the Dative powers impersonal expressions («мне необходимо», «ему удалось»), while the Instrumental expresses roles, states, and verb complements («обладать талантом», «являться примером»).",
    examples: [
      { ru: "Команде удалось завершить проект досрочно.", translit: "Komande udalos' zavershit' proyekt dosrochno.", en: "The team managed to finish the project ahead of schedule." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Поставьте слово «результат» в творительный падеж: «Мы гордимся ___»",
        instructionEn: "Put «результат» into the Instrumental case: «Мы гордимся ___»",
        prompt: "Мы гордимся ___",
        expectedAnswer: "результатом",
        hintRu: "Глагол «гордиться» требует творительного падежа (чем?).",
        hintEn: "«Гордиться» governs the Instrumental case.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какой глагол требует творительного падежа?",
        promptEn: "Which verb requires the Instrumental case?",
        options: ["бояться", "обладать", "помогать", "ждать"],
        correctIndex: 1,
        explanationRu: "«Обладать (чем?)» управляет творительным падежом.",
        explanationEn: "«Обладать» governs the Instrumental case.",
      },
    ],
    proSpeakingPrompt: "Расскажите о профессиональном достижении, которым вы гордитесь, используя безличные конструкции.",
    proPronunciationPhrase: "Нам удалось стать надёжным партнёром и воспользоваться уникальным шансом.",
    proListeningScript: "Руководителю проекта удалось убедить инвесторов в том, что новая платформа обладает огромным потенциалом.",
  },
  {
    slug: "participles-and-gerunds",
    order: 10,
    stage: "ADVANCED",
    isFreeTier: false,
    durationMinutes: 15,
    titleRu: "Причастные и деепричастные обороты + пунктуация",
    titleEn: "Participles, Adverbial Participles & Punctuation",
    summaryRu:
      "Обособление оборотов запятыми и исправление типичных синтаксических ошибок.",
    summaryEn:
      "Comma rules for participial clauses and fixing dangling adverbial participles.",
    topicsRu: ["Пунктуация", "Синтаксис", "Разбор ошибок"],
    topicsEn: ["Punctuation", "Syntax", "Error Analysis"],
    theoryRu:
      "Причастный оборот обособляется запятыми, если стоит ПОСЛЕ определяемого слова. Деепричастный оборот обособляется почти всегда и должен относиться к тому же субъекту, что и сказуемое (нельзя: «Подъезжая к станции, у меня слетела шляпа»).",
    theoryEn:
      "A participial clause takes commas when placed AFTER its head noun. An adverbial participle clause almost always takes commas and must share the same grammatical subject as the main verb.",
    examples: [
      { ru: "Книга, прочитанная вчера, оказалась захватывающей.", translit: "Kniga, prochitannaya vchera, okzalas' zakhvatyvayushchey.", en: "The book read yesterday turned out to be gripping." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Образуйте действительное причастие настоящего времени от «читать» (муж. род): «студент, ___ книгу»",
        instructionEn: "Form the active present participle of «читать»: «студент, ___ книгу»",
        prompt: "студент, ___ книгу",
        expectedAnswer: "читающий",
        hintRu: "I спряжение: суффикс -ющ- + окончание -ий.",
        hintEn: "1st conjugation uses suffix -ющ- + -ий.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какое предложение построено грамматически корректно?",
        promptEn: "Which sentence is grammatically sound?",
        options: [
          "Прочитав письмо, мне стало грустно.",
          "Прочитав письмо, я почувствовал облегчение.",
          "Открывая дверь, ключ сломался.",
          "Вернувшись домой, пошёл сильный дождь.",
        ],
        correctIndex: 1,
        explanationRu: "Во втором варианте субъект деепричастия («я») совпадает с подлежащим.",
        explanationEn: "Option 2 has matching subjects for the participle and main clause.",
      },
    ],
    proSpeakingPrompt: "Перефразируйте два простых предложения в одно сложное с причастным или деепричастным оборотом.",
    proPronunciationPhrase: "Проанализировав все детали отчёта, эксперты подготовили исчерпывающее заключение.",
    proListeningScript: "Проверив полученные данные и сопоставив их с прошлогодними показателями, аналитики представили итоговый отчёт.",
  },
  {
    slug: "spelling-n-and-nn",
    order: 11,
    stage: "ADVANCED",
    isFreeTier: false,
    durationMinutes: 12,
    titleRu: "Правописание Н и НН в прилагательных и причастиях",
    titleEn: "Spelling Single Н vs. Double НН",
    summaryRu:
      "Алгоритм различения отглагольных прилагательных и страдательных причастий.",
    summaryEn:
      "A reliable algorithm for Н vs. НН in deverbal adjectives and passive participles.",
    topicsRu: ["Правописание", "Орфография", "Квиз"],
    topicsEn: ["Spelling", "Orthography", "Quiz"],
    theoryRu:
      "НН в суффиксах страдательных причастий пишется при наличии приставки (кроме НЕ-), зависимого слова, суффиксов -ова-/-ева- или совершенного вида. Отглагольное прилагательное без приставки и зависимых слов пишется с одним Н (жареный картофель, но жаренный на масле).",
    theoryEn:
      "Double НН is used with prefixes (except НЕ-), dependent words, -ова-/-ева- suffixes, or perfective aspect. Bare imperfective deverbal adjectives use single Н (жареный картофель vs. жаренный на масле).",
    examples: [
      { ru: "Кованый сундук — подкованная лошадь.", translit: "Kovanyy sunduk — podkovannaya loshad'.", en: "Forged chest — shod horse." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Напишите слово правильно: «решё_ая задача» (н / нн)",
        instructionEn: "Spell correctly: «решё_ая задача» (н / нн)",
        prompt: "решё_ая задача",
        expectedAnswer: "решённая",
        hintRu: "Глагол «решить» совершенного вида → пишем НН.",
        hintEn: "Derived from perfective «решить» → double НН.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Где нужно писать одно Н?",
        promptEn: "Which phrase requires a single Н?",
        options: [
          "связанный шарф",
          "вязаный свитер",
          "вязанный бабушкой свитер",
          "организованная встреча",
        ],
        correctIndex: 1,
        explanationRu: "«Вязаный свитер» — отглагольное прилагательное от НСВ без зависимых слов.",
        explanationEn: "«Вязаный свитер» has no prefix, dependent word, or perfective root.",
      },
    ],
    proSpeakingPrompt: "Придумайте мини-диалог, используя пары слов: «варёный / сваренный», «жареный / поджаренный».",
    proPronunciationPhrase: "В тщательно отредактированном документе не осталось ни одной непроверенной цифры.",
    proListeningScript: "На столе стояла свежеприготовленная паста, а рядом лежал аккуратно сложенный и подписанный договор.",
  },
  {
    slug: "business-and-publicistic-style",
    order: 12,
    stage: "ADVANCED",
    isFreeTier: false,
    durationMinutes: 14,
    titleRu: "Деловой и публицистический стиль: точность формулировок",
    titleEn: "Business & Publicistic Style Precision",
    summaryRu:
      "Устранение канцеляризмов и тавтологии, дипломатичные обороты в переписке.",
    summaryEn:
      "Eliminate bureaucratese and tautology while mastering diplomatic phrasing.",
    topicsRu: ["Стилистика", "Speaking", "Разбор ошибок"],
    topicsEn: ["Stylistics", "Speaking", "Error Analysis"],
    theoryRu:
      "Деловой стиль требует точности и нейтральности без избыточного нагромождения отглагольных существительных («в целях повышения уровня...»). Разбираем замену тяжёлых канцеляризмов на ясные и уважительные конструкции.",
    theoryEn:
      "Effective Russian business style favors clarity and respectful precision over stacked deverbal nouns. Learn to replace heavy bureaucratese with crisp, polite phrasing.",
    examples: [
      { ru: "Просим рассмотреть возможность переноса встречи.", translit: "Prosim rassmotret' vozmozhnost' perenosa vstrechi.", en: "We kindly ask you to consider rescheduling the meeting." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Напишите корректный предлог для деловой фразы: «___ с вашим запросом» (согласно / по причине)",
        instructionEn: "Complete the formal phrase: «___ с вашим запросом»",
        prompt: "В соответствии ___ вашим запросом",
        expectedAnswer: "с",
        hintRu: "Устойчивая конструкция: «в соответствии с» + творительный падеж.",
        hintEn: "Fixed phrase: «в соответствии с» + Instrumental.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какой вариант правильный после предлога «согласно»?",
        promptEn: "Which case follows «согласно» in standard Russian?",
        options: [
          "согласно договора",
          "согласно договору",
          "согласно договором",
          "согласно о договоре",
        ],
        correctIndex: 1,
        explanationRu: "Предлог «согласно» требует дательного падежа: согласно договору.",
        explanationEn: "«Согласно» governs the Dative case: согласно договору.",
      },
    ],
    proSpeakingPrompt: "Проведите 1-минутную деловую презентацию идеи на русском языке без слов-паразитов.",
    proPronunciationPhrase: "Согласно достигнутым договорённостям мы направляем обновлённое коммерческое предложение.",
    proListeningScript: "Уважаемые коллеги, в соответствии с утверждённым графиком мы переходим к обсуждению квартальных результатов.",
  },
  {
    slug: "advanced-punctuation-dash-colon",
    order: 13,
    stage: "EXPERT",
    isFreeTier: false,
    durationMinutes: 16,
    titleRu: "Тонкая пунктуация: тире, двоеточие и бессоюзные предложения",
    titleEn: "Expert Punctuation: Dash, Colon & Asyndetic Clauses",
    summaryRu:
      "Смысловое разграничение тире и двоеточия, вводные конструкции и омонимы.",
    summaryEn:
      "Semantic contrast between dash and colon plus parenthetical homonyms.",
    topicsRu: ["Пунктуация", "Экспертный уровень", "Разбор ошибок"],
    topicsEn: ["Punctuation", "Expert Level", "Error Analysis"],
    theoryRu:
      "В бессоюзном сложном предложении двоеточие ставится при пояснении, причине или дополнении (можно вставить «потому что», «а именно», «и увидел, что»). Тире ставится при противопоставлении, быстрой смене событий, условии или следствии.",
    theoryEn:
      "In asyndetic complex sentences, a colon signals cause, explanation, or elaboration (потому что / а именно), whereas a dash signals contrast, rapid sequence, condition, or consequence.",
    examples: [
      { ru: "Я опоздал: поезд задержался из-за метели.", translit: "Ya opozdal: poyezd zaderzhalsya iz-za meteli.", en: "I was late: the train was delayed by the snowstorm." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Какой знак нужен между частями? Введите слово «двоеточие» или «тире»: «Сыр выпал ___ с ним была плутовка такова»",
        instructionEn: "Write «двоеточие» or «тире» for: «Сыр выпал ___ с ним была плутовка такова»",
        prompt: "Быстрая смена событий (двоеточие / тире)",
        expectedAnswer: "тире",
        hintRu: "Мгновенная смена действий или следствие оформляется тире.",
        hintEn: "Rapid sequence or consequence uses a dash (тире).",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Когда слово «однако» НЕ выделяется запятыми с двух сторон?",
        promptEn: "When is «однако» NOT enclosed in commas on both sides?",
        options: [
          "Когда стоит в середине предложения",
          "Когда выступает в роли союза «но» в начале части сложного предложения",
          "Никогда, оно всегда вводное",
          "Перед ним всегда ставится двоеточие",
        ],
        correctIndex: 1,
        explanationRu: "Если «однако» можно заменить на союз «но», это союз, и запятая ставится только перед ним.",
        explanationEn: "When «однако» functions as the conjunction 'but', it is not parenthetical.",
      },
    ],
    proSpeakingPrompt: "Прочитайте выразительный текст, соблюдая паузы на месте тире и двоеточия.",
    proPronunciationPhrase: "Прозвучал третий звонок — занавес медленно поднялся: спектакль начался.",
    proListeningScript: "Мы понимали одно: отступать нельзя — впереди оставался самый сложный участок перевала.",
  },
  {
    slug: "idioms-and-phraseology",
    order: 14,
    stage: "EXPERT",
    isFreeTier: false,
    durationMinutes: 15,
    titleRu: "Фразеологизмы, крылатые выражения и культурные аллюзии",
    titleEn: "Idioms, Phraseology & Cultural Allusions",
    summaryRu:
      "Точное употребление устойчивых оборотов без разрушения их лексической сочетаемости.",
    summaryEn:
      "Use Russian idioms accurately without breaking fixed collocations.",
    topicsRu: ["Лексика", "Идиомы", "Speaking"],
    topicsEn: ["Vocabulary", "Idioms", "Speaking"],
    theoryRu:
      "На уровне C2 важно не просто понимать идиомы («бить баклуши», «сесть в калошу», «заварить кашу»), но и точно сохранять их структуру, падеж и стилистическую окраску, избегая контаминации двух похожих выражений.",
    theoryEn:
      "At C2, mastery means preserving exact collocations and register in idioms while avoiding blending two expressions (e.g., «играть значение» instead of «иметь значение / играть роль»).",
    examples: [
      { ru: "Это решение имеет принципиальное значение и играет ключевую роль.", translit: "Eto resheniye imeyet printsipial'noye znacheniye i igrayet klyuchevuyu rol'.", en: "This decision is of fundamental importance and plays a key role." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Завершите устойчивое сочетание: «иметь большое ___» или «играть важную ___» — вставьте пропущенное слово для «играть важную ___»",
        instructionEn: "Complete the collocation: «играть важную ___»",
        prompt: "играть важную ___",
        expectedAnswer: "роль",
        hintRu: "Играют роль, а имеют значение.",
        hintEn: "You play a role (роль), and have significance (значение).",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Что означает фразеологизм «держать руку на пульсе»?",
        promptEn: "What does «держать руку на пульсе» mean?",
        options: [
          "Переживать перед экзаменом",
          "Быть в курсе всех текущих событий и изменений",
          "Сомневаться в решении",
          "Работать без отдыха",
        ],
        correctIndex: 1,
        explanationRu: "Выражение означает постоянно отслеживать ситуацию и оставаться в курсе.",
        explanationEn: "It means keeping one's finger on the pulse / staying informed.",
      },
    ],
    proSpeakingPrompt: "Вплетите 2 русских фразеологизма в короткий монолог о современных технологиях.",
    proPronunciationPhrase: "Чтобы не попасть впросак, команда с самого начала держала руку на пульсе.",
    proListeningScript: "Хотя проект казался безнадёжным, специалисты не опустили руки и довели дело до блестящего финала.",
  },
  {
    slug: "intonation-constructions-ik",
    order: 15,
    stage: "EXPERT",
    isFreeTier: false,
    durationMinutes: 15,
    titleRu: "Интонационные конструкции (ИК-1 – ИК-7) и логическое ударение",
    titleEn: "Intonation Contours (ИК-1–ИК-7) & Logical Stress",
    summaryRu:
      "Как интонация в русском языке меняет смысл предложения без изменения порядка слов.",
    summaryEn:
      "How pitch contours reshape Russian meaning without altering word order.",
    topicsRu: ["Произношение", "Фонетика", "Listening"],
    topicsEn: ["Pronunciation", "Phonetics", "Listening"],
    theoryRu:
      "В русском языке порядок слов гибкий, поэтому ключевую смысловую нагрузку несёт интонационный центр: ИК-1 (спокойная констатация), ИК-2 (вопрос с вопросительным словом), ИК-3 (вопрос без вопросительного слова с резким подъёмом тона на реме), ИК-5 (восторженная оценка).",
    theoryEn:
      "Because Russian word order is flexible, pitch contour carries meaning: ИК-1 (neutral statement), ИК-2 (wh-question), ИК-3 (yes/no question with sharp rise on the focused word), and ИК-5 (expressive praise).",
    examples: [
      { ru: "Вы приедете завтра? (ИК-3 на слове «завтра»)", translit: "Vy priyedete zavtra?", en: "Are you arriving TOMORROW?" },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Какая интонационная конструкция используется для общего вопроса без вопросительного слова (например, «ИК-3»)?",
        instructionEn: "Which intonation contour marks a yes/no question without a question word (write e.g. «ИК-3»)?",
        prompt: "Общий вопрос без вопросительного слова",
        expectedAnswer: "ИК-3",
        hintRu: "Резкий подъём тона на ключевом слове — это ИК-3.",
        hintEn: "The sharp pitch rise on the focus word is ИК-3.",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Где будет интонационный центр ИК-3 в вопросе «Вы уже читали эту книгу?» если мы сомневаемся именно в факте чтения?",
        promptEn: "Where does ИК-3 peak in «Вы уже читали эту книгу?» when questioning whether they read it?",
        options: ["Вы", "уже", "читали", "книгу"],
        correctIndex: 2,
        explanationRu: "Интонационный центр падает на сказуемое «читали».",
        explanationEn: "The pitch peak lands on the verb «читали».",
      },
    ],
    proSpeakingPrompt: "Произнесите фразу «Анна купила билеты на поезд» с разным логическим ударением: сначала как утверждение, затем как вопрос о слове «Анна».",
    proPronunciationPhrase: "Неужели вы действительно успели прочитать весь этот том за одну ночь?",
    proListeningScript: "Вы завтра уезжаете в Петербург? Нет, я уезжаю только послезавтра утренним поездом.",
  },
  {
    slug: "rhetoric-and-literary-analysis",
    order: 16,
    stage: "EXPERT",
    isFreeTier: false,
    durationMinutes: 16,
    titleRu: "Риторика, аргументация и литературная выразительность",
    titleEn: "Rhetoric, Argumentation & Literary Style",
    summaryRu:
      "Построение убедительных эссе, инверсия, градация и защита позиции.",
    summaryEn:
      "Craft persuasive essays with inversion, gradation, and nuanced rebuttal.",
    topicsRu: ["Риторика", "Speaking", "Разбор ошибок"],
    topicsEn: ["Rhetoric", "Speaking", "Error Analysis"],
    theoryRu:
      "Уровень C2 открывает доступ к риторическим приёмам: смысловой инверсии, парцелляции, синтаксическому параллелизму и точной лексической сочетаемости при аргументации сложных тезисов.",
    theoryEn:
      "C2 fluency harnesses rhetorical devices: semantic inversion, parcellation, syntactic parallelism, and razor-sharp collocations for nuanced persuasion.",
    examples: [
      { ru: "Не столько скорость, сколько глубина осмысления определяет качество речи.", translit: "Ne stol'ko skorost', skol'ko glubina osmysleniya opredelyayet kachestvo rechi.", en: "It is not so much speed as depth of reflection that defines the quality of speech." },
    ],
    tasks: [
      {
        id: "t1",
        instructionRu: "Завершите парный союз: «не столько скорость, ___ глубина»",
        instructionEn: "Complete the correlative conjunction: «не столько скорость, ___ глубина»",
        prompt: "не столько ..., ___ ...",
        expectedAnswer: "сколько",
        hintRu: "Парный союз: «не столько ..., сколько ...».",
        hintEn: "The correlative pair is «не столько ..., сколько ...».",
      },
    ],
    quiz: [
      {
        id: "q1",
        promptRu: "Какой приём используется в фразе «Пришёл. Увидел. Победил.»?",
        promptEn: "Which rhetorical device is used in «Пришёл. Увидел. Победил.»?",
        options: ["Тавтология", "Парцелляция", "Оксюморон", "Плеоназм"],
        correctIndex: 1,
        explanationRu: "Разделение единого высказывания на короткие самостоятельные предложения — парцелляция.",
        explanationEn: "Splitting one clause into punchy standalone sentences is parcellation.",
      },
    ],
    proSpeakingPrompt: "Сформулируйте аргументированную позицию «за» и «против» роли искусственного интеллекта в изучении литературы.",
    proPronunciationPhrase: "Искусство слова требует не только безупречной грамотности, но и тонкого чувства ритма.",
    proListeningScript: "По-настоящему выразительная речь рождается там, где точность мысли встречается с естественной мелодикой языка.",
  },
];

export const FREE_LESSON_SLUGS = LESSONS.filter((l) => l.isFreeTier).map(
  (l) => l.slug
);

export function getLessonBySlug(slug: string): LessonItem | undefined {
  return LESSONS.find((l) => l.slug === slug);
}

export function isLessonUnlocked(plan: PlanTier, lesson: LessonItem): boolean {
  if (plan === "PRO") return true;
  return lesson.isFreeTier;
}
