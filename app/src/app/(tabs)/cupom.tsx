// Tela 5 · Escanear cupom — lê o QR Code da NFC-e (ou a chave digitada)
// e abre a nota se ela já estiver no banco.
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from 'expo-camera';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BotaoPrincipal, Cartao, LinhaLista, Texto, Titulo } from '@/components/ui';
import { extrairChave, formatarChave, lerChave, type ChaveNfce } from '@/data/nfce';
import { brl, dataCurta } from '@/data/precos';
import { repo } from '@/data/repo';
import { useDados } from '@/data/useDados';
import { cores, fontes, raio } from '@/theme';

export default function Cupom() {
  const insets = useSafeAreaInsets();
  const { lojas, compras } = useDados();
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [ativa, setAtiva] = useState(false);
  const [digitada, setDigitada] = useState('');
  const [nova, setNova] = useState<ChaveNfce | null>(null);
  const [erro, setErro] = useState('');
  const lendo = useRef(false);

  // Desliga a câmera ao sair da aba.
  useFocusEffect(useCallback(() => () => setAtiva(false), []));

  const abrirChave = async (texto: string) => {
    setErro('');
    setNova(null);
    const chave = extrairChave(texto);
    if (!chave) {
      setErro('Não encontrei uma chave de acesso de 44 dígitos.');
      return;
    }
    const info = lerChave(chave);
    if (!info.valida) {
      setErro('A chave tem 44 dígitos, mas o dígito verificador não confere. Confira a digitação.');
      return;
    }
    const compra = await repo.compraPorChave(chave);
    if (compra) router.push({ pathname: '/compra/[id]', params: { id: compra.id } });
    else setNova(info);
  };

  const aoLer = async ({ data }: BarcodeScanningResult) => {
    if (lendo.current) return;
    lendo.current = true;
    setAtiva(false);
    await abrirChave(data);
    setTimeout(() => (lendo.current = false), 800);
  };

  const ligarCamera = async () => {
    if (!permissao?.granted) {
      const r = await pedirPermissao();
      if (!r.granted) {
        setErro('Sem acesso à câmera. Você pode digitar a chave de acesso abaixo.');
        return;
      }
    }
    setNova(null);
    setErro('');
    setAtiva(true);
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
      <View style={[s.cabecalho, { paddingTop: insets.top + 16 }]}>
        <Titulo style={{ color: cores.amarelo, fontSize: 26, letterSpacing: 1 }}>No caixa · Cupom fiscal</Titulo>
        <View style={s.visor}>
          {ativa ? (
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
              onBarcodeScanned={aoLer}
            />
          ) : (
            <View style={s.cupomFalso} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {[60, 100, 90, 95, 70, 85].map((w, i) => (
                <View key={i} style={{ height: i === 0 ? 6 : 4, width: `${w}%`, backgroundColor: i === 0 ? '#B8C1BB' : '#D9DED6', borderRadius: 3 }} />
              ))}
            </View>
          )}
          {ativa ? <View pointerEvents="none" style={s.mira} /> : null}
        </View>
        <Texto peso="bold" style={{ color: cores.branco, fontSize: 12, textAlign: 'center' }}>
          {ativa ? 'Aponte para o QR Code no rodapé da nota' : 'O app lê só a chave da nota · CPF e nome não são guardados'}
        </Texto>
      </View>

      <View style={s.corpo}>
        {Platform.OS !== 'web' || permissao?.canAskAgain !== false ? (
          <BotaoPrincipal rotulo={ativa ? 'Lendo… toque para parar' : 'Ler QR Code do cupom'} aoTocar={ativa ? () => setAtiva(false) : ligarCamera} />
        ) : null}

        <View style={{ gap: 8 }}>
          <Texto peso="bold">Ou digite a chave de acesso (44 dígitos)</Texto>
          <View style={s.campoChave}>
            <TextInput
              value={digitada}
              onChangeText={setDigitada}
              onSubmitEditing={() => abrirChave(digitada)}
              placeholder="3526 1006 0572 2305 …"
              placeholderTextColor={cores.cinzaTexto}
              keyboardType="number-pad"
              accessibilityLabel="Chave de acesso da nota"
              style={s.inputChave}
            />
          </View>
          <BotaoPrincipal rotulo="Abrir nota" aoTocar={() => abrirChave(digitada)} desabilitado={!digitada.trim()} />
        </View>

        {erro ? (
          <View style={[s.aviso, { backgroundColor: cores.vermelhoClaro }]}>
            <Texto peso="bold" style={{ color: cores.vermelho }}>{erro}</Texto>
          </View>
        ) : null}

        {nova ? (
          <Cartao style={{ padding: 16, gap: 8 }}>
            <Titulo style={{ color: cores.marinho, fontSize: 26 }}>Nota nova</Titulo>
            <Texto>Esta nota ainda não está no banco. Dados lidos da chave:</Texto>
            <Texto peso="bold">NFC-e {nova.numero} · série {nova.serie} · {nova.emissao} · {nova.uf}</Texto>
            <Texto peso="bold">CNPJ da loja {nova.cnpj}</Texto>
            <Texto style={{ fontSize: 12, color: cores.cinzaTexto }}>{formatarChave(nova.chave)}</Texto>
            <Texto style={{ fontSize: 13, color: cores.cinzaTexto, lineHeight: 19 }}>
              A importação automática dos itens (pela consulta da SEFAZ) é a próxima etapa. Por enquanto, envie a foto da nota para
              transcrição.
            </Texto>
          </Cartao>
        ) : null}

        <View style={{ gap: 10 }}>
          <Titulo style={{ fontSize: 28 }}>Notas registradas</Titulo>
          <Cartao>
            {compras.map((c, i) => (
              <LinhaLista
                key={c.id}
                href={{ pathname: '/compra/[id]', params: { id: c.id } }}
                titulo={lojas[c.lojaId]?.nome ?? c.lojaId}
                subtitulo={`${dataCurta(c.data)} · ${c.itens.length} itens · NFC-e ${c.nfce}`}
                valor={brl(c.valorPago)}
                ultima={i === compras.length - 1}
              />
            ))}
          </Cartao>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cabecalho: { backgroundColor: cores.marinho, paddingHorizontal: 20, paddingBottom: 16, gap: 12 },
  visor: { height: 220, borderRadius: raio.medio, backgroundColor: cores.marinhoClaro, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  cupomFalso: { width: 150, height: 112, backgroundColor: cores.branco, borderRadius: 6, paddingVertical: 10, paddingHorizontal: 12, gap: 6, borderWidth: 3, borderColor: cores.verde },
  mira: { width: 180, height: 180, borderWidth: 3, borderColor: cores.verde, borderRadius: 12 },
  corpo: { paddingHorizontal: 20, paddingTop: 16, gap: 16 },
  campoChave: { backgroundColor: cores.branco, borderWidth: 2, borderColor: cores.verde, borderRadius: raio.medio, paddingHorizontal: 14, minHeight: 50, justifyContent: 'center' },
  inputChave: { fontFamily: fontes.texto, fontSize: 15, color: cores.marinho, paddingVertical: 10 },
  aviso: { borderRadius: raio.pequeno, padding: 12 },
});
