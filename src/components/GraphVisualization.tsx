import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator, Platform, TouchableOpacity } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { Neo4jData } from '../utils/dataTransformer';
import { Theme } from '../contexts/ThemeContext';

// Web-specific type declarations
declare global {
  interface Window {
    THREE: any;
    ForceGraph3D: any;
  }
}

interface GraphVisualizationProps {
  data: Neo4jData;
  onNodeClick?: (node: any) => void;
  onLinkClick?: (link: any) => void;
  navigation?: any;
  theme: Theme;
}

// Web-specific graph component that renders HTML content directly
const WebGraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  onLinkClick,
  navigation,
  theme,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initializeWebGraph();
    }
  }, []); // ← Fixed: Only run once on mount

  // Handle data/theme changes without reinitializing everything
  useEffect(() => {
    if (Platform.OS === 'web' && !isLoading) {
      // TODO: Update existing graph instead of recreating
      console.log('🔧 EXPO DEBUG: Data or theme changed, updating graph...');
    }
  }, [data, theme, isLoading]);

  const initializeWebGraph = async () => {
    console.log('🔧 EXPO DEBUG: initializeWebGraph starting...');
    
    try {
      setIsLoading(true);
      console.log('🔧 EXPO DEBUG: Set loading to true');
      
      if (!containerRef.current) {
        console.log('❌ EXPO ERROR: Container ref not available');
        throw new Error('Container ref not available');
      }
      console.log('🔧 EXPO DEBUG: Container ref available');

      // Inject the HTML content directly
      console.log('🔧 EXPO DEBUG: Injecting HTML content...');
      await injectGraphHTML();
      console.log('🔧 EXPO DEBUG: HTML injection completed');
      
      // Initialize the graph system
      console.log('🔧 EXPO DEBUG: Initializing graph system...');
      await initializeGraphSystem();
      console.log('🔧 EXPO DEBUG: Graph system initialization completed');
      
      setIsLoading(false);
      console.log('🔧 EXPO DEBUG: Set loading to false - initialization complete');
      
    } catch (err) {
      console.log('❌ EXPO ERROR: initializeWebGraph failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to load web graph');
      setIsLoading(false);
    }
  };

  const injectGraphHTML = async (): Promise<void> => {
    if (!containerRef.current) return;

    // Clear container
    containerRef.current.innerHTML = '';

    // Create the HTML structure matching the mobile HTML file
    const htmlContent = `
      <div id="graph-container">
        <div id="graph"></div>
      </div>
      
      <!-- Bottom-left toggle button -->
      <button id="console-toggle" title="Toggle Console" style="
        position: fixed;
        bottom: 20px;
        left: 20px;
        width: 45px;
        height: 45px;
        background: rgba(0, 0, 0, 0.9);
        border: 2px solid #00FF41;
        border-radius: 50%;
        color: #00FF41;
        font-family: 'Courier New', monospace;
        font-size: 20px;
        font-weight: bold;
        cursor: pointer;
        z-index: 1001;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        backdrop-filter: blur(5px);
        box-shadow: 0 0 15px rgba(0, 255, 65, 0.5);
      ">⚡</button>
      
      <!-- Draggable console window -->
      <div id="console" style="
        position: fixed;
        top: 50px;
        left: 50px;
        width: 400px;
        height: 350px;
        background: rgba(0, 0, 0, 0.95);
        border: 2px solid #00FF41;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        color: #00FF41;
        box-shadow: 0 0 25px rgba(0, 255, 65, 0.4);
        backdrop-filter: blur(8px);
        z-index: 1000;
        display: flex;
        flex-direction: column;
        transition: opacity 0.3s ease;
      ">
        <div id="console-header" style="
          background: rgba(0, 255, 65, 0.1);
          padding: 10px 15px;
          border-bottom: 1px solid #00FF41;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: move;
          user-select: none;
          font-weight: bold;
        ">
          <span>⚡ NERON CONSOLE</span>
          <div style="display: flex; gap: 8px;">
            <button id="console-close" style="
              background: none;
              border: none;
              color: #00FF41;
              font-size: 16px;
              cursor: pointer;
              padding: 2px 6px;
              border-radius: 3px;
              transition: background-color 0.2s;
            ">×</button>
          </div>
        </div>
        
        <div id="log-display" style="
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          font-size: 11px;
          line-height: 1.3;
          background: rgba(0, 0, 0, 0.3);
        "></div>
        
        <div id="input-area" style="
          padding: 10px;
          display: flex;
          align-items: center;
          border-top: 1px solid #00FF41;
          background: rgba(0, 255, 65, 0.05);
        ">
          <span id="input-prompt" style="
            color: #00FF41;
            margin-right: 8px;
            font-weight: bold;
          ">></span>
          <input type="text" id="command-input" placeholder="Type 'help' for commands..." style="
            flex: 1;
            background: transparent;
            border: none;
            color: #00FF41;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            outline: none;
          " />
        </div>
      </div>
    `;

    containerRef.current.innerHTML = htmlContent;
  };

  const initializeGraphSystem = async (): Promise<void> => {
    // Load required scripts
    await loadRequiredScripts();
    
    // Initialize the graph system with the same logic as graph-viewer.html
    await setupGraphSystem();
  };

  const loadRequiredScripts = async (): Promise<void> => {
    const scriptsToLoad = [
      'https://unpkg.com/three@0.157.0/build/three.min.js',
      'https://unpkg.com/3d-force-graph@1.77.0/dist/3d-force-graph.min.js'
    ];

    for (const scriptSrc of scriptsToLoad) {
      if (!document.querySelector(`script[src="${scriptSrc}"]`)) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = scriptSrc;
          script.onload = () => resolve();
          script.onerror = () => reject(new Error(`Failed to load ${scriptSrc}`));
          document.head.appendChild(script);
        });
      }
    }

    // Add import map for ES6 modules
    if (!document.querySelector('script[type="importmap"]')) {
      const importMap = document.createElement('script');
      importMap.type = 'importmap';
      importMap.textContent = JSON.stringify({
        imports: {
          "three": "https://unpkg.com/three@0.157.0/build/three.module.js",
          "three/examples/jsm/postprocessing/UnrealBloomPass.js": "https://unpkg.com/three@0.157.0/examples/jsm/postprocessing/UnrealBloomPass.js"
        }
      });
      document.head.appendChild(importMap);
    }
  };

  const setupGraphSystem = async (): Promise<void> => {
    if (typeof window === 'undefined') return;

    // Set up the graph system using the same logic as graph-viewer.html
    const graphSystem = new WebGraphSystem(data, theme, navigation, onNodeClick);
    await graphSystem.initialize();
  };

  if (error) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.errorText, { color: theme.colors.error }]}>
          Error: {error}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading Neural Matrix...
          </Text>
        </View>
      )}
      <div 
        ref={containerRef} 
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: theme.type === 'matrix' ? '#000003' : '#f8fafc'
        }} 
      />
    </View>
  );
};

