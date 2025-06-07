import { useState, useEffect } from 'react';
import { Neo4jData } from '../utils/dataTransformer';

export const useGraphData = () => {
  const [data, setData] = useState<Neo4jData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadGraphData();
  }, []);

  const loadGraphData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load the test.json file
      const graphData = require('../../assets/test.json');
      
      // Validate the data structure
      if (!graphData.entities || !graphData.relations) {
        throw new Error('Invalid data format: missing entities or relations');
      }
      
      setData(graphData);
    } catch (err) {
      console.error('Error loading graph data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load graph data');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    loadGraphData();
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
}; 