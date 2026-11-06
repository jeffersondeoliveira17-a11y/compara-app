// Peças visuais que se repetem entre as telas do protótipo.
import { router, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, fontes, raio } from '@/theme';
import { IconeAvancar, IconeBusca, IconeVoltar } from './Icones';

/** Título em Bebas Neue (cabeçalhos e números de destaque). */
export function Titulo({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[s.titulo, style]}>{children}</Text>;
}

export function Texto({ children, style, peso = 'normal', numberOfLines }: {
  children: ReactNode;
  style?: TextStyle | TextStyle[];
  peso?: 'normal' | 'bold' | 'black';
  numberOfLines?: number;
}) {
  const fontFamily = peso === 'black' ? fontes.textoBlack : peso === 'bold' ? fontes.textoBold : fontes.texto;
  return (
    <Text numberOfLines={numberOfLines} style={[{ fontFamily, color: cores.marinho, fontSize: 14 }, style]}>
      {children}
    </Text>
  );
}

/** Cabeçalho azul-marinho com botão de voltar (telas empilhadas). */
export function CabecalhoEscuro({ sobretitulo, titulo, children }: { sobretitulo?: string; titulo: string; children?: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.cabecalho, { paddingTop: insets.top + 8 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
        style={s.voltar}
        hitSlop={8}>
        <IconeVoltar />
      </Pressable>
      {sobretitulo ? <Texto peso="bold" style={{ color: cores.branco, fontSize: 12 }}>{sobretitulo}</Texto> : null}
      <Titulo style={{ color: cores.amarelo, fontSize: 34 }}>{titulo}</Titulo>
      {children}
    </View>
  );
}

export function CampoBusca({ valor, aoMudar, aoEnviar, placeholder = 'Buscar produto ou código de barras' }: {
  valor: string;
  aoMudar: (t: string) => void;
  aoEnviar?: () => void;
  placeholder?: string;
}) {
  return (
    <View style={s.busca}>
      <IconeBusca />
      <TextInput
        value={valor}
        onChangeText={aoMudar}
        onSubmitEditing={aoEnviar}
        placeholder={placeholder}
        placeholderTextColor={cores.cinzaTexto}
        accessibilityLabel="Buscar produto por nome ou código de barras"
        returnKeyType="search"
        autoCorrect={false}
        style={s.buscaInput}
      />
    </View>
  );
}

export function Cartao({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[s.cartao, style]}>{children}</View>;
}

/** Linha de lista branca: título, subtítulo e valor à direita; navega ao tocar. */
export function LinhaLista({ href, titulo, subtitulo, valor, detalhe, corDetalhe, ultima }: {
  href: Href;
  titulo: string;
  subtitulo?: string;
  valor?: string;
  detalhe?: string;
  corDetalhe?: string;
  ultima?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      onPress={() => router.push(href)}
      style={({ pressed }) => [s.linha, ultima && { borderBottomWidth: 0 }, pressed && { backgroundColor: '#FBF6E6' }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Texto peso="bold" numberOfLines={2}>{titulo}</Texto>
          {subtitulo ? <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>{subtitulo}</Texto> : null}
        </View>
        <View style={{ alignItems: 'flex-end', gap: 2, maxWidth: '45%' }}>
          {valor ? <Texto peso="black">{valor}</Texto> : null}
          {detalhe ? (
            <Texto peso="bold" style={{ fontSize: 12, color: corDetalhe ?? cores.cinzaTexto, textAlign: 'right' }}>{detalhe}</Texto>
          ) : null}
        </View>
      <IconeAvancar />
    </Pressable>
  );
}

export function BotaoPrincipal({ rotulo, aoTocar, desabilitado }: { rotulo: string; aoTocar: () => void; desabilitado?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={desabilitado}
      onPress={aoTocar}
      style={({ pressed }) => [s.botao, (pressed || desabilitado) && { opacity: 0.7 }]}>
      <Texto peso="black" style={{ fontSize: 16 }}>{rotulo}</Texto>
    </Pressable>
  );
}

export function Selo({ texto, tipo }: { texto: string; tipo: 'sobe' | 'desce' | 'neutro' }) {
  const fundo = tipo === 'sobe' ? cores.vermelhoClaro : tipo === 'desce' ? cores.verdeOkClaro : '#ECEFF1';
  const cor = tipo === 'sobe' ? cores.vermelho : tipo === 'desce' ? cores.verdeOk : cores.cinzaTexto;
  return (
    <View style={{ backgroundColor: fundo, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Texto peso="black" style={{ fontSize: 12, color: cor }}>{texto}</Texto>
    </View>
  );
}

const s = StyleSheet.create({
  titulo: { fontFamily: fontes.display, fontSize: 32, lineHeight: 34, letterSpacing: 0.5, color: cores.cinzaTexto },
  cabecalho: { backgroundColor: cores.marinho, paddingHorizontal: 20, paddingBottom: 20, gap: 4 },
  voltar: { width: 44, height: 44, marginLeft: -10, alignItems: 'center', justifyContent: 'center' },
  busca: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: cores.branco,
    borderWidth: 2,
    borderColor: cores.verde,
    borderRadius: raio.medio,
    paddingHorizontal: 14,
    minHeight: 50,
  },
  buscaInput: { flex: 1, minWidth: 0, fontFamily: fontes.texto, fontSize: 15, color: cores.marinho, paddingVertical: 10 },
  cartao: { backgroundColor: cores.branco, borderRadius: raio.grande, overflow: 'hidden' },
  linha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    minHeight: 56,
    borderBottomWidth: 1,
    borderBottomColor: cores.linha,
    backgroundColor: cores.branco,
  },
  botao: { minHeight: 52, backgroundColor: cores.verde, borderRadius: raio.medio, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
});
