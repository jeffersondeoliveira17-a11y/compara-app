// Tela 3 · Início — busca, lojas onde você comprou e últimos preços pagos.
import { Link, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconeLocal, IconeSeta } from '@/components/Icones';
import { CampoBusca, Cartao, LinhaLista, Texto, Titulo } from '@/components/ui';
import { brl, dataCurta, pct, sufixoUnidade, ultimosPrecos } from '@/data/precos';
import { useDados } from '@/data/useDados';
import { cores, raio } from '@/theme';

export default function Inicio() {
  const insets = useSafeAreaInsets();
  const { carregando, lojas, produtos, compras } = useDados();
  const [busca, setBusca] = useState('');
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const ultimos = useMemo(() => ultimosPrecos(produtos, lojas), [produtos, lojas]);
  const visiveis = mostrarTodos ? ultimos : ultimos.slice(0, 8);

  const buscar = () => router.push({ pathname: '/historico', params: { q: busca } });

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.conteudo, { paddingTop: insets.top + 16 }]}>
      <View style={s.topo}>
        <Image source={require('../../../assets/images/logo.png')} accessibilityLabel="Compara" style={s.logo} resizeMode="contain" />
        <View style={s.local}>
          <IconeLocal />
          <Texto peso="bold" style={{ color: cores.branco, fontSize: 13 }}>Barueri · SP</Texto>
        </View>
      </View>

      <CampoBusca valor={busca} aoMudar={setBusca} aoEnviar={buscar} />

      <View style={{ gap: 10 }}>
        <Texto peso="bold" style={s.rotuloSecao}>Lojas onde você comprou</Texto>
        <View style={s.lojas}>
          {compras.map((c) => (
            <Link key={c.id} href={{ pathname: '/compra/[id]', params: { id: c.id } }} asChild>
              <Pressable style={s.loja}>
                <Texto peso="black" numberOfLines={1}>{lojas[c.lojaId]?.nome ?? c.lojaId}</Texto>
                <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>
                  {dataCurta(c.data)} · {brl(c.valorPago)}
                </Texto>
              </Pressable>
            </Link>
          ))}
        </View>
      </View>

      <View style={{ gap: 10 }}>
        <Texto peso="black" style={[s.rotuloSecao, { textTransform: 'uppercase' }]}>Últimos preços pagos</Texto>
        {carregando ? (
          <ActivityIndicator color={cores.marinho} />
        ) : (
          <Cartao>
            {visiveis.map((u, i) => {
              const loja = lojas[u.ultimo.lojaId]?.nome ?? u.ultimo.lojaId;
              const detalhe =
                u.outraLoja && u.diferenca !== undefined
                  ? `${u.outraLoja.nome} ${brl(u.outraLoja.ultimo.precoEfetivo)} (${pct(u.diferenca)})`
                  : undefined;
              return (
                <LinhaLista
                  key={u.produto.id}
                  href={{ pathname: '/produto/[id]', params: { id: u.produto.id } }}
                  titulo={u.produto.descricao}
                  subtitulo={`Você pagou em ${dataCurta(u.ultimo.data)} · ${loja}`}
                  valor={brl(u.ultimo.precoEfetivo) + sufixoUnidade(u.produto)}
                  detalhe={detalhe}
                  corDetalhe={u.diferenca !== undefined && u.diferenca > 0 ? cores.vermelho : cores.verdeOk}
                  ultima={i === visiveis.length - 1}
                />
              );
            })}
          </Cartao>
        )}
        {ultimos.length > 8 ? (
          <Pressable accessibilityRole="button" onPress={() => setMostrarTodos(!mostrarTodos)} style={s.verMais}>
            <Texto peso="bold" style={{ textDecorationLine: 'underline' }}>
              {mostrarTodos ? 'Mostrar menos' : `Ver todos os ${ultimos.length} produtos`}
            </Texto>
          </Pressable>
        ) : null}
      </View>

      <Link href="/cupom" asChild>
        <Pressable style={s.cta}>
          <View style={{ flex: 1, gap: 3 }}>
            <Titulo style={{ color: cores.amarelo, fontSize: 26, lineHeight: 28 }}>Registrar meu cupom</Titulo>
            <Texto style={{ color: cores.branco, lineHeight: 19 }}>Leia o QR Code da nota e guarde os preços que você pagou.</Texto>
          </View>
          <View style={s.ctaSeta}>
            <IconeSeta />
          </View>
        </Pressable>
      </Link>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  conteudo: { paddingHorizontal: 20, paddingBottom: 24, gap: 16 },
  topo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { width: 96, height: 62 },
  local: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: cores.marinho, borderRadius: 300, paddingVertical: 9, paddingHorizontal: 14 },
  rotuloSecao: { textAlign: 'center', color: cores.branco, letterSpacing: 1.2 },
  lojas: { flexDirection: 'row', gap: 10 },
  loja: { flex: 1, backgroundColor: cores.branco, borderRadius: raio.pequeno, paddingVertical: 10, paddingHorizontal: 12, gap: 2, minHeight: 56 },
  verMais: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  cta: { backgroundColor: cores.marinho, borderRadius: raio.card, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  ctaSeta: { width: 40, height: 40, borderRadius: 999, backgroundColor: cores.verde, alignItems: 'center', justifyContent: 'center' },
});
