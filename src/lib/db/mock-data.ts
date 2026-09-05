export interface MockGrade {
  id: string;
  gradeNumber: number;
  titleArabic: string;
  titleEnglish: string;
  slug: string;
  badgeColor: string;
  unitsCount: number;
  studentsCount: number;
}

export interface MockUnit {
  id: string;
  gradeId: string;
  gradeSlug: string;
  gradeTitle: string;
  title: string;
  slug: string;
  description: string;
  priceEgp: number;
  thumbnailUrl: string;
  lessonsCount: number;
  quizzesCount: number;
  isPublished: boolean;
}

export interface MockLesson {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  videoUrl: string; // Sample HLS or MP4 stream
  videoDuration: string;
  pdfAttachmentUrl?: string;
  pdfTitle?: string;
  isFreePreview: boolean;
  orderIndex: number;
  prerequisiteType?: 'none' | 'previous_quiz_passed' | 'previous_homework_submitted';
  prerequisiteLessonId?: string;
  isPrerequisiteBlocked?: boolean;
  prerequisiteMessage?: string;
}

export interface MockQuestion {
  id: string;
  text: string;
  audioUrl?: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

export interface MockQuiz {
  id: string;
  unitId: string;
  lessonId?: string;
  title: string;
  timeLimitMinutes: number;
  passPercentage: number;
  questions: MockQuestion[];
}

export interface MockAdventureQuiz {
  id: string;
  slug: string;
  title: string;
  theme: 'zoo' | 'spiderman' | 'fruits' | 'numbers';
  subtitle: string;
  gradeBadge: string;
  questionsCount: number;
  durationMinutes: number;
  xpReward: number;
  accentBg: string;
  accentBorder: string;
  buttonColor: string;
  tag: string;
}

export interface MockGradeChampion {
  rank: 1 | 2 | 3;
  name: string;
  initials: string;
  gradeBadge: string;
  schoolName: string;
  city: string;
  xpPoints: number;
}

export interface MockStudent {
  id: string;
  name: string;
  studentPhone: string;
  parentPhone: string;
  parentName: string;
  governorate: string;
  gradeLevel: number;
  gradeTitle: string;
  schoolName: string;
  xpPoints: number;
  enrolledUnits: string[];
  lastActive: string;
  deviceLocked: boolean;
  isBanned?: boolean;
}

export interface MockOrder {
  id: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  unitTitle: string;
  unitId: string;
  gradeTitle: string;
  amountEgp: number;
  paymentMethod: 'paymob_wallet' | 'paymob_card' | 'instapay_manual' | 'wallet_manual';
  status: 'pending' | 'completed' | 'failed' | 'manual_review';
  referenceNumber: string;
  receiptImageUrl?: string;
  receiptHash?: string;
  ocrData?: {
    extractedReference?: string;
    extractedAmount?: number;
    extractedDate?: string;
    matchedSender?: string;
    confidenceScore?: number;
    isSuspectedDuplicate?: boolean;
    duplicateOrderId?: string;
  };
  createdAt: string;
}

export interface MockHomeworkAssignment {
  id: string;
  unitId: string;
  unitTitle: string;
  lessonTitle?: string;
  gradeSlug: string;
  title: string;
  instructions: string;
  pageNumber: string;
  maxScore: number;
  dueDate: string;
}

export interface MockHomeworkSubmission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentId: string;
  studentName: string;
  studentPhone: string;
  parentPhone: string;
  gradeTitle: string;
  studentImages: Array<{ pageNumber: number; imageUrl: string }>;
  audioVoiceNoteUrl?: string;
  status: 'submitted' | 'in_review' | 'graded' | 'rejected';
  score?: number;
  maxScore: number;
  feedbackNotes?: string;
  annotatedImages?: Array<{ pageIndex: number; dataUrl: string }>;
  submittedAt: string;
  gradedAt?: string;
}

export interface MockLiveSession {
  id: string;
  gradeId: string;
  gradeTitle: string;
  gradeSlug: string;
  title: string;
  description: string;
  scheduledAt: string; // ISO string
  durationMinutes: number;
  provider: 'zoom' | 'livekit' | 'youtube_live';
  meetingUrl: string;
  meetingPassword?: string;
  isLiveNow: boolean;
  recordingUrl?: string;
  instructorName: string;
}


export const INITIAL_GRADES: MockGrade[] = [
  { id: 'g-1', gradeNumber: 1, titleArabic: 'الصف الأول الابتدائي', titleEnglish: 'Grade 1', slug: 'grade-1', badgeColor: '#3b82f6', unitsCount: 4, studentsCount: 420 },
  { id: 'g-2', gradeNumber: 2, titleArabic: 'الصف الثاني الابتدائي', titleEnglish: 'Grade 2', slug: 'grade-2', badgeColor: '#10b981', unitsCount: 4, studentsCount: 380 },
  { id: 'g-3', gradeNumber: 3, titleArabic: 'الصف الثالث الابتدائي', titleEnglish: 'Grade 3', slug: 'grade-3', badgeColor: '#f59e0b', unitsCount: 4, studentsCount: 510 },
  { id: 'g-4', gradeNumber: 4, titleArabic: 'الصف الرابع الابتدائي', titleEnglish: 'Grade 4', slug: 'grade-4', badgeColor: '#8b5cf6', unitsCount: 5, studentsCount: 640 },
  { id: 'g-5', gradeNumber: 5, titleArabic: 'الصف الخامس الابتدائي', titleEnglish: 'Grade 5', slug: 'grade-5', badgeColor: '#ec4899', unitsCount: 5, studentsCount: 590 },
  { id: 'g-6', gradeNumber: 6, titleArabic: 'الصف السادس الابتدائي', titleEnglish: 'Grade 6', slug: 'grade-6', badgeColor: '#06b6d4', unitsCount: 6, studentsCount: 710 },
];

