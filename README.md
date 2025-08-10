# Flight Monorepo

A Node.js monorepo containing an Eagle plugin and web frontend with support for independent testing.

## Structure

```
flight/
├── packages/
│   ├── eagle/              # Eagle plugin package (JavaScript only)
│   │   ├── manifest.json   # Eagle plugin manifest
│   │   ├── index.html      # Plugin entry point
│   │   ├── logo.png        # Plugin icon
│   │   └── js/
│   │       └── plugin.js   # Eagle plugin base functionality
│   └── web/                # TypeScript web frontend
│       ├── src/
│       │   ├── index.ts    # Main entry point
│       │   └── api.ts      # API client with mock support
│       ├── package.json
│       └── tsconfig.json
├── mocks/
│   └── main.js             # Mock web frontend for Eagle testing
├── dist/                   # Build output (Eagle plugin structure)
├── build.esbuild.js        # Build configuration with mock support
├── dev-server.js           # Development server using Node.js http module
├── package.json            # Root package.json
└── tsconfig.json           # Root TypeScript configuration
```

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) v16.x (exactly)
- [npm](https://www.npmjs.com/) >= 7.0.0

### Installation

```bash
npm install
```

### Building

#### Production Build (Real Web Frontend)
```bash
# Build for production with real web frontend
npm run build

# Build and watch for changes with real web frontend
npm run dev

# Build and start development server with real web frontend
npm run start
```

#### Mock Build (Eagle Plugin Testing)
```bash
# Build with mock web frontend for Eagle plugin testing
npm run build:mock

# Build and watch for changes with mock web frontend
npm run dev:mock

# Build and start development server with mock web frontend
npm run start:mock
```

#### Utility
```bash
# Clean build artifacts
npm run clean

# Start development server (serves dist/ on http://localhost:3000)
npm run serve
```

### How it works

1. **Two Build Modes:**
   - **Production mode**: Builds real TypeScript web frontend to `js/main.js`
   - **Mock mode**: Uses static mock `js/main.js` for Eagle plugin testing

2. **Eagle Package**: Contains the Eagle plugin structure with JavaScript files only
3. **Web Package**: Contains TypeScript source code for the frontend logic
4. **Mock Package**: Contains minimal stub implementation for independent Eagle testing

### Build Process

#### Production Mode (`npm run build`)
- Copies Eagle plugin structure to `dist/`
- Transpiles and bundles the web frontend TypeScript to `dist/js/main.js` using esbuild
- Creates full distributable artifact

#### Mock Mode (`npm run build:mock`)
- Copies Eagle plugin structure to `dist/`
- Copies mock `js/main.js` from `mocks/main.js`
- Allows Eagle plugin testing without web package dependencies

### Eagle Plugin Development

The built plugin in `dist/` can be loaded directly into Eagle for testing. The plugin structure follows the Eagle plugin API requirements:

- `manifest.json` - Plugin configuration
- `index.html` - Entry point that loads both plugin base and main app logic
- `js/plugin.js` - Eagle-specific plugin functionality
- `js/main.js` - Main application logic (real or mock)

### Testing Workflow

1. **Eagle Plugin Testing**: Use `npm run build:mock` to test Eagle plugin functionality independently
2. **Web Frontend Testing**: Use `npm run build` to test full integration
3. **Development**: Use `npm run dev:mock` or `npm run dev` with watch mode
4. **Browser Testing**: Use `npm run start:mock` or `npm run start` to serve locally

### Web Frontend Development

The web frontend is built with TypeScript and includes:

- ESM module support
- API client with mock capabilities for testing
- TypeScript strict mode enabled
- ES2021 target (compatible with Node.js v16)
- Built with esbuild for fast compilation

### Development Server

The development server is built using Node.js built-in `http` module and serves static files from the `dist/` directory. It supports:

- Static file serving with proper MIME types
- CORS headers for development
- Graceful shutdown handling
- Error handling for missing files
