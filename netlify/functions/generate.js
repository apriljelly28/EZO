// netlify/functions/generate.js
// Serverless function that holds the Anthropic API key server-side and
// proxies the request. The key is read from a Netlify environment variable
// named ANTHROPIC_API_KEY and is never exposed to the browser or the repo.

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server is missing ANTHROPIC_API_KEY. Add it in Netlify environment variables." }),
    };
  }

  let prompt;
  try {
    const parsed = JSON.parse(event.body || "{}");
    prompt = parsed.prompt;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid request body." }) };
  }

  if (!prompt) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt." }) };
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1600,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { statusCode: response.status, body: JSON.stringify({ error: data.error?.message || "API error" }) };
    }

    const text = (data.content || [])
      .filter((i) => i.type === "text")
      .map((i) => i.text)
      .join("\n");

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: "Generation failed: " + err.message }) };
  }
};