// Web Graph System Class - Encapsulates graph-viewer.html logic
class WebGraphSystem {
  private data: Neo4jData;
  private theme: Theme;
  private navigation: any;
  private onNodeClick?: (node: any) => void;
  private currentGraph: any = null;
  private isGraphLoaded = false;
  private currentTheme = 'matrix';

  constructor(data: Neo4jData, theme: Theme, navigation: any, onNodeClick?: (node: any) => void) {
    this.data = data;
    this.theme = theme;
    this.navigation = navigation;
    this.onNodeClick = onNodeClick;
    this.currentTheme = theme.type === 'matrix' ? 'matrix' : 'regular';
  }

  async initialize(): Promise<void> {
    console.log('🔧 EXPO DEBUG: WebGraphSystem initialization starting...');
    
    try {
      // Set up console functionality
      console.log('🔧 EXPO DEBUG: Setting up console handling...');
      this.setupConsoleHandling();
      console.log('🔧 EXPO DEBUG: Console handling setup completed');
      
      // Load graph with current data
      console.log('🔧 EXPO DEBUG: Loading graph data...');
      this.loadGraph();
      console.log('🔧 EXPO DEBUG: Graph loading completed');
      
    } catch (error) {
      console.log('❌ EXPO ERROR: WebGraphSystem initialization failed:', error);
      this.logToConsole(`❌ System initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
    
    console.log('🔧 EXPO DEBUG: WebGraphSystem initialization finished');
  }

  private setupConsoleHandling(): void {
    const commandInput = document.getElementById('command-input') as HTMLInputElement;
    const consoleToggle = document.getElementById('console-toggle') as HTMLButtonElement;
    const consoleDiv = document.getElementById('console') as HTMLDivElement;
    const consoleHeader = document.getElementById('console-header') as HTMLDivElement;
    const consoleClose = document.getElementById('console-close') as HTMLButtonElement;

    // Command input handling
    if (commandInput) {
      commandInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          const command = commandInput.value;
          if (command.trim()) {
            this.handleCommand(command);
            commandInput.value = '';
          }
        }
      });
    }

    // Console toggle button
    if (consoleToggle && consoleDiv) {
      let isConsoleVisible = true;
      consoleToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        
        if (isConsoleVisible) {
          consoleDiv.style.opacity = '0';
          consoleDiv.style.pointerEvents = 'none';
          consoleToggle.innerHTML = '👁️';
          consoleToggle.title = 'Show Console';
          isConsoleVisible = false;
        } else {
          consoleDiv.style.opacity = '1';
          consoleDiv.style.pointerEvents = 'all';
          consoleToggle.innerHTML = '⚡';
          consoleToggle.title = 'Hide Console';
          isConsoleVisible = true;
        }
      });
    }

    // Console close button
    if (consoleClose && consoleDiv) {
      consoleClose.addEventListener('click', (e) => {
        e.stopPropagation();
        consoleDiv.style.opacity = '0';
        consoleDiv.style.pointerEvents = 'none';
        if (consoleToggle) {
          consoleToggle.innerHTML = '👁️';
          consoleToggle.title = 'Show Console';
        }
      });
    }

    // Make console draggable
    if (consoleHeader && consoleDiv) {
      let isDragging = false;
      let dragOffset = { x: 0, y: 0 };

      consoleHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        const rect = consoleDiv.getBoundingClientRect();
        dragOffset.x = e.clientX - rect.left;
        dragOffset.y = e.clientY - rect.top;
        consoleDiv.style.cursor = 'grabbing';
        e.preventDefault();
      });

      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const x = e.clientX - dragOffset.x;
        const y = e.clientY - dragOffset.y;
        
        // Boundary constraints
        const maxX = window.innerWidth - consoleDiv.offsetWidth;
        const maxY = window.innerHeight - consoleDiv.offsetHeight;
        
        const constrainedX = Math.max(0, Math.min(x, maxX));
        const constrainedY = Math.max(0, Math.min(y, maxY));
        
        consoleDiv.style.left = constrainedX + 'px';
        consoleDiv.style.top = constrainedY + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (isDragging) {
          isDragging = false;
          consoleDiv.style.cursor = 'default';
        }
      });
    }

    // Initial welcome messages
    this.logToConsole('🚀 Neron Graph Engine initialized');
    this.logToConsole('💡 Commands: "help", "init", "test", "theme", "clear", "status"');
  }

  private handleCommand(command: string): void {
    const cmd = command.trim().toLowerCase();
    this.logToConsole(`> ${command}`);
    
    if (cmd === 'help') {
      this.logToConsole('📖 Available commands:');
      this.logToConsole('   • help - Show this help message');
      this.logToConsole('   • init - Load current graph data');
      this.logToConsole('   • test - Create test graph');
      this.logToConsole('   • theme - Switch themes');
      this.logToConsole('   • clear - Clear console log');
      this.logToConsole('   • status - Show system status');
      this.logToConsole('');
      this.logToConsole('🖱️ Console is draggable - grab the header to move');
    } else if (cmd === 'init') {
      this.loadGraph();
    } else if (cmd === 'test') {
      this.createTestGraph();
    } else if (cmd === 'theme') {
      this.switchTheme();
    } else if (cmd === 'clear') {
      const logDisplay = document.getElementById('log-display');
      if (logDisplay) {
        logDisplay.innerHTML = '';
      }
      this.logToConsole('Console cleared');
    } else if (cmd === 'status') {
      this.logToConsole('📊 System Status:');
      this.logToConsole(`  Theme: ${this.currentTheme.toUpperCase()}`);
      this.logToConsole(`  Graph loaded: ${this.isGraphLoaded ? 'YES' : 'NO'}`);
      this.logToConsole(`  Entities: ${this.data.entities.length}`);
      this.logToConsole(`  Relations: ${this.data.relations.length}`);
      this.checkLibrariesStatus();
    } else if (cmd === '') {
      // Do nothing for empty command
    } else {
      this.logToConsole(`❓ Unknown command: "${command}". Type "help" for available commands.`);
    }
  }

  private logToConsole(message: string): void {
    const logDisplay = document.getElementById('log-display');
    if (logDisplay) {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = document.createElement('div');
      logEntry.style.marginBottom = '2px';
      logEntry.style.opacity = '0.9';
      logEntry.innerHTML = `<span style="color: #00BB29; font-size: 9px;">[${timestamp}]</span> ${message}`;
      logDisplay.appendChild(logEntry);
      logDisplay.scrollTop = logDisplay.scrollHeight;
      
      // Keep max 50 entries for performance
      while (logDisplay.children.length > 50) {
        logDisplay.removeChild(logDisplay.firstChild!);
      }
    }
  }

  private loadGraph(): void {
    console.log('🔧 EXPO DEBUG: loadGraph called');
    this.logToConsole('🔄 Loading graph data...');
    
    console.log('🔧 EXPO DEBUG: Checking libraries status...');
    if (!this.checkLibrariesStatus()) {
      console.log('❌ EXPO ERROR: Libraries not ready');
      this.logToConsole('❌ Cannot load graph - libraries not ready');
      return;
    }
    console.log('🔧 EXPO DEBUG: Libraries check passed');

    console.log('🔧 EXPO DEBUG: Transforming data for graph...');
    const transformedData = this.transformDataForGraph(this.data);
    console.log('🔧 EXPO DEBUG: Data transformed:', { 
      originalEntities: this.data.entities.length,
      originalRelations: this.data.relations.length,
      transformedNodes: transformedData.nodes.length,
      transformedLinks: transformedData.links.length 
    });
    
    console.log('🔧 EXPO DEBUG: Calling displayGraph...');
    this.displayGraph(transformedData);
    console.log('🔧 EXPO DEBUG: displayGraph call completed');
  }

  private createTestGraph(): void {
    this.logToConsole('🧪 Creating test graph...');
    
    const testData = {
      nodes: [
        { id: 'node1', name: 'Test Project', type: 'Project', val: 10 },
        { id: 'node2', name: 'Bug Fix Issue', type: 'Bug Fix', val: 8 },
        { id: 'node3', name: 'New Feature', type: 'Feature', val: 15 },
        { id: 'node4', name: 'Core Component', type: 'Component', val: 6 }
      ],
      links: [
        { source: 'node1', target: 'node2' },
        { source: 'node1', target: 'node3' },
        { source: 'node2', target: 'node4' }
      ]
    };

    this.displayGraph(testData);
  }

  private displayGraph(graphData: any): void {
    try {
      console.log('🔧 EXPO DEBUG: displayGraph called with data:', { 
        nodes: graphData.nodes?.length || 0, 
        links: graphData.links?.length || 0 
      });
      
      const graphElement = document.getElementById('graph');
      console.log('🔧 EXPO DEBUG: Graph element found:', !!graphElement);
      
      if (!graphElement) {
        console.log('❌ EXPO ERROR: Graph element not found');
        this.logToConsole('❌ Graph element not found');
        return;
      }

      console.log('🔧 EXPO DEBUG: Clearing graph element...');
      graphElement.innerHTML = '';
      
      console.log('🔧 EXPO DEBUG: Setting up graph colors...');
      const backgroundColor = this.currentTheme === 'matrix' ? '#000000' : '#1e293b';
      const linkColor = this.currentTheme === 'matrix' ? '#004d1a' : '#64748b';
      
      console.log('🔧 EXPO DEBUG: Creating ForceGraph3D instance...');
      
      if (typeof (window as any).ForceGraph3D !== 'function') {
        console.log('❌ EXPO ERROR: ForceGraph3D not available');
        this.logToConsole('❌ ForceGraph3D not available');
        return;
      }
      
      const Graph = (window as any).ForceGraph3D()(graphElement)
        .graphData(graphData)
        .backgroundColor(backgroundColor)
        .nodeColor((node: any) => {
          console.log('🔧 EXPO DEBUG: Getting color for node:', node.type);
          return this.getNodeColor(node.type, this.currentTheme);
        })
        .linkColor(() => linkColor)
        .nodeLabel('name')
        .linkLabel((link: any) => `${link.source} → ${link.target}`)
        .onNodeClick((node: any) => {
          console.log('🔧 EXPO DEBUG: Node clicked:', node.name);
          this.logToConsole(`🖱️ Node clicked: ${node.name} (${node.type})`);
          
          if (this.navigation) {
            const nodeData = {
              id: node.id,
              name: node.name,
              type: node.type,
              observations: node.observations || [],
              color: this.getNodeColor(node.type, this.currentTheme),
              val: node.val || 1
            };

            this.navigation.navigate('NodeDetails', {
              node: nodeData,
              allData: this.data
            });
          }
          
          if (this.onNodeClick) {
            this.onNodeClick(node);
          }
        })
        .enableNodeDrag(true)
        .onEngineStop(() => {
          console.log('🔧 EXPO DEBUG: Graph engine stopped, layout stabilized');
          this.logToConsole('🎯 Graph layout stabilized with bloom effects!');
        });
      
      console.log('🔧 EXPO DEBUG: Graph created successfully');
      this.currentGraph = Graph;
      this.isGraphLoaded = true;
      
      // ✨ Apply bloom effects IMMEDIATELY during graph creation (not after)
      console.log('🔧 EXPO DEBUG: Applying bloom effects synchronously...');
      this.applyBloomEffects(Graph);
      
      this.logToConsole(`✅ GLOWING graph ready with ${this.currentTheme} theme and bloom effects!`);
      console.log('🔧 EXPO DEBUG: Graph rendering completed');
      
    } catch (error) {
      console.log('❌ EXPO ERROR: Graph display error:', error);
      this.logToConsole(`❌ Graph display error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // ✨ Apply bloom effects IMMEDIATELY during graph creation (research-based approach)
  private applyBloomEffects(graph: any): void {
    try {
      console.log('🔧 EXPO DEBUG: Applying bloom effects synchronously...');
      this.logToConsole('✨ Applying bloom effects for glowing visuals...');
      
      // Check if postProcessingComposer is available
      if (!graph.postProcessingComposer || typeof graph.postProcessingComposer !== 'function') {
        console.log('⚠️ EXPO WARNING: postProcessingComposer not available');
        this.logToConsole('⚠️ Bloom not supported - continuing with basic graph');
        return;
      }

      // Get the composer (this should work immediately after graph creation)
      const composer = graph.postProcessingComposer();
      
      if (!composer) {
        console.log('⚠️ EXPO WARNING: Could not get post-processing composer');
        this.logToConsole('⚠️ Could not access composer - continuing without bloom');
        return;
      }

      // Load UnrealBloomPass and apply immediately
      this.loadAndApplyBloom(composer);
      
    } catch (error) {
      console.log('❌ EXPO ERROR: Bloom setup error:', error);
      this.logToConsole(`⚠️ Bloom setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logToConsole('💡 Continuing with basic graph - still functional');
    }
  }

  private async loadAndApplyBloom(composer: any): Promise<void> {
    try {
      console.log('🔧 EXPO DEBUG: Loading UnrealBloomPass...');
      
      // Use dynamic import to load UnrealBloomPass (as per research)
      const dynamicImport = new Function('specifier', 'return import(specifier)');
      const module = await dynamicImport('https://unpkg.com/three@0.157.0/examples/jsm/postprocessing/UnrealBloomPass.js');
      const UnrealBloomPass = module.UnrealBloomPass;
      
      if (!UnrealBloomPass) {
        throw new Error('UnrealBloomPass not found in module');
      }

      console.log('🔧 EXPO DEBUG: Creating bloom pass...');
      const bloomPass = new UnrealBloomPass();
      
      // Apply theme-based bloom parameters (research-based values)
      if (this.currentTheme === 'matrix') {
        // Matrix theme: Green glow
        bloomPass.strength = 1.5;
        bloomPass.radius = 0.8;
        bloomPass.threshold = 0.1;
      } else {
        // Regular theme: Subtle multicolored glow
        bloomPass.strength = 1.0;
        bloomPass.radius = 0.6;
        bloomPass.threshold = 0.2;
      }
      
      console.log('🔧 EXPO DEBUG: Adding bloom pass to composer...');
      composer.addPass(bloomPass);
      
      console.log('✅ EXPO SUCCESS: Bloom effects applied successfully!');
      this.logToConsole(`✅ Bloom effects applied! Strength: ${bloomPass.strength}, Radius: ${bloomPass.radius}`);
      this.logToConsole('🌟 Graph now has glowing visuals!');
      
    } catch (error) {
      console.log('❌ EXPO ERROR: Bloom loading failed:', error);
      this.logToConsole(`❌ Bloom loading failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      this.logToConsole('💡 Graph still functional without bloom effects');
    }
  }

  private switchTheme(): void {
    const newTheme = this.currentTheme === 'matrix' ? 'regular' : 'matrix';
    this.logToConsole(`🔄 Switching from ${this.currentTheme} to ${newTheme} theme...`);
    this.currentTheme = newTheme;
    
    // Update console theme
    const consoleDiv = document.getElementById('console');
    const consoleToggle = document.getElementById('console-toggle');
    const inputPrompt = document.getElementById('input-prompt');
    
    if (this.currentTheme === 'regular') {
      if (consoleDiv) {
        consoleDiv.style.background = 'rgba(255, 255, 255, 0.95)';
        consoleDiv.style.borderColor = '#2563eb';
        consoleDiv.style.color = '#1e40af';
      }
      if (consoleToggle) {
        consoleToggle.style.borderColor = '#2563eb';
        consoleToggle.style.color = '#1e40af';
        consoleToggle.style.background = 'rgba(255, 255, 255, 0.9)';
      }
      if (inputPrompt) inputPrompt.textContent = '$';
    } else {
      if (consoleDiv) {
        consoleDiv.style.background = 'rgba(0, 0, 0, 0.9)';
        consoleDiv.style.borderColor = '#00FF41';
        consoleDiv.style.color = '#00FF41';
      }
      if (consoleToggle) {
        consoleToggle.style.borderColor = '#00FF41';
        consoleToggle.style.color = '#00FF41';
        consoleToggle.style.background = 'rgba(0, 0, 0, 0.8)';
      }
      if (inputPrompt) inputPrompt.textContent = '>';
    }
    
    // Re-render graph with new theme if loaded
    if (this.isGraphLoaded && this.currentGraph) {
      this.logToConsole('🔄 Updating graph colors...');
      this.updateGraphColors();
    }
    
    this.logToConsole(`🎨 Theme switched to ${newTheme.toUpperCase()}`);
  }

    private updateGraphColors(): void {
    if (!this.currentGraph) return;
    
    try {
      console.log('🔧 EXPO DEBUG: Updating graph colors for theme:', this.currentTheme);
      
      const backgroundColor = this.currentTheme === 'matrix' ? '#000000' : '#1e293b';
      const linkColor = this.currentTheme === 'matrix' ? '#004d1a' : '#64748b';
      
      this.currentGraph
        .backgroundColor(backgroundColor)
        .nodeColor((node: any) => this.getNodeColor(node.type, this.currentTheme))
        .linkColor(() => linkColor);
        
      this.logToConsole(`✅ BASIC graph colors updated for ${this.currentTheme} theme`);
      console.log('🔧 EXPO DEBUG: Graph colors updated successfully');
    } catch (error) {
      console.log('❌ EXPO ERROR: Failed to update graph colors:', error);
      this.logToConsole(`❌ Failed to update graph colors: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformDataForGraph(neo4jData: Neo4jData): any {
    const nodes = neo4jData.entities.map(entity => ({
      id: entity.name,
      name: entity.name,
      type: entity.type,
      val: Math.min(entity.observations.length * 2 + 5, 20),
      observations: entity.observations
    }));

    const links = neo4jData.relations.map(relation => ({
      source: relation.source,
      target: relation.target,
      relationType: relation.relationType
    }));

    return { nodes, links };
  }

  private getNodeColor(nodeType: string, themeType: string): string {
    const colorMappings = {
      matrix: {
        'Project': '#00FF41',
        'Bug Fix': '#FF4444',
        'Feature': '#00DD35',
        'Component': '#00BB29',
        'Architecture': '#44FF44',
        'Infrastructure': '#00AA22',
        'Strategy': '#FFAA00',
        'Problem Analysis': '#FF6666',
        'Feature Implementation': '#00CC30',
        'Architecture Strategy': '#44CCFF',
        'default': '#00FF41'
      },
      regular: {
        'Project': '#3b82f6',
        'Bug Fix': '#ef4444',
        'Feature': '#10b981',
        'Component': '#8b5cf6',
        'Architecture': '#06b6d4',
        'Infrastructure': '#64748b',
        'Strategy': '#f59e0b',
        'Problem Analysis': '#f87171',
        'Feature Implementation': '#14b8a6',
        'Architecture Strategy': '#0ea5e9',
        'default': '#6b7280'
      }
    };

    const themeColors = colorMappings[themeType as keyof typeof colorMappings] || colorMappings.regular;
    return themeColors[nodeType as keyof typeof themeColors] || themeColors.default;
  }

  private checkLibrariesStatus(): boolean {
    const threeAvailable = typeof (window as any).THREE !== 'undefined';
    const forceGraphAvailable = typeof (window as any).ForceGraph3D !== 'undefined';
    
    this.logToConsole(`${threeAvailable ? '✅' : '❌'} THREE.js: ${threeAvailable ? 'Available' : 'Missing'}`);
    this.logToConsole(`${forceGraphAvailable ? '✅' : '❌'} ForceGraph3D: ${forceGraphAvailable ? 'Available' : 'Missing'}`);
    
    const allReady = threeAvailable && forceGraphAvailable;
    this.logToConsole(`📊 Libraries ready: ${allReady ? 'YES' : 'NO'}`);
    
    return allReady;
  }
}

// Mobile WebView implementation
const MobileGraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  onLinkClick,
  navigation,
  theme,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  // Get HTML file path
  useEffect(() => {
    const getAssetUri = async () => {
      try {
        console.log('📱 MOBILE: Loading graph-viewer.html asset...');
        const asset = Asset.fromModule(require('../../assets/graph-viewer.html'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        console.log('📱 MOBILE: HTML asset loaded successfully:', uri);
        setWebViewUrl(uri);
        setHasError(false);
      } catch (error) {
        console.error('📱 MOBILE ERROR: Failed to load HTML asset:', error);
        setHasError(true);
        Alert.alert('Error', 'Failed to load graph viewer');
      }
    };

    getAssetUri();
  }, []);

  // Send theme updates to WebView
  useEffect(() => {
    if (webViewRef.current && !isLoading) {
      const message = {
        type: 'updateTheme',
        theme: theme.type
      };
      
      console.log(`📱 MOBILE: Theme changed, sending to WebView: ${theme.type}`);
      
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify(message));
      }, 1000);
    }
  }, [theme.type, isLoading]);

  // Transform Neo4j data for the graph
  const transformDataForGraph = (neo4jData: Neo4jData) => {
    const entities = neo4jData.entities.map(entity => ({
      id: entity.name,
      name: entity.name,
      type: entity.type,
      val: Math.min(entity.observations.length * 2 + 5, 20),
      observations: entity.observations
    }));

    const relations = neo4jData.relations.map(relation => ({
      source: relation.source,
      target: relation.target,
      relationType: relation.relationType
    }));

    return { entities, relations };
  };

  // Handle messages from WebView
  const handleWebViewMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      switch (message.type) {
        case 'log':
          const logMessage = message.message || 'Unknown log message';
          const logLevel = message.level || 'info';
          
          if (logLevel === 'error') {
            console.error(`📱 WEBVIEW ERROR: ${logMessage}`);
          } else if (logLevel === 'warn') {
            console.warn(`📱 WEBVIEW WARN: ${logMessage}`);
          } else {
            console.log(`📱 WEBVIEW: ${logMessage}`);
          }
          break;

        case 'request_graph_data':
          console.log('📱 WEBVIEW: Requesting graph data...');
          const transformedData = transformDataForGraph(data);
          const loadMessage = {
            type: 'loadGraphData',
            data: transformedData,
            theme: theme.type
          };
          
          console.log(`📱 WEBVIEW: Sending graph data - ${transformedData.entities.length} entities, ${transformedData.relations.length} relations`);
          
          setTimeout(() => {
            webViewRef.current?.postMessage(JSON.stringify(loadMessage));
          }, 100);
          break;

        case 'nodeClicked':
          console.log(`📱 WEBVIEW: Node clicked - ${message.node?.name || 'Unknown node'}`);
          if (message.node && navigation) {
            const nodeData = {
              id: message.node.id,
              name: message.node.name,
              type: message.node.type,
              observations: message.node.observations || [],
              color: message.node.color || theme.colors.primary,
              val: message.node.val || 1
            };

            navigation.navigate('NodeDetails', {
              node: nodeData,
              allData: message.allData || { entities: [], relations: [] }
            });
          }
          
          if (onNodeClick) {
            onNodeClick(message.node);
          }
          break;

        case 'webgl_error':
          console.error('📱 WEBVIEW WebGL ERROR:', message.error);
          Alert.alert(
            'Graphics Error',
            'Unable to initialize 3D graphics. This may be due to device limitations.',
            [{ text: 'OK' }]
          );
          break;

        case 'initialization_complete':
          console.log('📱 WEBVIEW: Initialization completed successfully');
          setIsLoading(false);
          break;

        case 'initialization_failed':
          console.error('📱 WEBVIEW: Initialization failed:', message.error);
          setHasError(true);
          setIsLoading(false);
          break;

        default:
          console.log(`📱 WEBVIEW: Unknown message type: ${message.type}`, message);
      }
    } catch (error) {
      console.error('📱 WEBVIEW ERROR: Failed to parse message:', error);
    }
  };

  const handleWebViewLoad = () => {
    console.log('📱 MOBILE: WebView loaded successfully');
    
    setTimeout(() => {
      const themeMessage = {
        type: 'updateTheme',
        theme: theme.type
      };
      console.log(`📱 MOBILE: Sending initial theme: ${theme.type}`);
      webViewRef.current?.postMessage(JSON.stringify(themeMessage));
    }, 500);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('📱 MOBILE ERROR: WebView failed to load', nativeEvent);
    setIsLoading(false);
    setHasError(true);
    Alert.alert('Error', 'Failed to load graph visualization');
  };

  const handleWebViewLoadStart = () => {
    console.log('📱 MOBILE: WebView load started');
    setIsLoading(true);
    setHasError(false);
  };

  const handleWebViewLoadEnd = () => {
    console.log('📱 MOBILE: WebView load ended');
    // Don't set loading to false here, wait for initialization_complete message
  };

  const retryLoad = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  if (!webViewUrl && !hasError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Initializing Graph Engine...
        </Text>
      </View>
    );
  }

  if (hasError) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
        <Text style={[styles.errorText, { color: theme.colors.error, textAlign: 'center', marginBottom: 20 }]}>
          Failed to load graph visualization. This may be due to device limitations with 3D graphics.
        </Text>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
          onPress={retryLoad}
        >
          <Text style={[styles.retryButtonText, { color: theme.colors.background }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Loading Neural Network...
          </Text>
        </View>
      )}
      
      <WebView
        ref={webViewRef}
        source={{ uri: webViewUrl }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onLoadStart={handleWebViewLoadStart}
        onLoadEnd={handleWebViewLoadEnd}
        
        // iOS-specific WebView optimizations
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        allowsFullscreenVideo={false}
        bounces={false}
        scrollEnabled={false}
        
        // Enhanced JavaScript and security settings
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        
        // iOS WebView optimizations for graphics performance
        allowsBackForwardNavigationGestures={false}
        dataDetectorTypes="none"
        textZoom={100}
        
        // Content handling optimizations
        scalesPageToFit={Platform.OS === 'android'}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={true}
        
        // iOS-specific performance settings
        decelerationRate="normal"
        automaticallyAdjustContentInsets={false}
        contentInset={{ top: 0, left: 0, bottom: 0, right: 0 }}
        
        // iOS 14+ specific optimizations
        limitsNavigationsToAppBoundDomains={false}
        fraudulentWebsiteWarningEnabled={false}
        
        // WebGL and graphics optimizations
        allowsAirPlayForMediaPlayback={false}
        allowsPictureInPictureMediaPlayback={false}
        
        // Error recovery settings
        onShouldStartLoadWithRequest={(request) => {
          // Allow all requests for local assets
          return true;
        }}
        
        // Advanced rendering settings for iOS
        renderError={(errorName) => (
          <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 }]}>
            <Text style={[styles.errorText, { color: theme.colors.error, textAlign: 'center', marginBottom: 20 }]}>
              WebView Error: {errorName}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} 
              onPress={retryLoad}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.background }]}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        )}
        
        renderLoading={() => (
          <View style={[styles.loadingOverlay, { backgroundColor: theme.colors.background }]}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Loading Neural Matrix...
            </Text>
          </View>
        )}
      />
    </View>
  );
};

// Main component that switches between web and mobile implementations
export const GraphVisualization: React.FC<GraphVisualizationProps> = (props) => {
  if (Platform.OS === 'web') {
    return <WebGraphVisualization {...props} />;
  } else {
    return <MobileGraphVisualization {...props} />;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  graphContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 