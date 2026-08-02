# JUET Helpdesk Chatbot — Interview Q&A Script

Use this as a quick reference for technical interviews. It explains how the chatbot protects the Gemini API key and delivers streaming responses.

---

## Q1: Walk me through the high-level architecture of this chatbot.

**A:** The chatbot is a React + TypeScript frontend that talks to a Supabase Edge Function. The flow is:

1. **User sends a message** from the chat widget in the browser.
2. **React calls the Edge Function** at `/functions/v1/chat` using the Supabase anon key.
3. **Edge Function checks rate limits and cache**, then forwards the request to the Lovable AI Gateway with the model `google/gemini-2.5-flash`.
4. **Gateway streams the AI response** back through the Edge Function.
5. **Frontend reads the stream** and updates the chat message in real time.

The AI only answers questions about JUET Guna because a strict system prompt limits it to the provided knowledge base.

---

## Q2: How does the chatbot protect the Gemini API key?

**A:** The API key is never exposed to the browser. It lives as a **Supabase secret** named `LOVABLE_API_KEY` and is read inside the Edge Function using:

```ts
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
```

The frontend only sends its **Supabase anon key** (which is meant to be public), not the AI API key. The Edge Function acts as a secure proxy: it receives the user's message, attaches the hidden API key, and calls the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) on the user's behalf.

**Why this matters:** If we called Gemini directly from the browser, anyone could inspect the network tab or source code, steal the key, and abuse it or run up costs. Keeping the key server-side prevents that.

---

## Q3: How does the streaming response work end-to-end?

**A:** Streaming is enabled in two places.

### Backend (Edge Function)

The Edge Function requests a streaming response from the AI gateway:

```ts
const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "google/gemini-2.5-flash",
    messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
    stream: true,
  }),
});

return new Response(response.body, {
  headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
});
```

The response body is a **Server-Sent Events (SSE)** stream, so the AI tokens arrive as they are generated.

### Frontend (React hook)

The `useChat` hook reads the stream using a `ReadableStream` reader:

```ts
const reader = resp.body.getReader();
const decoder = new TextDecoder();
let buffer = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buffer += decoder.decode(value, { stream: true });

  // Split by newline, parse SSE lines, and append content
  // to the last assistant message
}
```

Each chunk contains a partial token like:

```
data: {"choices":[{"delta":{"content":"Hello"}}]}
```

The hook extracts `choices[0].delta.content` and appends it to the current assistant message, so the user sees the answer typing out live.

---

## Q4: What happens if a user spams the chatbot?

**A:** The Edge Function has in-memory **rate limiting**: 20 requests per minute per IP address. If the limit is exceeded, it returns a `429 Too Many Requests` response, and the frontend shows a friendly toast message asking the user to wait.

```ts
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;
```

---

## Q5: Does the chatbot always call the AI model, or are some responses cached?

**A:** Common questions are cached for **1 hour** to reduce API costs and improve response speed. Before hitting the AI gateway, the Edge Function checks the user's last message for keywords like "fees", "placements", "hostel", "admission", etc. If it matches, it returns a pre-written response through the same SSE stream format, so the frontend does not need to handle it differently.

---

## Q6: What error handling is in place?

**A:** The frontend handles:

- `429` — rate limit exceeded
- `402` — service/billing issue from the gateway
- Network failures — shows a toast and removes any empty assistant message

The backend handles:

- Missing `LOVABLE_API_KEY` → `500`
- AI gateway rate limits → `429`
- Gateway billing errors → `402`
- Unknown errors → `500`

---

## Q7: Why use an Edge Function instead of a traditional backend server?

**A:** Supabase Edge Functions are serverless and run close to the user. We don't need to provision, scale, or maintain a server. They also integrate natively with Supabase secrets, so the API key is stored securely and injected into the function at runtime. This keeps the architecture simple, cost-effective, and secure.

---

## Quick Summary (30-Second Pitch)

> The JUET Helpdesk Chatbot is a React frontend backed by a Supabase Edge Function. The Gemini API key is stored as a Supabase secret and only accessed server-side, so users never see it. The frontend sends messages to the Edge Function, which forwards them to the Lovable AI Gateway with `stream: true`. The response comes back as an SSE stream, and the frontend reads it chunk-by-chunk to render the answer live in the chat UI. Rate limiting and caching are added to keep the system fast and cost-controlled.

---

*Good luck with your interview!*
