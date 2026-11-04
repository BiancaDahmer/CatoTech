import { useCallback, useEffect, useMemo, useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';

import {

  Box, Typography, Button, Stack, Paper, TextField, Chip, Alert, Tabs, Tab,

  Divider, MenuItem, Grid,

} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

import RefreshIcon from '@mui/icons-material/Refresh';

import { supabase } from '../lib/supabaseClient';

import { perfilEngenharia, protocolo, dataBR, moedaBR } from '../utils/cotacoesSupabase';

const NAVY = '#061b30';

const PANEL = '#10243a';

const BORDER = '#2c435b';

const ORANGE = '#ff6600';

const MUTED = '#a9bfd5';

const ETAPAS_EXECUCAO = ['Planejamento', 'Desenvolvimento', 'Revisão Técnica', 'Entrega', 'Concluída'];

const EXECUCAO_INICIAL = { etapa: 'Planejamento', progresso: 0, prazo: '', responsavel: '', observacoes: '' };

const STATUS = ['Nova', 'Em Andamento', 'Falta Informação', 'Revisão Técnica',

  'Aguardando Aprovação', 'Aguardando Pagamento', 'Em Execução', 'Concluído',

  'Proposta Recusada', 'Cancelada'];

function lerJSON(chave, padrao) {

  try { const item = JSON.parse(localStorage.getItem(chave) || 'null'); return item ?? padrao; }

  catch { return padrao; }

}

function formatarValorDigitado(valor) {

  const digitos = String(valor ?? '').replace(/\D/g, '');

  if (!digitos) return '';

  const centavos = Number(digitos.slice(-15)) / 100;

  return `R$ ${centavos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}

function formatarValorBanco(valor) {

  if (valor == null || valor === '') return '';

  const numero = Number(valor);

  if (!Number.isFinite(numero)) return '';

  return `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

}

function numeroMoeda(valor) {

  const texto = String(valor || '').replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.');

  const numero = Number(texto);

  return Number.isFinite(numero) && numero >= 0 ? numero : 0;

}

const painel = { background: PANEL, border: `1px solid ${BORDER}`, borderRadius: 3, p: { xs: 2, md: 3 } };

const campo = {

  '& .MuiInputLabel-root': { color: MUTED },

  '& .MuiInputLabel-root.Mui-focused': { color: '#ff995a' },

  '& .MuiInputBase-input, & .MuiSelect-select, & textarea': { color: '#fff' },

  '& .MuiOutlinedInput-root': {

    background: '#0b1c30', color: '#fff',

    '& fieldset': { borderColor: BORDER },

    '&:hover fieldset': { borderColor: '#7890a8' },

    '&.Mui-focused fieldset': { borderColor: ORANGE },

  },

  // Mantém contraste e leitura dos campos bloqueados no tema escuro.

  '& .MuiInputLabel-root.Mui-disabled': { color: '#bcd0e4', opacity: 1 },

  '& .MuiOutlinedInput-root.Mui-disabled': {

    backgroundColor: '#10263d',

    color: '#f4f8fc',

    opacity: 1,

    '& fieldset': { borderColor: '#59718a' },

  },

  '& .MuiInputBase-input.Mui-disabled, & .MuiSelect-select.Mui-disabled, & textarea.Mui-disabled': {

    WebkitTextFillColor: '#f4f8fc',

    color: '#f4f8fc',

    opacity: 1,

  },

  '& .MuiSelect-icon.Mui-disabled': { color: '#bcd0e4', opacity: 1 },

  '& .MuiFormHelperText-root.Mui-disabled': { color: '#bcd0e4' },

  '& .MuiFormHelperText-root': { color: MUTED },

};

const botaoLaranja = { background: ORANGE, color: '#fff', fontWeight: 700, textTransform: 'none',

  '&:hover': { background: '#e65c00' } };

export default function ResponderCotacao() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [cotacao, setCotacao] = useState(null);

  const [aba, setAba] = useState(0);

  const [form, setForm] = useState({});

  const [status, setStatus] = useState('Nova');

  const [execucao, setExecucao] = useState(EXECUCAO_INICIAL);

  const [mensagens, setMensagens] = useState([]);

  const [participantes, setParticipantes] = useState({});

  const [usuarioId, setUsuarioId] = useState(null);

  const [carregandoMensagens, setCarregandoMensagens] = useState(false);

  const [enviandoMensagem, setEnviandoMensagem] = useState(false);

  const [erroMensagens, setErroMensagens] = useState('');

  const [textoMensagem, setTextoMensagem] = useState('');

  const [aviso, setAviso] = useState('');

  const [erro, setErro] = useState('');

  const [carregando, setCarregando] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const [revisoes, setRevisoes] = useState([]);
  const [projetoVinculado, setProjetoVinculado] = useState(null);
  const [historicoProjeto, setHistoricoProjeto] = useState([]);
  const [carregandoProjeto, setCarregandoProjeto] = useState(false);
  const [erroProjeto, setErroProjeto] = useState('');

  const carregar = useCallback(async () => {

    setCarregando(true);

    setErro('');

    try {

      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!auth?.user || !(await perfilEngenharia(auth.user.id))) {

        throw new Error('Acesso permitido apenas para engenharia ou administração.');

      }

      setUsuarioId(auth.user.id);

      const selecionada = lerJSON('cotacaoSelecionada', null);

      const alvo = String(id || selecionada?.bancoId || '').trim();

      if (!/^\d+$/.test(alvo)) throw new Error('Identificador de cotação inválido.');

      const { data: c, error } = await supabase.from('cotacoes')

        .select('id,created_at,cliente_nome,cliente_email,descricao,status,numero_solicitacao,valor_proposta,prazo_proposta,condicoes_pagamento,escopo_proposta,dados_cliente,itens_solicitados,agendamento')

        .eq('id', Number(alvo)).single();

      if (error) throw error;

      const itens = Array.isArray(c.itens_solicitados) ? c.itens_solicitados : [];

      const registro = {

        ...c, bancoId: c.id, id: protocolo(c),

        cliente: c.cliente_nome || c.dados_cliente?.nome || 'Cliente não informado',

        email: c.cliente_email, data: dataBR(c.created_at),

        empresa: c.dados_cliente?.empresa || '',

        contato: c.dados_cliente?.telefone || c.dados_cliente?.celular || '',

        caracteristicas: itens.map(i => i.caracteristicas || i.descricao || '').filter(Boolean).join(' | '),

        tamanho: itens.map(i => i.tamanho || i.dimensoes || '').filter(Boolean).join(' | '),

        materiais: itens.map(i => i.materiais || '').filter(Boolean).join(' | '),

        observacao: c.agendamento ? JSON.stringify(c.agendamento, null, 2) : '',

        verba: itens[0]?.verba || c.dados_cliente?.verba || 'Não informada',

        valorOrcado: moedaBR(c.valor_proposta),

        andamento: c.status || 'Nova',

        propostaDisponibilizada: c.status === 'Aguardando Aprovação',

        historico: [],

      };

      const { data: historicoRevisoes, error: erroRevisoes } = await supabase

        .from('cotacoes_revisoes').select('id,versao_anterior,valor_anterior,escopo_anterior,prazo_anterior,condicoes_anterior,criado_em')

        .eq('cotacao_id', c.id).order('criado_em', { ascending: false });

      if (erroRevisoes) throw erroRevisoes;

      setRevisoes(historicoRevisoes || []);

      setCotacao(registro);

      setStatus(c.status || 'Nova');

      setForm({ analiseTecnica: '', pendencias: '',

        escopoProposta: c.escopo_proposta || '',

        prazoProposta: c.prazo_proposta || '',

        condicoesPagamento: c.condicoes_pagamento || '',

        validadeProposta: '',

        valorProposta: formatarValorBanco(c.valor_proposta),

      });

      setExecucao(EXECUCAO_INICIAL);

      setMensagens([]);

      setErroMensagens('');

    } catch (e) {

      setCotacao(null);

      setUsuarioId(null);

      setRevisoes([]);

      setErro(e?.message || 'Falha ao consultar cotação no Supabase.');

    } finally { setCarregando(false); }

  }, [id]);

  useEffect(() => { carregar(); }, [carregar]);

  const temProposta = useMemo(() => numeroMoeda(form.valorProposta) > 0 && form.escopoProposta?.trim(), [form]);

  const editar = (chave) => (event) => setForm((anterior) => ({ ...anterior, [chave]: event.target.value }));

  const salvar = async (enviarProposta = false) => {

    setErro(''); setAviso('');

    if (!cotacao || salvando) return;

    if (enviarProposta && !temProposta) {

      setErro('Preencha o escopo e um valor maior que zero antes de disponibilizar a proposta.');

      setAba(2); return;

    }

    if (!enviarProposta && ![0, 2].includes(aba)) {

      setErro('Análise técnica e execução ainda não possuem armazenamento neste formulário. Use a aba Mensagens para conversar com o cliente.');

      return;

    }

    const permitidos = ['Nova', 'Em Andamento', 'Falta Informação', 'Revisão Técnica', 'Aguardando Aprovação'];

    const recusada = cotacao.status === 'Proposta Recusada';

    if (recusada && !enviarProposta) {

      setErro('Proposta recusada: ajuste os campos e utilize Disponibilizar revisão para reenviar ao cliente.');

      setAba(2); return;

    }

    if (enviarProposta && !['Nova', 'Em Andamento', 'Falta Informação', 'Revisão Técnica', 'Proposta Recusada'].includes(cotacao.status)) {

      setErro('A proposta só pode ser disponibilizada em etapas de elaboração ou após recusa do cliente.');

      return;

    }

    const novoStatus = enviarProposta ? 'Aguardando Aprovação' : status;

    if (!permitidos.includes(novoStatus)) {

      setErro('Aprovação, pagamento, execução e conclusão exigem fluxos específicos ainda não integrados.');

      return;

    }

    const valor = numeroMoeda(form.valorProposta);

    setSalvando(true);

    try {

      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!auth?.user || !(await perfilEngenharia(auth.user.id))) throw new Error('Acesso não autorizado.');

      const atualizacao = {

        status: novoStatus,

        escopo_proposta: form.escopoProposta || null,

        prazo_proposta: form.prazoProposta || null,

        condicoes_pagamento: form.condicoesPagamento || null,

        valor_proposta: valor > 0 ? valor : null,

        updated_at: new Date().toISOString(),

      };

        if (recusada && enviarProposta) {

          const { error: erroRpc } = await supabase.rpc('revisar_proposta_cotacao', {

            p_cotacao_id: cotacao.bancoId,

            p_escopo: form.escopoProposta.trim(),

            p_valor: valor,

            p_prazo: form.prazoProposta || null,

            p_condicoes: form.condicoesPagamento || null,

          });

          if (erroRpc) throw erroRpc;

        } else {

          const { data: gravadas, error } = await supabase.from('cotacoes')

            .update(atualizacao).eq('id', cotacao.bancoId).eq('status', cotacao.status).select('id');

          if (error) throw error;

          if (!gravadas?.length) throw new Error('O status mudou. Atualize a solicitação antes de salvar.');

        }

      setAviso(enviarProposta

        ? (recusada ? 'Revisão registrada com histórico no Supabase e disponibilizada para nova aprovação.' : 'Proposta registrada no Supabase com status Aguardando Aprovação. Não foi enviada notificação externa.')

        : 'Status e campos da proposta salvos no Supabase.');

      await carregar();

    } catch (e) { setErro(e?.message || 'Não foi possível salvar no Supabase.'); }

    finally { setSalvando(false); }

  };

  const carregarProjeto = useCallback(async () => {
    if (!cotacao?.bancoId) return;
    setCarregandoProjeto(true);
    setErroProjeto('');
    try {
      const { data: projeto, error: erroConsulta } = await supabase
        .from('projetos')
        .select('id,cotacao_id,numero_projeto,titulo,descricao,status,percentual_conclusao,data_inicio,previsao_entrega,data_entrega,observacoes,criado_em,atualizado_em')
        .eq('cotacao_id', cotacao.bancoId)
        .maybeSingle();
      if (erroConsulta) throw erroConsulta;
      setProjetoVinculado(projeto || null);
      if (!projeto) {
        setHistoricoProjeto([]);
        return;
      }
      const { data: historico, error: erroHistorico } = await supabase
        .from('projetos_historico')
        .select('id,status_anterior,status_novo,percentual_anterior,percentual_novo,observacao,criado_em')
        .eq('projeto_id', projeto.id)
        .order('criado_em', { ascending: false })
        .limit(100);
      if (erroHistorico) throw erroHistorico;
      setHistoricoProjeto(historico || []);
    } catch (e) {
      setProjetoVinculado(null);
      setHistoricoProjeto([]);
      setErroProjeto(e?.message || 'Não foi possível consultar o projeto.');
    } finally {
      setCarregandoProjeto(false);
    }
  }, [cotacao?.bancoId]);

  useEffect(() => {
    if (aba === 5 && cotacao?.bancoId) carregarProjeto();
  }, [aba, cotacao?.bancoId, carregarProjeto]);

  const salvarExecucao = () => setErro('Execução não integrada ao Supabase. Nenhum dado foi salvo.');

  const simularPagamento = () => setErro('Pagamento demonstrativo desativado para cotações reais.');

  const carregarMensagens = useCallback(async (silencioso = false) => {

    if (!cotacao?.bancoId) return;

    if (!silencioso) setCarregandoMensagens(true);

    try {

      const { data, error } = await supabase.from('cotacoes_mensagens')

        .select('id,cotacao_id,remetente_id,mensagem,criado_em')

        .eq('cotacao_id', cotacao.bancoId)

        .order('criado_em', { ascending: true })

        .order('id', { ascending: true })

        .limit(500);

      if (error) throw error;

      setMensagens(data || []);

      const { data: perfisChat, error: erroPerfis } = await supabase.rpc('identificar_participantes_chat', {

        p_cotacao_id: cotacao.bancoId,

      });

      if (erroPerfis) throw erroPerfis;

      setParticipantes(Object.fromEntries((perfisChat || []).map((p) => [

        p.usuario_id,

        { nome: p.nome, tipo: p.tipo },

      ])));

      setErroMensagens('');

    } catch (e) {

      setErroMensagens(e?.message || 'Não foi possível consultar as mensagens.');

    } finally {

      if (!silencioso) setCarregandoMensagens(false);

    }

  }, [cotacao?.bancoId]);

  useEffect(() => {

    if (aba !== 3 || !cotacao?.bancoId) return undefined;

    carregarMensagens();

    const intervalo = setInterval(() => carregarMensagens(true), 12000);

    return () => clearInterval(intervalo);

  }, [aba, cotacao?.bancoId, carregarMensagens]);

  const enviarMensagem = async () => {

    const texto = textoMensagem.trim();

    if (!texto || !cotacao?.bancoId || enviandoMensagem) return;

    if (texto.length > 5000) {

      setErroMensagens('A mensagem pode conter no máximo 5.000 caracteres.');

      return;

    }

    setEnviandoMensagem(true);

    setErroMensagens('');

    try {

      const { data: auth, error: authError } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!auth?.user || !(await perfilEngenharia(auth.user.id))) {

        throw new Error('Acesso permitido apenas para engenharia ou administração.');

      }

      const { error } = await supabase.from('cotacoes_mensagens').insert({

        cotacao_id: cotacao.bancoId,

        remetente_id: auth.user.id,

        mensagem: texto,

      });

      if (error) throw error;

      setTextoMensagem('');

      await carregarMensagens(true);

    } catch (e) {

      setErroMensagens(e?.message || 'Não foi possível enviar a mensagem.');

    } finally {

      setEnviandoMensagem(false);

    }

  };

  return (

    <Box sx={{ minHeight: '100vh', background: NAVY, color: '#fff', pt: { xs: 13, md: 17 }, pb: 7, px: { xs: 2, md: 4 } }}>

      <Box sx={{ maxWidth: 1320, mx: 'auto' }}>

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>

          <Box>

            <Typography sx={{ color: '#ff985a', fontWeight: 800, letterSpacing: 2, fontSize: 12 }}>CATOTECH / GESTÃO DE ORÇAMENTOS</Typography>

            <Typography variant="h4" sx={{ fontWeight: 800, mt: 1 }}>Central de gestão da solicitação</Typography>

            <Typography sx={{ color: MUTED, mt: 1 }}>Análise técnica, proposta, comunicação e acompanhamento em um só lugar.</Typography>

          </Box>

          <Stack direction="row" gap={1}>

            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/recebimentoCotacao')}

              sx={{ color: '#fff', borderColor: BORDER, textTransform: 'none' }}>Voltar</Button>

            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={carregar}

              sx={{ color: '#fff', borderColor: BORDER, textTransform: 'none' }}>Atualizar</Button>

          </Stack>

        </Stack>

        <Alert severity="warning" sx={{ mb: 3, background: '#2d211b', color: '#ffccaa', border: '1px solid #8b451b', '& .MuiAlert-icon': { color: '#ff995a' } }}>

          Cotação carregada do Supabase. Propostas, revisões e mensagens estão integradas. O acompanhamento do projeto é somente de leitura; a execução não será liberada com pagamento pendente.

        </Alert>

        {!cotacao ? (

          <Paper sx={{ ...painel, color: '#fff' }}>

            <Typography variant="h6" sx={{ fontWeight: 700 }}>{carregando ? "Carregando solicitação..." : "Solicitação não encontrada"}</Typography>

            <Typography sx={{ color: MUTED, mt: 1 }}>Aguarde a consulta ao Supabase ou verifique o identificador e as permissões de acesso.</Typography>

            <Button onClick={() => navigate('/recebimentoCotacao')} sx={{ ...botaoLaranja, mt: 2 }}>Ver solicitações</Button>

          </Paper>

        ) : (

          <>

            <Paper sx={{ ...painel, color: '#fff', mb: 3 }}>

              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" gap={2}>

                <Box>

                  <Typography variant="h5" sx={{ fontWeight: 800 }}>{cotacao.cliente || 'Cliente não informado'}</Typography>

                  <Typography sx={{ color: MUTED, mt: 0.5 }}>Solicitação {cotacao.id} • Registrada em {cotacao.data || 'data não informada'}</Typography>

                  {cotacao.empresa && <Typography sx={{ color: MUTED, fontSize: 13 }}>{cotacao.empresa}</Typography>}

                </Box>

                <Stack alignItems={{ xs: 'flex-start', md: 'flex-end' }} gap={1}>

                  <Chip label={cotacao.status} sx={{ bgcolor: '#263b52', color: '#ffb17f', fontWeight: 800, border: '1px solid #925328' }} />

                  <Typography sx={{ color: MUTED, fontSize: 13 }}>Verba: <strong style={{ color: '#fff' }}>{cotacao.verba || 'Não informada'}</strong></Typography>

                  <Typography sx={{ color: MUTED, fontSize: 13 }}>Proposta: <strong style={{ color: '#fff' }}>{cotacao.valorOrcado && cotacao.valorOrcado !== 'R$ 0,00' ? cotacao.valorOrcado : 'A definir'}</strong></Typography>

                </Stack>

              </Stack>

            </Paper>

            {aviso && <Alert severity="success" onClose={() => setAviso('')} sx={{ mb: 2 }}>{aviso}</Alert>}

            {erro && <Alert severity="error" onClose={() => setErro('')} sx={{ mb: 2 }}>{erro}</Alert>}

            <Paper sx={{ ...painel, color: '#fff', mb: 3 }}>

              <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>Controle da etapa</Typography>

              <Stack direction={{ xs: 'column', md: 'row' }} gap={2} alignItems={{ md: 'center' }}>

                <TextField select fullWidth label="Status da solicitação" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ ...campo, maxWidth: { md: 440 } }}>

                  {STATUS.map((item) => <MenuItem key={item} value={item} disabled={cotacao.status === 'Proposta Recusada' || !['Nova', 'Em Andamento', 'Falta Informação', 'Revisão Técnica', 'Aguardando Aprovação'].includes(item)}>{item}</MenuItem>)}

                </TextField>

                <Button startIcon={<SaveOutlinedIcon />} onClick={() => salvar(false)} disabled={salvando} sx={botaoLaranja}>Salvar alterações</Button>

              </Stack>

              <Typography sx={{ color: MUTED, fontSize: 12, mt: 1.5 }}>A aprovação do cliente já está integrada. A confirmação automática do pagamento e a liberação de execução ainda não estão disponíveis.</Typography>

              {false && cotacao.status === 'Aguardando Pagamento' && cotacao.propostaDisponibilizada && (

                <Box sx={{ mt: 2, p: 2, border: '1px solid #a66324', borderRadius: 2, bgcolor: '#251e1b' }}>

                  <Typography sx={{ color: '#ffbf91', fontWeight: 800, mb: 1 }}>Simulação administrativa — somente desenvolvimento local</Typography>

                  <Typography sx={{ color: MUTED, mb: 2, fontSize: 13 }}>Registra um pagamento fictício no histórico e libera a execução de teste. Não gera Pix, boleto, cartão, cobrança ou confirmação bancária.</Typography>

                  <Button onClick={simularPagamento} sx={botaoLaranja}>Simular pagamento (teste)</Button>

                </Box>

              )}

            </Paper>

            <Paper sx={{ ...painel, color: '#fff' }}>

              <Tabs value={aba} onChange={(_, value) => setAba(value)} variant="scrollable" scrollButtons="auto"

                sx={{ borderBottom: `1px solid ${BORDER}`, mb: 3, '& .MuiTab-root': { color: MUTED, textTransform: 'none', fontWeight: 700 },

                  '& .Mui-selected': { color: '#ff995a !important' }, '& .MuiTabs-indicator': { bgcolor: ORANGE } }}>

                <Tab label="Solicitação" /><Tab label="Análise técnica" /><Tab label="Proposta" /><Tab label="Mensagens" /><Tab label="Histórico" /><Tab label="Execução do Projeto" />

              </Tabs>

              {aba === 0 && (

                <Grid container spacing={2}>

                  {[

                    ['Descrição do pedido', cotacao.descricao], ['Características técnicas', cotacao.caracteristicas],

                    ['Dimensões', cotacao.tamanho], ['Materiais', cotacao.materiais],

                    ['Observações', cotacao.observacao], ['Contato', cotacao.contato],

                    ['E-mail', cotacao.email], ['Andamento', cotacao.andamento],

                  ].map(([rotulo, valor]) => (

                    <Grid item xs={12} md={6} key={rotulo}>

                      <Box sx={{ bgcolor: '#0b1c30', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2, height: '100%' }}>

                        <Typography sx={{ color: '#ff995a', fontSize: 12, fontWeight: 800, mb: 1 }}>{rotulo}</Typography>

                        <Typography sx={{ color: '#fff', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{valor || 'Não informado'}</Typography>

                      </Box>

                    </Grid>

                  ))}

                </Grid>

              )}

              {aba === 1 && (

                <Stack gap={3}>

                  <Typography sx={{ color: MUTED }}>Registre a avaliação técnica e as informações pendentes. O pedido original permanece preservado.</Typography>

                  <TextField multiline minRows={5} label="Parecer técnico" value={form.analiseTecnica || ''} onChange={editar('analiseTecnica')} fullWidth sx={campo} />

                  <TextField multiline minRows={3} label="Pendências / informações necessárias" value={form.pendencias || ''} onChange={editar('pendencias')} fullWidth sx={campo} />

                  <Box><Button startIcon={<SaveOutlinedIcon />} onClick={() => salvar(false)} disabled={salvando} sx={botaoLaranja}>Salvar análise</Button></Box>

                </Stack>

              )}

              {aba === 2 && (

                <Stack gap={3}>

                  {cotacao.status === 'Proposta Recusada' && <Alert severity="warning">O cliente recusou a proposta anterior. Edite os campos e disponibilize a revisão; a versão anterior ficará no histórico.</Alert>}

                  <Typography sx={{ color: MUTED }}>Elabore uma proposta real. Ao disponibilizá-la, os campos e o status Aguardando Aprovação serão gravados no Supabase. Não há notificação externa automática.</Typography>

                  <TextField multiline minRows={4} label="Escopo da proposta" value={form.escopoProposta || ''} onChange={editar('escopoProposta')} fullWidth sx={campo} />

                  <Grid container spacing={2}>

                    <Grid item xs={12} md={6}><TextField fullWidth label="Valor da proposta (R$)" placeholder="R$ 0,00" value={form.valorProposta || ''} onChange={(event) => setForm((anterior) => ({ ...anterior, valorProposta: formatarValorDigitado(event.target.value) }))} inputProps={{ inputMode: 'numeric' }} sx={campo} /></Grid>

                    <Grid item xs={12} md={6}><TextField fullWidth label="Prazo de entrega" value={form.prazoProposta || ''} onChange={editar('prazoProposta')} sx={campo} /></Grid>

                    <Grid item xs={12} md={6}><TextField fullWidth label="Condições de pagamento" value={form.condicoesPagamento || ''} onChange={editar('condicoesPagamento')} sx={campo} /></Grid>

                    <Grid item xs={12} md={6}><TextField fullWidth label="Validade da proposta" value={form.validadeProposta || ''} onChange={editar('validadeProposta')} sx={campo} /></Grid>

                  </Grid>

                  <Divider sx={{ borderColor: BORDER }} />

                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>

                    <Button startIcon={<SaveOutlinedIcon />} variant="outlined" onClick={() => salvar(false)} disabled={salvando || cotacao.status === 'Proposta Recusada'} sx={{ color: '#fff', borderColor: BORDER, textTransform: 'none' }}>Salvar rascunho</Button>

                    <Button startIcon={<SendOutlinedIcon />} onClick={() => salvar(true)} disabled={salvando || !['Nova', 'Em Andamento', 'Falta Informação', 'Revisão Técnica', 'Proposta Recusada'].includes(cotacao.status)} sx={botaoLaranja}>{cotacao.status === 'Proposta Recusada' ? 'Disponibilizar revisão' : 'Disponibilizar proposta no Supabase'}</Button>

                  </Stack>

                  {cotacao.propostaDisponibilizada && <Typography sx={{ color: '#a7e6d4', fontSize: 13 }}>Proposta disponível no Supabase: {cotacao.revisaoProposta || 1}</Typography>}

                </Stack>

              )}

              {aba === 3 && (

                <Stack gap={2}>

                  <Alert severity="info">Conversa privada vinculada à solicitação {cotacao.id}. Mensagens são salvas no Supabase e podem ser vistas pelo cliente desta cotação e pela engenharia.</Alert>

                  {erroMensagens && <Alert severity="error" onClose={() => setErroMensagens('')}>{erroMensagens}</Alert>}

                  <Stack direction="row" alignItems="center" justifyContent="space-between">

                    <Typography sx={{ color: MUTED, fontSize: 13 }}>{carregandoMensagens ? 'Carregando mensagens...' : `${mensagens.length} mensagem(ns)`}</Typography>

                    <Button startIcon={<RefreshIcon />} onClick={() => carregarMensagens()} disabled={carregandoMensagens} sx={{ color: '#fff', textTransform: 'none' }}>Atualizar conversa</Button>

                  </Stack>

                  <Box sx={{ bgcolor: '#0b1c30', borderRadius: 2, p: 2, minHeight: 180, maxHeight: 430, overflowY: 'auto' }}>

                    {!carregandoMensagens && mensagens.length === 0 && <Typography sx={{ color: MUTED }}>Nenhuma mensagem registrada nesta cotação.</Typography>}

                    {mensagens.map((msg) => {

                      const minha = msg.remetente_id === usuarioId;

                        const participante = participantes[msg.remetente_id];

                        const papel = participante?.tipo === 'cliente' ? 'Cliente' : 'Engenharia';

                        const identificacao = `${minha ? 'Você' : papel}${participante?.nome ? ` (${participante.nome})` : ''}`;

                      return (

                        <Box key={msg.id} sx={{ p: 1.5, mb: 1.5, borderRadius: 2, bgcolor: minha ? '#253d55' : '#172b40', maxWidth: '90%', ml: minha ? 'auto' : 0, border: `1px solid ${BORDER}` }}>

                          <Typography sx={{ color: '#ff995a', fontSize: 12, fontWeight: 800 }}>{identificacao}</Typography>

                          <Typography sx={{ color: '#fff', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{msg.mensagem}</Typography>

                          <Typography sx={{ color: MUTED, fontSize: 11, mt: 1 }}>{dataBR(msg.criado_em)}</Typography>

                        </Box>

                      );

                    })}

                  </Box>

                  <TextField multiline minRows={3} label="Mensagem para o cliente" value={textoMensagem} onChange={(e) => setTextoMensagem(e.target.value)} fullWidth sx={campo} inputProps={{ maxLength: 5000 }} helperText={`${textoMensagem.length}/5000 caracteres`} />

                  <Box><Button startIcon={<SendOutlinedIcon />} onClick={enviarMensagem} disabled={enviandoMensagem || !textoMensagem.trim()} sx={botaoLaranja}>{enviandoMensagem ? 'Enviando...' : 'Enviar mensagem'}</Button></Box>

                  <Typography sx={{ color: MUTED, fontSize: 12 }}>A conversa é atualizada automaticamente a cada 12 segundos enquanto esta aba estiver aberta.</Typography>

                </Stack>

              )}

              {aba === 5 && (

                <Stack gap={2.5}>

                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Execução do Projeto</Typography>
                <Paper sx={{ bgcolor: '#0b1c30', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2.5, color: '#fff' }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 2 }}>
                    <Box>
                      <Typography sx={{ color: '#ff995a', fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>SUPABASE / PROJETOS</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>Projeto vinculado à solicitação</Typography>
                    </Box>
                    <Button startIcon={<RefreshIcon />} onClick={carregarProjeto} disabled={carregandoProjeto} variant="outlined" sx={{ color: '#fff', borderColor: BORDER, textTransform: 'none' }}>
                      {carregandoProjeto ? 'Consultando...' : 'Atualizar projeto'}
                    </Button>
                  </Stack>
                  {erroProjeto && <Alert severity="error" sx={{ mb: 2 }}>{erroProjeto}</Alert>}
                  {!carregandoProjeto && !erroProjeto && !projetoVinculado && (
                    <Alert severity="info">Nenhum projeto foi criado para a solicitação {cotacao.id}. A aprovação da proposta não libera a execução: é necessária a confirmação do pagamento.</Alert>
                  )}
                  {projetoVinculado && (
                    <Stack gap={2}>
                      <Stack direction="row" flexWrap="wrap" alignItems="center" gap={1}>
                        <Chip label={projetoVinculado.numero_projeto || `Projeto #${projetoVinculado.id}`} sx={{ bgcolor: '#263b52', color: '#fff', fontWeight: 700 }} />
                        <Chip label={projetoVinculado.status} sx={{ bgcolor: '#293b2e', color: '#b9f2cc', fontWeight: 700 }} />
                      </Stack>
                      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>{projetoVinculado.titulo}</Typography>
                      {projetoVinculado.descricao && <Typography sx={{ whiteSpace: 'pre-wrap', color: MUTED }}>{projetoVinculado.descricao}</Typography>}
                      <Grid container spacing={2}>
                        {[
                          ['Início', projetoVinculado.data_inicio || 'Não definido'],
                          ['Previsão de entrega', projetoVinculado.previsao_entrega || 'Não definida'],
                          ['Entrega', projetoVinculado.data_entrega || 'Não realizada'],
                        ].map(([titulo, valor]) => (
                          <Grid item xs={12} md={4} key={titulo}>
                            <Box sx={{ p: 1.5, bgcolor: PANEL, borderRadius: 2 }}>
                              <Typography sx={{ color: MUTED, fontSize: 12 }}>{titulo}</Typography>
                              <Typography sx={{ fontWeight: 700 }}>{valor}</Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                      <Box sx={{ height: 10, bgcolor: '#293d53', borderRadius: 2, overflow: 'hidden' }}>
                        <Box sx={{ height: '100%', bgcolor: ORANGE, width: `${projetoVinculado.percentual_conclusao || 0}%` }} />
                      </Box>
                      <Typography sx={{ color: MUTED, fontSize: 13 }}>Progresso: {projetoVinculado.percentual_conclusao || 0}%</Typography>
                      {projetoVinculado.observacoes && <Typography sx={{ whiteSpace: 'pre-wrap', color: MUTED }}>Observações: {projetoVinculado.observacoes}</Typography>}
                      <Divider sx={{ borderColor: BORDER }} />
                      <Typography sx={{ fontWeight: 800 }}>Histórico do projeto</Typography>
                      {historicoProjeto.length === 0 && <Typography sx={{ color: MUTED }}>Nenhuma atualização registrada.</Typography>}
                      {historicoProjeto.map((evento) => (
                        <Box key={evento.id} sx={{ p: 1.5, borderRadius: 2, bgcolor: PANEL }}>
                          <Typography sx={{ color: '#ff995a', fontWeight: 700 }}>{evento.status_novo || 'Atualização de progresso'}</Typography>
                          <Typography sx={{ color: MUTED, fontSize: 12 }}>{dataBR(evento.criado_em)}</Typography>
                          {evento.observacao && <Typography sx={{ whiteSpace: 'pre-wrap' }}>{evento.observacao}</Typography>}
                        </Box>
                      ))}
                    </Stack>
                  )}
                </Paper>


                  <Typography sx={{ color: MUTED }}>Visualização da estrutura de execução. O salvamento e a liberação por pagamento ainda não estão integrados ao Supabase.</Typography>

                  {true && (

                    <Alert severity="warning">Execução não integrada ao Supabase. Campos disponíveis apenas para consulta; nenhum pagamento foi confirmado.</Alert>

                  )}

                  <Grid container spacing={2}>

                    <Grid item xs={12} sm={6} md={2}>

                      <TextField select fullWidth label="Etapa atual" value={execucao.etapa} onChange={(e) => setExecucao((v) => ({ ...v, etapa: e.target.value }))} sx={campo} disabled>

                        {ETAPAS_EXECUCAO.map((etapa) => <MenuItem key={etapa} value={etapa}>{etapa}</MenuItem>)}

                      </TextField>

                    </Grid>

                    <Grid item xs={12} sm={6} md={1}>

                      <TextField fullWidth type="number" label="Progresso (%)" value={execucao.progresso} onChange={(e) => setExecucao((v) => ({ ...v, progresso: e.target.value }))} inputProps={{ min: 0, max: 100 }} sx={campo} disabled />

                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>

                      <TextField fullWidth label="Prazo previsto" placeholder="DD/MM/AAAA" value={execucao.prazo} onChange={(e) => setExecucao((v) => ({ ...v, prazo: e.target.value }))} sx={campo} disabled />

                    </Grid>

                    <Grid item xs={12} sm={6} md={2}>

                      <TextField fullWidth label="Responsável" value={execucao.responsavel} onChange={(e) => setExecucao((v) => ({ ...v, responsavel: e.target.value }))} sx={campo} disabled />

                    </Grid>

                    <Grid item xs={12} md={5}>

                      <TextField fullWidth multiline minRows={3} label="Observações da execução" value={execucao.observacoes} onChange={(e) => setExecucao((v) => ({ ...v, observacoes: e.target.value }))} sx={campo} disabled />

                    </Grid>

                  </Grid>

                  <Box sx={{ height: 9, bgcolor: '#293d53', borderRadius: 2, overflow: 'hidden' }}>

                    <Box sx={{ width: `${Math.min(100, Math.max(0, Number(execucao.progresso) || 0))}%`, height: '100%', bgcolor: ORANGE }} />

                  </Box>

                  <Typography sx={{ color: MUTED, fontSize: 13 }}>Progresso registrado: {Math.min(100, Math.max(0, Number(execucao.progresso) || 0))}%</Typography>

                  <Box><Button startIcon={<SaveOutlinedIcon />} onClick={salvarExecucao} disabled sx={{ ...botaoLaranja, '&.Mui-disabled': { bgcolor: '#344457', color: '#b9c4d0' } }}>Salvar acompanhamento</Button></Box>

                </Stack>

              )}

              {aba === 4 && (

                <Stack gap={2}>

                  <Typography sx={{ color: MUTED, fontWeight: 700 }}>Revisões de propostas registradas no Supabase</Typography>

                  {revisoes.length === 0 && <Typography sx={{ color: MUTED }}>Nenhuma revisão registrada.</Typography>}

                  {revisoes.map((r) => <Box key={r.id} sx={{ bgcolor: '#0b1c30', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2 }}>

                    <Typography sx={{ color: '#ff995a', fontWeight: 800 }}>Versão anterior {r.versao_anterior}</Typography>

                    <Typography sx={{ color: MUTED, fontSize: 12 }}>{dataBR(r.criado_em)}</Typography>

                    <Typography>Valor: {moedaBR(r.valor_anterior)}</Typography>

                    <Typography sx={{ whiteSpace: 'pre-wrap' }}>Escopo: {r.escopo_anterior || 'Não informado'}</Typography>

                    <Typography>Prazo: {r.prazo_anterior || 'Não informado'}</Typography>

                    <Typography>Condições: {r.condicoes_anterior || 'Não informadas'}</Typography>

                  </Box>)}

                  {(!cotacao.historico || cotacao.historico.length === 0) && <Typography sx={{ color: MUTED }}>Nenhuma alteração de gestão registrada ainda.</Typography>}

                  {[...(cotacao.historico || [])].reverse().map((evento, index) => (

                    <Box key={index} sx={{ bgcolor: '#0b1c30', border: `1px solid ${BORDER}`, borderRadius: 2, p: 2 }}>

                      <Typography sx={{ color: '#ff995a', fontWeight: 800 }}>{evento.tipo}</Typography>

                      <Typography sx={{ color: '#fff' }}>{evento.detalhe}</Typography>

                      <Typography sx={{ color: MUTED, fontSize: 12, mt: 1 }}>{evento.data}</Typography>

                    </Box>

                  ))}

                </Stack>

              )}

            </Paper>

          </>

        )}

      </Box>

    </Box>

  );

}
