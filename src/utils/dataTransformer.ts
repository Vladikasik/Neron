export interface Neo4jData {
  entities: {
    name: string;
    type: string;
    observations: string[];
  }[];
  relations: {
    source: string;
    target: string;
    relationType: string;
  }[];
}

export interface GraphNode {
  id: string;
  name: string;
  type: string;
  val: number;
  color?: string;
  observations?: string[];
}

export interface GraphLink {
  source: string;
  target: string;
  relationType: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

const nodeColors: { [key: string]: string } = {
  'Project': '#FF6B6B',
  'project': '#FF6B6B',
  'codebase_component': '#4ECDC4',
  'Component': '#4ECDC4',
  'Decision': '#45B7D1',
  'Architecture': '#96CEB4',
  'Implementation': '#FFEAA7',
  'Infrastructure': '#DDA0DD',
  'Configuration': '#F39C12',
  'Environment': '#A8E6CF',
  'Bug': '#FF7675',
  'Bug Fix': '#FF7675',
  'Feature': '#74B9FF',
  'Process': '#81ECEC',
  'Script': '#FD79A8',
  'Documentation': '#FDCB6E',
  'Resource': '#E17055',
  'Domain': '#6C5CE7',
  'milestone': '#00B894',
  'Roadmap': '#2D3436',
  'deliverable_summary': '#636E72',
  'Strategy': '#B2BEC3',
  'Cleanup': '#DDD',
  'default': '#74B9FF'
};

export const transformNeo4jToGraph = (data: Neo4jData): GraphData => {
  const nodes: GraphNode[] = data.entities.map(entity => ({
    id: entity.name,
    name: entity.name,
    type: entity.type,
    val: Math.min(entity.observations.length * 2 + 5, 20), // Size based on observations
    color: nodeColors[entity.type] || nodeColors.default,
    observations: entity.observations
  }));

  const links: GraphLink[] = data.relations.map(relation => ({
    source: relation.source,
    target: relation.target,
    relationType: relation.relationType
  }));

  return {
    nodes,
    links
  };
};

export const getNodesByType = (nodes: GraphNode[]): { [key: string]: GraphNode[] } => {
  return nodes.reduce((acc, node) => {
    if (!acc[node.type]) {
      acc[node.type] = [];
    }
    acc[node.type].push(node);
    return acc;
  }, {} as { [key: string]: GraphNode[] });
}; 