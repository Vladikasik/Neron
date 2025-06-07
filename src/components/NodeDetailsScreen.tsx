import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { Neo4jData } from '../utils/dataTransformer';
import { useTheme } from '../contexts/ThemeContext';

// Define the navigation stack parameter list
type RootStackParamList = {
  Graph: undefined;
  NodeDetails: {
    node: {
      id: string;
      name: string;
      type: string;
      observations: string[];
      color: string;
      val: number;
    };
    allData: Neo4jData;
  };
};

// Use the proper React Navigation type
type NodeDetailsScreenProps = StackScreenProps<RootStackParamList, 'NodeDetails'>;

const { width } = Dimensions.get('window');

export const NodeDetailsScreen: React.FC<NodeDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { node, allData } = route.params;
  const { theme } = useTheme();
  const styles = createStyles(theme);

  // Calculate backlinks (relationships pointing TO this node)
  const backlinks = allData.relations.filter(
    (relation) => relation.target === node.name
  );

  // Calculate outgoing links (relationships FROM this node)
  const outgoingLinks = allData.relations.filter(
    (relation) => relation.source === node.name
  );

  // Get connected nodes
  const getConnectedNodeInfo = (nodeName: string) => {
    return allData.entities.find(entity => entity.name === nodeName);
  };

  const navigateToNode = (nodeName: string) => {
    const targetNode = allData.entities.find(entity => entity.name === nodeName);
    if (targetNode) {
      // Transform to match the expected format
      const formattedNode = {
        id: targetNode.name,
        name: targetNode.name,
        type: targetNode.type,
        observations: targetNode.observations,
        color: getNodeColor(targetNode.type),
        val: targetNode.observations.length * 2 + 5,
      };
      
      navigation.navigate('NodeDetails', {
        node: formattedNode,
        allData: allData,
      });
    }
  };

  const getNodeColor = (type: string) => {
    const nodeColors: { [key: string]: string } = {
      'Project': '#FF6B6B', 'project': '#FF6B6B',
      'codebase_component': '#4ECDC4', 'Component': '#4ECDC4',
      'Decision': '#45B7D1', 'Architecture': '#96CEB4',
      'Implementation': '#FFEAA7', 'Infrastructure': '#DDA0DD',
      'Configuration': '#F39C12', 'Environment': '#A8E6CF',
      'Bug': '#FF7675', 'Bug Fix': '#FF7675',
      'Feature': '#74B9FF', 'Process': '#81ECEC',
      'Script': '#FD79A8', 'Documentation': '#FDCB6E',
      'Resource': '#E17055', 'Domain': '#6C5CE7',
      'milestone': '#00B894', 'Roadmap': '#2D3436',
      'deliverable_summary': '#636E72', 'Strategy': '#B2BEC3',
      'Cleanup': '#DDD', 'default': '#74B9FF'
    };
    return nodeColors[type] || nodeColors.default;
  };

  const totalConnections = backlinks.length + outgoingLinks.length;

  const renderObservation = (observation: string, index: number) => (
    <View key={index} style={styles.observationCard}>
      <View style={styles.observationHeader}>
        <Text style={styles.observationNumber}>#{index + 1}</Text>
      </View>
      <Text style={styles.observationText}>{observation}</Text>
    </View>
  );

  const renderRelation = (relation: any, index: number, isIncoming: boolean) => (
    <View key={`${isIncoming ? 'in' : 'out'}-${index}`} style={styles.relationCard}>
      <View style={styles.relationHeader}>
        <Ionicons
          name={isIncoming ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={theme.colors.primary}
        />
        <Text style={styles.relationType}>{relation.relationType}</Text>
      </View>
      <Text style={styles.relationNode}>
        {isIncoming ? relation.source : relation.target}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {theme.type === 'matrix' ? 'NODE DETAILS' : 'Node Details'}
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Node Info Card */}
        <View style={styles.nodeInfoCard}>
          <View style={styles.nodeHeader}>
            <View
              style={[
                styles.nodeIcon,
                { backgroundColor: node.color || theme.colors.primary },
              ]}
            />
            <View style={styles.nodeInfo}>
              <Text style={styles.nodeName}>{node.name}</Text>
              <Text style={styles.nodeType}>{node.type}</Text>
              <Text style={styles.nodeStats}>
                {node.observations.length} {theme.type === 'matrix' ? 'observations' : 'observations'} • {totalConnections} {theme.type === 'matrix' ? 'connections' : 'connections'}
              </Text>
            </View>
          </View>
        </View>

        {/* Observations Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>
              {theme.type === 'matrix' ? 'OBSERVATIONS' : 'Observations'}
            </Text>
          </View>
          {node.observations.map((observation, index) =>
            renderObservation(observation, index)
          )}
        </View>

        {/* Relationships Section */}
        {totalConnections > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="git-network" size={20} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>
                {theme.type === 'matrix' ? 'NEURAL CONNECTIONS' : 'Relationships'}
              </Text>
            </View>

            {/* Incoming Relationships */}
            {backlinks.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>
                  {theme.type === 'matrix' ? 'INCOMING SIGNALS' : 'Incoming Relations'}
                </Text>
                {backlinks.map((relation, index) =>
                  renderRelation(relation, index, true)
                )}
              </View>
            )}

            {/* Outgoing Relationships */}
            {outgoingLinks.length > 0 && (
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle}>
                  {theme.type === 'matrix' ? 'OUTGOING SIGNALS' : 'Outgoing Relations'}
                </Text>
                {outgoingLinks.map((relation, index) =>
                  renderRelation(relation, index, false)
                )}
              </View>
            )}
          </View>
        )}

        {/* Technical Details Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>
              {theme.type === 'matrix' ? 'TECHNICAL SPECS' : 'Technical Details'}
            </Text>
          </View>
          <View style={styles.techCard}>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>
                {theme.type === 'matrix' ? 'NODE ID:' : 'ID:'}
              </Text>
              <Text style={styles.techValue}>{node.id}</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>
                {theme.type === 'matrix' ? 'SIGNAL STRENGTH:' : 'Value:'}
              </Text>
              <Text style={styles.techValue}>{node.val}</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>
                {theme.type === 'matrix' ? 'COLOR CODE:' : 'Color:'}
              </Text>
              <Text style={styles.techValue}>{node.color}</Text>
            </View>
            <View style={styles.techRow}>
              <Text style={styles.techLabel}>
                {theme.type === 'matrix' ? 'CLASSIFICATION:' : 'Type:'}
              </Text>
              <Text style={styles.techValue}>{node.type}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (theme: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
    letterSpacing: theme.type === 'matrix' ? 1 : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  nodeInfoCard: {
    backgroundColor: theme.type === 'matrix' ? 'rgba(0, 255, 65, 0.05)' : 'rgba(116, 185, 255, 0.05)',
    borderRadius: 12,
    padding: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  nodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nodeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: theme.type === 'matrix' ? 0.8 : 0.3,
    shadowRadius: theme.type === 'matrix' ? 10 : 5,
    elevation: 8,
  },
  nodeInfo: {
    flex: 1,
  },
  nodeName: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
    marginBottom: 4,
    textShadowColor: theme.type === 'matrix' ? theme.colors.primary : 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: theme.type === 'matrix' ? 5 : 0,
  },
  nodeType: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontFamily: theme.fonts.primary,
    marginBottom: 8,
    fontWeight: theme.type === 'matrix' ? 'bold' : 'normal',
  },
  nodeStats: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontFamily: theme.fonts.primary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: theme.fonts.primary,
    letterSpacing: theme.type === 'matrix' ? 1 : 0,
  },
  observationCard: {
    backgroundColor: theme.type === 'matrix' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(45, 52, 54, 0.6)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  observationHeader: {
    marginBottom: 8,
  },
  observationNumber: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
    textTransform: 'uppercase',
  },
  observationText: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: theme.fonts.primary,
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionTitle: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    fontFamily: theme.fonts.primary,
    textTransform: theme.type === 'matrix' ? 'uppercase' : 'none',
    letterSpacing: theme.type === 'matrix' ? 1 : 0,
  },
  relationCard: {
    backgroundColor: theme.type === 'matrix' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(45, 52, 54, 0.4)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  relationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  relationType: {
    color: theme.colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 8,
    fontFamily: theme.fonts.primary,
    textTransform: 'uppercase',
  },
  relationNode: {
    color: theme.colors.text,
    fontSize: 14,
    fontFamily: theme.fonts.primary,
  },
  techCard: {
    backgroundColor: theme.type === 'matrix' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(45, 52, 54, 0.6)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  techLabel: {
    color: theme.colors.textSecondary,
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
    textTransform: theme.type === 'matrix' ? 'uppercase' : 'none',
  },
  techValue: {
    color: theme.colors.text,
    fontSize: 12,
    fontFamily: theme.fonts.primary,
    fontWeight: theme.type === 'matrix' ? 'bold' : 'normal',
  },
}); 