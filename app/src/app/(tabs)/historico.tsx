// Aba Histórico — busca em todos os produtos já registrados.
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CampoBusca, LinhaLista, Texto, Titulo } from '@/components/ui';
import { brl, filtrar, ordenarPorData, precosPorLoja, sufixoUnidade } from '@/data/precos';
import { useDados } from '@/data/useDados';
import { cores } from '@/theme';

export default function Historico() {
  const insets = useSafeAreaInsets();
  const { q } = useLocalSearchParams<{ q?: string }>();
  const { lojas, produtos } = useDados();
  const [busca, setBusca] = useState(q ?? '');

  useEffect(() => {
    if (q !== undefined) setBusca(q);
  }, [q]);

  const lista = useMemo(
    () => [...filtrar(produtos, busca)].sort((a, b) => a.descricao.localeCompare(b.descricao, 'pt')),
    [produtos, busca],
  );

  return (
    <FlatList
      style={{ flex: 1 }}
      data={lista}
      keyExtractor={(p) => p.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: insets.top + 16, paddingHorizontal: 20, paddingBottom: 24 }}
      ListHeaderComponent={
        <View style={{ gap: 10, marginBottom: 12 }}>
          <Titulo>Histórico de preços</Titulo>
          <Texto peso="bold" style={{ color: cores.cinzaTexto, fontSize: 12 }}>
            {produtos.length} produtos · {Object.keys(lojas).length} lojas
          </Texto>
          <CampoBusca valor={busca} aoMudar={setBusca} />
        </View>
      }
      ListEmptyComponent={<Texto style={{ textAlign: 'center', marginTop: 24 }}>Nenhum produto encontrado.</Texto>}
      renderItem={({ item, index }) => {
        const regs = ordenarPorData(item.registros);
        const ultimo = regs[regs.length - 1];
        const porLoja = precosPorLoja(item, lojas);
        return (
          <View style={[s.bloco, index === 0 && s.primeiro, index === lista.length - 1 && s.ultimo]}>
            <LinhaLista
              href={{ pathname: '/produto/[id]', params: { id: item.id } }}
              titulo={item.descricao}
              subtitulo={`${regs.length} registro${regs.length > 1 ? 's' : ''} · ${porLoja.length} loja${porLoja.length > 1 ? 's' : ''}`}
              valor={ultimo ? brl(ultimo.precoEfetivo) + sufixoUnidade(item) : '–'}
              detalhe={porLoja.length > 1 ? `menor: ${porLoja[0].nome}` : undefined}
              corDetalhe={cores.verdeOk}
              ultima={index === lista.length - 1}
            />
          </View>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  bloco: { overflow: 'hidden' },
  primeiro: { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  ultimo: { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
});
