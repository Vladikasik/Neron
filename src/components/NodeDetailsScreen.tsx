import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Platform,
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

// Web-specific responsive breakpoints
const getResponsiveLayout = () => {
  const screenWidth = width;
  
  if (Platform.OS === 'web') {
    return {
      isDesktop: screenWidth > 1024,
      isTablet: screenWidth > 768 && screenWidth <= 1024,
      isMobile: screenWidth <= 768,
      maxWidth: screenWidth > 1024 ? 800 : screenWidth > 768 ? 600 : screenWidth - 32,
      horizontalPadding: screenWidth > 1024 ? 32 : screenWidth > 768 ? 24 : 16,
      sidebarWidth: screenWidth > 1024 ? 300 : 0,
    };
  }
  
  return {
    isDesktop: false,
    isTablet: false,
    isMobile: true,
    maxWidth: width,
    horizontalPadding: 16,
    sidebarWidth: 0,
  };
};

export const NodeDetailsScreen: React.FC<NodeDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { node, allData } = route.params;
  const { theme } = useTheme();
  const layout = getResponsiveLayout();
  const styles = createStyles(theme, layout);

  // Add web-specific CSS for proper scrolling
  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const style = document.createElement('style');
      style.textContent = `
        .rn-scrollview-content-container {
          min-height: 100%;
        }
        .rn-scrollview {
          overflow: auto !important;
          -webkit-overflow-scrolling: touch;
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);

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

  const renderRelation = (relation: any, index: number, isIncoming: boolean) => {
    const connectedNode = getConnectedNodeInfo(isIncoming ? relation.source : relation.target);
    const canNavigate = !!connectedNode;
    
    return (
      <TouchableOpacity
        key={`${isIncoming ? 'in' : 'out'}-${index}`}
        style={[styles.relationCard, canNavigate && styles.relationCardClickable]}
        onPress={() => canNavigate && navigateToNode(isIncoming ? relation.source : relation.target)}
        disabled={!canNavigate}
      >
        <View style={styles.relationHeader}>
          <Ionicons
            name={isIncoming ? 'arrow-down' : 'arrow-up'}
            size={16}
            color={theme.colors.primary}
          />
          <Text style={styles.relationType}>{relation.relationType}</Text>
          {canNavigate && (
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.colors.textSecondary}
              style={styles.relationNavIcon}
            />
          )}
        </View>
        <Text style={styles.relationNode}>
          {isIncoming ? relation.source : relation.target}
        </Text>
      </TouchableOpacity>
    );
  };

  // Web-specific wrapper to center content
  const ContentWrapper = ({ children }: { children: React.ReactNode }) => {
    if (Platform.OS === 'web' && !layout.isMobile) {
      return (
        <View style={styles.webContentWrapper}>
          <View style={styles.webContentContainer}>
            {children}
          </View>
        </View>
      );
    }
    return <>{children}</>;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {theme.type === 'matrix' ? 'NODE DETAILS' : 'Node Details'}
          </Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>

      <ContentWrapper>
        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
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

          {/* Desktop Layout: Side-by-side sections */}
          {layout.isDesktop ? (
            <View style={styles.desktopLayout}>
              <View style={styles.desktopLeftColumn}>
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
              </View>

              <View style={styles.desktopRightColumn}>
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
              </View>
            </View>
          ) : (
            /* Mobile/Tablet Layout: Stacked sections */
            <>
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
            </>
          )}

                                {/* Bottom padding for better scrolling */}
           <View style={styles.bottomPadding} />
         </ScrollView>
       </ContentWrapper>
     </SafeAreaView>
   );
 };

const createStyles = (theme: any, layout: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    paddingHorizontal: layout.horizontalPadding,
    paddingVertical: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: theme.fonts.primary,
    letterSpacing: theme.type === 'matrix' ? 1 : 0,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40, // Same as back button to center title
  },
  // Web-specific responsive wrappers
  webContentWrapper: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  webContentContainer: {
    width: '100%',
    maxWidth: layout.maxWidth,
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: layout.horizontalPadding,
  },
  contentContainer: {
    paddingBottom: 20,
    flexGrow: 1,
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
  // Desktop layout styles
  desktopLayout: {
    flexDirection: 'row',
    gap: 24,
    alignItems: 'flex-start',
  },
  desktopLeftColumn: {
    flex: 2,
    minWidth: 0,
  },
  desktopRightColumn: {
    flex: 1,
    minWidth: 300,
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
  relationCardClickable: {
    backgroundColor: theme.type === 'matrix' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(45, 52, 54, 0.6)',
    borderColor: theme.colors.primary,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    }),
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
    flex: 1,
  },
  relationNavIcon: {
    marginLeft: 8,
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
  bottomPadding: {
    height: 40,
  },
}); 