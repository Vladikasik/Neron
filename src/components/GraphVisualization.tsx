import React, { useRef, useEffect, useState } from 'react';
import { View, StyleSheet, Alert, Text, ActivityIndicator, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import { Asset } from 'expo-asset';
import { Neo4jData } from '../utils/dataTransformer';
import { Theme } from '../contexts/ThemeContext';

interface GraphVisualizationProps {
  data: Neo4jData;
  onNodeClick?: (node: any) => void;
  onLinkClick?: (link: any) => void;
  navigation?: any;
  theme: Theme;
}

export const GraphVisualization: React.FC<GraphVisualizationProps> = ({
  data,
  onNodeClick,
  onLinkClick,
  navigation,
  theme,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [webViewUrl, setWebViewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  // Get HTML file path
  useEffect(() => {
    const getAssetUri = async () => {
      try {
        console.log('🌐 REACT NATIVE: Loading graph-viewer.html asset...');
        const asset = Asset.fromModule(require('../../assets/graph-viewer.html'));
        await asset.downloadAsync();
        const uri = asset.localUri || asset.uri;
        console.log('🌐 REACT NATIVE: HTML asset loaded successfully:', uri);
        setWebViewUrl(uri);
      } catch (error) {
        console.error('🌐 REACT NATIVE ERROR: Failed to load HTML asset:', error);
        Alert.alert('Error', 'Failed to load graph viewer');
      }
    };

    getAssetUri();
  }, []);

  // Send theme updates to WebView
  useEffect(() => {
    if (webViewRef.current) {
      const message = {
        type: 'updateTheme',
        theme: theme.type
      };
      
      console.log(`🌐 REACT NATIVE: Theme changed, sending to WebView: ${theme.type}`);
      
      setTimeout(() => {
        webViewRef.current?.postMessage(JSON.stringify(message));
      }, 1000);
    }
  }, [theme.type]);

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
          // Handle logging messages from WebView and display in Mac terminal console
          const logMessage = message.message || 'Unknown log message';
          const logLevel = message.level || 'info';
          
          // Output to Mac terminal console where npm start ios is running
          if (logLevel === 'error') {
            console.error(`🌐 WEBVIEW ERROR: ${logMessage}`);
          } else if (logLevel === 'warn') {
            console.warn(`🌐 WEBVIEW WARN: ${logMessage}`);
          } else {
            console.log(`🌐 WEBVIEW: ${logMessage}`);
          }
          
          // Also use React Native's console for additional visibility
          if (__DEV__) {
            console.log(`[NERON WEBVIEW] ${logMessage}`);
          }
          break;

        case 'request_graph_data':
          console.log('🌐 WEBVIEW: Requesting graph data...');
          // Send graph data when WebView requests it via "init" command
          const transformedData = transformDataForGraph(data);
          const loadMessage = {
            type: 'loadGraphData',
            data: transformedData,
            theme: theme.type
          };
          
          console.log(`🌐 WEBVIEW: Sending graph data - ${transformedData.entities.length} entities, ${transformedData.relations.length} relations`);
          
          setTimeout(() => {
            webViewRef.current?.postMessage(JSON.stringify(loadMessage));
          }, 100);
          break;

        case 'clear_graph':
          // Handle graph clearing via "SHUTDOWN" command
          console.log('🌐 WEBVIEW: Graph cleared via SHUTDOWN command');
          break;

        case 'nodeClicked':
          console.log(`🌐 WEBVIEW: Node clicked - ${message.node?.name || 'Unknown node'}`);
          // Handle node clicks
          if (message.node && navigation) {
            const nodeData = {
              id: message.node.id,
              name: message.node.name,
              type: message.node.type,
              observations: message.node.observations || [],
              color: message.node.color || theme.colors.primary,
              val: message.node.val || 1
            };

            // Navigate to node details
            navigation.navigate('NodeDetails', {
              node: nodeData,
              allData: message.allData || { entities: [], relations: [] }
            });
          }
          
          if (onNodeClick) {
            onNodeClick(message.node);
          }
          break;

        default:
          console.log(`🌐 WEBVIEW: Unknown message type: ${message.type}`, message);
      }
    } catch (error) {
      console.error('🌐 WEBVIEW ERROR: Failed to parse message:', error);
      console.error('🌐 WEBVIEW ERROR: Raw message data:', event.nativeEvent.data);
    }
  };

  // Handle WebView load completion
  const handleWebViewLoad = () => {
    console.log('🌐 REACT NATIVE: WebView loaded successfully');
    setIsLoading(false);
    
    // Send initial theme after WebView loads
    setTimeout(() => {
      const themeMessage = {
        type: 'updateTheme',
        theme: theme.type
      };
      console.log(`🌐 REACT NATIVE: Sending initial theme: ${theme.type}`);
      webViewRef.current?.postMessage(JSON.stringify(themeMessage));
    }, 500);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('🌐 REACT NATIVE ERROR: WebView failed to load');
    console.error('🌐 REACT NATIVE ERROR: Error details:', nativeEvent);
    console.error('🌐 REACT NATIVE ERROR: URL:', nativeEvent.url);
    console.error('🌐 REACT NATIVE ERROR: Description:', nativeEvent.description);
    setIsLoading(false);
    Alert.alert('Error', 'Failed to load graph visualization');
  };

  if (!webViewUrl) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Initializing Graph Engine...
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
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={false}
        scalesPageToFit={Platform.OS === 'android'}
        originWhitelist={['*']}
        mixedContentMode="compatibility"
        allowsFullscreenVideo={false}
        scrollEnabled={false}
        bounces={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        overScrollMode="never"
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={true}
        allowsBackForwardNavigationGestures={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
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
}); 