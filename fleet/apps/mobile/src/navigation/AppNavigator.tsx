import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet } from 'react-native';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserProfile } from '../store/slices/authSlice';
import { RootStackParamList } from '../types';
import { AuthStack } from './AuthStack';
import { MainTabNavigator } from './MainTabNavigator';

const Stack = createStackNavigator<RootStackParamList>();

const LoadingScreen: React.FC = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

export const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user, isLoading } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Try to fetch user profile on app start
    dispatch(fetchUserProfile());
  }, [dispatch]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated && user ? (
          <Stack.Screen name="Main">
            {() => <MainTabNavigator userRole={user.role} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Auth" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
});
