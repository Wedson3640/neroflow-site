export interface User {
  id: string;
  email: string;
  full_name: string;
  tenant_id: string;
  role: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export interface NFSeListItem {
  id: string;
  numero: string | null;
  data_emissao: string | null;
  prestador: string | null;
  cnpj_prestador: string | null;
  tomador: string | null;
  cnpj_tomador: string | null;
  valor_servicos: number;
  status: "NORMAL" | "CANCELADA" | "SUBSTITUIDA" | "PENDENTE";
}

export interface NFSeDetail {
  id: string;
  numero: string | null;
  codigo_verificacao: string | null;
  competencia: string | null;
  data_emissao: string | null;
  nsu: number | null;
  // Prestador
  cnpj_prestador: string | null;
  cpf_prestador: string | null;
  razao_prestador: string | null;
  nome_fantasia_prestador: string | null;
  im_prestador: string | null;
  municipio_prestador: string | null;
  uf_prestador: string | null;
  // Tomador
  cnpj_tomador: string | null;
  cpf_tomador: string | null;
  razao_tomador: string | null;
  im_tomador: string | null;
  // Serviço
  discriminacao: string | null;
  item_lista_servico: string | null;
  codigo_cnae: string | null;
  exigibilidade_iss: number | null;
  iss_retido: number | null;
  // Valores
  valor_servicos: number;
  valor_deducoes: number;
  base_calculo: number;
  aliquota: number | null;
  valor_pis: number;
  valor_cofins: number;
  valor_inss: number;
  valor_ir: number;
  valor_csll: number;
  valor_iss: number;
  valor_iss_retido: number;
  outras_retencoes: number;
  desconto_incondicionado: number;
  desconto_condicionado: number;
  valor_liquido: number | null;
  // Tributação
  natureza_operacao: number | null;
  optante_simples_nacional: number | null;
  // Controle
  status: "NORMAL" | "CANCELADA" | "SUBSTITUIDA" | "PENDENTE";
  criado_em: string | null;
}

export interface NFSeListResponse {
  items: NFSeListItem[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface NFSeResumo {
  total: number;
  normais: number;
  canceladas: number;
  substituidas: number;
  valor_total: number;
}

export interface NFSeFilters {
  page?: number;
  page_size?: number;
  filtro_status?: string;
  cnpj_prestador?: string;
  data_inicio?: string;
  data_fim?: string;
  numero?: string;
}

export interface Certificate {
  id: string;
  cnpj: string | null;
  empresa: string | null;
  subject_name: string | null;
  valid_until: string | null;
  is_active: boolean;
}

export interface ConsultarRecebidasRequest {
  certificate_id: string;
  last_nsu: number;
  max_notas: number;
  data_inicial: string;
  data_final: string;
}
