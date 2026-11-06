// Ícones de traço do protótipo, redesenhados com react-native-svg.
import Svg, { Circle, Path, Rect } from 'react-native-svg';

interface P {
  cor?: string;
  tamanho?: number;
  espessura?: number;
}

const base = (t: number) => ({ width: t, height: t, viewBox: '0 0 24 24', fill: 'none' as const });
const traco = (cor: string, e: number) => ({
  stroke: cor,
  strokeWidth: e,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const IconeInicio = ({ cor = '#102532', tamanho = 24, espessura = 2.2 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeHistorico = ({ cor = '#102532', tamanho = 24, espessura = 2.2 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M5 20V11M12 20V4M19 20v-6" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeCupom = ({ cor = '#102532', tamanho = 24, espessura = 2.2 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" {...traco(cor, espessura)} />
    <Path d="M9 8h6M9 12h6M9 16h3" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeQr = ({ cor = '#102532', tamanho = 24, espessura = 2 }: P) => (
  <Svg {...base(tamanho)}>
    <Rect x={3} y={3} width={7} height={7} rx={1} {...traco(cor, espessura)} />
    <Rect x={14} y={3} width={7} height={7} rx={1} {...traco(cor, espessura)} />
    <Rect x={3} y={14} width={7} height={7} rx={1} {...traco(cor, espessura)} />
    <Path d="M14 14h3v3M21 14v.01M14 21h3M21 17v4h-4" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeBusca = ({ cor = '#102532', tamanho = 20, espessura = 2 }: P) => (
  <Svg {...base(tamanho)}>
    <Circle cx={11} cy={11} r={7} {...traco(cor, espessura)} />
    <Path d="M20 20l-3.5-3.5" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeLocal = ({ cor = '#19B19B', tamanho = 14, espessura = 2.4 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" {...traco(cor, espessura)} />
    <Circle cx={12} cy={9.5} r={2.5} {...traco(cor, espessura)} />
  </Svg>
);

export const IconeVoltar = ({ cor = '#FFFFFF', tamanho = 24, espessura = 2.2 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M15 6l-6 6 6 6" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeSeta = ({ cor = '#102532', tamanho = 22, espessura = 2.6 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M5 12h14M13 6l6 6-6 6" {...traco(cor, espessura)} />
  </Svg>
);

export const IconeAvancar = ({ cor = '#4A5A66', tamanho = 20, espessura = 2.2 }: P) => (
  <Svg {...base(tamanho)}>
    <Path d="M9 6l6 6-6 6" {...traco(cor, espessura)} />
  </Svg>
);
