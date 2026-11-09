# AI Production Line Balancer | نظام موازنة خطوط الإنتاج والتحسين بالذكاء الاصطناعي

> **تصميم وبرمجة وتطوير:** المهندس مينا خيرت (Eng. Mina Khairat)  
> **رقم الموبايل / واتساب:** 01200224513 (+20 1200224513)  
> **البريد الإلكتروني:** minakhairat1@gmail.com  
> **حقوق الملكية الفكرية:** جميع الحقوق محفوظة © 2026

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/Gemini_API-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-222222?logo=github&logoColor=white)](https://pages.github.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com/)

نظام هندسي صناعي متكامل ومتقدم لموازنة خطوط التجميع والإنتاج الصناعي، حساب زمن التاكت، كفاءة الخط، ونسب الفاقد، مع محرك تحسين رياضي مبني على بحوث العمليات وخوارزميات (RPW & LCR) ومساعد ذكاء اصطناعي خبير في الهندسة الصناعية.

---

## 🌐 كيفية نشر الموقع أونلاين مجاناً عبر جيت هاب (How to Deploy Online via GitHub)

المشروع مجهز بالكامل بملفات النشر التلقائي (`.github/workflows/deploy.yml` و `vercel.json` و `netlify.toml`). يمكنك نشره وجعله متاحاً أونلاين على الإنترنت بأحد الطرق التالية:

---

### الطريقة الأولى: النشر التلقائي عبر GitHub Pages (مجاناً 100%)

1. **ارفع الكود إلى مستودعك على GitHub:**
   ```bash
   git add .
   git commit -m "feat: release AI Production Line Balancer"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

2. **تفعيل النشر التلقائي من إعدادات المستودع على GitHub:**
   - ادخل على صفحة المستودع في GitHub.
   - اضغط على **Settings** في التبويبات العلوية.
   - من القائمة الجانبية اليسرى اختر **Pages**.
   - تحت قسم **Build and deployment**:
     - في خانة **Source** اختر: **`GitHub Actions`**.
   - بمجرد اختيارها، سيبدأ ملف العمل المبرمج مسبقاً (`.github/workflows/deploy.yml`) في بناء الموقع ورفعه تلقائياً.
   - خلال دقيقة واحدة ستجد رابط موقعك المباشر في نفس الصفحة:
     `https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/`

---

### الطريقة الثانية: النشر الفوري بنقرة واحدة عبر Vercel (أسرع وأسهل رابط مباشر)

1. سجل الدخول إلى موقع **[Vercel.com](https://vercel.com)** باستخدام حساب GitHub الخاص بك.
2. اضغط على **Add New Project**.
3. اختر مستودع المشروع من القائمة (Import).
4. اضغط زر **Deploy** مباشرة (المشروع يحتوي بالفعل على `vercel.json` المعد تلقائياً).
5. خلال 30 ثانية ستحصل على رابط حي وسريع جداً مع شهادة أمان مجانية (SSL):
   `https://ai-production-line-balancer.vercel.app`

---

## 🌟 أهم إمكانيات ومميزات النظام (Core Features)

### 1. مخطط يامازومي التفاعلي (Interactive Yamazumi Balance Chart)
- عرض بياني متراكم لكل محطة عمل يوضح توزيع أزمنة العمليات بالثواني.
- تقسيم العمليات إلى 7 فئات لونية معتمدة هندسياً:
  - 🔵 **عمل يدوي (Manual Work)**
  - 🟣 **تشغيل ماكينة (Machine Cycle)**
  - 🟠 **مناولة وتداول (Material Handling)**
  - 🟢 **حركة ومشية الفني (Operator Walking)**
  - 🟩 **فحص ومراقبة جودة (Quality Inspection)**
  - 🔴 **تغليف وتعبئة (Packaging)**
  - ⚪ **دورة مؤتمتة بالكامل (Automated)**
- خطوط مرجعية أفقية لزمن التاكت المستهدف وزمن دورة الخط الفعلي (عنق الزجاجة).
- لوحة فحص جانبية لمعاينة وتعديل أزمنة أي عملية بنقرة واحدة.

### 2. المحرك الحسابي الهندسي الدقيق (`src/utils/engineeringCalculationEngine.ts`)
- **زمن التاكت (Takt Time):**
  $$T_{takt} = \frac{\text{صافي وقت الإنتاج المتاح بالثواني}}{\text{طلب العميل المطلوب بالوحدات}}$$
- **حساب أحمال محطات العمل والعمالة المتوازية (Parallel Operators):**
  تقسيم أحمال المشغلين المتعددين داخل نفس المحطة بخوارزمية LPT ومراعاة التتابع.
- **كفاءة توازن الخط (Line Efficiency):**
  $$E = \frac{\sum t_i}{N_{stations} \times CT_{line}} \times 100\%$$
- **نسبة الفاقد والتشتت (Balance Delay):**
  $$BD = 100\% - E$$
- **الحد الأدنى النظري للمحطات:**
  $$N_{\min} = \left\lceil \frac{\text{إجمالي محتوى العمل}}{T_{takt}} \right\rceil$$
- **مؤشر النعومة وتناسق الأحمال (Smoothness Index):**
  $$SI = \sqrt{\sum (CT_{line} - CT_s)^2}$$
- **الطاقة الإنتاجية:** حساب الطاقة الفعلية بالساعة والوردية بمعامل فاعلية المعدات (OEE).

### 3. محرك التحسين وبحوث العمليات (3 Optimization Scenarios)
- **سيناريو أ (تسوية الأحمال - RPW):** إعادة توزيع العمليات بدون تكاليف رأسمالية باستخدام خوارزمية الأوزان المكانية المرتّبة (Helgeson-Birnie).
- **سيناريو ب (تقليص العمالة - LCR):** دمج محطات العمل وتقليص عدد العمالة مع الالتزام بتلبية طلب العميل.
- **سيناريو ج (طاقة الذروة القصوى):** تخصيص عمالة متوازية وتجزئة عمليات عنق الزجاجة لمضاعفة الطاقة الإنتاجية للوردية.

### 4. دراسة الوقت والتصدير لإكسل (Time Study & Excel Generator)
- جدول تفصيلي بـ 14 حقلاً هندسياً شاملاً.
- تصدير مصنف **Excel أصلي مكوّن من 5 أوراق عمل متكاملة** (`.xlsx`).
- تصدير واستيراد ملفات CSV و Excel.

### 5. تقرير هندسي رسمي معتمد (12-Section Audit Report)
- تقرير فني شامل بـ 12 قسماً معتمداً للطباعة والتصدير كـ PDF (`window.print()`).
- يتضمن المعادلات المطبقة، وخطة كايزن التنفيذية، وخانات التوقيع والاعتماد.

### 6. المستشار الهندسي الذكي (AI Copilot)
- مدعوم بنموذج Google Gemini 3.8 Flash مع محاكاة هندسية داخلية في حال النشر الاستاتيكي بدون سيرفر.
- يقدم حلول كايزن واقعية مستندة على الأرقام الفعلية لخط الإنتاج.

---

## 💻 التشغيل المحلي (Local Development)

```bash
# تثبيت الحزم
npm install

# تشغيل بيئة التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## 👨‍💼 حقوق النشر والتواصل (Author & Contact)

- **الاسم:** المهندس مينا خيرت (Eng. Mina Khairat)
- **الهاتف / واتساب:** 01200224513 (+20 1200224513)
- **البريد الإلكتروني:** minakhairat1@gmail.com
- **التخصص:** Lead Industrial Systems Engineer & Full-Stack Developer
- **الترخيص:** جميع الحقوق محفوظة © 2026 - نظام موازنة خطوط الإنتاج بالذكاء الاصطناعي (Apache 2.0).
