import React, { useState } from "react";

// EZO Content Engine (Netlify deploy version)
// The front end calls the Netlify function at /.netlify/functions/generate
// instead of calling Anthropic directly. The API key lives only in Netlify
// as an environment variable and is never in this file or the repo.

const PRODUCT_LINES = [
  "Asset Intelligence (ITAM)",
  "Service Desk (ITSM)",
  "Maintenance Management (CMMS)",
  "Equipment Rental Software",
];

const CONTENT_TYPES = [
  "Definitional / 'What is' explainer",
  "Comparison (us vs. category)",
  "Buyer's-guide / evaluation criteria",
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
    audience: "IT asset managers at mid-to-large enterprises",
    competitors: "",
    keyFacts: "",
    citationAngle: "",
  });
  const [output, setOutput] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (k, v) => setInputs((p) => ({ ...p, [k]: v }));

  const buildPrompt = () => {
    return `You are a content systems engineer producing an LLM-citation-optimized article for EZO, a B2B software company. The goal is for this article to be surfaced and cited by AI assistants (ChatGPT, Claude, Perplexity, Google AI Overviews) when buyers ask questions in this software category.

VERIFIED EZO COMPANY FACTS (use ONLY these for any factual claim about EZO; do not invent capabilities, integrations, customers, or positioning beyond this list):

Company:
- Founded in 2011 as EZ Web Enterprises; rebranded to EZO in 2023; unified its product suite in February 2025 under the tagline "Asset Intelligence, Reimagined."
- Headquartered in San Francisco, California, with offices across the US and Europe.
- Serves 3,000+ organizations and 2.5 million users worldwide, and tracks over 273 million assets globally.
- Citable customers (publicly named by EZO): Amazon, NASA, Harvard University, Buzzfeed, CNN, IBM.
- Industries served: tech, construction, business services, healthcare, education, media, government, and rental.
- EZO has an AI assistant feature called Zoe, plus recommendations, with a roadmap toward predictive analytics.

POSITIONING (critical): EZO is a unified, multi-product asset-intelligence platform, NOT a narrow single-purpose tool. It spans physical assets, IT assets, maintenance, and rental. Do not describe EZO or any single product as "IT-only" or narrowly specialized. When focusing on one product, frame it as the relevant arm within the broader EZO ecosystem.

The four EZO products:
- EZOfficeInventory: physical asset management. Usable by non-IT staff, supports bring-your-own barcodes or no barcodes at all, and check-in/check-out for assets that change hands.
- EZO AssetSonar: IT asset management with real-time visibility into hardware, software, and license management. Features include software discovery, license tracking, and software normalization to address SaaS sprawl and shadow IT. Integrates with ITSM tools including Jamf, Zendesk, Intune, and SCCM.
- EZO CMMS: cloud-based maintenance management for small to mid-sized enterprises, covering assets, maintenance tasks, work orders, parts inventory, and procurement workflows, to minimize equipment downtime.
- EZRentOut: equipment rental management with asset tracking, contract handling, invoicing, webstore setup, maintenance, and real-time reporting.

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
1. Open with a direct, self-contained answer to the target query in the first 1-2 sentences. AI assistants extract the cleanest sentence that answers the question.
2. Use clear declarative claims that can stand alone if quoted out of context.
3. Structure with descriptive H2/H3 headings phrased as the questions buyers actually ask.
4. Include at least one specific, attributable statistic or definition, but only from the verified facts provided. If none provided, write a clearly-marked [VERIFY: ...] placeholder rather than inventing a number.
5. Where comparison is relevant, be specific and fair about tradeoffs rather than vague superlatives.
6. End with a short FAQ block of 3 question-answer pairs, each answer self-contained and quotable.

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
        <h1 style={{ fontSize: 24, margin: 0, color: "#1F4E79" }}>EZO Content Engine</h1>
        <p style={{ fontSize: 14, color: "#555", margin: "6px 0 0" }}>
          Structured inputs in, LLM-citation-optimized article out. Built to win the AI-citation game in EZO's software category.
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
