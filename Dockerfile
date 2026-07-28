FROM node:22.12.0-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* .npmrc* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && corepack prepare pnpm@9.13.2 --activate && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED 1

RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && corepack prepare pnpm@9.13.2 --activate && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Headless LibreOffice converts e-mailed .docx bulletins to PDF (src/lib/docx-to-pdf.ts).
# Only the Writer component is installed; the full suite would roughly double the image.
#
# Fonts matter for fidelity, not just for diacritics:
#   ttf-liberation  metric-compatible stand-ins for Times New Roman / Arial, so Word
#                   layouts keep their line breaks instead of reflowing
#   ttf-dejavu      broad Latin coverage including Czech
#   font-noto       last-resort fallback for anything else
RUN apk add --no-cache \
      libreoffice-writer \
      ttf-liberation \
      ttf-dejavu \
      font-noto

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p public media
RUN chown nextjs:nodejs media

# LibreOffice gets an explicit per-conversion profile, but still expects a writable HOME.
RUN mkdir -p /home/nextjs && chown nextjs:nodejs /home/nextjs
ENV HOME=/home/nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME 0.0.0.0

CMD ["node", "server.js"]
