# ChainPulse

Multi-chain cryptocurrency portfolio tracker supporting **Solana** and **TON** networks. Real-time price updates, transaction history, and wallet connectivity — available as a web app and a Telegram Web App.

**Live:** [cheslav.space/chainpulse](https://cheslav.space/chainpulse/)
**Telegram Bot:** [@CheslavChain_bot](https://t.me/CheslavChain_bot)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| SDK | TypeScript, InversifyJS (DI), RxJS (reactive streams), @solana/web3.js, @ton/ton |
| Backend | NestJS, WebSockets (Socket.IO), REST API |
| Web | React 19, Vite, @xyflow/react, Solana Wallet Adapter, TonConnect |
| TWA | React 19, Vite, TonConnect, @twa-dev/sdk |
| Monorepo | Turborepo, pnpm workspaces |

## Getting Started

```bash
# Prerequisites: Node >= 20, pnpm >= 9

pnpm install
pnpm dev           # starts all packages in parallel via Turborepo
```

### Run Individual Packages

```bash
pnpm --filter @chainpulse/backend dev    # NestJS API server
pnpm --filter @chainpulse/web dev        # React web app
pnpm --filter @chainpulse/twa dev        # Telegram Web App
pnpm --filter @chainpulse/sdk build      # Build SDK
```

### Build

```bash
pnpm build         # builds all packages
```

## Project Structure

```
chainpulse/
├── packages/
│   ├── sdk/                # Core SDK — chain providers, DI container, types
│   │   └── src/
│   │       ├── providers/  # Solana & TON blockchain adapters
│   │       ├── services/   # Portfolio aggregation, price feeds
│   │       ├── container/  # InversifyJS IoC configuration
│   │       ├── types/      # Shared interfaces & DTOs
│   │       └── utils/      # Formatters, converters
│   ├── backend/            # NestJS API server
│   │   └── src/
│   │       ├── portfolio/  # Portfolio endpoints & logic
│   │       ├── prices/     # Real-time price service
│   │       └── transactions/ # Transaction history
│   ├── web/                # React SPA — full web dashboard
│   │   └── src/
│   │       ├── pages/      # Portfolio, wallet views
│   │       ├── components/ # Charts, tables, wallet connect
│   │       └── hooks/      # Data fetching, WebSocket subscriptions
│   └── twa/                # Telegram Web App (mini app)
│       └── src/
│           ├── components/ # TWA-optimized UI
│           └── hooks/      # Telegram SDK integration
├── turbo.json              # Turborepo pipeline config
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── Dockerfile
```

## Architecture

```
┌──────────────┐  ┌──────────────┐
│   Web App    │  │  Telegram    │
│   (React)    │  │  Web App     │
└──────┬───────┘  └──────┬───────┘
       │    REST / WS    │
       └────────┬────────┘
         ┌──────┴───────┐
         │   Backend    │
         │   (NestJS)   │
         └──────┬───────┘
         ┌──────┴───────┐
         │     SDK      │
         │ (InversifyJS)│
         └──┬────────┬──┘
        Solana      TON
```

## Author

Vyacheslav Kovalev — [GitHub](https://github.com/al-mighty) · [cheslav.space](https://cheslav.space)
