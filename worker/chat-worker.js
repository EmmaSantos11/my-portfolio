/**
 * Cloudflare Worker — Google Gemini AI Chat backend for Bera's portfolio (100% Free)
 *
 * Deploy steps:
 *  1. Go to https://dash.cloudflare.com/ → Workers & Pages → Select your worker (chart-worker)
 *  2. Paste this file's contents into the Cloudflare Worker editor
 *  3. Add a secret: Settings → Variables and Secrets → Add Secret:
 *       Name:  GEMINI_API_KEY
 *       Value: <your free API key from https://aistudio.google.com/>
 *  4. Click "Save and Deploy"
 *  5. Your worker URL (https://chart-worker.ohamadikee98.workers.dev) is now powered by Gemini!
 */

const SYSTEM_PROMPT = `You are an AI assistant on the personal portfolio of Chidera Emmanuel Ohamadike.
Answer questions about his background, skills, projects, and experience in a friendly and professional tone.
Keep answers concise (2-4 sentences max). You can respond in English or French depending on what the user uses. Never make up information — only use the facts below.

ABOUT:
- Full name: Chidera Emmanuel Ohamadike
- Location: Abidjan, Côte d'Ivoire — open to remote work worldwide
- BSc Computer Science, Catholic University of Ghana, Fiapre (Jan 2020 – Oct 2024)
  Relevant coursework: IT Service Management, Database Design, Systems Analysis
- Roles: Software Developer | AI Quality Analyst | Data Annotator | Prompt Engineer
- Languages spoken fluently: English and French
- Actively seeking remote roles in Data Science, AI/ML Engineering, or Prompt Engineering

SKILLS:
- Programming: Python (expert), SQL, JavaScript, Java, C++, C#
- AI/ML/NLP: scikit-learn, NLTK, Numpy, Pandas, NLP, Sentiment Analysis, Text Classification,
  Prompt Engineering, LLM Evaluation, Multi-turn Conversation Analysis, Graph Models, Knowledge Graphs
- Tools: ChatGPT/LLM Interfaces, Git, GitHub, Postman, VS Code, Streamlit, Microsoft Office (Excel, Word)
- Platforms: Linux, Web-based AI Tools, Cloud (basic AWS/Heroku), Remote Work Systems
- Soft Skills: Analytical Thinking, Attention to Detail, Critical Reasoning, Written Communication, Problem-Solving, Adaptability

AI & LLM EXPERIENCE:
- Designed and tested prompts to evaluate AI response quality (accuracy, coherence, relevance, helpfulness)
- Compared LLM outputs for contextual relevance and consistency across multi-turn conversations
- Simulated real-world conversations to assess model personalisation and consistency
- Applied structured reasoning frameworks to evaluate and document model performance
- Annotated and classified datasets for NLP training and validation

PROFESSIONAL EXPERIENCE:
1. Field Agent | CJ Grand Group, Abidjan (Jan 2024 – Present, full-time from Jan 2025)
   - Managed customer currency exchange transactions with high accuracy
   - Assisted clients in purchasing vehicles and real estate with clear guidance
   - Handled daily client interactions and ensured professional relationship management
   - Prepared detailed end-of-day operational and financial reports
   - Strengthened attention to detail, financial accuracy, and communication skills
2. Teaching Assistant | Catholic University of Ghana, Fiapre (Jan 2023 – Oct 2024)
   - Assisted instructors with student assessments, class planning, and academic material organisation
   - Streamlined academic documentation processes, enhancing course efficiency
   - Mentored students in the completion of assignments and research projects
   - Facilitated scholarly discussions and provided guidance on technical subjects

PROJECTS:
1. Sentiment Analysis-Based Election Prediction System — live at https://sentiment-election-predict.streamlit.app
   Predictive model using sentiment analysis of social media comments to forecast election outcomes.
   Built NLP system for sentiment classification. Python, MySQL, Streamlit, X (Twitter) API. (Jan 2024 – present)
2. Clinical Rotation Management Web App — web system for student practicum: scheduling, attendance tracking,
   performance evaluation, document management. JavaScript.
3. Twitter-Driven Voting System — community voting powered by social media analytics and sentiment analysis. Python.
4. Forex Bot AI (in progress) — AI-powered Forex trading bot with ML pattern recognition and risk management. Python.
5. Bera E-Commerce Website (in progress) — full-featured online store with cart, user auth, and payment integration.
6. Netflix Clone (in progress) — responsive landing + login UI replicating Netflix's design. HTML/CSS/JS.
7. Find My iPhone Web App — tracks iPhone via iCloud credentials/IMEI on an interactive map. Python, Streamlit, Google Maps.
8. Tetris — classic Tetris built in vanilla JavaScript. HTML/CSS/JS.
9. The Plastic Ocean 3D — interactive Three.js WebGL ocean scene. HTML/CSS/JS.

RESUME:
- English CV available for download on the portfolio
- French CV (CV en français) also available for download on the portfolio

CONTACT:
- Email: ohamadikee98@gmail.com
- GitHub: https://github.com/EmmaSantos11
- LinkedIn: https://www.linkedin.com/in/emmanuel-ohamadike-767195196/
- Instagram: @_bera_santos
- X/Twitter: @bera_santos2
- Open to remote opportunities worldwide`;

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 });
    }

    const userMessage = (body.message || '').slice(0, 500);
    if (!userMessage) {
      return new Response(JSON.stringify({ error: 'No message provided' }), { status: 400 });
    }

    const apiKey = (env && env.GEMINI_API_KEY) || (typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : null) || (env && env.ANTHROPIC_API_KEY) || (typeof ANTHROPIC_API_KEY !== 'undefined' ? ANTHROPIC_API_KEY : null) || 'AIzaSyBgyKIbQIl_UpkRwMZ35uzbGcrSK8JVR90';
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured in Cloudflare environment' }), {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      });
    }

    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest'
    ];

    let geminiRes = null;
    let lastErrBody = '';

    for (const model of candidateModels) {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: userMessage }],
            },
          ],
          generationConfig: {
            maxOutputTokens: 350,
          },
        }),
      });

      if (geminiRes.ok) {
        break;
      } else {
        lastErrBody = await geminiRes.text();
        if (geminiRes.status === 401 || (geminiRes.status === 400 && lastErrBody.includes('API_KEY'))) {
          break; // Stop if the key itself is invalid
        }
      }
    }

    if (!geminiRes || !geminiRes.ok) {
      return new Response(JSON.stringify({ error: 'AI service error', status: geminiRes ? geminiRes.status : 500, detail: lastErrBody }), {
        status: 502,
        headers: { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' },
      });
    }

    const geminiData = await geminiRes.json();
    const reply = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';

    return new Response(JSON.stringify({ reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};
