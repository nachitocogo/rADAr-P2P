/**
 * Tipos de documentación que el alumno puede declarar en el diagnóstico.
 * `sumaCerti` → fuentes que, según la Academia, suman para armar la certificación.
 */
export type DocId =
  | 'certi'
  | 'cedular'
  | 'monotributo'
  | 'recibo_sueldo'
  | 'extractos'
  | 'ddjj'
  | 'mutuo'
  | 'societaria'
  | 'contador';

export interface DocTipo {
  id: DocId;
  nombre: string;
  descripcion: string;
  /** Pide el monto respaldado. */
  conMonto?: boolean;
  sumaCerti?: boolean;
  fuente: 'pdf' | 'academia' | 'sugerencia';
}

export const DOCUMENTOS: DocTipo[] = [
  {
    id: 'certi',
    nombre: 'Certificación contable / de ingresos (CERTI)',
    descripcion: 'La hace un contador. Respalda tu capacidad operativa ante billeteras, bancos y exchanges. Es la llave de casi todas las ampliaciones. Para presentarla conviene que tenga menos de 3 meses.',
    conMonto: true,
    fuente: 'academia',
  },
  {
    id: 'cedular',
    nombre: 'Inscripción en régimen cedular',
    descripcion: 'Lo que la Academia recomienda a nivel general para compraventa de activos digitales. El detalle lo define tu contador.',
    fuente: 'academia',
  },
  {
    id: 'monotributo',
    nombre: 'Monotributo / facturación propia',
    descripcion: 'Actividad declarada que justifica ingresos. Suma para armar la CERTI.',
    sumaCerti: true,
    fuente: 'academia',
  },
  {
    id: 'recibo_sueldo',
    nombre: 'Recibos de sueldo',
    descripcion: 'Hasta 12 meses hacia atrás suman para la certificación.',
    sumaCerti: true,
    fuente: 'academia',
  },
  {
    id: 'extractos',
    nombre: 'Extractos bancarios / de billeteras',
    descripcion: 'Con logo y dirección. Binance los pide para el verificado; los resúmenes "rasos" no sirven.',
    fuente: 'academia',
  },
  {
    id: 'ddjj',
    nombre: 'Declaraciones juradas (Ganancias / Bienes Personales)',
    descripcion: 'Respaldan patrimonio y origen de fondos.',
    sumaCerti: true,
    fuente: 'sugerencia',
  },
  {
    id: 'mutuo',
    nombre: 'Contrato de mutuo certificado',
    descripcion: 'Capital de un inversor, certificado por escribano. Suma para la CERTI (no todas las plataformas lo aceptan).',
    sumaCerti: true,
    fuente: 'academia',
  },
  {
    id: 'societaria',
    nombre: 'Documentación societaria',
    descripcion: 'Si operás desde una sociedad (SAS, SRL). Útil para bancos y OTC.',
    fuente: 'sugerencia',
  },
  {
    id: 'contador',
    nombre: 'Tengo contador que maneja el rubro',
    descripcion: 'Un contador que entiende cripto/arbitraje arma una CERTI que refleja bien la operativa.',
    fuente: 'academia',
  },
];

export const docById = (id: DocId) => DOCUMENTOS.find((d) => d.id === id)!;
