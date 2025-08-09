// Mock implementation of the web frontend
// This is a minimal stub to allow Eagle plugin testing without the real web package

console.log('Mock web frontend loaded');

// Mock FlightApp class
class MockFlightApp {
    constructor() {
        console.log('Mock Flight app initialized');
        this.setupMockUI();
    }

    setupMockUI() {
        const appElement = document.getElementById('app');
        if (appElement) {
            appElement.innerHTML = `
                <h1>Flight Plugin (Mock Mode)</h1>
                <p>Mock web frontend loaded for Eagle plugin testing</p>
                <div id="content">
                    <p>This is a mock implementation for testing the Eagle plugin independently.</p>
                </div>
            `;
        }
    }
}

// Initialize mock app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new MockFlightApp();
    });
} else {
    new MockFlightApp();
}

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MockFlightApp };
}
