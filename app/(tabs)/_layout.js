import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs, useRouter } from 'expo-router';
import { Pressable } from 'react-native';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: '#dcdee0',
        tabBarStyle: { display: 'none' },
        headerStyle: {
          backgroundColor: '#0f2027',
        },
        headerTintColor: '#fff',
        headerShadowVisible: false,
        headerTitleStyle: {
          alignItems: 'center',
          fontWeight: 'bold',
        },
        headerLeft: () => 
          route.name !== 'index' ? (
            <Pressable 
              onPress={() => router.back()}
              style={{ marginLeft: 15 }}
            >
              <Ionicons name="arrow-back" size={30} color="#fff" />
            </Pressable>
          ) : null,
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '首頁',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'home-sharp' : 'home-outline'} 
              color={'#fff'} 
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="GetInfo"
        options={{
          title: '獲取水質資料',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'information-circle' : 'information-circle-outline'} 
              color={'#fff'} 
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cal"
        options={{
          title: '查閱報表',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calculator' : 'calculator-outline'} 
              color={'#fff'} 
              size={20}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: '歷史紀錄',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'calculator' : 'calculator-outline'} 
              color={'#fff'} 
              size={20}
            />
          ),
        }}
      />
    </Tabs>
  );
}