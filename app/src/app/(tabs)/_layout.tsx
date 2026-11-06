import { TabList, TabSlot, TabTrigger, Tabs } from 'expo-router/ui';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotaoAba } from '@/components/BarraAbas';
import { IconeCupom, IconeHistorico, IconeInicio } from '@/components/Icones';
import { cores } from '@/theme';

export default function LayoutAbas() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs style={{ flex: 1 }}>
      <TabSlot style={{ flex: 1, minHeight: 0 }} />
      <TabList asChild>
        <View style={{ flexDirection: 'row', backgroundColor: cores.branco, paddingBottom: insets.bottom }}>
          <TabTrigger name="inicio" href="/" asChild>
            <BotaoAba Icone={IconeInicio} rotulo="Início" />
          </TabTrigger>
          <TabTrigger name="cupom" href="/cupom" asChild>
            <BotaoAba Icone={IconeCupom} rotulo="Cupom" />
          </TabTrigger>
          <TabTrigger name="historico" href="/historico" asChild>
            <BotaoAba Icone={IconeHistorico} rotulo="Histórico" />
          </TabTrigger>
        </View>
      </TabList>
    </Tabs>
  );
}