export const INITIAL_UNITS: MockUnit[] = [
  {
    id: 'u-101',
    gradeId: 'g-1',
    gradeSlug: 'grade-1',
    gradeTitle: 'Grade 1',
    title: 'Unit 1: Hello & My Class',
    slug: 'grade-1-unit-1',
    description: 'تعلم الحروف والأصوات الأساسية، وطريقة إلقاء التحية والمحادثات اليومية البسيطة بأسلوب تفاعلي ممتع.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-102',
    gradeId: 'g-1',
    gradeSlug: 'grade-1',
    gradeTitle: 'Grade 1',
    title: 'Unit 2: My Family & Toys',
    slug: 'grade-1-unit-2',
    description: 'شرح كلمات أفراد العائلة والألعاب بأغاني ممتعة وأساليب تفاعلية للأطفال.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-201',
    gradeId: 'g-2',
    gradeSlug: 'grade-2',
    gradeTitle: 'Grade 2',
    title: 'Unit 1: Meet My Family',
    slug: 'grade-2-unit-1',
    description: 'قواعد المضارع البسيط والضمائر مع تدريبات صوتية مميزة لتثبيت النطق السليم.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1588072432836-e10032774350?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-301',
    gradeId: 'g-3',
    gradeSlug: 'grade-3',
    gradeTitle: 'Grade 3',
    title: 'Unit 1: I Feel Happy!',
    slug: 'grade-3-unit-1',
    description: 'المشاعر والصفات، وتكوين الجمل الصحيحة والتعبير عن النفس بطلاقة.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-401',
    gradeId: 'g-4',
    gradeSlug: 'grade-4',
    gradeTitle: 'Grade 4',
    title: 'Unit 1: I Discover Myself',
    slug: 'grade-4-unit-1',
    description: 'منهج Connect Plus الجديد مع شرح القواعد وبنك أسئلة مطابق لمواصفات الوزارة.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-501',
    gradeId: 'g-5',
    gradeSlug: 'grade-5',
    gradeTitle: 'Grade 5',
    title: 'Unit 1: We Plant Our Food',
    slug: 'grade-5-unit-1',
    description: 'شرح مبسط وشامل لمفردات الزراعة والبيئة وتدريبات كتابية وتمارين استماع.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
  {
    id: 'u-601',
    gradeId: 'g-6',
    gradeSlug: 'grade-6',
    gradeTitle: 'Grade 6',
    title: 'Unit 1: Green Cities & Communities',
    slug: 'grade-6-unit-1',
    description: 'مراجعة شاملة لأساسيات اللغة وقواعد المحادثة والكتابة لطلاب الشهادة الابتدائية.',
    priceEgp: 250,
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=60',
    lessonsCount: 4,
    quizzesCount: 2,
    isPublished: true,
  },
];

export const INITIAL_LESSONS: MockLesson[] = [
  {
    id: 'les-1',
    unitId: 'u-101',
    title: 'الدرس 1 و 2: الحروف والنطق الصوتي (Phonics & Letters)',
    slug: 'phonics-and-letters',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Demo fast HLS stream
    videoDuration: '24 دقيقة',
    pdfAttachmentUrl: '/sample-notes.pdf',
    pdfTitle: 'ملزمة الحروف والكلمات الملونة - الوحدة الأولى.pdf',
    isFreePreview: true,
    orderIndex: 1,
  },
  {
    id: 'les-2',
    unitId: 'u-101',
    title: 'الدرس 3 و 4: التحيات والمحادثة اليومية (Greetings & Conversation)',
    slug: 'greetings-and-conversation',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    videoDuration: '28 دقيقة',
    pdfAttachmentUrl: '/sample-notes.pdf',
    pdfTitle: 'تدريبات الواجب المنزلي وأنشطة التلوين.pdf',
    isFreePreview: false,
    orderIndex: 2,
  },
  {
    id: 'les-3',
    unitId: 'u-101',
    title: 'الدرس 5: قواعد تكوين الجملة البسيطة (Simple Sentences)',
    slug: 'simple-sentences',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    videoDuration: '22 دقيقة',
    pdfAttachmentUrl: '/sample-notes.pdf',
    pdfTitle: 'ملخص القواعد والتمارين.pdf',
    isFreePreview: false,
    orderIndex: 3,
  },
  {
    id: 'les-4',
    unitId: 'u-101',
    title: 'مراجعة شاملة وحل أسئلة كتاب الوزارة والامتحانات',
    slug: 'unit-revision',
    videoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    videoDuration: '35 دقيقة',
    pdfAttachmentUrl: '/sample-notes.pdf',
    pdfTitle: 'نماذج اختبارات شاملة مع الإجابات النموذجية.pdf',
    isFreePreview: false,
    orderIndex: 4,
  },
];

export const INITIAL_QUIZ: MockQuiz = {
  id: 'quiz-101',
  unitId: 'u-101',
  lessonId: 'les-1',
  title: 'مغامرة اختبار الوحدة الأولى (Unit 1 Adventure Quiz)',
  timeLimitMinutes: 10,
  passPercentage: 70,
  questions: [
    {
      id: 'q1',
      text: 'What is the correct greeting in the morning?',
      options: [
        { id: 'opt-1', text: 'Good morning', isCorrect: true },
        { id: 'opt-2', text: 'Good night', isCorrect: false },
        { id: 'opt-3', text: 'Goodbye', isCorrect: false },
        { id: 'opt-4', text: 'Good evening', isCorrect: false },
      ],
      explanation: 'نقول Good morning عند الصباح الباكر وتحية الأصدقاء والمعلم.',
    },
    {
      id: 'q2',
      text: 'Choose the correct word starting with the letter "B":',
      options: [
        { id: 'opt-1', text: 'Apple', isCorrect: false },
        { id: 'opt-2', text: 'Book', isCorrect: true },
        { id: 'opt-3', text: 'Cat', isCorrect: false },
        { id: 'opt-4', text: 'Duck', isCorrect: false },
      ],
      explanation: 'كلمة Book (كتاب) تبدأ بحرف B مثل /b/ sound.',
    },
    {
      id: 'q3',
      text: 'Complete the sentence: "Hello, what is ______ name?"',
      options: [
        { id: 'opt-1', text: 'you', isCorrect: false },
        { id: 'opt-2', text: 'your', isCorrect: true },
        { id: 'opt-3', text: 'my', isCorrect: false },
        { id: 'opt-4', text: 'he', isCorrect: false },
      ],
      explanation: 'نستخدم your للسؤال عن اسم الشخص المخاطب: What is your name?',
    },
    {
      id: 'q4',
      text: 'Is "Bag" a classroom item? (حقيبة مدرسية)',
      options: [
        { id: 'opt-1', text: 'Yes, it is', isCorrect: true },
        { id: 'opt-2', text: 'No, it is not', isCorrect: false },
      ],
      explanation: 'نعم، الحقيبة المدرسية Bag من أهم أدوات الفصل المدرسي.',
    },
  ],
};

export const INITIAL_ADVENTURE_QUIZZES: MockAdventureQuiz[] = [
  {
    id: 'quiz-zoo',
    slug: 'quiz-zoo',
    title: 'إختبار حديقة الحيوان 🦁',
    theme: 'zoo',
    subtitle: 'مغامرة صوتيات الحيوانات وحروف Phonics',
    gradeBadge: 'Grade 1 & 2',
    questionsCount: 4,
    durationMinutes: 8,
    xpReward: 150,
    accentBg: 'from-emerald-50 to-teal-50',
    accentBorder: 'border-emerald-200 hover:border-emerald-400',
    buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
    tag: 'مغامرة حيوانات الغابة',
  },
  {
    id: 'quiz-spiderman',
    slug: 'quiz-spiderman',
    title: 'اختبار سبايدر مان 🕷️',
    theme: 'spiderman',
    subtitle: 'تحدي الأبطال الخارقين في قواعد الإنجليزي والضمائر',
    gradeBadge: 'Grade 2 & 3',
    questionsCount: 4,
    durationMinutes: 10,
    xpReward: 200,
    accentBg: 'from-red-50 to-blue-50',
    accentBorder: 'border-red-200 hover:border-red-400',
    buttonColor: 'bg-gradient-to-r from-red-600 to-indigo-600 hover:opacity-90',
    tag: 'تحدي الأبطال الخارقين',
  },
  {
    id: 'quiz-fruits',
    slug: 'quiz-fruits',
    title: 'اختبار سلة الفواكه 🍎',
    theme: 'fruits',
    subtitle: 'مسابقة الألوان، الأطعمة، وكلمات المطبخ الإنجليزية',
    gradeBadge: 'Grade 1 & 2',
    questionsCount: 4,
    durationMinutes: 7,
    xpReward: 120,
    accentBg: 'from-amber-50 to-orange-50',
    accentBorder: 'border-amber-200 hover:border-amber-400',
    buttonColor: 'bg-amber-600 hover:bg-amber-700',
    tag: 'مملكة الألوان والفواكه',
  },
  {
    id: 'quiz-numbers',
    slug: 'quiz-numbers',
    title: 'اختبار صائدي الأرقام 🔢',
    theme: 'numbers',
    subtitle: 'مغامرة الجمع، العد، وقواعد الجمع والمفرد بالإنجليزية',
    gradeBadge: 'Grade 1, 2 & 3',
    questionsCount: 4,
    durationMinutes: 8,
    xpReward: 160,
    accentBg: 'from-purple-50 to-pink-50',
    accentBorder: 'border-purple-200 hover:border-purple-400',
    buttonColor: 'bg-purple-600 hover:bg-purple-700',
    tag: 'تحدي الأرقام السحرية',
  },
];

export const ADVENTURE_QUIZZES_MAP: Record<string, MockQuiz> = {
  'quiz-zoo': {
    id: 'quiz-zoo',
    unitId: 'u-101',
    title: 'مغامرة حديقة الحيوان — Zoo Adventure Phonics',
    timeLimitMinutes: 8,
    passPercentage: 75,
    questions: [
      {
        id: 'qz-1',
        text: 'What sound does the Lion start with?',
        options: [
          { id: 'opt-1', text: 'Letter /l/ (Lion)', isCorrect: true },
          { id: 'opt-2', text: 'Letter /b/ (Bear)', isCorrect: false },
          { id: 'opt-3', text: 'Letter /m/ (Monkey)', isCorrect: false },
          { id: 'opt-4', text: 'Letter /z/ (Zebra)', isCorrect: false },
        ],
        explanation: 'الأسد Lion يبدأ بصوت حرف L الصوتي /l/.',
      },
      {
        id: 'qz-2',
        text: 'The Elephant has a long _______.',
        options: [
          { id: 'opt-1', text: 'trunk', isCorrect: true },
          { id: 'opt-2', text: 'wing', isCorrect: false },
          { id: 'opt-3', text: 'horn', isCorrect: false },
          { id: 'opt-4', text: 'fin', isCorrect: false },
        ],
        explanation: 'الفيل يمتلك خرطوماً طويلاً Trunk.',
      },
      {
        id: 'qz-3',
        text: 'Monkeys love to eat ________.',
        options: [
          { id: 'opt-1', text: 'bananas', isCorrect: true },
          { id: 'opt-2', text: 'pizza', isCorrect: false },
          { id: 'opt-3', text: 'meat', isCorrect: false },
          { id: 'opt-4', text: 'grass', isCorrect: false },
        ],
        explanation: 'القرود تعشق أكل الموز Bananas.',
      },
      {
        id: 'qz-4',
        text: 'Is a Zebra black and white?',
        options: [
          { id: 'opt-1', text: 'Yes, it is!', isCorrect: true },
          { id: 'opt-2', text: 'No, it is green.', isCorrect: false },
        ],
        explanation: 'الحمار الوحشي Zebra مخطط باللونين الأبيض والأسود.',
      },
    ],
  },
  'quiz-spiderman': {
    id: 'quiz-spiderman',
    unitId: 'u-201',
    title: 'تحدي سبايدر مان الخارق — Superhero Grammar Challenge',
    timeLimitMinutes: 10,
    passPercentage: 70,
    questions: [
      {
        id: 'qs-1',
        text: 'Spider-Man says: "I _______ climb walls!"',
        options: [
          { id: 'opt-1', text: 'can', isCorrect: true },
          { id: 'opt-2', text: 'am', isCorrect: false },
          { id: 'opt-3', text: 'is', isCorrect: false },
          { id: 'opt-4', text: 'are', isCorrect: false },
        ],
        explanation: 'نستخدم الفعل المساعد can للتعبير عن القدرة والمهارة: I can climb walls.',
      },
      {
        id: 'qs-2',
        text: 'Choose the correct pronoun: "Peter Parker is a hero. _______ helps people."',
        options: [
          { id: 'opt-1', text: 'He', isCorrect: true },
          { id: 'opt-2', text: 'She', isCorrect: false },
          { id: 'opt-3', text: 'It', isCorrect: false },
          { id: 'opt-4', text: 'They', isCorrect: false },
        ],
        explanation: 'بيتر باركر مذكر مفرد، والضمير المناسب له هو He.',
      },
      {
        id: 'qs-3',
        text: 'What is the opposite of "Strong"?',
        options: [
          { id: 'opt-1', text: 'Weak', isCorrect: true },
          { id: 'opt-2', text: 'Fast', isCorrect: false },
          { id: 'opt-3', text: 'Tall', isCorrect: false },
          { id: 'opt-4', text: 'Brave', isCorrect: false },
        ],
        explanation: 'عكس كلمة Strong (قوي) هي Weak (ضعيف).',
      },
      {
        id: 'qs-4',
        text: 'Complete the hero phrase: "With great power comes great ________."',
        options: [
          { id: 'opt-1', text: 'responsibility', isCorrect: true },
          { id: 'opt-2', text: 'candy', isCorrect: false },
          { id: 'opt-3', text: 'homework', isCorrect: false },
          { id: 'opt-4', text: 'speed', isCorrect: false },
        ],
        explanation: 'شعار سبايدر مان الشهير: مع القوة العظيمة تأتي مسؤولية عظيمة.',
      },
    ],
  },
  'quiz-fruits': {
    id: 'quiz-fruits',
    unitId: 'u-102',
    title: 'مسابقة سلة الفواكه — Magic Fruits & Colors',
    timeLimitMinutes: 7,
    passPercentage: 70,
    questions: [
      {
        id: 'qf-1',
        text: 'What color is a ripe banana?',
        options: [
          { id: 'opt-1', text: 'Yellow', isCorrect: true },
          { id: 'opt-2', text: 'Blue', isCorrect: false },
          { id: 'opt-3', text: 'Purple', isCorrect: false },
          { id: 'opt-4', text: 'Black', isCorrect: false },
        ],
        explanation: 'الموز الأصفر الناضج لونه Yellow.',
      },
      {
        id: 'qf-2',
        text: 'An apple a day keeps the _______ away!',
        options: [
          { id: 'opt-1', text: 'doctor', isCorrect: true },
          { id: 'opt-2', text: 'teacher', isCorrect: false },
          { id: 'opt-3', text: 'pilot', isCorrect: false },
          { id: 'opt-4', text: 'driver', isCorrect: false },
        ],
        explanation: 'المثل الإنجليزي الشهير: تفاحة يومياً تغنيك عن الطبيب doctor.',
      },
      {
        id: 'qf-3',
        text: 'Which fruit is red and has small seeds on the outside?',
        options: [
          { id: 'opt-1', text: 'Strawberry', isCorrect: true },
          { id: 'opt-2', text: 'Orange', isCorrect: false },
          { id: 'opt-3', text: 'Grape', isCorrect: false },
          { id: 'opt-4', text: 'Lemon', isCorrect: false },
        ],
        explanation: 'الفراولة Strawberry فاكهة حمراء وبذورها على السطح الخارجي.',
      },
      {
        id: 'qf-4',
        text: 'Choose the sweet citrus fruit: "O _ _ _ _ E"',
        options: [
          { id: 'opt-1', text: 'ORANGE', isCorrect: true },
          { id: 'opt-2', text: 'ONION', isCorrect: false },
          { id: 'opt-3', text: 'OLIVE', isCorrect: false },
          { id: 'opt-4', text: 'OVEN', isCorrect: false },
        ],
        explanation: 'البرتقال البرتقالي اللذيذ هو ORANGE.',
      },
    ],
  },
  'quiz-numbers': {
    id: 'quiz-numbers',
    unitId: 'u-101',
    title: 'تحدي صيادي الأرقام — Number Hunters Counting Challenge',
    timeLimitMinutes: 8,
    passPercentage: 70,
    questions: [
      {
        id: 'qn-1',
        text: 'Spell the number "7" in English letters:',
        options: [
          { id: 'opt-1', text: 'Seven', isCorrect: true },
          { id: 'opt-2', text: 'Six', isCorrect: false },
          { id: 'opt-3', text: 'Eleven', isCorrect: false },
          { id: 'opt-4', text: 'Eight', isCorrect: false },
        ],
        explanation: 'الرقم 7 يُكتب بالإنجليزية S-E-V-E-N.',
      },
      {
        id: 'qn-2',
        text: 'Two plus three equals: "2 + 3 = _______"',
        options: [
          { id: 'opt-1', text: 'Five (5)', isCorrect: true },
          { id: 'opt-2', text: 'Four (4)', isCorrect: false },
          { id: 'opt-3', text: 'Six (6)', isCorrect: false },
          { id: 'opt-4', text: 'Ten (10)', isCorrect: false },
        ],
        explanation: '2 + 3 = 5 (Five).',
      },
      {
        id: 'qn-3',
        text: 'What is the plural of "One Cat"?',
        options: [
          { id: 'opt-1', text: 'Two Cats', isCorrect: true },
          { id: 'opt-2', text: 'Two Cates', isCorrect: false },
          { id: 'opt-3', text: 'Two Caties', isCorrect: false },
          { id: 'opt-4', text: 'Two Catss', isCorrect: false },
        ],
        explanation: 'نضيف حرف s لتحويل المفرد إلى جمع: Cat -> Cats.',
      },
      {
        id: 'qn-4',
        text: 'How many days are in one week?',
        options: [
          { id: 'opt-1', text: 'Seven days', isCorrect: true },
          { id: 'opt-2', text: 'Five days', isCorrect: false },
          { id: 'opt-3', text: 'Ten days', isCorrect: false },
          { id: 'opt-4', text: 'Twelve days', isCorrect: false },
        ],
        explanation: 'يحتوي الأسبوع على 7 أيام: Seven days.',
      },
    ],
  },
};

export const INITIAL_GRADE_CHAMPIONS: Record<string, MockGradeChampion[]> = {
  'grade-1': [
    {
      rank: 1,
      name: 'أحمد محمود الخولي',
      initials: 'أ.خ',
      gradeBadge: 'Grade 1',
      schoolName: 'مدرسة اللغات التجريبية',
      city: 'كفر الشيخ',
      xpPoints: 780,
    },
    {
      rank: 2,
      name: 'فريدة إسلام كمال',
      initials: 'ف.ك',
      gradeBadge: 'Grade 1',
      schoolName: 'مدرسة طيبة الدولية',
      city: 'الإسكندرية',
      xpPoints: 720,
    },
    {
      rank: 3,
      name: 'سيف الدين رامي',
      initials: 'س.ر',
      gradeBadge: 'Grade 1',
      schoolName: 'مدرسة النزهة للغات',
      city: 'القاهرة',
      xpPoints: 690,
    },
  ],
  'grade-2': [
    {
      rank: 1,
      name: 'نور عمر الجمل',
      initials: 'ن.ج',
      gradeBadge: 'Grade 2',
      schoolName: 'مدرسة الدلتا الدولية',
      city: 'المنصورة (الدقهلية)',
      xpPoints: 840,
    },
    {
      rank: 2,
      name: 'مالك إسلام المزين',
      initials: 'م.م',
      gradeBadge: 'Grade 2',
      schoolName: 'مدرسة الرواد الرسمية',
      city: 'طنطا (الغربية)',
      xpPoints: 810,
    },
    {
      rank: 3,
      name: 'جنى أحمد حسام',
      initials: 'ج.ح',
      gradeBadge: 'Grade 2',
      schoolName: 'مدرسة بدر الدولية',
      city: 'السويس',
      xpPoints: 760,
    },
  ],
  'grade-3': [
    {
      rank: 1,
      name: 'مريم كريم منصور',
      initials: 'م.م',
      gradeBadge: 'Grade 3',
      schoolName: 'مدرسة طيبة الدولية',
      city: 'الإسكندرية',
      xpPoints: 920,
    },
    {
      rank: 2,
      name: 'مارسيلينو مينا رفيق',
      initials: 'م.ر',
      gradeBadge: 'Grade 3',
      schoolName: 'مدرسة الفرير للغات',
      city: 'القاهرة',
      xpPoints: 890,
    },
    {
      rank: 3,
      name: 'عمر خالد الصاوي',
      initials: 'ع.ص',
      gradeBadge: 'Grade 3',
      schoolName: 'مدرسة سان جورج',
      city: 'بورسعيد',
      xpPoints: 830,
    },
  ],
  'grade-4': [
    {
      rank: 1,
      name: 'يوسف حازم الشناوي',
      initials: 'ي.ش',
      gradeBadge: 'Grade 4',
      schoolName: 'مدرسة النصر الرسمية',
      city: 'القاهرة',
      xpPoints: 880,
    },
    {
      rank: 2,
      name: 'حنين شريف غانم',
      initials: 'ح.غ',
      gradeBadge: 'Grade 4',
      schoolName: 'مدرسة المنارة الدولية',
      city: 'الجيزة',
      xpPoints: 850,
    },
    {
      rank: 3,
      name: 'كريم وائل الزهيري',
      initials: 'ك.ز',
      gradeBadge: 'Grade 4',
      schoolName: 'مدرسة آمون الخاصة',
      city: 'دمياط',
      xpPoints: 810,
    },
  ],
  'grade-5': [
    {
      rank: 1,
      name: 'ليلى طارق العزازي',
      initials: 'ل.ع',
      gradeBadge: 'Grade 5',
      schoolName: 'مدرسة الفاروق الدولية',
      city: 'الشرقية',
      xpPoints: 910,
    },
    {
      rank: 2,
      name: 'زياد إيهاب القاضي',
      initials: 'ز.ق',
      gradeBadge: 'Grade 5',
      schoolName: 'مدرسة الزهور الرسمية',
      city: 'الإسماعيلية',
      xpPoints: 870,
    },
    {
      rank: 3,
      name: 'فاطمة محمد رضوان',
      initials: 'ف.ر',
      gradeBadge: 'Grade 5',
      schoolName: 'مدرسة السلام لغات',
      city: 'أسيوط',
      xpPoints: 840,
    },
  ],
  'grade-6': [
    {
      rank: 1,
      name: 'عبد الرحمن وليد ناصر',
      initials: 'ع.ن',
      gradeBadge: 'Grade 6',
      schoolName: 'مدرسة الأوائل الدولية',
      city: 'القاهرة',
      xpPoints: 950,
    },
    {
      rank: 2,
      name: 'ريتاج أشرف الباز',
      initials: 'ر.ب',
      gradeBadge: 'Grade 6',
      schoolName: 'مدرسة العروبة للغات',
      city: 'بني سويف',
      xpPoints: 910,
    },
    {
      rank: 3,
      name: 'حمزة مصطفى الهواري',
      initials: 'ح.هـ',
      gradeBadge: 'Grade 6',
      schoolName: 'مدرسة الكرنك الدولية',
      city: 'الأقصر',
      xpPoints: 890,
    },
  ],
};

export const INITIAL_STUDENTS: MockStudent[] = [
  {
    id: 'std-1',
    name: 'أحمد محمود الخولي',
    studentPhone: '01012345678',
    parentPhone: '01098765432',
    parentName: 'محمود الخولي',
    governorate: 'كفر الشيخ',
    gradeLevel: 1,
    gradeTitle: 'Grade 1',
    schoolName: 'مدرسة اللغات التجريبية',
    xpPoints: 450,
    enrolledUnits: ['u-101', 'u-102'],
    lastActive: 'منذ 15 دقيقة',
    deviceLocked: false,
  },
  {
    id: 'std-2',
    name: 'مريم كريم منصور',
    studentPhone: '01123456789',
    parentPhone: '01198765431',
    parentName: 'كريم منصور',
    governorate: 'الإسكندرية',
    gradeLevel: 3,
    gradeTitle: 'Grade 3',
    schoolName: 'مدرسة طيبة الدولية',
    xpPoints: 820,
    enrolledUnits: ['u-301'],
    lastActive: 'منذ ساعتين',
    deviceLocked: false,
  },
  {
    id: 'std-3',
    name: 'يوسف حازم الشناوي',
    studentPhone: '01234567890',
    parentPhone: '01298765430',
    parentName: 'حازم الشناوي',
    governorate: 'القاهرة',
    gradeLevel: 4,
    gradeTitle: 'Grade 4',
    schoolName: 'مدرسة النصر الرسمية',
    xpPoints: 310,
    enrolledUnits: ['u-401'],
    lastActive: 'أمس',
    deviceLocked: true,
  },
  {
    id: 'std-4',
    name: 'نور عمر الجمل',
    studentPhone: '01545678901',
    parentPhone: '01598765429',
    parentName: 'عمر الجمل',
    governorate: 'المنصورة (الدقهلية)',
    gradeLevel: 2,
    gradeTitle: 'Grade 2',
    schoolName: 'مدرسة الدلتا الدولية',
    xpPoints: 610,
    enrolledUnits: ['u-201'],
    lastActive: 'منذ 3 ساعات',
    deviceLocked: false,
  },
];

export const INITIAL_ORDERS: MockOrder[] = [
  {
    id: 'ord-901',
    studentName: 'أحمد محمود الخولي',
    studentPhone: '01012345678',
    parentPhone: '01098765432',
    unitTitle: 'Grade 1 Unit 1: Hello & My Class',
    unitId: 'u-101',
    gradeTitle: 'Grade 1',
    amountEgp: 250,
    paymentMethod: 'instapay_manual',
    status: 'manual_review',
    referenceNumber: 'INSTA-884920194',
    receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=60',
    receiptHash: 'hash_insta_884920194',
    ocrData: {
      extractedReference: '884920194',
      extractedAmount: 250,
      extractedDate: '2026-09-02 02:38 AM',
      matchedSender: 'ahmed.elkholy@instapay',
      confidenceScore: 98,
      isSuspectedDuplicate: false,
    },
    createdAt: '2026-09-02 02:40 ص',
  },
  {
    id: 'ord-902',
    studentName: 'سارة إبراهيم الدسوقي',
    studentPhone: '01055544433',
    parentPhone: '01022211100',
    unitTitle: 'Grade 3 Unit 1: I Feel Happy!',
    unitId: 'u-301',
    gradeTitle: 'Grade 3',
    amountEgp: 250,
    paymentMethod: 'wallet_manual',
    status: 'manual_review',
    referenceNumber: 'VF-CASH-7738210',
    receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=60',
    receiptHash: 'hash_vf_7738210',
    ocrData: {
      extractedReference: '7738210',
      extractedAmount: 250,
      extractedDate: '2026-09-02 01:12 AM',
      matchedSender: '01055544433',
      confidenceScore: 94,
      isSuspectedDuplicate: false,
    },
    createdAt: '2026-09-02 01:15 ص',
  },
  {
    id: 'ord-903',
    studentName: 'عمر شريف زايد',
    studentPhone: '01599887766',
    parentPhone: '01511223344',
    unitTitle: 'Grade 2 Unit 1: My Family & Me',
    unitId: 'u-201',
    gradeTitle: 'Grade 2',
    amountEgp: 250,
    paymentMethod: 'instapay_manual',
    status: 'manual_review',
    referenceNumber: 'INSTA-884920194', // Reused reference!
    receiptImageUrl: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&auto=format&fit=crop&q=60',
    receiptHash: 'hash_insta_884920194',
    ocrData: {
      extractedReference: '884920194',
      extractedAmount: 250,
      extractedDate: '2026-09-02 02:38 AM',
      matchedSender: 'ahmed.elkholy@instapay',
      confidenceScore: 98,
      isSuspectedDuplicate: true,
      duplicateOrderId: 'ord-901',
    },
    createdAt: '2026-09-02 03:10 ص',
  },
  {
    id: 'ord-899',
    studentName: 'مريم كريم منصور',
    studentPhone: '01123456789',
    parentPhone: '01198765431',
    unitTitle: 'Grade 3 Unit 1: I Feel Happy!',
    unitId: 'u-301',
    gradeTitle: 'Grade 3',
    amountEgp: 250,
    paymentMethod: 'paymob_wallet',
    status: 'completed',
    referenceNumber: 'PM-9920138402',
    createdAt: '2026-09-01 18:20 م',
  },
  {
    id: 'ord-898',
    studentName: 'يوسف حازم الشناوي',
    studentPhone: '01234567890',
    parentPhone: '01298765430',
    unitTitle: 'Grade 4 Unit 1: I Discover Myself',
    unitId: 'u-401',
    gradeTitle: 'Grade 4',
    amountEgp: 250,
    paymentMethod: 'paymob_card',
    status: 'completed',
    referenceNumber: 'PM-CARD-1192837',
    createdAt: '2026-09-01 15:10 م',
  },
];

export const EGYPTIAN_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'كفر الشيخ', 'الدقهلية (المنصورة)', 'الغربية (طنطا)',
  'المنوفية', 'القليوبية', 'الشرقية', 'البحيرة', 'دمياط', 'بورسعيد', 'الإسماعيلية',
  'السويس', 'بني سويف', 'الفيوم', 'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'شمال سيناء', 'جنوب سيناء', 'مطروح', 'الوادي الجديد'
];

