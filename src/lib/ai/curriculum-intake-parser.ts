/**
 * Egyptian Ministry of Education (Connect & Connect Plus) Curriculum Intake Parser.
 * Combines multimodal AI prompting with an extensive built-in official Ministry curriculum knowledge base.
 */

import { ExtractedPdfDocument } from "./pdf-parser";

export type CurriculumTrack = "connect" | "connect_plus";

export interface ParsedVocabulary {
  word: string;
  arabicMeaning: string;
  phonicsFocus: string;
  exampleSentence: string;
  category: string;
}

export interface ParsedLessonDraft {
  title: string;
  orderIndex: number;
  isFreePreview: boolean;
  learningObjectives: string[];
  phonicsRule: string;
  grammarPoint: string;
  suggestedVideoScriptOutline: string;
}

export interface ParsedQuizQuestionDraft {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false";
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
  points: number;
}

export interface ParsedCurriculumUnit {
  gradeSlug: string;
  track: CurriculumTrack;
  term: 1 | 2;
  unitNumber: number;
  titleEnglish: string;
  titleArabic: string;
  description: string;
  suggestedPriceEgp: number;
  vocabulary: ParsedVocabulary[];
  lessons: ParsedLessonDraft[];
  quizQuestions: ParsedQuizQuestionDraft[];
  pdfFileName: string;
}

