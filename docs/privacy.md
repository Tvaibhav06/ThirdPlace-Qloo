# ThirdPlace Squad: Data Privacy & Safe Use Statement (docs/privacy.md)

In strict adherence to the 2026 Qloo Agentic Hackathon Kit (`API_ACCESS.md` and `SAFE_USE.md`):

1. **Server-Side Credential Isolation (HR-10)**:
   All Qloo API credentials (`QLOO_API_KEY`), Ticketmaster keys, and LLM provider keys reside strictly in server environment variables. Secrets never touch browser bundles, client logs, git history, or prompt interpolations.

2. **Browser-Only Display Labels**:
   Member names, labels, and personal identities are retained exclusively in the browser's local memory. The server and external APIs receive only synthetic aliases (`M1`, `M2`, `M3`, `M4`) and public media seed titles.

3. **No Sensitive Inferences**:
   ThirdPlace Squad never attempts to infer or profile any individual's identity, demographics, health, financial status, political viewpoints, or legal eligibility from Qloo taste data.

4. **Zero Persistent Storage**:
   No databases, tracking cookies, or user profile records are stored on the server. In-memory run records are discarded within 15 minutes.

5. **Ticketmaster Terms Disclosure**:
   Ticketmaster live event data is utilized solely for real-time proximity conflict detection. No revenue is derived from Ticketmaster API usage, and event data is cached for a maximum of 1 hour in accordance with Ticketmaster developer policies.