export const INITIAL_HOMEWORK_ASSIGNMENTS: MockHomeworkAssignment[] = [
  {
    id: 'hw-101',
    unitId: 'u-101',
    unitTitle: 'Grade 1 Unit 1: Hello & My Class',
    lessonTitle: 'Lesson 1: Phonics & Greetings',
    gradeSlug: 'grade-1',
    title: 'واجب كتابة الحروف وتدريبات كتاب النشاط صـ 14 و 15',
    instructions: 'قم بحل تدريبات كتاب النشاط الخاصة بالحروف A, B, C وتوصيل الكلمات بالصور ثم التقط صورة واضحة لصفحات الكراسة وارفعها هنا.',
    pageNumber: 'صـ 14 - 15',
    maxScore: 10,
    dueDate: '2026-09-10T23:59:59Z',
  },
  {
    id: 'hw-102',
    unitId: 'u-102',
    unitTitle: 'Grade 1 Unit 2: Family & Friends',
    lessonTitle: 'Lesson 2: Phonics Digraphs (Sh, Ch)',
    gradeSlug: 'grade-1',
    title: 'كراسة الكلمات الصوتية (Family Members & Digraphs)',
    instructions: 'اكتب الكلمات التالية مرتين في كراسة الواجب: (Father, Mother, Sister, Brother, Ship, Chair) مع وضع دائرة حول الصوت الصحيح.',
    pageNumber: 'صـ 22 - 23',
    maxScore: 10,
    dueDate: '2026-09-14T23:59:59Z',
  },
  {
    id: 'hw-301',
    unitId: 'u-301',
    unitTitle: 'Grade 3 Unit 1: I Feel Happy!',
    lessonTitle: 'Lesson 1: Feelings & Sentences',
    gradeSlug: 'grade-3',
    title: 'تكوين الجمل وتمارين القواعد صـ 18',
    instructions: 'قم بكتابة 5 جمل تعبر عن المشاعر باستخدام: (I feel happy, I feel thirsty, I feel excited) وحل تمرين التوصيل.',
    pageNumber: 'صـ 18',
    maxScore: 10,
    dueDate: '2026-09-12T23:59:59Z',
  },
];

