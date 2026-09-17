import { Tabs } from 'expo-router';
import { Text, type ColorValue } from 'react-native';

/** Cinco abas (DP-09): Cifra e Treino são acessadas a partir de uma música. */
function Icone({ simbolo, color }: { simbolo: string; color: ColorValue }) {
  return <Text style={{ color, fontSize: 18 }}>{simbolo}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#4f46e5' }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => <Icone simbolo="🏠" color={color} />,
        }}
      />
      <Tabs.Screen
        name="escalas"
        options={{
          title: 'Escalas',
          tabBarIcon: ({ color }) => <Icone simbolo="📅" color={color} />,
        }}
      />
      <Tabs.Screen
        name="musicas"
        options={{
          title: 'Músicas',
          tabBarIcon: ({ color }) => <Icone simbolo="🎵" color={color} />,
        }}
      />
      <Tabs.Screen
        name="setlists"
        options={{
          title: 'Setlists',
          tabBarIcon: ({ color }) => <Icone simbolo="📝" color={color} />,
        }}
      />
      <Tabs.Screen
        name="ajustes"
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => <Icone simbolo="⚙️" color={color} />,
        }}
      />
    </Tabs>
  );
}
