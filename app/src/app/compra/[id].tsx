// Detalhe de uma nota registrada — itens cobrados, totais e pagamentos.
import { useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { CabecalhoEscuro, Cartao, LinhaLista, Texto, Titulo } from '@/components/ui';
import { formatarChave } from '@/data/nfce';
import { brl, dataLonga } from '@/data/precos';
import { useDados } from '@/data/useDados';
import { cores } from '@/theme';

export default function CompraDetalhe() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { carregando, lojas, compras } = useDados();
  const compra = compras.find((c) => c.id === id);

  if (!compra) {
    return (
      <View style={{ flex: 1 }}>
        <CabecalhoEscuro titulo="Nota fiscal" />
        <Texto style={{ padding: 20 }}>{carregando ? 'Carregando…' : 'Nota não encontrada.'}</Texto>
      </View>
    );
  }

  const loja = lojas[compra.lojaId];
  const qtd = (q: number, u: string) => (u === 'KG' ? `${q.toFixed(3).replace('.', ',')} kg` : `${q} un`);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <CabecalhoEscuro sobretitulo={`${loja?.unidade ?? ''} · ${dataLonga(compra.data)}`} titulo={loja?.nome ?? compra.lojaId}>
        <Texto peso="bold" style={{ color: cores.branco }}>
          {compra.itens.length} itens · {compra.totalItens} unidades · NFC-e {compra.nfce}/{compra.serie}
        </Texto>
      </CabecalhoEscuro>

      <View style={s.corpo}>
        <Titulo style={{ fontSize: 30 }}>Registro do caixa</Titulo>
        <Cartao>
          {compra.itens.map((it) => (
            <LinhaLista
              key={it.item}
              href={{ pathname: '/produto/[id]', params: { id: it.produtoId } }}
              titulo={it.descricao}
              subtitulo={`${it.item} · ${qtd(it.qtd, it.unidade)} × ${brl(it.precoUnit)}`}
              valor={brl(it.total)}
              detalhe={it.desconto > 0 ? `desconto ${brl(it.desconto)}` : undefined}
              corDetalhe={cores.verdeOk}
            />
          ))}
          <Linha rotulo="Valor total" valor={brl(compra.valorTotal)} />
          {compra.desconto > 0 ? <Linha rotulo="Descontos" valor={`− ${brl(compra.desconto)}`} /> : null}
          <View style={s.total}>
            <Texto peso="bold" style={{ flex: 1, color: cores.cinzaTexto }}>Total cobrado</Texto>
            <Titulo style={{ color: cores.marinho, fontSize: 30 }}>{brl(compra.valorPago)}</Titulo>
          </View>
        </Cartao>

        <Cartao style={{ padding: 16, gap: 6 }}>
          <Texto peso="black">Pagamento</Texto>
          {compra.pagamentos.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              <Texto style={{ flex: 1 }}>{p.forma}</Texto>
              <Texto peso="bold">{brl(p.valor)}</Texto>
            </View>
          ))}
        </Cartao>

        {compra.observacao ? (
          <Texto style={{ fontSize: 13, lineHeight: 19, color: cores.cinzaTexto }}>{compra.observacao}</Texto>
        ) : null}
        <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>Chave: {formatarChave(compra.chave)}</Texto>
      </View>
    </ScrollView>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={s.linha}>
      <Texto style={{ flex: 1, color: cores.cinzaTexto }}>{rotulo}</Texto>
      <Texto peso="bold">{valor}</Texto>
    </View>
  );
}

const s = StyleSheet.create({
  corpo: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  linha: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: cores.linha },
  total: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
});
