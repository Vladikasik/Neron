# NeronGraphViz

A React Native application for visualizing Neo4j graph data with 3D interactive graphics.

## Features

- 3D force-directed graph visualization
- Interactive node exploration
- Theme switching (Matrix/Regular)
- Cross-platform support (iOS, Android, Web)
- Neo4j data integration

## Installation

```bash
npm install
```

## Running the App

```bash
# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android

# Run on Web
npm run web
```

## iOS WebView Troubleshooting

This app uses WebView to render 3D graphics, which can encounter issues on iOS devices. Here's how to diagnose and resolve common problems:

### Common iOS Issues

1. **WebGL Context Lost**: iOS WebView has known issues with WebGL context loss, especially on newer iOS versions (16.4+, 17+, 18+)
2. **External Script Loading**: iOS WebView blocks external CDN scripts by default
3. **Memory Limitations**: iOS devices have stricter memory limits for WebView applications
4. **Graphics Performance**: iOS WebView has reduced performance for complex 3D graphics

### Solutions Implemented

#### 1. CDN Script Loading
- **Problem**: Initially thought iOS WebView blocks external CDN scripts
- **Solution**: CDN scripts actually work fine on iOS WebView when properly configured
- **Implementation**: Uses unpkg.com CDN for THREE.js and 3D Force Graph libraries
- **Advantage**: Always gets latest compatible versions without local bundling complexity

#### 2. Enhanced Error Handling
- **WebGL Error Detection**: Automatic detection of WebGL support and context loss
- **Retry Mechanism**: Automatic retry with exponential backoff (max 3 attempts)
- **Graceful Fallback**: Console remains functional even if graphics fail
- **User Feedback**: Clear error messages and retry options

#### 3. iOS-Specific WebView Configuration
```typescript
// Enhanced WebView props for iOS compatibility
allowsInlineMediaPlayback={true}
bounces={false}
scrollEnabled={false}
allowsBackForwardNavigationGestures={false}
dataDetectorTypes="none"
fraudulentWebsiteWarningEnabled={false}
limitsNavigationsToAppBoundDomains={false}
```

#### 4. WebGL Context Recovery
- **Context Loss Handlers**: Automatic detection and recovery from WebGL context loss
- **State Preservation**: Graph state is preserved during context recovery
- **Progressive Enhancement**: Features degrade gracefully on unsupported devices

### Debugging iOS Issues

#### Using the Built-in Console

1. **Open the Console**: Tap the ⚡ button in the bottom-left corner
2. **Check Status**: Type `status` to see system information
3. **Debug Information**: Type `debug` to see detailed device information
4. **Test Graphics**: Type `test` to create a simple test graph
5. **Retry Failed Graphics**: Type `retry` to retry graph initialization

#### Console Commands

| Command | Description |
|---------|-------------|
| `help` | Show all available commands |
| `status` | Display system status and library availability |
| `debug` | Show detailed device and WebGL information |
| `test` | Create a simple test graph to verify graphics work |
| `retry` | Retry graph initialization if it failed |
| `clear` | Clear console log |
| `theme` | Switch between Matrix and Regular themes |

#### Common Error Messages

**"WebGL not supported"**
- Device doesn't support WebGL
- Try restarting the app
- Check if device supports 3D graphics

**"WebGL context lost"**
- iOS WebGL context was lost (common issue)
- Tap "Retry" or use console command `retry`
- Try closing other apps to free memory

**"Libraries not ready"**
- Local JavaScript libraries failed to load
- Check internet connection (for initial download)
- Restart the app

**"Failed to initialize after multiple attempts"**
- Device may not support complex 3D graphics
- Graphics will be disabled, console remains available
- Consider using web version for full functionality

### Performance Optimization for iOS

#### Memory Management
- Graph is optimized for mobile devices
- Node count is limited to prevent memory issues
- Automatic cleanup of unused resources

#### Graphics Optimization
- Reduced particle effects on mobile
- Simplified shaders for better compatibility
- Hardware acceleration when available

#### Progressive Enhancement
- Core functionality works without 3D graphics
- Console provides full debugging capabilities
- Graceful degradation on older devices

### Device Compatibility

#### Fully Supported
- iPhone 12 and newer
- iPad Pro (2020 and newer)
- iOS 15.0 and newer

#### Limited Support
- iPhone X to iPhone 11 series
- iPad Air 3rd generation and newer
- iOS 14.0 - 14.9

#### Basic Support (Console Only)
- iPhone 8 and older
- iPad 6th generation and older
- iOS 13.0 and older

### Troubleshooting Steps

1. **Check Console Logs**
   - Open console and look for error messages
   - Use `debug` command to see device information

2. **Verify WebGL Support**
   - Use `status` command to check WebGL availability
   - Try `test` command to create simple graph

3. **Restart and Retry**
   - Close and reopen the app
   - Use `retry` command in console
   - Restart iOS device if issues persist

4. **Alternative Solutions**
   - Use web version if iOS issues persist
   - Consider updating iOS to latest version
   - Free up device memory by closing other apps

### Development Notes

- JavaScript libraries loaded from CDN (unpkg.com) for best compatibility
- Comprehensive error handling with React Native communication
- Automatic fallback systems for unsupported devices
- Real-time debugging through integrated console
- iOS WebView supports external scripts when properly configured

For additional support or to report iOS-specific issues, please check the console logs and include device information when reporting bugs. 