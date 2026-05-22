# Chat Personas

N.O.M.A.D. ships with a set of opinionated **chat personas** — system prompts that give the AI Assistant a specific domain expertise and voice for off-grid and grid-down scenarios. Pick a persona from the chat header and the assistant answers as a journeyman electrician, a wilderness medic, a rural vet, and so on, instead of a generic chatbot.

Personas are an **opt-out feature** — they're on by default. If you want the chat to behave like upstream NOMAD (a generic helpful assistant with markdown formatting only), you can turn them off entirely from Settings.

---

## Why personas?

A single generic system prompt produces generic answers. Asking "what wire do I need for a 30A 12V run over 50 feet" of a default chatbot gives you a watered-down explanation with disclaimers about consulting a professional. Asking it of an **Electrician** persona gives you "2 AWG for less than 3% voltage drop, 4 AWG if you can tolerate 4.5%, fuse the wire not the load."

The personas also share a baseline off-grid framing — they assume you don't have reliable grid power, internet, cell service, or commercial supply chains, and they answer with that constraint in mind instead of suggesting you call the utility company or look something up online.

---

## The built-in personas

| Persona | Specialty |
|---|---|
| **Generalist** | Broad practical skills for off-grid and grid-down living. The default choice when you're not sure. |
| **Medic** | Wilderness and austere medicine. Triage-first, conservative on dosing, escalates clearly. |
| **Electrician** | Residential wiring, 12V automotive, off-grid solar and battery systems. NEC-aware. |
| **Mechanic** | Vehicles, small engines, generators, hydraulics, fuel systems. Diagnose first, repair second. |
| **Plumber** | Water supply, drains, vents, septic, frozen pipes, hot water. Gravity-fed and pressurized systems. |
| **Builder** | Framing, roofing, foundations, structural repairs, sheds and outbuildings. Hand-tool friendly. |
| **Bushcraft** | Primitive and low-supply wilderness skills. Hard off-grid lean — assume nothing. |
| **Comms Operator** | Amateur radio, GMRS, FRS, antennas, propagation, emergency communications. |
| **Homesteader** | Food production and preservation, livestock, gardening, water management, seasonal planning. |
| **Vet** | Animal health for homestead livestock and working animals. Diagnoses, basic treatment, when to cull. |
| **Security Planner** | Defensive security — home hardening, OPSEC, evacuation planning, threat assessment. Not tactical/offensive. |
| **Grid** | Connected-world assistant. Recommends websites, online tutorials, manufacturer docs, and grid-dependent services freely. Pick this when you're online and want normal-life answers. |
| **Custom** | Your own persona. Starts as a placeholder; edit it on the Personas page to define behavior, voice, and rules of your own. |

---

## Using a persona

1. Open the chat (`/chat`).
2. In the chat header, pick a persona from the **Persona** dropdown next to the model selector.
3. Send a message. The persona is locked to that chat session.

The persona stays with the session, so a conversation you started as the Medic stays in medic context even when you return to it days later. Starting a new chat resets to the default (Generalist).

You can change a session's persona mid-conversation. The new persona will be in effect from your next message — earlier messages still reflect the previous persona's framing.

### Off-grid vs. Grid

Twelve of the thirteen built-in personas inherit a shared **off-grid baseline**: they assume you don't have reliable grid power, internet, or cell service, they don't recommend websites or hire-a-pro shortcuts, and they end answers with concrete steps instead of disclaimers.

The **Grid** persona is the explicit counterpart for when you *do* have all those things. Pick it when you're online and want the assistant to freely recommend YouTube tutorials, manufacturer docs, professional services, and grid-tied solutions. If you ask Grid an off-grid-flavored question, it'll suggest switching to a more specialized persona.

---

## Customizing a persona

Every persona — including the built-in ones — can be customized. From **Settings → AI Assistant → Personas**, you can:

- Edit a persona's **label**, **description**, or **system prompt**
- Save your changes (which the chat will use immediately on new messages)
- **Reset to default** to discard your changes and restore the built-in version

An "edited" badge appears next to any persona you've customized. Your overrides are stored separately from the built-in defaults — you can never permanently break a built-in persona, and resetting brings it right back.

### The Custom persona

If you want to build a persona from scratch — a niche role the built-ins don't cover, or a voice tuned to your specific workflow — use the **Custom** slot. It starts as a placeholder ("you are a helpful assistant"), and you can rewrite it however you want. Custom is just another persona in every way except that it doesn't have a curated default behavior.

For inspiration, look at how the built-in prompts are structured: a backstory paragraph, a list of opinions and rules of thumb, any domain-specific data the persona should always have at hand, and (optionally) a few example exchanges. The built-in prompts are good reference material if you want to write your own.

### What's in a persona system prompt?

Every persona's system prompt is injected as the first message of the conversation. It contains:

1. A **shared baseline** (off-grid framing, formatting rules, English-only, no LaTeX, no closing hedges) — this applies to all twelve off-grid personas. The Grid persona swaps it out for an online-friendly baseline.
2. A **persona-specific section** — backstory, opinions, domain quick-references.
3. **Few-shot examples** (built-in personas only) — 2-3 example Q→A exchanges that demonstrate the voice and structure. These get injected as real prior turns on the first message of a new conversation, so the model pattern-matches the assistant style. They don't repeat on follow-up turns.

When you edit a persona, only the system prompt is yours to change. The few-shot examples are part of the built-in definition and aren't currently editable from the UI.

---

## Disabling personas

If you'd rather have the unchanged upstream chat behavior — no persona framing, no off-grid baseline, just markdown formatting rules — turn personas off:

**Settings → AI Assistant → Chat Personas** (toggle).

When disabled:
- The persona dropdown disappears from the chat header.
- The Personas section is hidden in Settings.
- The chat falls back to NOMAD's original generic system prompt.
- Existing chat sessions still have a persona set on them, but it's inert — no system prompt injection from the persona system.

Re-enabling brings the dropdown and the personas back; existing sessions resume using their saved persona.

---

## When to switch personas

A good rule: **if the question is squarely in a specialist's domain, use the specialist.** The Medic gives better answers to medical questions than the Generalist; the Electrician gives better answers to wire-sizing than the Mechanic.

If the question is broad or cross-domain ("the power is out, help"), the **Generalist** is the right choice — it's specifically designed to triage and route rather than to do deep specialist work.

If you're online and want normal-life answers, switch to **Grid**.

If a persona suggests another persona for a specific question, take the hint — they're designed to know their limits.

---

## Customizing for an upstream deployment

If you're customizing NOMAD for a deployment (a community organization, a household, a specific use case), the persona system is a meaningful surface for fitting the assistant to your audience. The Custom slot is the cleanest place for that — you can describe your audience, your priorities, and your constraints, and the assistant will answer in that voice consistently.

The built-in personas are intentionally generic across off-grid scenarios. If you're, say, a high-altitude search-and-rescue team, you'd write a Custom persona that's tuned to alpine SAR specifically — and you can leave the built-in Medic alone for general medical questions.

---

## Related

- [Getting Started](/docs/getting-started) — overall NOMAD setup
- [Use Cases](/docs/use-cases) — what people use NOMAD for
- [AI Assistant Settings](/settings/models) — toggle, customize, and manage personas
