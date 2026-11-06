// Leitura da chave de acesso da NFC-e (44 dígitos), vinda do QR Code ou digitada.
// Layout da chave: cUF(2) AAMM(4) CNPJ(14) modelo(2) série(3) número(9) tpEmis(1) código(8) DV(1).

export interface ChaveNfce {
  chave: string;
  uf: string;
  emissao: string; // "MM/AAAA"
  cnpj: string; // formatado
  modelo: string;
  serie: string;
  numero: string;
  valida: boolean; // dígito verificador confere
}

const UFS: Record<string, string> = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO', '21': 'MA', '22': 'PI',
  '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA', '31': 'MG', '32': 'ES',
  '33': 'RJ', '35': 'SP', '41': 'PR', '42': 'SC', '43': 'RS', '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
};

/** Dígito verificador da chave (módulo 11, pesos 2 a 9). */
function dv(base43: string): number {
  let soma = 0;
  let peso = 2;
  for (let i = base43.length - 1; i >= 0; i--) {
    soma += Number(base43[i]) * peso;
    peso = peso === 9 ? 2 : peso + 1;
  }
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

/** Extrai a chave de um texto: URL do QR Code (p=chave|...), chave com espaços, etc. */
export function extrairChave(texto: string): string | null {
  const daUrl = texto.match(/[?&]p=(\d{44})/);
  if (daUrl) return daUrl[1];
  const so = texto.replace(/\D/g, '');
  const m = so.match(/\d{44}/);
  return m ? m[0] : null;
}

export function lerChave(chave: string): ChaveNfce {
  const c = chave.replace(/\D/g, '');
  const cnpj = c.slice(6, 20);
  return {
    chave: c,
    uf: UFS[c.slice(0, 2)] ?? c.slice(0, 2),
    emissao: `${c.slice(4, 6)}/20${c.slice(2, 4)}`,
    cnpj: `${cnpj.slice(0, 2)}.${cnpj.slice(2, 5)}.${cnpj.slice(5, 8)}/${cnpj.slice(8, 12)}-${cnpj.slice(12)}`,
    modelo: c.slice(20, 22),
    serie: String(Number(c.slice(22, 25))),
    numero: String(Number(c.slice(25, 34))),
    valida: c.length === 44 && dv(c.slice(0, 43)) === Number(c[43]),
  };
}

export const formatarChave = (c: string) => c.replace(/(\d{4})(?=\d)/g, '$1 ');
