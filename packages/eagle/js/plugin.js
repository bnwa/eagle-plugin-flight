// Eagle plugin base functionality
// This file contains the basic Eagle plugin integration

console.log('Eagle plugin loaded');

// Basic Eagle plugin initialization
if (typeof eagle !== 'undefined') {
    console.log('Eagle API available');
    
    // Plugin initialization logic
    eagle.onPluginCreate(() => {
        console.log('Plugin created');
    });
    
    eagle.onPluginShow(() => {
        console.log('Plugin shown');
    });
    
    eagle.onPluginHide(() => {
        console.log('Plugin hidden');
    });
} else {
    console.log('Eagle API not available - running in development mode');
}
