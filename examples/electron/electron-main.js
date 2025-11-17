const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;
let iohook;

// Create Electron window
function createWindow() {
    console.log('🖼️  Electron window created');
    
    mainWindow = new BrowserWindow({
        width: 1400,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: 'iohook-macos Electron Test (Polling Mode)'
    });

    mainWindow.loadFile('electron-test.html');
    mainWindow.webContents.openDevTools();
}

// Initialize iohook with polling mode
function initializeIOHook() {
    console.log('🔧 Loading iohook-macos library...');
    
    // Load module with value-based error handling
    let hasError = false;
    let errorObj = null;
    let moduleObj = null;
    
    try {
        moduleObj = require('../../index.js');
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    // Early return on load failure
    if (hasError) {
        console.error('❌ Failed to initialize iohook:', errorObj);
        return false;
    }
    
    iohook = moduleObj;
    console.log('✅ iohook-macos loaded successfully in Electron!');
    
    // Demonstrate both string and int event type usage
    console.log('📋 Available CGEventTypes mapping:', iohook.CGEventTypes);
    
    // Set up event listeners using string names (backward compatible)
    iohook.on('keyDown', (data) => {
        console.log(`📝 String event: keyDown (type: ${data.type})`);
        mainWindow.webContents.send('event-data', data);
    });
    
    iohook.on('keyUp', (data) => {
        mainWindow.webContents.send('event-data', data);
    });
    
    // Set up event listeners using int values (new feature)
    iohook.on(1, (data) => {  // kCGEventLeftMouseDown = 1
        console.log(`🔢 Int event: leftMouseDown (CGEventType: ${data.type})`);
        mainWindow.webContents.send('event-data', data);
    });
    
    iohook.on(2, (data) => {  // kCGEventLeftMouseUp = 2
        console.log(`🔢 Int event: leftMouseUp (CGEventType: ${data.type})`);
        mainWindow.webContents.send('event-data', data);
    });
    
    // Mix of string and int for demonstration
    iohook.on('rightMouseDown', (data) => {
        mainWindow.webContents.send('event-data', data);
    });
    
    iohook.on('rightMouseUp', (data) => {
        mainWindow.webContents.send('event-data', data);
    });
    
    iohook.on('mouseMoved', (data) => {
        mainWindow.webContents.send('event-data', data);
    });
    
    iohook.on(22, (data) => {  // kCGEventScrollWheel = 22
        console.log(`🔢 Int event: scrollWheel (CGEventType: ${data.type})`);
        mainWindow.webContents.send('event-data', data);
    });
    
    // Check accessibility permissions
    console.log('🔐 Checking accessibility permissions...');
    const permissions = iohook.checkAccessibilityPermissions();
    console.log('🔐 Accessibility permissions:', permissions.hasPermissions ? 'GRANTED' : 'DENIED');
    
    return true;
}

// IPC Handlers for polling mode
ipcMain.on('start-monitoring', (event) => {
    console.log('🎯 Starting iohook monitoring in Electron...');
    
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.startMonitoring();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to start monitoring:', errorObj);
        return;
    }
    
    console.log('✅ iohook monitoring started successfully in Electron!');
});

ipcMain.on('stop-monitoring', (event) => {
    console.log('🛑 Stopping iohook monitoring...');
    
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.stopMonitoring();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to stop monitoring:', errorObj);
        return;
    }
    
    console.log('✅ iohook monitoring stopped successfully');
});

ipcMain.on('get-queue-size', (event) => {
    let hasError = false;
    let errorObj = null;
    let sizeValue = 0;
    
    try {
        sizeValue = iohook.getQueueSize();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to get queue size:', errorObj);
        event.reply('queue-size', 0);
        return;
    }
    
    event.reply('queue-size', sizeValue);
});

ipcMain.on('clear-queue', (event) => {
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.clearQueue();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to clear queue:', errorObj);
        return;
    }
    
    console.log('🗑️ Event queue cleared');
});

ipcMain.on('set-polling-rate', (event, rate) => {
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.setPollingRate(rate);
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to set polling rate:', errorObj);
        return;
    }
    
    console.log(`⚡ Polling rate set to ${rate}ms`);
});

ipcMain.on('enable-performance-mode', (event) => {
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.enablePerformanceMode();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to enable performance mode:', errorObj);
        return;
    }
    
    console.log('🚀 Performance mode enabled');
});

ipcMain.on('disable-performance-mode', (event) => {
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.disablePerformanceMode();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to disable performance mode:', errorObj);
        return;
    }
    
    console.log('🐌 Performance mode disabled');
});

ipcMain.on('set-verbose-logging', (event, enable) => {
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.setVerboseLogging(enable);
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Failed to set verbose logging:', errorObj);
        return;
    }
    
    console.log(`📝 Verbose logging ${enable ? 'enabled' : 'disabled'}`);
});

// Electron app events
app.whenReady().then(() => {
    console.log('🚀 Electron main process started');
    console.log('⚡ Electron app ready');
    
    createWindow();
    
    // Initialize iohook after window is created
    if (initializeIOHook()) {
        console.log('🎉 iohook-macos initialization completed');
    } else {
        console.error('💥 iohook-macos initialization failed');
    }
});

app.on('window-all-closed', () => {
    console.log('🔚 All windows closed');
    
    // Early return if no iohook
    if (!iohook) {
        if (process.platform != 'darwin') {
            app.quit();
        }
        return;
    }
    
    // Stop monitoring before quitting
    let hasError = false;
    let errorObj = null;
    
    try {
        iohook.stopMonitoring();
    } catch (e) {
        hasError = true;
        errorObj = e;
    }
    
    if (hasError) {
        console.error('❌ Error stopping monitoring on quit:', errorObj);
    } else {
        console.log('✅ iohook monitoring stopped on quit');
    }
    
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length == 0) {
        createWindow();
    }
});

process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('📋 Electron main process script loaded'); 