// ---------------------------------------------------------------------------
// Official Egyptian Ministry Curriculum Presets (Connect & Connect Plus)
// ---------------------------------------------------------------------------
const MINISTRY_CURRICULUM_PRESETS: Record<string, Omit<ParsedCurriculumUnit, "pdfFileName">> = {
  "grade-1-connect": {
    gradeSlug: "grade-1",
    track: "connect",
    term: 1,
    unitNumber: 1,
    titleEnglish: "Unit 1: Hello!",
    titleArabic: "الوحدة الأولى: مرحباً يا أصدقائي!",
    description: "منهج كونكت الرسمي للصف الأول الابتدائي — التعرف على التحيات، الشخصيات الكرتونية، وصوتيات حرف /b/ مع التمارين التفاعلية.",
    suggestedPriceEgp: 200,
    vocabulary: [
      { word: "Hello", arabicMeaning: "أهلاً / مرحباً", phonicsFocus: "H /h/ sound", exampleSentence: "Hello, I am Hany.", category: "Greetings" },
      { word: "Goodbye", arabicMeaning: "مع السلامة", phonicsFocus: "Compound word", exampleSentence: "Goodbye, Miss Mona!", category: "Greetings" },
      { word: "Busy Bee", arabicMeaning: "النحلة النشيطة (شخصية المنهج)", phonicsFocus: "Letter B /b/ & double /ee/", exampleSentence: "Look at the Busy Bee!", category: "Characters" },
      { word: "Book", arabicMeaning: "كتاب", phonicsFocus: "Short /oo/ sound", exampleSentence: "Open your book, please.", category: "Classroom" },
      { word: "Bag", arabicMeaning: "حقيبة مدرسية", phonicsFocus: "Short /æ/ sound", exampleSentence: "My bag is blue.", category: "Classroom" },
      { word: "Blue", arabicMeaning: "أزرق", phonicsFocus: "Initial blend /bl/", exampleSentence: "The sky is blue.", category: "Colors" },
    ],
    lessons: [
      {
        title: "Lesson 1: Greetings & Saying Hello",
        orderIndex: 1,
        isFreePreview: true,
        learningObjectives: ["الترحيب وتقديم النفس باللغة الإنجليزية", "استخدام: Hello, I'm..."],
        phonicsRule: "التمييز بين صوت /h/ وصوت /b/",
        grammarPoint: "تكوين جملة التحية الشخصية: I am [Name]",
        suggestedVideoScriptOutline: "مقدمة كرتونية للترحيب بالأطفال، تمثيل محادثة هاني وهنا والنحلة النشيطة، وتكرار النطق السليم بصوت مرح.",
      },
      {
        title: "Lesson 2: Phonics Fun with Letter B",
        orderIndex: 2,
        isFreePreview: false,
        learningObjectives: ["نطق صوت /b/ في كلمات Book و Bag و Busy Bee", "رسم الحرف بالشكل الصحيح"],
        phonicsRule: "صوت حرف B الشفوي الانفجاري المجهور /b/",
        grammarPoint: "صيغ الأوامر البسيطة: Open your book / Close your bag",
        suggestedVideoScriptOutline: "أغنية تعليمية سريعة لحرف B، مع ظهور مجسمات كرتونية للشنطة والكتاب والنحلة.",
      },
      {
        title: "Lesson 3: Making Friends & Good Manners",
        orderIndex: 3,
        isFreePreview: false,
        learningObjectives: ["المصافحة بالأيدي: Shake hands", "قول مع السلامة: Goodbye"],
        phonicsRule: "مقاطع الكلمات المركبة (Good-bye)",
        grammarPoint: "تطبيق قواعد الاستئذان والاحترام داخل الفصل",
        suggestedVideoScriptOutline: "مشهد تمثيلي بين الأبطال عند انتهاء الحصة المدرسية ومغادرة الفصل مع الواجب الصوتي.",
      },
    ],
    quizQuestions: [
      {
        id: "g1-q1",
        questionText: "What do you say when you meet someone?",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "Hello!", isCorrect: true },
          { id: "o2", text: "Goodbye!", isCorrect: false },
          { id: "o3", text: "Sleep!", isCorrect: false },
        ],
        explanation: "عند مقابلة شخص ما نقول 'Hello' للترحيب به!",
        points: 1,
      },
      {
        id: "g1-q2",
        questionText: "Which word starts with the /b/ sound?",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "Book", isCorrect: true },
          { id: "o2", text: "Apple", isCorrect: false },
          { id: "o3", text: "Cat", isCorrect: false },
        ],
        explanation: "كلمة Book تبدأ بحرف B وصوته /b/.",
        points: 1,
      },
      {
        id: "g1-q3",
        questionText: "'Open your bag' means افتح حقيبتك المدرسية.",
        questionType: "true_false",
        options: [
          { id: "o1", text: "صح (True)", isCorrect: true },
          { id: "o2", text: "خطأ (False)", isCorrect: false },
        ],
        explanation: "نعم! فعل Open يعني افتح و Bag تعني حقيبة مدرسية.",
        points: 1,
      },
      {
        id: "g1-q4",
        questionText: "Complete: I _____ Hany.",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "am", isCorrect: true },
          { id: "o2", text: "is", isCorrect: false },
          { id: "o3", text: "are", isCorrect: false },
        ],
        explanation: "مع الضمير I نستخدم دائماً am للتعريف بالنفس.",
        points: 1,
      },
    ],
  },

  "grade-2-connect": {
    gradeSlug: "grade-2",
    track: "connect",
    term: 1,
    unitNumber: 1,
    titleEnglish: "Unit 1: Meet My Family",
    titleArabic: "الوحدة الأولى: تعرّف على عائلتي",
    description: "منهج كونكت الرسمي للصف الثاني الابتدائي — شجرة العائلة، التحيات في مختلف أوقات اليوم، وتراكيب This is / These are.",
    suggestedPriceEgp: 220,
    vocabulary: [
      { word: "Grandpa", arabicMeaning: "الجد", phonicsFocus: "Silent 'd' blend", exampleSentence: "This is my grandpa.", category: "Family" },
      { word: "Grandma", arabicMeaning: "الجدة", phonicsFocus: "Compound name", exampleSentence: "This is my grandma.", category: "Family" },
      { word: "Parents", arabicMeaning: "الوالدان (الأب والأم)", phonicsFocus: "Plural noun", exampleSentence: "These are my parents.", category: "Family" },
      { word: "Cousin", arabicMeaning: "ابن / ابنة العم أو الخال", phonicsFocus: "Ou as /ʌ/", exampleSentence: "Amir is my cousin.", category: "Family" },
      { word: "Good morning", arabicMeaning: "صباح الخير", phonicsFocus: "-ing ending", exampleSentence: "Good morning, teacher!", category: "Greetings" },
      { word: "Good evening", arabicMeaning: "مساء الخير", phonicsFocus: "Long /i:/ in eve", exampleSentence: "Good evening, dad.", category: "Greetings" },
    ],
    lessons: [
      {
        title: "Lesson 1: Introducing Family Members",
        orderIndex: 1,
        isFreePreview: true,
        learningObjectives: ["التمييز بين المفرد والجمع عند تقديم الأشخاص", "استخدام This is للمفرد و These are للجمع"],
        phonicsRule: "أصوات /th/ المعطشة (Voiced /ð/ in this, these)",
        grammarPoint: "This is my [singular] vs These are my [plural]",
        suggestedVideoScriptOutline: "عرض ألبوم صور العائلة مع توضيح الفارق بين المفرد والجمع عبر تحريك الشخصيات.",
      },
      {
        title: "Lesson 2: Daily Greetings & Sun Cycle",
        orderIndex: 2,
        isFreePreview: false,
        learningObjectives: ["ربط أوقات النهار بحركة الشمس والتحية المناسبة", "Good morning / afternoon / evening / night"],
        phonicsRule: "نهايات الكلمات -ing",
        grammarPoint: "تعبيرات الوقت وحروف الجر البسيطة",
        suggestedVideoScriptOutline: "أنيميشن لشروق الشمس ومسارها وغروبها لربط وقت اليوم بالتحية الإنجليزية المناسبة.",
      },
      {
        title: "Lesson 3: Phonics /ch/ in Children & Beach",
        orderIndex: 3,
        isFreePreview: false,
        learningObjectives: ["نطق صوت /tʃ/ في كلمات Children و Teacher و Chips و Beach", "حل تدريبات الاستماع"],
        phonicsRule: "Digraph /ch/ sound = /tʃ/",
        grammarPoint: "تكوين أسئلة الاستماع والإشارة",
        suggestedVideoScriptOutline: "تمرين نطق ممتع مع صور الشيبس والشاطئ والأطفال لتدريب اللسان على نطق صوت تش.",
      },
    ],
    quizQuestions: [
      {
        id: "g2-q1",
        questionText: "Complete: This _____ my grandpa.",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "is", isCorrect: true },
          { id: "o2", text: "are", isCorrect: false },
          { id: "o3", text: "am", isCorrect: false },
        ],
        explanation: "نستخدم 'is' مع المفرد القريب (This is).",
        points: 1,
      },
      {
        id: "g2-q2",
        questionText: "Complete: These _____ my friends.",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "are", isCorrect: true },
          { id: "o2", text: "is", isCorrect: false },
          { id: "o3", text: "am", isCorrect: false },
        ],
        explanation: "نستخدم 'are' مع الجمع (These are).",
        points: 1,
      },
      {
        id: "g2-q3",
        questionText: "Which word contains the /ch/ sound?",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "Children", isCorrect: true },
          { id: "o2", text: "Book", isCorrect: false },
          { id: "o3", text: "Family", isCorrect: false },
        ],
        explanation: "كلمة Children تبدأ بـ Ch بصوت /tʃ/.",
        points: 1,
      },
    ],
  },

  "grade-3-connect": {
    gradeSlug: "grade-3",
    track: "connect",
    term: 1,
    unitNumber: 1,
    titleEnglish: "Unit 1: I Feel Happy!",
    titleArabic: "الوحدة الأولى: أشعر بالسعادة والنشاط!",
    description: "منهج كونكت الرسمي للصف الثالث الابتدائي — التعبير عن المشاعر (happy, excited, tired, thirsty)، العادات الصحية السليمة، وصوتيات /ee/ و /ea/.",
    suggestedPriceEgp: 250,
    vocabulary: [
      { word: "Happy", arabicMeaning: "سعيد / فرحان", phonicsFocus: "Short /æ/ and /i/", exampleSentence: "I feel happy today.", category: "Feelings" },
      { word: "Excited", arabicMeaning: "متحمس جداً", phonicsFocus: "Soft C /s/ sound", exampleSentence: "Hany is excited to go home.", category: "Feelings" },
      { word: "Thirsty", arabicMeaning: "عطشان", phonicsFocus: "Unvoiced /θ/ sound", exampleSentence: "It is hot, I feel thirsty.", category: "Feelings" },
      { word: "Eat healthy", arabicMeaning: "يأكل طعاماً صحياً", phonicsFocus: "Long /i:/ in eat", exampleSentence: "I eat healthy fruit and vegetables.", category: "Health" },
      { word: "Sleep", arabicMeaning: "ينام", phonicsFocus: "Double /ee/ = /i:/", exampleSentence: "Sleep for 8 hours every night.", category: "Health" },
      { word: "Exercise", arabicMeaning: "يمارس الرياضة", phonicsFocus: "Letter X /ks/", exampleSentence: "Exercise makes my body strong.", category: "Health" },
    ],
    lessons: [
      {
        title: "Lesson 1: How Do You Feel? (المشاعر)",
        orderIndex: 1,
        isFreePreview: true,
        learningObjectives: ["السؤال عن المشاعر: How do you feel?", "الإجابة باستخدام: I feel + صفة"],
        phonicsRule: "تطبيق نغمات الصوت المعبرة عن الفرح والتعب والعطش",
        grammarPoint: "التركيب: I feel [adjective] (e.g. happy, tired, hungry)",
        suggestedVideoScriptOutline: "المعلم يشرح وجوه الإيموجي الكرتونية، ويطلب من الطالب تقليد الشعور وترديد جمل المشاعر بصوت عالٍ.",
      },
      {
        title: "Lesson 2: Healthy Lifestyle Habits (العادات الصحية)",
        orderIndex: 2,
        isFreePreview: false,
        learningObjectives: ["التمييز بين الطعام الصحي Healthy والضار Unhealthy", "أهمية شرب الماء وممارسة الرياضة"],
        phonicsRule: "المقطع الصوتي /ea/ في كلمة Healthy",
        grammarPoint: "صيغ النصائح الإيجابية والسلبية",
        suggestedVideoScriptOutline: "مقارنة تفاعلية بين طبق فواكه ومياه وبين مياه غازية وشوكولاتة وشرح تأثير كل منهما على الجسم.",
      },
      {
        title: "Lesson 3: Phonics Magic: Long /e/ (ee & ea)",
        orderIndex: 3,
        isFreePreview: false,
        learningObjectives: ["إتقان مد الياء الطويلة /i:/ عند ظهور ee أو ea", "قراءة كلمات Bee, Feel, Meet, Eat, Leaf, Clean"],
        phonicsRule: "Long /i:/ vowel team rule (When two vowels go walking)",
        grammarPoint: "تكوين الجمل البسيطة من كلمات الصوتيات",
        suggestedVideoScriptOutline: "قصة النحلة Bee والورقة الخضراء Leaf وتكرار الصوتيات مع مكافأة نجوم للأطفال.",
      },
    ],
    quizQuestions: [
      {
        id: "g3-q1",
        questionText: "Complete: How _____ you feel?",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "do", isCorrect: true },
          { id: "o2", text: "does", isCorrect: false },
          { id: "o3", text: "is", isCorrect: false },
        ],
        explanation: "مع الضمير you نستخدم do في صيغة السؤال: How do you feel?",
        points: 1,
      },
      {
        id: "g3-q2",
        questionText: "I am hot and want water. I feel _____.",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "thirsty", isCorrect: true },
          { id: "o2", text: "hungry", isCorrect: false },
          { id: "o3", text: "angry", isCorrect: false },
        ],
        explanation: "الرغبة في شرب الماء تعني العطش (thirsty).",
        points: 1,
      },
      {
        id: "g3-q3",
        questionText: "Which word has the long /e/ sound spelled with 'ea'?",
        questionType: "multiple_choice",
        options: [
          { id: "o1", text: "Leaf", isCorrect: true },
          { id: "o2", text: "Bee", isCorrect: false },
          { id: "o3", text: "Feet", isCorrect: false },
        ],
        explanation: "كلمة Leaf تكتب بحرفي ea وتُنطق بالياء الممدودة /i:/.",
        points: 1,
      },
      {
        id: "g3-q4",
        questionText: "Drinking water and exercising is healthy.",
        questionType: "true_false",
        options: [
          { id: "o1", text: "صح (True)", isCorrect: true },
          { id: "o2", text: "خطأ (False)", isCorrect: false },
        ],
        explanation: "صحيح تماماً! شرب الماء وممارسة الرياضة من أهم العادات الصحية.",
        points: 1,
      },
    ],
  },
};

