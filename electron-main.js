const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

console.log('🚀 Electron main process started')

let mainWindow
let iohook

function createWindow() {
    // 메인 윈도우 생성
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            enableRemoteModule: true
        }
    })

    // HTML 파일 로드
    mainWindow.loadFile('electron-test.html')
    
    // DevTools 자동 열기
    mainWindow.webContents.openDevTools()

    console.log('🖼️  Electron window created')
}

// Electron 준비 완료 시
app.whenReady().then(() => {
    console.log('⚡ Electron app ready')
    createWindow()
    
    // macOS에서 앱이 활성화될 때 윈도우 생성
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    
    // iohook 라이브러리 테스트
    testIOHook()
})

// 모든 윈도우가 닫힐 때
app.on('window-all-closed', () => {
    console.log('🔄 All windows closed')
    
    // iohook 정리
    if (iohook && iohook.isMonitoring()) {
        console.log('🛑 Stopping iohook monitoring...')
        iohook.stopMonitoring()
    }
    
    // macOS가 아닌 경우 앱 종료
    if (process.platform !== 'darwin') app.quit()
})

// iohook 라이브러리 테스트 함수
function testIOHook() {
    try {
        console.log('🔧 Loading iohook-macos library...')
        iohook = require('./index.js')
        
        console.log('✅ iohook-macos loaded successfully in Electron!')
        
        // 이벤트 리스너 설정
        iohook.on('keyDown', (eventData) => {
            console.log('⌨️  [Electron] Key pressed:', eventData.keyCode)
            
            // 렌더러 프로세스로 이벤트 전송
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('iohook-event', {
                    type: 'keyDown',
                    data: eventData
                })
            }
        })
        
        iohook.on('leftMouseDown', (eventData) => {
            console.log('🖱️  [Electron] Mouse clicked at:', eventData.x, eventData.y)
            
            // 렌더러 프로세스로 이벤트 전송
            if (mainWindow && mainWindow.webContents) {
                mainWindow.webContents.send('iohook-event', {
                    type: 'leftMouseDown',
                    data: eventData
                })
            }
        })
        
        iohook.on('mouseMoved', (eventData) => {
            // 마우스 이동은 너무 많으므로 10번째만 로깅
            if (Math.random() < 0.01) {
                console.log('🖱️  [Electron] Mouse moved to:', eventData.x, eventData.y)
            }
            
            // 렌더러 프로세스로 이벤트 전송 (성능을 위해 throttle)
            if (mainWindow && mainWindow.webContents && Math.random() < 0.05) {
                mainWindow.webContents.send('iohook-event', {
                    type: 'mouseMoved',
                    data: eventData
                })
            }
        })
        
        // 권한 체크
        console.log('🔐 Checking accessibility permissions...')
        const hasPermissions = iohook.checkAccessibilityPermissions()
        console.log('🔐 Accessibility permissions:', hasPermissions ? 'GRANTED' : 'DENIED')
        
        if (!hasPermissions) {
            console.log('⚠️  Accessibility permissions required. Opening System Preferences...')
            iohook.requestAccessibilityPermissions()
            
            // 5초 후 다시 시도
            setTimeout(() => {
                const hasPermissionsAfter = iohook.checkAccessibilityPermissions()
                if (hasPermissionsAfter) {
                    startMonitoring()
                } else {
                    console.log('❌ Please grant accessibility permissions and restart the app')
                }
            }, 5000)
        } else {
            startMonitoring()
        }
        
    } catch (error) {
        console.error('❌ Failed to load iohook-macos in Electron:', error)
        console.error('Error details:', error.message)
        console.error('Stack trace:', error.stack)
    }
}

function startMonitoring() {
    try {
        console.log('🎯 Starting iohook monitoring in Electron...')
        iohook.startMonitoring()
        console.log('✅ iohook monitoring started successfully in Electron!')
        
        // 렌더러 프로세스에 상태 알림
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('iohook-status', {
                status: 'started',
                message: 'Event monitoring started successfully!'
            })
        }
        
    } catch (error) {
        console.error('❌ Failed to start monitoring:', error)
        
        // 렌더러 프로세스에 에러 알림
        if (mainWindow && mainWindow.webContents) {
            mainWindow.webContents.send('iohook-status', {
                status: 'error',
                message: error.message
            })
        }
    }
}

// 렌더러 프로세스로부터의 요청 처리
ipcMain.handle('iohook-test-performance', async () => {
    if (iohook) {
        console.log('🚀 Testing performance mode...')
        iohook.enablePerformanceMode()
        return { success: true, message: 'Performance mode enabled' }
    }
    return { success: false, message: 'iohook not loaded' }
})

ipcMain.handle('iohook-test-hardware', async () => {
    if (iohook) {
        console.log('🖱️  Hardware control features are ready')
        return { success: true, message: 'Hardware control ready' }
    }
    return { success: false, message: 'iohook not loaded' }
}) 