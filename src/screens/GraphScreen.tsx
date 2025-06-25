import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { GraphVisualization } from '../components/GraphVisualization';
import { useGraphData } from '../hooks/useGraphData';
import { useTheme } from '../contexts/ThemeContext';

interface GraphScreenProps {
  navigation: any;
}

export const GraphScreen: React.FC<GraphScreenProps> = ({ navigation }) => {
  const { data, loading, error, refreshData } = useGraphData();
  const { theme, toggleTheme } = useTheme();

  const handleNodeClick = (node: any) => {
    // This is now handled in GraphVisualization component via navigation
    console.log('Node clicked in GraphScreen:', node.name);
  };

  const handleLinkClick = (link: any) => {
    console.log('Link clicked:', link);
    // Could show link details or navigate to another screen
  };

  const styles = createStyles(theme);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>
            {theme.type === 'matrix' ? 'Loading Neural Matrix Data...' : 'Loading Graph Data...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {theme.type === 'matrix' ? 'ERROR:' : 'Error:'} {error}
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={refreshData}>
            <Text style={styles.retryButtonText}>
              {theme.type === 'matrix' ? 'RETRY' : 'Retry'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>
            {theme.type === 'matrix' ? 'No neural data available' : 'No data available'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {theme.type === 'matrix' ? 'NERON GRAPH VISUALIZATION' : 'Neron Graph Visualization'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {data.entities.length} {theme.type === 'matrix' ? 'ENTITIES' : 'Entities'} • {data.relations.length} {theme.type === 'matrix' ? 'RELATIONS' : 'Relations'}
            </Text>
          </View>
          <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
            <Ionicons 
              name={theme.type === 'matrix' ? 'grid' : 'code'} 
              size={24} 
              color={theme.colors.primary} 
            />
            <Text style={styles.themeButtonText}>
              {theme.type === 'matrix' ? 'MATRIX' : 'Regular'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.graphContainer}>
        <GraphVisualization 
          data={data}
          onNodeClick={handleNodeClick}
          onLinkClick={handleLinkClick}
          navigation={navigation}
          theme={theme}
        />
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
    letterSpacing: theme.type === 'matrix' ? 2 : 0,
    ...(theme.type === 'matrix' && {
      textShadowColor: theme.colors.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
    }),
  },
  headerSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
    fontFamily: theme.fonts.primary,
    letterSpacing: theme.type === 'matrix' ? 1 : 0,
  },
  themeButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    minWidth: 70,
  },
  themeButtonText: {
    color: theme.colors.primary,
    fontSize: 10,
    fontFamily: theme.fonts.primary,
    marginTop: 2,
    fontWeight: 'bold',
  },
  graphContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    color: theme.colors.primary,
    fontSize: 18,
    textAlign: 'center',
    fontFamily: theme.fonts.primary,
  },
  errorText: {
    color: theme.colors.error,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: theme.fonts.primary,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  retryButtonText: {
    color: theme.type === 'matrix' ? theme.colors.background : theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
  },
}); 