// Tela 8 · Histórico de preços de um produto — gráfico, mínimo/máximo/último,
// comparação por loja e lista de registros.
import { useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { CabecalhoEscuro, Cartao, Selo, Texto } from '@/components/ui';
import { brl, dataCurta, ordenarPorData, pct, precosPorLoja, sufixoUnidade } from '@/data/precos';
import { useDados } from '@/data/useDados';
import { cores, raio } from '@/theme';

const PERIODOS = [30, 90, 180] as const;
type Periodo = (typeof PERIODOS)[number];

export default function ProdutoHistorico() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carregando, lojas, produtos } = useDados();
  const [periodo, setPeriodo] = useState<Periodo>(90);
  const produto = produtos.find((p) => p.id === id);

  const regs = useMemo(() => {
    if (!produto) return [];
    const limite = Date.now() - periodo * 864e5;
    return ordenarPorData(produto.registros).filter((r) => new Date(r.data).getTime() >= limite);
  }, [produto, periodo]);

  if (!produto) {
    return (
      <View style={{ flex: 1 }}>
        <CabecalhoEscuro titulo="Histórico de preços" />
        <Texto style={{ padding: 20 }}>{carregando ? 'Carregando…' : 'Produto não encontrado.'}</Texto>
      </View>
    );
  }

  const un = sufixoUnidade(produto);
  const valores = regs.map((r) => r.precoEfetivo);
  const min = valores.length ? Math.min(...valores) : 0;
  const max = valores.length ? Math.max(...valores) : 0;
  const ultimo = regs[regs.length - 1];
  const porLoja = precosPorLoja(produto, lojas);
  const comDesconto = regs.filter((r) => r.desconto > 0);
  const altura = (v: number) => (max === min ? 90 : Math.round(24 + ((v - min) / (max - min)) * 96));

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <CabecalhoEscuro sobretitulo={produto.codigo ? `Código ${produto.codigo}` : undefined} titulo="Histórico de preços">
        <Texto peso="black" style={{ color: cores.branco, fontSize: 16 }}>{produto.descricao}</Texto>
        <Texto peso="bold" style={{ color: '#B8C7D0', fontSize: 12 }}>
          {porLoja.map((l) => l.nome).join(' · ')} · preço {produto.unidade === 'KG' ? 'por kg' : 'por unidade'}
        </Texto>
      </CabecalhoEscuro>

      <View style={s.corpo}>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityRole="radiogroup" accessibilityLabel="Período">
          {PERIODOS.map((p) => (
            <Pressable
              key={p}
              accessibilityRole="radio"
              accessibilityState={{ selected: periodo === p }}
              onPress={() => setPeriodo(p)}
              style={[s.periodo, { backgroundColor: periodo === p ? cores.verde : cores.branco }]}>
              <Texto peso="black">{p} dias</Texto>
            </Pressable>
          ))}
        </View>

        <Cartao style={{ padding: 16, gap: 10 }}>
          {regs.length === 0 ? (
            <Texto style={{ color: cores.cinzaTexto }}>Nenhum registro nos últimos {periodo} dias.</Texto>
          ) : (
            <>
              <View
                style={s.grafico}
                accessibilityRole="image"
                accessibilityLabel={`Gráfico com ${regs.length} preços entre ${brl(min)} e ${brl(max)}`}>
                {regs.map((r, i) => (
                  <View key={i} style={{ flex: 1, maxWidth: 56, alignItems: 'center', gap: 4 }}>
                    <Texto peso="bold" style={{ fontSize: 11 }}>{brl(r.precoEfetivo).replace('R$ ', '')}</Texto>
                    <View
                      style={{
                        width: '100%',
                        height: altura(r.precoEfetivo),
                        backgroundColor: r.desconto > 0 ? cores.laranjaPromo : cores.verdeEscuro,
                        borderTopLeftRadius: 4,
                        borderTopRightRadius: 4,
                      }}
                    />
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                {regs.map((r, i) => (
                  <View key={i} style={{ flex: 1, maxWidth: 56, alignItems: 'center' }}>
                    <Texto style={{ fontSize: 11, color: cores.cinzaTexto }} numberOfLines={1}>{dataCurta(r.data)}</Texto>
                  </View>
                ))}
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                <Legenda cor={cores.verdeEscuro} texto="Preço normal" />
                <Legenda cor={cores.laranjaPromo} texto="Com desconto" />
              </View>
            </>
          )}
        </Cartao>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Indicador rotulo="Mínimo" valor={regs.length ? brl(min) + un : '–'} />
          <Indicador rotulo="Máximo" valor={regs.length ? brl(max) + un : '–'} />
          <Indicador rotulo="Último" valor={ultimo ? brl(ultimo.precoEfetivo) + un : '–'} destaque />
        </View>

        {porLoja.length > 1 ? (
          <Cartao style={{ padding: 16, gap: 10 }}>
            <Texto peso="black" style={{ fontSize: 15 }}>Comparação entre lojas</Texto>
            {porLoja.map((l, i) => {
              const dif = (l.ultimo.precoEfetivo - porLoja[0].ultimo.precoEfetivo) / porLoja[0].ultimo.precoEfetivo;
              return (
                <View key={l.lojaId} style={s.lojaLinha}>
                  <View style={{ flex: 1 }}>
                    <Texto peso="bold">{l.nome}</Texto>
                    <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>em {dataCurta(l.ultimo.data)}</Texto>
                  </View>
                  <Texto peso="black">{brl(l.ultimo.precoEfetivo)}{un}</Texto>
                  {i === 0 ? <Selo texto="menor" tipo="desce" /> : <Selo texto={pct(dif)} tipo="sobe" />}
                </View>
              );
            })}
          </Cartao>
        ) : null}

        <Cartao>
          {[...regs].reverse().map((r, i) => (
            <View key={i} style={[s.registro, i === regs.length - 1 && { borderBottomWidth: 0 }]}>
              <View style={{ flex: 1, gap: 2 }}>
                <Texto peso="bold">{lojas[r.lojaId]?.nome ?? r.lojaId}</Texto>
                <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>
                  {dataCurta(r.data)} · {produto.unidade === 'KG' ? `${r.qtd.toFixed(3).replace('.', ',')} kg` : `${r.qtd} un`}
                  {r.desconto > 0 ? ` · desconto ${brl(r.desconto)}` : ''}
                </Texto>
              </View>
              <Texto peso="black">{brl(r.precoEfetivo)}{un}</Texto>
            </View>
          ))}
        </Cartao>

        <Texto peso="bold" style={{ fontSize: 13, color: cores.cinzaTexto, lineHeight: 19 }}>
          {regs.length} registro{regs.length === 1 ? '' : 's'} das suas notas no período.
          {comDesconto.length ? ` ${comDesconto.length} com desconto na nota.` : ''} O preço efetivo já desconta promoções.
        </Texto>
      </View>
    </ScrollView>
  );
}

function Legenda({ cor, texto }: { cor: string; texto: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: cor }} />
      <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>{texto}</Texto>
    </View>
  );
}

function Indicador({ rotulo, valor, destaque }: { rotulo: string; valor: string; destaque?: boolean }) {
  return (
    <View style={[s.indicador, destaque && { backgroundColor: cores.marinho }]}>
      <Texto peso="bold" style={{ fontSize: 12, color: destaque ? cores.branco : cores.cinzaTexto }}>{rotulo}</Texto>
      <Texto peso="black" style={{ fontSize: 16, color: destaque ? cores.amarelo : cores.marinho }}>{valor}</Texto>
    </View>
  );
}

const s = StyleSheet.create({
  corpo: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  periodo: { flex: 1, minHeight: 44, borderRadius: raio.pequeno, borderWidth: 2, borderColor: cores.marinho, alignItems: 'center', justifyContent: 'center' },
  grafico: { flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 140, borderBottomWidth: 2, borderBottomColor: cores.eixo },
  indicador: { flex: 1, backgroundColor: cores.branco, borderRadius: raio.pequeno, paddingVertical: 10, paddingHorizontal: 12, gap: 2 },
  lojaLinha: { flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 },
  registro: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: cores.linha },
});
