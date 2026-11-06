// Botão da barra inferior, no estilo do protótipo: faixa verde em cima da aba ativa.
import type { TabTriggerSlotProps } from 'expo-router/ui';
import type { ComponentRef, ComponentType, Ref } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, fontes } from '@/theme';

type BotaoAbaProps = Omit<TabTriggerSlotProps, 'ref'> & {
  Icone: ComponentType<{ cor?: string }>;
  rotulo: string;
  ref?: Ref<ComponentRef<typeof Pressable>>;
};

export function BotaoAba({ Icone, rotulo, isFocused, ...props }: BotaoAbaProps) {
  const cor = isFocused ? cores.marinho : cores.cinzaAba;
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: !!isFocused }}
      style={[s.aba, { borderTopColor: isFocused ? cores.verde : 'transparent' }]}>
      <Icone cor={cor} />
      <Text style={[s.rotulo, { color: cor, fontFamily: isFocused ? fontes.textoBlack : fontes.textoBold }]}>{rotulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  aba: { flex: 1, borderTopWidth: 4, alignItems: 'center', justifyContent: 'center', gap: 3, minHeight: 68 },
  rotulo: { fontSize: 12 },
});
