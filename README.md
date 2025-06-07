# Neron Graph Visualization

A React Native app with Expo that visualizes Neo4j graph data using the `react-force-graph` library with Bloom Post-Processing Effects.

## 🌟 Features

- **Real `react-force-graph`**: Uses the actual `react-force-graph-3d` library running in a WebView
- **Bloom Post-Processing Effect**: Stunning visual effects with ThreeJS UnrealBloomPass
- **Neo4j Data Support**: Directly imports and visualizes Neo4j JSON exports
- **Interactive Nodes & Links**: Click on nodes and relationships to see details
- **Production Ready**: Clean architecture with proper error handling
- **Cross Platform**: Works on iOS, Android, and Web

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator / Android Emulator / Physical device

### Installation

1. **Clone and setup the project**:
   ```bash
   cd NeronGraphViz
   npm install
   ```

2. **Start the development server**:
   ```bash
   npx expo start
   ```

3. **Run on your preferred platform**:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Scan QR code with Expo Go app on your device

## 📊 Data Format

The app expects Neo4j data in the following JSON format (see `assets/test.json`):

```json
{
  "entities": [
    {
      "name": "unique-entity-name",
      "type": "entity-type",
      "observations": ["observation1", "observation2"]
    }
  ],
  "relations": [
    {
      "source": "source-entity-name",
      "target": "target-entity-name", 
      "relationType": "relationship-type"
    }
  ]
}
```

### How to Use Your Own Data

1. **Export from Neo4j**: Replace `assets/test.json` with your own Neo4j export
2. **Format Requirements**:
   - Must have `entities` and `relations` arrays
   - Each entity needs `name`, `type`, and `observations`
   - Each relation needs `source`, `target`, and `relationType`
3. **Restart the app** to load the new data

## 🎨 Visualization Features

### Node Styling
- **Size**: Based on number of observations
- **Color**: Automatically assigned by entity type
- **Labels**: Show entity name and type on hover

### Link Styling  
- **Directional**: Shows relationships between entities
- **Interactive**: Click to see relationship details
- **Styled**: Semi-transparent with connection indicators

### Bloom Effect
- **Post-Processing**: Real-time UnrealBloomPass from ThreeJS
- **Strength**: 4 (intense glow)
- **Radius**: 1 (medium spread)
- **Threshold**: 0 (affects all elements)

## 🏗️ Architecture

### WebView Approach
This app uses a hybrid architecture:

1. **React Native**: Main app shell, navigation, data loading
2. **WebView**: Embedded HTML page running `react-force-graph`
3. **Communication**: Bidirectional message passing between RN and WebView

### Key Components

- `GraphVisualization.tsx`: WebView wrapper with communication
- `useGraphData.ts`: Data loading and management hook
- `dataTransformer.ts`: Neo4j to react-force-graph data conversion
- `graph-viewer.html`: Web page with react-force-graph implementation

### Why WebView?

`react-force-graph` is designed for web browsers and uses:
- HTML Canvas / WebGL
- DOM manipulation
- Browser-specific APIs

Since React Native doesn't have these APIs, WebView is the most practical solution to use the library exactly as intended.

## 🛠️ Development

### Adding New Features

1. **WebView Side** (HTML): Edit `assets/graph-viewer.html`
   - Add new react-force-graph props
   - Implement new visual effects
   - Handle new interaction events

2. **React Native Side**: Edit components in `src/`
   - Add UI controls
   - Implement data filtering
   - Add new screens/navigation

### Communication Protocol

Messages between React Native and WebView:

```typescript
// React Native → WebView
{
  type: 'GRAPH_DATA',
  payload: Neo4jData
}

// WebView → React Native  
{
  type: 'NODE_CLICK' | 'LINK_CLICK' | 'READY',
  payload: any
}
```

## 📱 Platform Support

- ✅ **iOS**: Full support with WebView
- ✅ **Android**: Full support with WebView  
- ✅ **Web**: Runs in browser via Expo Web
- ❌ **Desktop**: Not supported (Expo limitation)

## 🐛 Troubleshooting

### WebView Not Loading
- Check console for JavaScript errors
- Ensure `assets/graph-viewer.html` exists
- Verify internet connection (loads libraries from CDN)

### Data Not Showing
- Validate JSON format in `assets/test.json`
- Check React Native logs for parsing errors
- Ensure entities and relations arrays exist

### Performance Issues
- Large graphs (>1000 nodes) may be slow
- Consider data filtering/pagination for better performance
- Adjust force simulation parameters in HTML file

## 🎯 Use Cases

Perfect for visualizing:
- **Knowledge Graphs**: Documentation, notes, concept maps
- **Project Dependencies**: Code relationships, component hierarchies  
- **Social Networks**: User connections, interaction patterns
- **Data Lineage**: Database relationships, data flow
- **Process Maps**: Workflow visualization, decision trees

## 📄 License

MIT License - feel free to use this project as a base for your own graph visualizations!

## 🤝 Contributing

Contributions welcome! This project demonstrates a practical approach to using web-based visualization libraries in React Native apps. 