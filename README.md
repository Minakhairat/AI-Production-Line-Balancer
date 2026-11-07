# AI Production Line Balancer | نظام موازنة خطوط الإنتاج والتحسين بالذكاء الاصطناعي

[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Gemini 3.8 Flash](https://img.shields.io/badge/Gemini_API-3.8_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](LICENSE)

An industrial engineering software suite and operations research optimization platform designed for manufacturing engineers, plant managers, and assembly line supervisors. It analyzes assembly line workloads, calculates deterministic line balancing metrics, detects critical bottlenecks, evaluates operator utilization, and computes mathematically validated balancing scenarios (RPW, LCR, Heuristics).

نظام هندسي متكامل ومتقدم لموازنة خطوط التجميع والإنتاج الصناعي وحساب زمن التاكت، كفاءة الخط، ونسب الفاقد، مع محرك تحسين رياضي مبني على بحوث العمليات وخوارزميات (RPW & LCR) ومساعد ذكاء اصطناعي خبير في الهندسة الصناعية.

---

## 🌟 Key Features | أهم المميزات

### 1. Interactive Yamazumi Balance Chart (مخطط يامازومي التفاعلي)
- High-fidelity stacked bar visualization for every workstation.
- 7 color-coded operational categories:
  - 🔵 **Manual Work** (عمل يدوي)
  - 🟣 **Machine Cycle** (تشغيل ماكينة)
  - 🟠 **Material Handling** (مناولة وتداول)
  - 🟢 **Operator Walking** (حركة ومشية الفني)
  - 🟩 **Quality Inspection** (فحص ومراقبة الجودة)
  - 🔴 **Packaging** (تغليف وتعبئة)
  - ⚪ **Automated Cycle** (دورة مؤتمتة)
- Reference horizontal lines for **Target Takt Time** and **Actual Line Cycle Time**.
- Visual glowing alerts for overloaded bottlenecks ($CT > T_{takt}$) and underutilized stations.
- Side inspector panel displaying detailed operational breakdowns with instant editing capability.

### 2. Deterministic Industrial Engineering Calculation Engine (المحرك الحسابي الهندسي)
Located at `src/utils/engineeringCalculationEngine.ts`:
- **Takt Time**:
  $$T_{takt} = \frac{\text{Net Available Production Time}}{\text{Customer Demand}}$$
- **Workstation Workload & Cycle Time**:
  Calculates single and parallel operator workloads, critical path, and concurrent machine cycles.
- **Line Balancing Efficiency**:
  $$E = \frac{\sum t_i}{N \times CT_{line}} \times 100\%$$
- **Balance Delay**:
  $$BD = 100\% - E$$
- **Theoretical Minimum Workstations & Operators**:
  $$N_{\min} = \left\lceil \frac{\text{Total Work Content}}{T_{takt}} \right\rceil$$
- **Smoothness Index (SI)**:
  $$SI = \sqrt{\sum (CT_{\max} - CT_i)^2}$$
- **Capacity Estimation**:
  Hourly and shift-based throughput calibrated with OEE (Overall Equipment Effectiveness).

### 3. Operations Research Optimization Engine (محرك التحسين الرياضي)
Generates 3 feasible, constraint-validated scenarios:
- **Scenario A: Workload Leveling (Helgeson-Birnie RPW)**
  Rebalances operations across existing workstations without capital expenditure or adding headcount.
- **Scenario B: Lean Headcount Reduction (Largest Candidate Rule)**
  Consolidates operations into fewer workstations/operators while strictly respecting customer demand.
- **Scenario C: Maximum Capacity Surge (Parallel Operators & Task Splitting)**
  Deconstructs critical bottleneck operations with dual operator assignments to maximize shift output.
- Strict topological precedence verification preventing backward assembly flows.

### 4. Time Study & Standard Work Sheet (دراسة الوقت والحركة)
- 14-column spreadsheet covering manual, machine, walking, handling, and automatic durations.
- Precedence dependency tagging and skill requirements.
- Native **5-Sheet Excel Workbook Export (`.xlsx`)** (Summary, Time Study, Workstations, Operators, Metrics).
- Full CSV export and Excel/CSV import parser.

### 5. Precedence Network DAG (مخطط التتابع والاعتماديات)
- Directed Acyclic Graph (DAG) viewer illustrating critical path dependencies.
- Kahn's algorithm cycle detection preventing deadlock dependency loops.

### 6. Formal 12-Section Technical Audit Report (التقرير الهندسي المعتمد)
- Ready for presentation to plant directors and clients.
- Includes formulas, bottleneck diagnostics, 3-phase Kaizen roadmap (Immediate, SMED, Cross-training), and sign-off blocks.
- One-click print / PDF export (`window.print()`).

### 7. AI Industrial Engineering Copilot (المستشار الهندسي الذكي)
- Powered by Google Gemini 3.8 Flash through a secure server-side proxy (`/api/ai/assistant`).
- Grounded strictly in calculated line data (never invents measurements or numbers).
- Bilingual responses with actionable shop-floor Kaizen recommendations.

---

## 🚀 Quick Start | البدء السريع

### Prerequisites
- Node.js 18.x or 20.x+
- npm or bun

### Installation
```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/ai-production-line-balancer.git

# Navigate into project directory
cd ai-production-line-balancer

# Install dependencies
npm install

# Start local full-stack development server (Port 3000)
npm run dev
```

Open `http://localhost:3000` in your web browser.

### Production Build
```bash
# Build Vite frontend and compile Express server
npm run build

# Start production server
npm start
```

---

## 📤 How to Publish to Your GitHub (طريقة النشر على حسابك في جيت هاب)

To push this repository to your own personal GitHub account:

### الخطوة 1: أنشئ مستودعاً جديداً على جيت هاب (Create a new GitHub Repository)
1. افتح متصفحك وسجل الدخول على [GitHub New Repository](https://github.com/new).
2. اكتب اسم المستودع، مثلاً: `ai-production-line-balancer`.
3. اختر المستودع **Public** أو **Private**.
4. **لا تضع علامة صح** على (Initialize with README) لأن المشروع يحتوي بالفعل على ملفات جاهزة.
5. اضغط زر **Create repository**.

### الخطوة 2: ربط المشروع المحلي ورفعه (Link & Push to GitHub)
افتح الطرفية (Terminal) في مجلد المشروع ونفّذ الأوامر التالية (استبدل `YOUR_USERNAME` باسم حسابك على جيت هاب):

```bash
# تهيئة المستودع وإضافة الملفات
git init
git add .
git commit -m "feat: initial release of AI Production Line Balancer"

# ضبط اسم الفرع الرئيسي
git branch -M main

# إضافة رابط مستودعك على جيت هاب
git remote add origin https://github.com/YOUR_USERNAME/ai-production-line-balancer.git

# رفع الكود بالكامل إلى جيت هاب
git push -u origin main
```

---

## 📁 Project Structure | هيكلية المشروع

```
ai-production-line-balancer/
├── index.html                   # HTML5 Entry Point with Cairo & IBM Plex Mono fonts
├── metadata.json                # AI Studio & Applet configuration
├── package.json                 # Dependencies & build scripts
├── server.ts                    # Express server with server-side Gemini 3.8 Flash proxy
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite build and Tailwind v4 configuration
├── src/
│   ├── App.tsx                  # Main Layout & Tab Router
│   ├── main.tsx                 # React 19 root bootstrap
│   ├── index.css                # Tailwind CSS v4 directives & print styling
│   ├── components/
│   │   ├── AIAssistantDrawer.tsx       # Gemini-powered IE copilot drawer
│   │   ├── DashboardView.tsx           # Executive KPIs, bottlenecks & status
│   │   ├── Navbar.tsx                  # Top header, live metrics, language toggle
│   │   ├── OperationModal.tsx          # 16-field operation creator/editor
│   │   ├── PrecedenceGraph.tsx         # Interactive DAG network viewer
│   │   ├── ProductionLinesView.tsx     # Line preset switcher & calibration
│   │   ├── ReportView.tsx              # 12-section printable audit report
│   │   ├── ScenarioComparisonView.tsx  # Side-by-side optimization matrix
│   │   ├── SettingsView.tsx            # JSON backup/restore & preferences
│   │   ├── Sidebar.tsx                 # Responsive 10-view navigation drawer
│   │   ├── TimeStudyTable.tsx          # 14-column spreadsheet with import/export
│   │   ├── WorkersView.tsx             # Operator roster & skills matrix
│   │   ├── WorkstationsView.tsx        # Workstation sequence & machinery layout
│   │   └── YamazumiChart.tsx           # Stacked bar Yamazumi balance chart
│   ├── context/
│   │   └── LineContext.tsx             # Centralized bilingual state management
│   ├── services/
│   │   ├── calculationEngine.ts        # Bridge to engineering engine
│   │   ├── calculationEngine.test.ts   # 11-step automated verification suite
│   │   ├── excelService.ts             # 5-sheet native Excel & CSV generator
│   │   ├── i18n.ts                     # Bilingual Arabic/English dictionary
│   │   ├── optimizationEngine.ts       # RPW, LCR & Capacity Surge algorithms
│   │   └── sampleData.ts               # 3 benchmark lines (Alternator, Phone, Compressor)
│   ├── types/
│   │   └── lineBalancing.ts            # Complete TypeScript domain interfaces
│   └── utils/
│       └── engineeringCalculationEngine.ts # Robust IE mathematical calculation engine
```

---

## 🧮 Industrial Engineering Formulations

| Metric | Formula | Industrial Meaning |
|---|---|---|
| **Takt Time** ($T_{takt}$) | $\frac{T_{gross} - T_{nonprod}}{\text{Customer Demand}}$ | The required production pace to meet customer demand exactly. |
| **Line Cycle Time** ($CT_{line}$) | $\max_{s} (CT_s)$ | Bottleneck workstation pacing the entire line. |
| **Line Efficiency** ($E$) | $\frac{\sum t_i}{N_{stations} \times CT_{line}} \times 100\%$ | Proportion of total work content to total available station capacity. |
| **Balance Delay** ($BD$) | $100\% - E$ | Percentage of idle time and unbalance losses across the line. |
| **Theoretical Min Stations** ($N_{\min}$) | $\left\lceil \frac{\sum t_i}{T_{takt}} \right\rceil$ | Minimum physical workstations required under ideal zero-delay conditions. |
| **Smoothness Index** ($SI$) | $\sqrt{\sum (CT_{line} - CT_s)^2}$ | Relative measure of workload smoothness among workstations. |
| **Shift Capacity** | $\left\lfloor \frac{T_{net}}{CT_{line}} \right\rfloor \times \text{OEE}$ | Expected net finished units per shift considering planned downtime and OEE. |

---

## 📄 License
Distributed under the Apache License 2.0.
Developed for manufacturing and industrial excellence.