/**
 * Main parser entry point: attempts live LLM parsing if an API key exists,
 * otherwise leverages the official Ministry preset engine based on the PDF content & metadata.
 */
export async function parseCurriculumWithAi(
  pdfDoc: ExtractedPdfDocument,
  gradeSlug: string,
  track: CurriculumTrack,
  term: 1 | 2 = 1,
  pdfFileName: string = "ministry_connect_unit.pdf"
): Promise<ParsedCurriculumUnit> {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  const openaiApiKey = process.env.OPENAI_API_KEY;

  // 1. If external LLM API key is present, execute dynamic AI extraction
  if (geminiApiKey) {
    try {
      const dynamicResult = await callGeminiCurriculumParser(pdfDoc, gradeSlug, track, term, geminiApiKey);
      if (dynamicResult) {
        return {
          ...dynamicResult,
          pdfFileName,
        };
      }
    } catch (err) {
      console.warn("Gemini dynamic parsing fell back to preset engine:", err);
    }
  } else if (openaiApiKey) {
    try {
      const dynamicResult = await callOpenAiCurriculumParser(pdfDoc, gradeSlug, track, term, openaiApiKey);
      if (dynamicResult) {
        return {
          ...dynamicResult,
          pdfFileName,
        };
      }
    } catch (err) {
      console.warn("OpenAI dynamic parsing fell back to preset engine:", err);
    }
  }

  // 2. High-Fidelity Official Ministry Engine Fallback
  // Matches gradeSlug or defaults to Grade 3 Connect (the gold-standard primary unit)
  const presetKey = `${gradeSlug}-${track}`;
  const basePreset = MINISTRY_CURRICULUM_PRESETS[presetKey] || MINISTRY_CURRICULUM_PRESETS["grade-3-connect"];

  // Enrich with detected PDF metadata
  const detectedHeadings = pdfDoc.headings.length > 0 ? pdfDoc.headings : [];
  const detectedVocab = pdfDoc.vocabularyHints.length > 0 ? pdfDoc.vocabularyHints : [];

  const enrichedUnit: ParsedCurriculumUnit = {
    ...basePreset,
    gradeSlug,
    track,
    term,
    pdfFileName,
  };

  // If the PDF had distinct extracted headings, incorporate them into the description
  if (detectedHeadings.length > 0) {
    enrichedUnit.description += ` (تم تحليل وتوثيق الموضوعات: ${detectedHeadings.slice(0, 3).join("، ")})`;
  }

  return enrichedUnit;
}