export const INITIAL_HOMEWORK_SUBMISSIONS: MockHomeworkSubmission[] = [
  {
    id: 'sub-001',
    assignmentId: 'hw-101',
    assignmentTitle: 'واجب كتابة الحروف وتدريبات كتاب النشاط صـ 14 و 15',
    studentId: 'std-1',
    studentName: 'أحمد محمود الخولي',
    studentPhone: '01012345678',
    parentPhone: '01098765432',
    gradeTitle: 'Grade 1 (الصف الأول الابتدائي)',
    studentImages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=70',
      },
      {
        pageNumber: 2,
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=70',
      },
    ],
    status: 'submitted',
    maxScore: 10,
    submittedAt: 'منذ ساعتين',
  },
  {
    id: 'sub-002',
    assignmentId: 'hw-301',
    assignmentTitle: 'تكوين الجمل وتمارين القواعد صـ 18',
    studentId: 'std-2',
    studentName: 'مريم كريم منصور',
    studentPhone: '01123456789',
    parentPhone: '01198765431',
    gradeTitle: 'Grade 3 (الصف الثالث الابتدائي)',
    studentImages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=70',
      },
    ],
    status: 'graded',
    score: 10,
    maxScore: 10,
    feedbackNotes: 'خط ممتاز ومنظم يا مريم! إجابات صحيحة 100% وأحسنتِ في كتابة جمل مشاعر السعادة. بطلة متميزة 🌟',
    submittedAt: 'منذ يوم',
    gradedAt: 'منذ 5 ساعات',
  },
  {
    id: 'sub-003',
    assignmentId: 'hw-101',
    assignmentTitle: 'واجب كتابة الحروف وتدريبات كتاب النشاط صـ 14 و 15',
    studentId: 'std-4',
    studentName: 'نور عمر الجمل',
    studentPhone: '01545678901',
    parentPhone: '01598765429',
    gradeTitle: 'Grade 1 (الصف الأول الابتدائي)',
    studentImages: [
      {
        pageNumber: 1,
        imageUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=70',
      },
    ],
    status: 'submitted',
    maxScore: 10,
    submittedAt: 'منذ 4 ساعات',
  },
];

