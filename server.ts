import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'AI Production Line Balancer' });
});

// Server-side Gemini AI Endpoint
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { prompt, context, language = 'ar' } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Fallback helpful offline engineering answer if key is not injected yet
      const fallbackMsg =
        language === 'ar'
          ? `[استجابة المحاكي الهندسي الداخلي]: بناءً على بيانات خط الإنتاج المدخلة:
- زمن التاكت المحسوب: ${context?.taktTime || 'N/A'} ثانية.
- زمن دورة الخط (عنق الزجاجة): ${context?.lineCycleTime || 'N/A'} ثانية.
- كفاءة توازن الخط: ${context?.lineEfficiency || 'N/A'}%.
توصية مهندس النظم الصناعية:
1. لنقل المهام غير الحرجة من محطة عنق الزجاجة إلى المحطات التالية ذات نسبة الاستغلال المنخفضة.
2. تقليص أوقات المناولة والمشي (Waste Elimination) باستخدام مبادئ Kaizen و 5S.
3. دراسة تجزئة العمليات القابلة للفصل وتطبيق العمل المتوازي (Parallel Stations).`
          : `[Engineering Simulator Response]: Based on your line data:
- Takt Time: ${context?.taktTime || 'N/A'}s
- Line Cycle Time: ${context?.lineCycleTime || 'N/A'}s
- Balancing Efficiency: ${context?.lineEfficiency || 'N/A'}%
Recommendations:
1. Reallocate non-critical work content from bottleneck station to adjacent underutilized stations.
2. Eliminate non-value-added walking and handling time using Kaizen and 5S principles.
3. Consider parallel workstations or task splitting for long operations.`;

      res.json({ text: fallbackMsg });
      return;
    }

    const ai = new GoogleGenAI();
    const systemInstruction = `You are a Senior Industrial Engineer, Operations Research Specialist, and Production Systems Architect.
You advise manufacturing engineers on assembly line balancing, cycle time reduction, bottleneck analysis, and Kaizen.
CRITICAL RULES:
1. NEVER invent measurements or numerical metrics. Always base calculations strictly on the provided JSON context (Takt time, line cycle time, station workloads, line efficiency, balance delay, idle times).
2. Answer in the user's requested language (${language === 'ar' ? 'Arabic with technical English terms in parentheses (e.g. زمن التاكت Takt Time, كفاءة الخط Line Efficiency)' : 'English with precise Industrial Engineering terms'}).
3. Provide structured, practical, shop-floor actionable engineering recommendations. Cite specific Station IDs, Operation IDs, and exact cycle seconds.
4. When comparing scenarios (Scenario A: Leveling, Scenario B: Lean Headcount, Scenario C: Maximum Capacity), explain trade-offs clearly.`;

    const userPrompt = `Production Line Context:
${JSON.stringify(context, null, 2)}

User Question / Engineering Inquiry:
${prompt}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\n${userPrompt}` }],
        },
      ],
    });

    res.json({ text: response.text || '' });
  } catch (error: any) {
    console.error('Error in /api/ai/assistant:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate AI response' });
  }
});

// Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

startServer();