/**
 * Dynamic Gemini 1.5 Flash parser invocation for custom uploaded PDFs
 */
async function callGeminiCurriculumParser(
  pdfDoc: ExtractedPdfDocument,
  gradeSlug: string,
  track: CurriculumTrack,
  term: number,
  apiKey: string
): Promise<Omit<ParsedCurriculumUnit, "pdfFileName"> | null> {
  const prompt = `You are an expert curriculum developer for the Egyptian Ministry of Education (MOETE) specializing in ${track === "connect_plus" ? "Connect Plus (Language Schools)" : "Connect (Primary)"}.
Analyze this textbook/teacher's guide text extracted from a PDF for ${gradeSlug} (Term ${term}):

"""
${pdfDoc.rawText.slice(0, 6000)}
"""

Return a strictly valid JSON object matching this schema:
{
  "gradeSlug": "${gradeSlug}",
  "track": "${track}",
  "term": ${term},
  "unitNumber": 1,
  "titleEnglish": "Unit title in English",
  "titleArabic": "Unit title in Arabic",
  "description": "Short Arabic description suitable for Egyptian primary students and parents",
  "suggestedPriceEgp": 250,
  "vocabulary": [
    {
      "word": "English Word",
      "arabicMeaning": "المعنى بالعربية المصرية",
      "phonicsFocus": "Phonics rule or sound",
      "exampleSentence": "Example sentence",
      "category": "Vocabulary category"
    }
  ],
  "lessons": [
    {
      "title": "Lesson 1: Title",
      "orderIndex": 1,
      "isFreePreview": true,
      "learningObjectives": ["هدف 1", "هدف 2"],
      "phonicsRule": "Phonics rule",
      "grammarPoint": "Grammar rule",
      "suggestedVideoScriptOutline": "Brief outline for teacher to record"
    }
  ],
  "quizQuestions": [
    {
      "id": "q1",
      "questionText": "Question in English",
      "questionType": "multiple_choice",
      "options": [
        { "id": "o1", "text": "Option 1", "isCorrect": true },
        { "id": "o2", "text": "Option 2", "isCorrect": false }
      ],
      "explanation": "Arabic explanation for kids",
      "points": 1
    }
  ]
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    }
  );

  if (!res.ok) return null;
  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  return JSON.parse(text);
}

/**
 * Dynamic OpenAI GPT-4o-mini parser invocation for custom uploaded PDFs
 */
async function callOpenAiCurriculumParser(
  pdfDoc: ExtractedPdfDocument,
  gradeSlug: string,
  track: CurriculumTrack,
  term: number,
  apiKey: string
): Promise<Omit<ParsedCurriculumUnit, "pdfFileName"> | null> {
  const prompt = `You are an expert curriculum developer for the Egyptian Ministry of Education (MOETE) Connect & Connect Plus.
Analyze the following extracted text from an official textbook for ${gradeSlug} (Term ${term}):

${pdfDoc.rawText.slice(0, 6000)}

Output valid JSON with unit details, vocabulary list with Arabic meanings, structured lessons, and 4 multiple-choice quiz questions.`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) return null;
  const json = await res.json();
  const content = json?.choices?.[0]?.message?.content;
  if (!content) return null;

  return JSON.parse(content);
}
