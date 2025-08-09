// Main entry point for the web frontend
// This will be built and bundled to js/main.js in the Eagle plugin

console.log('Web frontend initializing...');

// Main application class
class FlightApp {
    constructor() {
        this.init();
    }

    init() {
        console.log('Flight app initialized');
        this.setupUI();
        this.setupAPI();
    }

    setupUI() {
        // UI setup logic will go here
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <h1>Flight Plugin</h1>
                <p>Web frontend loaded successfully!</p>
                <div id="content">
                    <!-- Content will be dynamically loaded here -->
                </div>
            `;
        }
    }

    setupAPI() {
        // API communication setup will go here
        console.log('API setup complete');
    }
}

// Initialize the app when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new FlightApp();
    });
} else {
    new FlightApp();
}

export { FlightApp };
