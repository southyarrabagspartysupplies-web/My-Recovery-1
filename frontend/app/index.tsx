import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../src/store/authStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, user, checkAuth } = useAuthStore();

  useEffect(() => {
    const navigateToProperScreen = async () => {
      const isAuth = await checkAuth();
      if (isAuth) {
        const currentUser = useAuthStore.getState().user;
        if (currentUser && !currentUser.onboarded) {
          router.replace('/onboarding');
        } else {
          router.replace('/(tabs)/home');
        }
      } else {
        router.replace('/auth');
      }
    };
    navigateToProperScreen();
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#E57373" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1115',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
