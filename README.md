# Flight Monorepo

A Node.js monorepo containing an Eagle plugin that serves a separate web frontend via HTTP.

## Architecture

The monorepo has been restructured with a new architecture:

- **Eagle Plugin**: Contains the Eagle plugin structure and starts an HTTP server
- **Web Frontend**: A separate SPA (Single Page Application) served by the Eagle plugin
- **HTTP Server**: The Eagle plugin runs a Node.js HTTP server to serve the web frontend

## Structure

```
flight/
├── packages/
│   ├── eagle/              # Eagle plugin package (JavaScript only)
│   │   ├── manifest.json   # Eagle plugin manifest
│   │   ├── index.html      # Plugin UI (shows server status)
│   │   ├── logo.png        # Plugin icon
│   │   └── js/
│   │       └── plugin.js   # Eagle plugin + HTTP server
│   └── web/                # TypeScript web frontend SPA
│       ├── app/
│       │   ├── index.html  # Web frontend HTML template
│       │   ├── index.ts    # Main entry point
│       │   └── api.ts      # API client with mock support
│       ├── build.js        # Web frontend build script
│       ├── package.json
│       └── tsconfig.json
├── dist/                   # Build output (Eagle plugin structure)
│   ├── index.html          # Eagle plugin UI
│   ├── js/
│   │   ├── plugin.js       # Eagle plugin + HTTP server
│   │   └── client/         # Web frontend SPA files (Eagle-compatible path)
│   │       ├── index.html  # Web frontend HTML
│   │       └── main.js     # Web frontend JavaScript
│   ├── logo.png
│   ├── manifest.json
│   └── package.json
├── build.esbuild.js        # Main build configuration
├── dev-server.js           # Development server (for testing builds)
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
cd packages/web && npm install
```

### Building

#### Production Build (Real Web Frontend)
```bash
# Build for production with real web frontend SPA
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

#### New Architecture Flow

1. **Eagle Plugin (`plugin.js`)**:
   - Starts a Node.js HTTP server on port 8080 (with fallback if occupied)
   - Serves the web frontend SPA from the `js/client/` directory (Eagle-compatible path)
   - Logs the server URL to console
   - Handles Eagle plugin lifecycle events

2. **Web Frontend SPA**:
   - Built as a standalone Single Page Application
   - Contains `index.html` and bundled `main.js`
   - Served via the Eagle plugin's HTTP server
   - Accessible at `http://localhost:8080` (or fallback port)

3. **Build Process**:
   - **Production mode**: Builds real TypeScript web frontend to SPA, copies to `js/client/`
   - **Mock mode**: Creates simple mock SPA files for Eagle plugin testing

#### Build Modes

##### Production Mode (`npm run build`)
1. Copies Eagle plugin structure to `dist/`
2. Builds web frontend TypeScript to SPA in `packages/web/dist/`
3. Copies web frontend SPA to `dist/js/client/` (Eagle-compatible path)
4. Creates complete Eagle plugin with HTTP server

##### Mock Mode (`npm run build:mock`)
1. Copies Eagle plugin structure to `dist/`
2. Creates mock SPA files in `dist/js/client/`
3. Allows Eagle plugin testing without web package dependencies

### Eagle Plugin Development

The built plugin in `dist/` can be loaded directly into Eagle:

1. **Plugin UI** (`index.html`): Shows plugin status and web frontend URL
2. **HTTP Server** (`js/plugin.js`): Serves web frontend SPA on localhost
3. **Web Frontend**: Accessible via HTTP at the logged URL
4. **Client Directory**: Located at `js/client/` for Eagle file access compatibility

### Web Frontend Development

The web frontend is a standalone SPA built with:

- TypeScript with strict mode
- ES2021 target (Node.js v16 compatible)
- esbuild for fast compilation
- Flat file structure (`index.html` + `main.js`)

#### Web Frontend Scripts

```bash
cd packages/web

# Build web frontend SPA
npm run build

# Build and watch for changes
npm run dev

# Clean web frontend build
npm run clean
```

### Testing Workflow

1. **Eagle Plugin Testing**: Use `npm run build:mock` to test plugin HTTP server independently
2. **Web Frontend Testing**: Use `npm run build` for full integration testing
3. **Development**: Use watch modes (`npm run dev` or `npm run dev:mock`)
4. **Browser Testing**: Access web frontend via Eagle plugin's HTTP server

### HTTP Server Details

The Eagle plugin starts an HTTP server that:

- **Default Port**: 8080 (with automatic fallback if occupied)
- **Binding**: localhost (127.0.0.1) for security
- **Serves**: Static files from `js/client/` directory (Eagle-compatible path)
- **Security**: Path traversal protection
- **CORS**: Enabled for development
- **Logging**: Server URL logged to console

### Eagle File Access Compatibility

The web frontend files are placed in `dist/js/client/` because:

- Eagle plugins have restricted file access permissions
- Files must be located beneath the `js/` directory to be readable
- The `client/` directory is now peer to `plugin.js` for proper access

### Development Server

The monorepo also includes a development server (`dev-server.js`) for testing built artifacts:

- Serves the complete `dist/` directory
- Useful for testing the Eagle plugin structure
- Runs on http://localhost:3000
- Independent of the Eagle plugin's HTTP server
