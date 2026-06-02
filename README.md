# EZO Content Engine

A structured-input generator for LLM-citation-optimized articles, built for B2B software in EZO's categories (ITAM, ITSM, CMMS, and equipment rental software).

The premise: buyers increasingly ask an AI assistant a question and act on the synthesized answer rather than searching, scrolling, and clicking. The defensible market position is being the source those assistants pull from and cite. This tool treats content as citation real estate, engineering each article around a specific buyer question and a specific quotable claim worth attributing to EZO.

## What it does

You supply structured inputs (product line, content type, funnel stage, target query, audience, competitors, verified facts, and the citation angle). The tool constructs a prompt enforcing citation-optimization rules and returns a draft in clean markdown, followed by notes flagging which sentences are the citation pull and what a human must verify before publishing.

## The human-in-the-loop guardrail

The model never invents a statistic. Verified facts are supplied as input, and anything unverified comes back as a flagged placeholder rather than a fabricated number. Editorial judgment is the gate, model velocity is the engine, nothing ships unreviewed.

## Architecture

The front end never touches the API key. It calls a Netlify serverless function at `/.netlify/functions/generate`, and that function reads the key from a Netlify environment variable and proxies the request to the Anthropic API. The key lives only in Netlify, never in the browser and never in this repo. This mirrors the architecture of the LinkedIn Post Generator: structured front-end inputs, a prompt-construction layer, and the API call isolated server-side.

```
src/EZOContentEngine.jsx        front end, calls the function
netlify/functions/generate.js   serverless function, holds the key
netlify.toml                    build and functions config
```

## Deploying to Netlify

1. Push this folder to a GitHub repository.
2. In Netlify, choose "Add new site" then "Import an existing project," and connect the repo.
3. Add your API key as an environment variable. In Site settings, under Environment variables, add a variable named `ANTHROPIC_API_KEY` with your key as the value. Do not put the key anywhere in the code.
4. Deploy. Netlify builds the front end and the function together, and injects the key into the function at runtime.

## Getting an API key

Create a key in the Anthropic Console under Settings, in the API keys section, and add a small amount of credit under billing. The calls this tool makes are small, so a few dollars covers extensive testing. Treat the key like a password: never commit it, never paste it into the front end, and rotate it if it is ever exposed.

## Note on the build setup

This repo includes the front-end component and the function. To run it as a full site you will need a standard React build setup (for example Vite) so `npm run build` produces the `dist` folder Netlify publishes. The component and the function are the parts specific to this tool; the build scaffolding is standard and can be generated with a Vite React template.

## Status

Working demonstration. Built to make the underlying content-systems thinking concrete rather than theoretical.
