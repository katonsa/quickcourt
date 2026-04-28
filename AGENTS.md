<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

`npm run build` requires network access because the app uses `next/font/google` for fonts. If running in a sandbox with restricted network access, request network permission before running `npm run build` instead of running it first and accepting a font-fetch build failure.

Database-backed commands connect to the local PostgreSQL service through the network stack. If running in a sandbox with restricted network access, request network permission before running commands such as `npm run db:migrate`, `npm run db:migrate:deploy`, `npm run db:reset`, `npm run db:verify-constraints`, `npm run db:seed`, or `npm run db:smoke`.
