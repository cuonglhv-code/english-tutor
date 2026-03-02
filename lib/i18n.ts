// Centralised translation object. IELTS terms always stay in English.
// All prose UI labels are provided in both 'en' and 'vi'.

export type Lang = "en" | "vi";

const translations = {
  // ─── Navbar ───────────────────────────────────────────────────────────────
  nav: {
    practice: { en: "Practice", vi: "Luyện thi" },
    courses: { en: "Courses", vi: "Khóa học" },
    dashboard: { en: "Dashboard", vi: "Tổng quan" },
    login: { en: "Log in", vi: "Đăng nhập" },
    logout: { en: "Log out", vi: "Đăng xuất" },
    register: { en: "Register", vi: "Đăng ký" },
  },

  // ─── Step 1: Personal Details ─────────────────────────────────────────────
  details: {
    title: { en: "Personal Details", vi: "Thông tin cá nhân" },
    description: { en: "Tell us about yourself so we can personalise your feedback.", vi: "Hãy cho chúng tôi biết về bạn để cá nhân hóa phản hồi." },
    fullName: { en: "Full Name", vi: "Họ và tên" },
    age: { en: "Age", vi: "Tuổi" },
    city: { en: "City", vi: "Thành phố" },
    mobile: { en: "Mobile", vi: "Số điện thoại" },
    email: { en: "Email", vi: "Email" },
    currentBands: { en: "Current Band Scores", vi: "Band hiện tại" },
    targetBand: { en: "Target Band", vi: "Band mục tiêu" },
    continue: { en: "Continue to Task Selection →", vi: "Tiếp theo: Chọn bài →" },
    errorName: { en: "Name must be at least 2 characters", vi: "Tên phải có ít nhất 2 ký tự" },
    errorAge: { en: "Minimum age is 16", vi: "Tuổi tối thiểu là 16" },
    errorCity: { en: "Please select a city", vi: "Vui lòng chọn thành phố" },
    errorMobile: { en: "Invalid Vietnamese mobile (+84 / 0 + 9 digits)", vi: "Số điện thoại không hợp lệ (+84 / 0 + 9 chữ số)" },
    errorEmail: { en: "Invalid email address", vi: "Email không hợp lệ" },
  },

  // ─── Step 2: Task Selection ───────────────────────────────────────────────
  task: {
    title: { en: "Select Your Task", vi: "Chọn bài thi" },
    description: { en: "Choose your IELTS module and task type.", vi: "Chọn module IELTS và loại bài thi." },
    module: { en: "IELTS Module", vi: "Module IELTS" },
    taskNumber: { en: "Task Number", vi: "Số bài" },
    academicDesc: { en: "University admission, professional registration", vi: "Nhập học đại học, đăng ký nghề nghiệp" },
    generalDesc: { en: "Secondary education, work experience abroad", vi: "Giáo dục phổ thông, làm việc ở nước ngoài" },
    back: { en: "Back", vi: "Quay lại" },
    continue: { en: "Continue to Question →", vi: "Tiếp theo: Câu hỏi →" },
  },

  // ─── Step 3: Question ─────────────────────────────────────────────────────
  question: {
    title: { en: "Enter the Question", vi: "Nhập câu hỏi" },
    description: { en: "Upload the question image/file or type it directly below.", vi: "Tải lên hình ảnh/file hoặc nhập trực tiếp bên dưới." },
    dropzone: { en: "Drag & drop or click to upload", vi: "Kéo & thả hoặc nhấp để tải lên" },
    dropzoneHint: { en: "Image, PDF, or .txt file", vi: "Hình ảnh, PDF, hoặc file .txt" },
    orType: { en: "— or type below —", vi: "— hoặc nhập bên dưới —" },
    questionLabel: { en: "Question Text", vi: "Nội dung câu hỏi" },
    errorEmpty: { en: "Please enter the question (at least 5 characters).", vi: "Vui lòng nhập câu hỏi (ít nhất 5 ký tự)." },
    back: { en: "Back", vi: "Quay lại" },
    continue: { en: "Continue to Writing →", vi: "Tiếp theo: Viết bài →" },
  },

  // ─── Step 4: Write ────────────────────────────────────────────────────────
  write: {
    questionPanel: { en: "Question", vi: "Câu hỏi" },
    responsePanel: { en: "Your response", vi: "Bài viết của bạn" },
    wordsRequired: { en: "required", vi: "cần thiết" },
    shortWarning: { en: "more words needed — short essays receive automatic band penalties in IELTS.", vi: "từ nữa — bài viết ngắn sẽ bị trừ điểm tự động trong IELTS." },
    placeholder1: { en: "Begin writing your Task 1 response here…", vi: "Bắt đầu viết bài Task 1 tại đây…" },
    placeholder2: { en: "Begin writing your Task 2 essay here…", vi: "Bắt đầu viết bài Task 2 tại đây…" },
    analyzeBtn: { en: "Submit & Analyze", vi: "Nộp & Chấm bài" },
    analyzing: { en: "Analyzing…", vi: "Đang chấm bài…" },
    back: { en: "Back", vi: "Quay lại" },
    spendAbout: { en: "Spend about", vi: "Dành khoảng" },
    minutes: { en: "minutes", vi: "phút" },
    writeAtLeast: { en: "Write at least", vi: "Viết ít nhất" },
    words: { en: "words", vi: "từ" },
    language: { en: "Feedback language", vi: "Ngôn ngữ phản hồi" },
    feedbackLangEn: { en: "English", vi: "Tiếng Anh" },
    feedbackLangVi: { en: "Vietnamese", vi: "Tiếng Việt" },
    errorEmpty: { en: "Please write your essay first.", vi: "Vui lòng viết bài trước." },
    warningShort: { en: (wc: number, min: number) => `Only ${wc} words — minimum is ${min}. Proceeding but score will be penalised.`, vi: (wc: number, min: number) => `Chỉ có ${wc} từ — tối thiểu là ${min}. Tiếp tục nhưng điểm sẽ bị trừ.` },
  },

  // ─── Results ──────────────────────────────────────────────────────────────
  results: {
    title: { en: "Your Results", vi: "Kết quả của bạn" },
    overallBand: { en: "Overall Band Score", vi: "Band tổng thể" },
    expertUser: { en: "Expert User", vi: "Người dùng thành thạo" },
    goodUser: { en: "Good User", vi: "Người dùng giỏi" },
    competentUser: { en: "Competent User", vi: "Người dùng đủ năng lực" },
    modestUser: { en: "Modest User", vi: "Người dùng trung bình" },
    limitedUser: { en: "Limited User", vi: "Người dùng hạn chế" },
    detailedFeedback: { en: "Detailed Feedback", vi: "Phản hồi chi tiết" },
    feedbackDesc: { en: "Expand each criterion for strengths, gaps, and how to improve.", vi: "Mở từng tiêu chí để xem điểm mạnh, điểm yếu và cách cải thiện." },
    wellDone: { en: "What You Did Well", vi: "Điểm mạnh" },
    improve: { en: "How to Improve (+0.5 Band)", vi: "Cách cải thiện (+0.5 Band)" },
    nextBand: { en: "Next band target:", vi: "Mục tiêu Band tiếp theo:" },
    tips: { en: "Personalised Tips", vi: "Mẹo cá nhân hóa" },
    prev: { en: "Prev", vi: "Trước" },
    next: { en: "Next", vi: "Tiếp" },
    exploreCourses: { en: "Explore Courses", vi: "Khám phá khóa học" },
    practiceAgain: { en: "Practice Again", vi: "Luyện thêm" },
    startOver: { en: "Start Over", vi: "Bắt đầu lại" },
    scoredBy: { en: "Scored by", vi: "Chấm bởi" },
    aiExaminer: { en: "AI Examiner", vi: "Chấm thi AI" },
    ruleBased: { en: "Rule-Based Fallback", vi: "Hệ thống dự phòng" },
    disclaimer: { en: "⚠️ Simulated examiner result — not official IELTS marking", vi: "⚠️ Kết quả mô phỏng — không phải điểm IELTS chính thức" },
    strengths: { en: "Strengths", vi: "Điểm mạnh" },
    improvements: { en: "Areas to Improve", vi: "Cần cải thiện" },
    bandJustification: { en: "Band Justification", vi: "Lý do xếp Band" },
    priorityActions: { en: "Priority Actions", vi: "Hành động ưu tiên" },
    overallComment: { en: "Overall Comment", vi: "Nhận xét tổng thể" },
    bandDescriptor: { en: "Band Descriptor", vi: "Mô tả Band" },
  },

  // ─── Auth ─────────────────────────────────────────────────────────────────
  auth: {
    loginTitle: { en: "Log in to Jaxtina", vi: "Đăng nhập Jaxtina" },
    loginDesc: { en: "Track your progress and view submission history.", vi: "Theo dõi tiến độ và xem lịch sử nộp bài." },
    registerTitle: { en: "Create an Account", vi: "Tạo tài khoản" },
    registerDesc: { en: "Free to use. Track your IELTS Writing progress.", vi: "Miễn phí. Theo dõi tiến độ Viết IELTS của bạn." },
    emailLabel: { en: "Email address", vi: "Địa chỉ email" },
    passwordLabel: { en: "Password", vi: "Mật khẩu" },
    displayNameLabel: { en: "Display Name", vi: "Tên hiển thị" },
    loginBtn: { en: "Log in", vi: "Đăng nhập" },
    registerBtn: { en: "Create Account", vi: "Tạo tài khoản" },
    noAccount: { en: "Don't have an account?", vi: "Chưa có tài khoản?" },
    hasAccount: { en: "Already have an account?", vi: "Đã có tài khoản?" },
    signupLink: { en: "Sign up", vi: "Đăng ký" },
    loginLink: { en: "Log in", vi: "Đăng nhập" },
    loggingIn: { en: "Logging in…", vi: "Đang đăng nhập…" },
    registering: { en: "Creating account…", vi: "Đang tạo tài khoản…" },
    errorInvalid: { en: "Invalid email or password.", vi: "Email hoặc mật khẩu không đúng." },
    errorGeneric: { en: "Something went wrong. Please try again.", vi: "Đã có lỗi xảy ra. Vui lòng thử lại." },
    successRegister: { en: "Account created! Please check your email to confirm.", vi: "Tài khoản đã tạo! Vui lòng kiểm tra email để xác nhận." },
    orContinueWith: { en: "Or continue with", vi: "Hoặc tiếp tục bằng" },
    google: { en: "Google", vi: "Google" },
    skipLogin: { en: "Continue without account", vi: "Tiếp tục không cần tài khoản" },
  },

  // ─── Dashboard ────────────────────────────────────────────────────────────
  dashboard: {
    title: { en: "My Dashboard", vi: "Tổng quan của tôi" },
    totalSubmissions: { en: "Total Submissions", vi: "Tổng số bài đã nộp" },
    task1: { en: "Task 1", vi: "Task 1" },
    task2: { en: "Task 2", vi: "Task 2" },
    avgBand: { en: "Average Band", vi: "Band trung bình" },
    bandProgression: { en: "Band Progression", vi: "Tiến bộ Band" },
    submissionHistory: { en: "Submission History", vi: "Lịch sử nộp bài" },
    recentFeedback: { en: "Recent Feedback", vi: "Phản hồi gần đây" },
    date: { en: "Date", vi: "Ngày" },
    taskType: { en: "Task Type", vi: "Loại bài" },
    prompt: { en: "Prompt", vi: "Đề bài" },
    overallBand: { en: "Overall Band", vi: "Band tổng" },
    scoringMethod: { en: "Method", vi: "Phương pháp" },
    language: { en: "Language", vi: "Ngôn ngữ" },
    viewDetail: { en: "View", vi: "Xem" },
    noSubmissions: { en: "No submissions yet. Practice your first essay!", vi: "Chưa có bài nộp. Hãy viết bài đầu tiên!" },
    aiExaminer: { en: "AI", vi: "AI" },
    ruleBased: { en: "Rule", vi: "Quy tắc" },
    prevPage: { en: "Previous", vi: "Trước" },
    nextPage: { en: "Next", vi: "Tiếp" },
    page: { en: "Page", vi: "Trang" },
    viewFull: { en: "View full feedback →", vi: "Xem phản hồi đầy đủ →" },
  },

  // ─── Common ───────────────────────────────────────────────────────────────
  common: {
    back: { en: "Back", vi: "Quay lại" },
    loading: { en: "Loading…", vi: "Đang tải…" },
    error: { en: "Something went wrong.", vi: "Đã có lỗi xảy ra." },
    words: { en: "words", vi: "từ" },
    draftSaved: { en: "Draft auto-saved locally. ⚠️ Simulated examiner — not official IELTS.", vi: "Nháp được lưu tự động. ⚠️ Chấm mô phỏng — không phải IELTS chính thức." },
    ai: { en: "AI Examiner", vi: "Chấm AI" },
    fallback: { en: "Rule-Based", vi: "Quy tắc" },
  },
} as const;

export type TranslationKey = typeof translations;

export function t<
  Section extends keyof TranslationKey,
  Key extends keyof TranslationKey[Section]
>(
  section: Section,
  key: Key,
  lang: Lang
): TranslationKey[Section][Key] extends { en: infer V; vi: unknown } ? V : never {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const entry = (translations[section] as any)[key];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (entry?.[lang] ?? entry?.["en"]) as any;
}

export default translations;
