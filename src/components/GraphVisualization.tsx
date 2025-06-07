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
        const asset = Asset.fromModule(require('../../assets/graph-viewer.html'));
        await asset.downloadAsync();
        setWebViewUrl(asset.localUri || asset.uri);
      } catch (error) {
        console.error('Error loading HTML asset:', error);
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
        case 'request_graph_data':
          // Send graph data when WebView requests it via "init" command
          const transformedData = transformDataForGraph(data);
          const loadMessage = {
            type: 'loadGraphData',
            data: transformedData,
            theme: theme.type
          };
          
          setTimeout(() => {
            webViewRef.current?.postMessage(JSON.stringify(loadMessage));
          }, 100);
          break;

        case 'clear_graph':
          // Handle graph clearing via "SHUTDOWN" command
          console.log('Graph cleared via WebView command');
          break;

        case 'nodeClicked':
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

        case 'log':
          // Handle console logs from WebView (optional for debugging)
          console.log('WebView log:', message.message);
          break;

        default:
          console.log('Unknown WebView message type:', message.type);
      }
    } catch (error) {
      console.error('Error parsing WebView message:', error);
    }
  };

  // Handle WebView load completion
  const handleWebViewLoad = () => {
    setIsLoading(false);
    
    // Send initial theme after WebView loads
    setTimeout(() => {
      const themeMessage = {
        type: 'updateTheme',
        theme: theme.type
      };
      webViewRef.current?.postMessage(JSON.stringify(themeMessage));
    }, 500);
  };

  const handleWebViewError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView error:', nativeEvent);
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