export const INITIAL_LIVE_SESSIONS: MockLiveSession[] = [
  {
    id: 'live-01',
    gradeId: 'g-1',
    gradeTitle: 'Grade 1 (الصف الأول الابتدائي)',
    gradeSlug: 'grade-1',
    title: '🔴 بث المراجعة التفاعلية الشاملة للوحدة الأولى',
    description: 'مراجعة نطق الصوتيات والأغاني التفاعلية، ومسابقة سريعة لأبطال الصف الأول الابتدائي وجوائز XP فورية.',
    scheduledAt: '2026-09-04T18:00:00.000Z',
    durationMinutes: 45,
    provider: 'zoom',
    meetingUrl: 'https://zoom.us/j/99283748291?pwd=ELITE_GRADE1_ZOOM',
    meetingPassword: 'ELITE',
    isLiveNow: false,
    instructorName: 'المعلم المشرف',
  },
  {
    id: 'live-02',
    gradeId: 'g-3',
    gradeTitle: 'Grade 3 (الصف الثالث الابتدائي)',
    gradeSlug: 'grade-3',
    title: '🔥 ورشة تأسيس الجرامر وتكوين الجمل البسيطة (Grammar Workshop)',
    description: 'شرح مبسط لقواعد Have got و Feelings مع تطبيق مباشر وأسئلة تفاعلية مع الطلاب.',
    scheduledAt: '2026-09-05T19:30:00.000Z',
    durationMinutes: 60,
    provider: 'zoom',
    meetingUrl: 'https://zoom.us/j/11827364520?pwd=ELITE_GRADE3_ZOOM',
    meetingPassword: 'ELITE',
    isLiveNow: false,
    instructorName: 'المعلم المشرف',
  },
];

