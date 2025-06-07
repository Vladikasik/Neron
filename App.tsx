import React from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { GraphScreen } from './src/screens/GraphScreen';
import { NodeDetailsScreen } from './src/components/NodeDetailsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor="#000003" 
          translucent={true}
        />
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerShown: false,
              cardStyle: { backgroundColor: '#000003' },
            }}
          >
            <Stack.Screen 
              name="Graph" 
              component={GraphScreen}
            />
            <Stack.Screen 
              name="NodeDetails" 
              component={NodeDetailsScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
