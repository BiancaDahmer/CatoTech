/** Armazenamento demonstrativo local. Não representa cobrança real. */
const CHAVE_PRINCIPAL = 'catotech_cotacoes_demo';
const CHAVES_LEGADAS = ['cotacoesDemo', 'cotacoes_demo', 'cotacoes'];
const EVENTOS = ['cotacoesDemoAtualizadas', 'catotech-cotacoes-atualizadas'];
const lerArray = (chave) => {
  try {
    const valor = JSON.parse(localStorage.getItem(chave) || 'null');
    if (Array.isArray(valor)) return valor;
    if (Array.isArray(valor?.cotacoes)) return valor.cotacoes;
    return null;
  } catch { return null; }
};
function chaveAtiva() {
  if (localStorage.getItem(CHAVE_PRINCIPAL) !== null) return CHAVE_PRINCIPAL;
  return CHAVES_LEGADAS.find((chave) => localStorage.getItem(chave) !== null) || CHAVE_PRINCIPAL;
}
const notificar = () => EVENTOS.forEach((evento) => window.dispatchEvent(new Event(evento)));
const normalizarId = (id) => String(id ?? '').replace(/^#/, '');
const normalizarStatus = (status) => String(status ?? '').trim().toLowerCase();
const STATUS_PAGAMENTO = ['aprovada', 'aprovado', 'proposta aprovada', 'aguardando pagamento', 'pagamento liberado', 'pagamento confirmado', 'paga', 'pago', 'em execução', 'em execucao', 'concluído', 'concluido'];
const STATUS_REABERTOS = ['nova', 'em andamento', 'falta informação', 'falta informacao', 'aguardando aprovação', 'aguardando aprovacao', 'revisão técnica', 'revisao tecnica', 'reprovada', 'recusada', 'proposta recusada', 'cancelada'];
function aplicarRegraPagamento(cotacao) {
  const status = normalizarStatus(cotacao?.status);
  const reaberta = STATUS_REABERTOS.includes(status);
  const simulada = !reaberta && cotacao?.pagamentoSimulado === true && cotacao?.statusPagamento === 'Pagamento simulado (teste)';
  const confirmado = !reaberta && cotacao?.statusPagamento === 'Pagamento confirmado';
  const liberado = !reaberta && (Boolean(cotacao?.pagamentoLiberado) || STATUS_PAGAMENTO.includes(status) || simulada || confirmado);
  return {
    ...cotacao,
    pagamentoSimulado: simulada,
    pagamentoLiberado: liberado,
    statusPagamento: !liberado ? 'Não liberado' : confirmado ? 'Pagamento confirmado' : simulada ? 'Pagamento simulado (teste)' : 'Aguardando pagamento',
  };
}
export function listarCotacoesDemo() {
  return (lerArray(chaveAtiva()) || []).map(aplicarRegraPagamento);
}
export function salvarCotacaoDemo(dadosCliente = {}, itens = [], agendamento = null) {
  const chave = chaveAtiva();
  const registros = lerArray(chave) || [];
  const id = String(Date.now());
  const novaCotacao = aplicarRegraPagamento({
    id, numero: id, cliente: dadosCliente?.nome || '', nome: dadosCliente?.nome || '',
    dadosCliente: { ...dadosCliente }, itens: Array.isArray(itens) ? itens : [], agendamento,
    status: 'Nova', data: new Date().toISOString(), criadoEm: new Date().toISOString(), valorOrcado: null,
  });
  localStorage.setItem(chave, JSON.stringify([novaCotacao, ...registros]));
  notificar();
  return novaCotacao;
}
export function atualizarCotacaoDemo(idOuCotacao, alteracoes = {}) {
  const id = normalizarId(typeof idOuCotacao === 'object' ? idOuCotacao?.id : idOuCotacao);
  const mudancas = typeof idOuCotacao === 'object' ? idOuCotacao : alteracoes;
  if (!id) throw new Error('Identificador da cotação não informado.');
  const chave = chaveAtiva();
  const registros = lerArray(chave) || [];
  let atualizada = null;
  const novos = registros.map((registro) => {
    if (normalizarId(registro.id ?? registro.numero) !== id) return registro;
    const mesclada = { ...registro, ...mudancas, id: registro.id ?? id, atualizadoEm: new Date().toISOString() };
    atualizada = aplicarRegraPagamento(mesclada);
    return atualizada;
  });
  if (!atualizada) throw new Error(`Cotação ${id} não encontrada neste navegador.`);
  localStorage.setItem(chave, JSON.stringify(novos));
  notificar();
  return atualizada;
}
