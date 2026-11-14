# NEXUS

Private messenger concept — React, TypeScript and Vite.

## Development

```bash
npm install
npm run dev
```

## Current status

This is the first UI foundation build. It contains a responsive five-section shell, demo chat list and conversation view, channel showcase, AI placeholder, profile/settings screens, theme switching, and a visual NEXUS HISTORY import entry point.

**Important:** messages, authentication, channel subscriptions, AI responses, and chat archive processing are currently demo-only. No end-to-end encryption is implemented. Do not use real private conversations or sensitive files in this prototype.

## Next milestones

1. Connect Supabase Auth and database with row-level security.
2. Implement real-time conversations and message persistence.
3. Add channel publishing and subscriptions.
4. Connect an AI provider through a server-side function.
5. Implement validated import parsers for supported exported archive formats.
6. Complete security review and test before public launch.