export interface MockPlatformSettings {
  id: string;
  academyNameArabic: string;
  academyNameEnglish: string;
  teacherNameArabic: string;
  teacherNameEnglish: string;
  teacherTitle?: string;
  teacherBio?: string;
  whatsappNumber: string;
  hotlineNumber: string;
  inquiriesNumber: string;
  vodafoneCashNumber?: string;
  instapayAddress?: string;
  heroVideoUrl: string;
  sampleLectures: Array<{
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    thumbnailUrl: string;
    badgeText: string;
    orderIndex: number;
  }>;
  updatedAt?: Date;
}

export const INITIAL_PLATFORM_SETTINGS: MockPlatformSettings = {
  id: 'default',
  academyNameArabic: 'أكاديمية إيليت',
  academyNameEnglish: 'Elite Academy',
  teacherNameArabic: 'المعلم المشرف',
  teacherNameEnglish: 'Lead Instructor',
  teacherTitle: 'المشرف الأكاديمي وكبير المعلمين',
  teacherBio: 'نخبة من أفضل الكفاءات التعليمية المتخصصة في تدريس وتأسيس المناهج التعليمية بأحدث الأساليب التفاعلية والتقنيات الحديثة.',
  whatsappNumber: '201000000000',
  hotlineNumber: '0225006000',
  inquiriesNumber: '01100000000',
  vodafoneCashNumber: '01000000000',
  instapayAddress: 'academy@instapay',
  heroVideoUrl: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
  sampleLectures: [
    {
      id: 'samp-1',
      title: 'Grade 2 — Unit 1 Lesson 3',
      description: 'شرح تفاعلي ممتع — Phonics & Vocabulary',
      videoUrl: 'https://www.youtube.com/watch?v=TnWuKHiN0b0',
      thumbnailUrl: 'https://img.youtube.com/vi/TnWuKHiN0b0/hqdefault.jpg',
      badgeText: 'مجاني',
      orderIndex: 1,
    },
    {
      id: 'samp-2',
      title: '4 أزمنة بطريقة مختلفة للأطفال',
      description: 'Grammar بأسلوب كرتوني — Present & Past',
      videoUrl: 'https://www.youtube.com/watch?v=iJY5GbIdLlA&list=PL1sW44fty50ZTqlCTg70kbuYvaCYHwhtP',
      thumbnailUrl: 'https://img.youtube.com/vi/iJY5GbIdLlA/hqdefault.jpg',
      badgeText: 'مجاني',
      orderIndex: 2,
    },
    {
      id: 'samp-3',
      title: 'تدريب Phonics — الحروف والأصوات',
      description: 'نطق سليم وتعلم ممتع — Grade 1 & 2',
      videoUrl: 'https://www.youtube.com/watch?v=TnWuKHiN0b0',
      thumbnailUrl: 'https://img.youtube.com/vi/TnWuKHiN0b0/hqdefault.jpg',
      badgeText: 'مجاني',
      orderIndex: 3,
    },
    {
      id: 'samp-4',
      title: 'Connect Plus 1 — Unit 2',
      description: 'تدريبات صوتية وقراءة القصص المصورة',
      videoUrl: 'https://www.youtube.com/watch?v=TnWuKHiN0b0',
      thumbnailUrl: 'https://img.youtube.com/vi/TnWuKHiN0b0/hqdefault.jpg',
      badgeText: 'مجاني',
      orderIndex: 4,
    },
  ],
};

