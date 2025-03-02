// main.js - Enhanced Version
import { initializeQRUploadHandlers } from './js/QRCodeUploadHandling.js';
import { initializeQRScanner } from './js/QRScanning.js';
import { initializeTTS } from './js/tts.js';
import { initializeModeSwitching } from './js/ModeSwitching.js';
import { initializeRecordingControls, initializeAudioModule } from './js/audioRecordingCompressionQR.js';
import { updateStatus } from './js/utils.js';

// Global error handling
window.addEventListener('error', (event) => {
    console.error('Global Error:', event.error);
    updateStatus(`Critical error: ${event.message}`, 'error');
    return true;
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled Rejection:', event.reason);
    updateStatus(`Async error: ${event.reason.message}`, 'error');
});

// Application state management
let isInitialized = false;
const cleanupCallbacks = [];

async function initializeApp() {
    if (isInitialized) return;
    
    try {
        showLoading(true);
        
        // Ordered initialization
        await initializeCoreComponents();
        initializeUIHandlers();
        
        // Set initial state
        document.dispatchEvent(new CustomEvent('app-ready'));
        updateStatus('Application ready', 'success');
        isInitialized = true;
    } catch (error) {
        console.error('Boot failed:', error);
        updateStatus('Failed to initialize. Please refresh.', 'error');
        showLoading(false);
        throw error;
    } finally {
        showLoading(false);
    }
}

async function initializeCoreComponents() {
    const initQueue = [
        { fn: initializeModeSwitching, name: 'Mode Switching' },
        { fn: initializeAudioModule, name: 'Audio Module' },
        { fn: initializeRecordingControls, name: 'Recording Controls' },
        { fn: initializeTTS, name: 'Text-to-Speech' },
        { fn: initializeQRScanner, name: 'QR Scanner' },
        { fn: initializeQRUploadHandlers, name: 'File Uploads' }
    ];

    for (const { fn, name } of initQueue) {
        try {
            const cleanup = await fn();
            if (typeof cleanup === 'function') {
                cleanupCallbacks.push(cleanup);
            }
            updateStatus(`Initialized: ${name}`, 'info');
        } catch (error) {
            console.error(`${name} init failed:`, error);
            updateStatus(`${name} initialization failed`, 'warning');
        }
    }
}

function initializeUIHandlers() {
    // Download handlers
    const downloadCleanup = [
        setupDownloadHandler('#downloadQRCodeBtn', handleQRDownload),
        setupDownloadHandler('#downloadBtn', handleContentDownload)
    ];
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutHandler = () => {
        performCleanup();
        window.location.href = 'signin.html';
    };
    
    logoutBtn.addEventListener('click', logoutHandler);
    cleanupCallbacks.push(() => {
        logoutBtn.removeEventListener('click', logoutHandler);
    });

    cleanupCallbacks.push(...downloadCleanup);
}

// Rest of the file remains unchanged...
