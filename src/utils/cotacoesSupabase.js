import { supabase, supabaseConfigurado } from '../lib/supabaseClient';

export const moedaBR = (v) => v === null || v === undefined || v === '' ? 'Aguardando proposta' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const dataBR = (v) => v ? new Date(v).toLocaleString('pt-BR') : 'Não informado';
export const protocolo = (c) => c.numero_solicitacao || `CT-${String(c.id).padStart(6, '0')}`;
export const valorTexto = (v) => v === null || v === undefined || v === '' ? 'Não informado' : (typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v));
export const perfilEngenharia = async (id) => {
  const { data, error } = await supabase.from('perfis').select('tipo').eq('id', id).single();
  if (error) throw error;
  return ['engenheiro', 'admin'].includes(data?.tipo);
};
export async function buscarCotacoes({ engenharia = false } = {}) {
  if (!supabaseConfigurado) throw new Error('Configure as variáveis REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.');
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  const user = authData?.user;
  if (!user) throw new Error('Entre com sua conta para visualizar as solicitações.');
  if (engenharia && !(await perfilEngenharia(user.id))) throw new Error('Esta página é exclusiva para engenharia e administração.');
  let consulta = supabase.from('cotacoes').select('id,created_at,cliente_id,numero_solicitacao,cliente_nome,cliente_email,descricao,status,valor_proposta,prazo_proposta,condicoes_pagamento,escopo_proposta,dados_cliente,itens_solicitados,agendamento,updated_at').order('created_at', { ascending: false });
  if (!engenharia) consulta = consulta.eq('cliente_id', user.id);
  const { data, error } = await consulta;
  if (error) throw error;
  return data || [];
}
