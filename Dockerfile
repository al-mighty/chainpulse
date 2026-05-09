FROM node:22-alpine AS base
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# Install deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/sdk/package.json packages/sdk/
COPY packages/backend/package.json packages/backend/
RUN pnpm install --frozen-lockfile --filter @chainpulse/sdk --filter @chainpulse/backend

# Copy source and build
COPY packages/sdk packages/sdk
COPY packages/backend packages/backend
RUN cd packages/sdk && pnpm build
RUN cd packages/backend && pnpm build

EXPOSE 3001
CMD ["node", "packages/backend/dist/main.js"]
