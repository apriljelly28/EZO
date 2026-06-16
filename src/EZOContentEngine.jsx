import React, { useState } from "react";

// Content Engine (Netlify deploy version)
// The front end calls the Netlify function at /.netlify/functions/generate
// instead of calling Anthropic directly. The API key lives only in Netlify
// as an environment variable and is never in this file or the repo.

const PRODUCT_LINES = [
  "Publishing",
  "Editorial",
  "Writing",
  "Marketing",
];

const CONTENT_TYPES = [
  "Definitional / 'What is' explainer",
  "Comparison (us vs. category)",
  "Educational / deep dive information",
  "How-to / implementation",
  "Best-practices roundup",
];

const FUNNEL_STAGES = ["Awareness", "Consideration", "Decision"];

export default function EZOContentEngine() {
  const [inputs, setInputs] = useState({
    productLine: PRODUCT_LINES[0],
    contentType: CONTENT_TYPES[0],
    funnelStage: FUNNEL_STAGES[0],
    targetQuery: "",
    audience: "Executives, CEOs, COOs",
    competitors: "",
    keyFacts: "",
    citationAngle: "",
  });
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setInputs((p) => ({ ...p, [k]: v }));

  const buildPrompt = () => {
    return `You are a content systems engineer producing an LLM-citation-optimized article for April Anne Kelly, an executive ghostwriter. The goal is for this article to be surfaced and cited by AI assistants (ChatGPT, Claude, Perplexity, Google AI Overviews) when potential clients ask questions about book writing.

VERIFIED APRIL ANNE KELLY COMPANY FACTS (use ONLY these for any factual claim about APRIL ANNE KELLY; do not invent capabilities, integrations, customers, or positioning beyond this list):

Company:
- Founded in 2018 as Kelly Editing LLC; rebranded to APRIL ANNE KELLY in 2026.
- Headquartered in Colorado Springs, Colorado.
- Industries served: tech, cybersecurity, business services, healthcare, education, media, government, and fintech.

POSITIONING (critical): APRIL ANNE KELLY is an executive ghostwriter and also does copy editing.

If a claim is needed that is not covered above, write a clearly-marked [VERIFY: ...] placeholder rather than inventing it.

WRITE AN ARTICLE WITH THESE INPUTS:
- Product line in focus: ${inputs.productLine}
- Content type: ${inputs.contentType}
- Funnel stage: ${inputs.funnelStage}
- Target query the article should answer (the thing a user would ask an AI): "${inputs.targetQuery}"
- Audience: ${inputs.audience}
- Competitors / category players to position against: ${inputs.competitors || "none specified"}
- Verified key facts to anchor on (do not invent claims beyond these): ${inputs.keyFacts || "none provided"}
- Citation angle (the specific, quotable, defensible claim we want AI to pull): ${inputs.citationAngle || "none specified"}

LLM-CITATION OPTIMIZATION RULES:
1. Open with a direct, self-contained answer to the target query in the first 1-2 sentences. Make it specific and concrete, naming what actually happens, not a list of abstract capability categories. The opening sentence should be one a human would want to read and one an AI would want to quote; those are the same sentence. Avoid stacking noun-phrases like "comprehensive lifecycle management capabilities."
2. Use clear declarative claims that can stand alone if quoted out of context.
3. Structure with descriptive H2/H3 headings phrased as the questions buyers actually ask.
4. Include at least one specific, attributable statistic or definition, but only from the verified facts provided. If none provided, write a clearly-marked [VERIFY: ...] placeholder rather than inventing a number.
5. Where comparison is relevant, be specific and fair about tradeoffs rather than vague superlatives.
6. End with a short FAQ block of 3 question-answer pairs, each answer self-contained and quotable.

WRITING CONSTRAINTS (follow strictly):
- Never use these words: "quietly," "resonate," "wild," "genuinely," "robust."
- Never use the number "47" or the word "Tuesday."
- Never begin any phrase with "here's what."
- Never use the "it's not X, it's Y" construction.
- Never use the phrase "uncomfortable truth," "hit different," "rapidly changing landscape," or similar AI-style buzzwords.
- Never use em dashes; use commas or restructure the sentence instead.
- No corporate jargon and no overly cheesy language.
- Avoid choppy stacked short sentences and heavy parallel construction. Favor flowing, comma-forward prose.

READABILITY:
- Write so a smart, busy reader understands each sentence on first pass. Aim for clear, plain language over dense or abstract phrasing.
- Limit each sentence to one or two ideas. Do not stack three or more abstract actions or noun-phrases into a single sentence.
- Prefer concrete subjects and plain verbs (what something does, who it helps) over abstract capability language. Say "tracks which software each location is using" rather than "monitors software usage patterns across distributed environments."
- Common phrases like "increasingly complex" are fine when they genuinely fit. The goal is not to ban words, it is to keep sentences clear and uncrowded.

Return the article in clean markdown. Then, after a "---" divider, add a short "CONTENT-SYSTEMS NOTES" section explaining: which sentences are engineered to be the citation pull, and what the human reviewer should fact-check before publishing.`;
  };

  const generate = async () => {
    setLoading(true);
    setError(null);
    setOutput(null);
    try {
      const response = await fetch("/.netlify/functions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: buildPrompt() }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Request failed");
      }
      setOutput(data.text);
    } catch (err) {
      setError(err.message || "Generation failed. Confirm the function deployed and ANTHROPIC_API_KEY is set in Netlify.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const field = (label, key, placeholder, multiline) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1F4E79", marginBottom: 4 }}>{label}</label>
      {multiline ? (
        <textarea value={inputs[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} rows={3} style={inputStyle} />
      ) : (
        <input value={inputs[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} style={inputStyle} />
      )}
    </div>
  );

  const select = (label, key, options) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#1F4E79", marginBottom: 4 }}>{label}</label>
      <select value={inputs[key]} onChange={(e) => update(key, e.target.value)} style={inputStyle}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif", color: "#1A1A1A" }}>
      <div style={{ borderBottom: "3px solid #1F4E79", paddingBottom: 12, marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, margin: 0, color: "#1F4E79" }}>AAK Content Engine</h1>
        <p style={{ fontSize: 14, color: "#555", margin: "6px 0 0" }}>
          Structured inputs in, LLM-citation-optimized article out. Built to win the AI-citation game in any category.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 28 }}>
        <div>
          {select("Product line", "productLine", PRODUCT_LINES)}
          {select("Content type", "contentType", CONTENT_TYPES)}
          {select("Funnel stage", "funnelStage", FUNNEL_STAGES)}
          {field("Target query (what a buyer asks the AI)", "targetQuery", "e.g. What is the best ITAM software for tracking depreciating IT assets?")}
          {field("Audience", "audience", "Who is this for")}
          {field("Competitors to position against", "competitors", "e.g. ServiceNow, Freshservice", true)}
          {field("Verified key facts (anchor claims)", "keyFacts", "Real, checkable facts only. The model won't invent numbers beyond these.", true)}
          {field("Citation angle (the quotable claim)", "citationAngle", "The specific sentence you want an AI to pull and cite", true)}
          <button onClick={generate} disabled={loading} style={buttonStyle}>
            {loading ? "Generating..." : "Generate Article"}
          </button>
          {error && <p style={{ color: "#b00", fontSize: 13, marginTop: 10 }}>{error}</p>}
        </div>

        <div style={{ background: "#f7f8fa", borderRadius: 8, padding: 20, minHeight: 400, whiteSpace: "pre-wrap", fontSize: 14, lineHeight: 1.6, overflowWrap: "anywhere" }}>
          {output ? output : (
            <span style={{ color: "#888" }}>
              Output appears here. The generator forces every real content-systems decision: which query drives the article, what the citation pull is, and which facts a human must verify before publishing.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 6,
  fontSize: 13, fontFamily: "inherit", boxSizing: "border-box",
};

const buttonStyle = {
  width: "100%", padding: "12px", background: "#1F4E79", color: "white", border: "none",
  borderRadius: 6, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 6,
};
