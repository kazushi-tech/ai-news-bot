import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

const prompt = `以下URLの内容を50〜80字で日本語要約。前後説明やコードブロックは不要。
URL: https://ai.google.dev`;

(async () => {
  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      // ← URLコンテキスト（ブラウズ）
      tools: [{ urlContext: {} }],
    });
    console.log('OK:', result.response.text());
  } catch (e) {
    console.error('NG:', e?.response?.data ?? e.message);
    process.exit(1);
  }
})();
