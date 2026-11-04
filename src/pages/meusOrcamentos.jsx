import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Table, TableHead, TableRow, TableCell, TableBody, Button, Chip, TextField, InputAdornment, Card, CardContent, Dialog, DialogTitle, DialogContent, DialogActions, Stack, Alert, Divider, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PaymentIcon from '@mui/icons-material/Payment';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { buscarCotacoes, moedaBR, dataBR, protocolo, valorTexto } from '../utils/cotacoesSupabase';

const NAVY = '#071B2E';
const ORANGE = '#ff6600';
const MUTED = '#60748A';
const cores = { Nova: 'success', 'Em Andamento': 'warning', 'Aguardando Aprovação': 'info', 'Revisão Técnica': 'warning', 'Aguardando Pagamento': 'warning', 'Pagamento Confirmado': 'success', 'Em Execução': 'info', 'Proposta Recusada': 'error', Concluído: 'success', Cancelada: 'default' };
const detalhe = (nome, valor) => <Box sx={{ py: 1.1, borderBottom: '1px solid #e5ebf0', display: 'flex', gap: 2, justifyContent: 'space-between', flexWrap: 'wrap' }}><Typography sx={{ color: MUTED, fontWeight: 700 }}>{nome}</Typography><Typography sx={{ color: NAVY, maxWidth: '70%', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }}>{valorTexto(valor)}</Typography></Box>;

// Exibe os dados JSONB do Supabase em campos legíveis, sem mostrar JSON bruto.
const nomesCampos = {
  nome: 'Nome', name: 'Nome', email: 'E-mail', contato: 'Telefone', telefone: 'Telefone',
  empresa: 'Empresa', cnpj: 'CNPJ', cpf: 'CPF', cep: 'CEP', endereco: 'Endereço',
  numero: 'Número', complemento: 'Complemento', bairro: 'Bairro', cidade: 'Cidade',
  estado: 'Estado', produto: 'Produto', quantidade: 'Quantidade', unidade: 'Unidade',
  descricao: 'Descrição', observacao: 'Observações', observacoes: 'Observações',
  valor: 'Verba disponível', data: 'Data', horario: 'Horário', modalidade: 'Modalidade',
};
const rotuloCampo = (chave) => nomesCampos[chave] || String(chave)
  .replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/^./, letra => letra.toUpperCase());
const campoEstruturado = (chave, valor, indice) => {
  if (valor === null || valor === undefined || valor === '') return null;
  return <Box key={`${chave}-${indice}`} sx={{ py: 1, px: 1.5, bgcolor: indice % 2 ? '#fff' : '#f7f9fc', borderRadius: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '175px minmax(0, 1fr)' }, gap: { xs: .25, sm: 2 }, alignItems: 'start' }}>
    <Typography sx={{ color: MUTED, fontWeight: 700, fontSize: 13 }}>{rotuloCampo(chave)}</Typography>
    <Typography sx={{ color: NAVY, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', fontSize: 14 }}>{typeof valor === 'object' ? JSON.stringify(valor) : String(valor)}</Typography>
  </Box>;
};
const secaoEstruturada = (titulo, dados) => {
  if (!dados || (typeof dados === 'object' && !Object.keys(dados).length)) return null;
  const registros = Array.isArray(dados) ? dados : [dados];
  return <Box sx={{ mt: 1 }}>
    <Typography sx={{ color: NAVY, fontWeight: 800, fontSize: 16, mb: 1.5 }}>{titulo}</Typography>
    <Stack spacing={1.5}>{registros.map((registro, indice) => <Box key={indice} sx={{ border: '1px solid #e2eaf1', borderRadius: 2, p: 1.5, bgcolor: '#fff' }}>
      {registros.length > 1 && <Typography sx={{ color: ORANGE, fontWeight: 800, mb: 1 }}>Item {indice + 1}</Typography>}
      {registro && typeof registro === 'object' && !Array.isArray(registro)
        ? Object.entries(registro).map(([chave, valor], pos) => campoEstruturado(chave, valor, pos))
        : campoEstruturado('Informação', registro, 0)}
    </Box>)}</Stack>
  </Box>;
};

// Conversa privada vinculada à cotação. O Supabase aplica RLS em leitura e envio.
function ChatCliente({ cotacaoId }) {
  const [mensagens, setMensagens] = useState([]);
  const [participantes, setParticipantes] = useState({});
  const [texto, setTexto] = useState('');
  const [usuarioId, setUsuarioId] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erroChat, setErroChat] = useState('');

  const carregarMensagens = useCallback(async (mostrarCarregamento = false) => {
    if (!cotacaoId) return;
    if (mostrarCarregamento) setCarregando(true);
    try {
      const { data, error } = await supabase
        .from('cotacoes_mensagens')
        .select('id, cotacao_id, remetente_id, mensagem, criado_em')
        .eq('cotacao_id', cotacaoId)
        .order('criado_em', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      setMensagens(data || []);
      const { data: perfisChat, error: erroPerfis } = await supabase.rpc('identificar_participantes_chat', {
        p_cotacao_id: cotacaoId,
      });
      if (erroPerfis) throw erroPerfis;
      setParticipantes(Object.fromEntries((perfisChat || []).map(p => [p.usuario_id, { nome: p.nome, tipo: p.tipo }])));
      setErroChat('');
    } catch (e) {
      setErroChat(e?.message || 'Não foi possível carregar as mensagens.');
    } finally {
      if (mostrarCarregamento) setCarregando(false);
    }
  }, [cotacaoId]);

  useEffect(() => {
    let ativo = true;
    setMensagens([]);
    setParticipantes({});
    setTexto('');
    setUsuarioId(null);
    setErroChat('');
    setCarregando(true);
    const iniciar = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!ativo) return;
      if (error || !data?.user) {
        setErroChat('Faça login para acessar a conversa privada.');
        setCarregando(false);
        return;
      }
      setUsuarioId(data.user.id);
      await carregarMensagens(true);
    };
    iniciar();
    const intervalo = window.setInterval(() => {
      if (ativo && document.visibilityState === 'visible') carregarMensagens();
    }, 12000);
    return () => { ativo = false; window.clearInterval(intervalo); };
  }, [cotacaoId, carregarMensagens]);

  const enviarMensagem = async () => {
    const mensagem = texto.trim();
    if (!mensagem || mensagem.length > 5000 || enviando || !usuarioId || !cotacaoId) return;
    setEnviando(true);
    setErroChat('');
    try {
      const { error } = await supabase.from('cotacoes_mensagens').insert({
        cotacao_id: cotacaoId,
        remetente_id: usuarioId,
        mensagem
      });
      if (error) throw error;
      setTexto('');
      await carregarMensagens();
    } catch (e) {
      setErroChat(e?.message || 'Não foi possível enviar a mensagem.');
    } finally {
      setEnviando(false);
    }
  };

  return <Box sx={{ mt: 2.5 }}>
    <Divider sx={{ mb: 2 }} />
    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" gap={1} sx={{ mb: 1.5 }}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <ChatBubbleOutlineIcon sx={{ color: ORANGE }} />
        <Typography sx={{ color: NAVY, fontWeight: 800, fontSize: 17 }}>Mensagens com a engenharia</Typography>
      </Stack>
      <Button size="small" startIcon={<RefreshIcon />} onClick={() => carregarMensagens(true)} disabled={carregando} sx={{ color: NAVY, textTransform: 'none' }}>Atualizar conversa</Button>
    </Stack>
    <Typography sx={{ color: MUTED, fontSize: 13, mb: 1.5 }}>Conversa privada desta solicitação. As mensagens são armazenadas no Supabase.</Typography>
    {erroChat && <Alert severity="error" sx={{ mb: 1.5 }}>{erroChat}</Alert>}
    <Box sx={{ p: 1.5, bgcolor: '#edf3f8', borderRadius: 2, minHeight: 125, maxHeight: 320, overflowY: 'auto', border: '1px solid #dce6ef' }}>
      {carregando ? <Box sx={{ textAlign: 'center', py: 3 }}><CircularProgress size={25} /></Box>
        : mensagens.length === 0 ? <Typography sx={{ color: MUTED, fontSize: 14, py: 2, textAlign: 'center' }}>Nenhuma mensagem nesta conversa ainda.</Typography>
        : <Stack spacing={1.5}>{mensagens.map(m => {
          const minha = m.remetente_id === usuarioId;
          const participante = participantes[m.remetente_id];
          const papel = participante?.tipo === 'cliente' ? 'Cliente' : 'Engenharia';
          const identificacao = `${minha ? 'Você' : papel}${participante?.nome ? ` (${participante.nome})` : ''}`;
          return <Box key={m.id} sx={{ alignSelf: minha ? 'flex-end' : 'flex-start', maxWidth: '90%', minWidth: 120, bgcolor: minha ? '#dceee6' : '#fff', border: '1px solid #d5e0e9', borderRadius: 2, px: 1.5, py: 1.25 }}>
            <Typography sx={{ color: minha ? '#17623c' : ORANGE, fontSize: 12, fontWeight: 800 }}>{identificacao}</Typography>
            <Typography sx={{ color: NAVY, fontSize: 14, whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{m.mensagem}</Typography>
            <Typography sx={{ color: MUTED, fontSize: 11, mt: .75 }}>{dataBR(m.criado_em)}</Typography>
          </Box>;
        })}</Stack>}
    </Box>
    <TextField
      label="Mensagem para a engenharia"
      multiline minRows={2} maxRows={5} fullWidth
      value={texto} onChange={e => setTexto(e.target.value)}
      inputProps={{ maxLength: 5000 }}
      disabled={!usuarioId || enviando}
      sx={{ mt: 1.5, '& .MuiInputBase-root': { bgcolor: '#fff' } }}
      helperText={`${texto.length}/5000 caracteres`}
    />
    <Button variant="contained" startIcon={enviando ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
      disabled={!texto.trim() || enviando || !usuarioId}
      onClick={enviarMensagem}
      sx={{ mt: 1, bgcolor: ORANGE, '&:hover': { bgcolor: '#d95700' }, textTransform: 'none', fontWeight: 800 }}>
      {enviando ? 'Enviando...' : 'Enviar mensagem'}
    </Button>
    <Typography sx={{ color: MUTED, fontSize: 12, mt: 1 }}>A conversa é atualizada automaticamente a cada 12 segundos enquanto esta janela estiver aberta.</Typography>
  </Box>;
}

export default function MeusOrcamentos() {
  const navigate = useNavigate();
  const [aba, setAba] = useState('solicitacoes');
  const [projetos, setProjetos] = useState([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(false);
  const [erroProjetos, setErroProjetos] = useState('');
  const [buscaProjeto, setBuscaProjeto] = useState('');
  const [projetoSelecionado, setProjetoSelecionado] = useState(null);
  const [historicoProjeto, setHistoricoProjeto] = useState([]);
  const [erroHistorico, setErroHistorico] = useState('');
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [lista, setLista] = useState([]);
  const [busca, setBusca] = useState('');
  const [selecionada, setSelecionada] = useState(null);
  const [pagamentoSelecionado, setPagamentoSelecionado] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [decisao, setDecisao] = useState(null);
  const [enviandoDecisao, setEnviandoDecisao] = useState(false);
  const [erroDecisao, setErroDecisao] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [pagamentos, setPagamentos] = useState({});
  const [erroPagamento, setErroPagamento] = useState('');
  const [registrandoPendente, setRegistrandoPendente] = useState(false);
  const carregarPagamentos = useCallback(async (cotacoes) => {
    const ids = (cotacoes || []).filter(c => ['Aguardando Pagamento', 'Pagamento Confirmado'].includes(c.status)).map(c => c.id);
    if (!ids.length) { setPagamentos({}); return; }
    const { data, error } = await supabase.from('cotacoes_pagamentos')
      .select('cotacao_id, valor, status, metodo, criado_em, confirmado_em')
      .in('cotacao_id', ids);
    if (error) throw error;
    setPagamentos(Object.fromEntries((data || []).map(p => [p.cotacao_id, p])));
  }, []);
  const atualizar = useCallback(async () => {
    setCarregando(true); setErro('');
    try {
      const cotacoes = await buscarCotacoes();
      setLista(cotacoes);
      try { await carregarPagamentos(cotacoes); setErroPagamento(''); }
      catch (e) { setErroPagamento(e?.message || 'Não foi possível consultar os pagamentos.'); }
    } catch (e) { setLista([]); setErro(e?.message || 'Não foi possível carregar as solicitações.'); }
    finally { setCarregando(false); }
  }, [carregarPagamentos]);
  useEffect(() => { atualizar(); const atualizarFoco = () => { if (document.visibilityState === 'visible') atualizar(); }; window.addEventListener('focus', atualizarFoco); return () => window.removeEventListener('focus', atualizarFoco); }, [atualizar]);
  const confirmarDecisao = async () => {
    if (!decisao || enviandoDecisao) return;
    setEnviandoDecisao(true);
    setErroDecisao('');
    try {
      const { data, error } = await supabase.rpc('decidir_proposta_cotacao', {
        p_cotacao_id: decisao.id,
        p_decisao: decisao.acao,
      });
      if (error) throw error;
      if (decisao.acao === 'aprovar') {
        const { error: erroRegistro } = await supabase.rpc('registrar_pagamento_pendente', {
          p_cotacao_id: decisao.id,
        });
        if (erroRegistro) {
          setSucesso('Proposta aprovada. O registro do pagamento pendente ainda precisa ser concluído. Abra a solicitação e use “Registrar pagamento pendente”.');
          setErroPagamento(erroRegistro.message || 'Falha ao registrar o pagamento pendente.');
        } else {
          setSucesso('Proposta aprovada! Pagamento registrado como Pendente. Nenhuma cobrança foi realizada.');
          setErroPagamento('');
        }
      } else {
        setSucesso(`Proposta recusada com sucesso. Status: ${data}.`);
      }
      setSelecionada(null);
      setDecisao(null);
      await atualizar();
    } catch (e) {
      setErroDecisao(e?.message || 'Não foi possível registrar sua decisão.');
    } finally {
      setEnviandoDecisao(false);
    }
  };
  const registrarPendente = async (cotacaoId) => {
    if (registrandoPendente) return;
    setRegistrandoPendente(true);
    setErroPagamento('');
    try {
      const { error } = await supabase.rpc('registrar_pagamento_pendente', { p_cotacao_id: cotacaoId });
      if (error) throw error;
      setSucesso('Pagamento pendente registrado com sucesso. Nenhuma cobrança foi realizada.');
      await atualizar();
    } catch (e) {
      setErroPagamento(e?.message || 'Não foi possível registrar o pagamento pendente.');
    } finally { setRegistrandoPendente(false); }
  };
  const atualizarProjetos = useCallback(async () => {
    setCarregandoProjetos(true);
    setErroProjetos('');
    try {
      const { data: usuario, error: erroAuth } = await supabase.auth.getUser();
      if (erroAuth) throw erroAuth;
      if (!usuario?.user) throw new Error('Faça login para consultar seus projetos.');
      const { data, error } = await supabase.from('projetos')
        .select('id,cotacao_id,numero_projeto,titulo,descricao,status,percentual_conclusao,data_inicio,previsao_entrega,data_entrega,observacoes,criado_em')
        .eq('cliente_id', usuario.user.id)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      setProjetos(data || []);
    } catch (e) {
      setProjetos([]);
      setErroProjetos(e?.message || 'Não foi possível carregar os projetos.');
    } finally { setCarregandoProjetos(false); }
  }, []);
  useEffect(() => { if (aba === 'projetos') atualizarProjetos(); }, [aba, atualizarProjetos]);
  const projetosFiltrados = useMemo(() => projetos.filter(p =>
    [p.numero_projeto, p.titulo, p.status, String(p.cotacao_id)].some(v =>
      String(v || '').toLocaleLowerCase('pt-BR').includes(buscaProjeto.trim().toLocaleLowerCase('pt-BR'))
    )), [projetos, buscaProjeto]);
  const abrirDetalhesProjeto = async (projeto) => {
    setProjetoSelecionado(projeto);
    setHistoricoProjeto([]);
    setErroHistorico('');
    setCarregandoHistorico(true);
    try {
      const { data, error } = await supabase.from('projetos_historico')
        .select('id,status_anterior,status_novo,percentual_anterior,percentual_novo,observacao,criado_em')
        .eq('projeto_id', projeto.id)
        .order('criado_em', { ascending: false });
      if (error) throw error;
      setHistoricoProjeto(data || []);
    } catch (e) { setErroHistorico(e?.message || 'Não foi possível carregar o histórico.'); }
    finally { setCarregandoHistorico(false); }
  };
  const dataProjeto = (valor) => valor ? new Date(`${valor}T12:00:00`).toLocaleDateString('pt-BR') : 'Não informada';
  const filtradas = useMemo(() => lista.filter(c => [protocolo(c), c.cliente_nome, c.status, c.descricao].some(v => String(v || '').toLowerCase().includes(busca.trim().toLowerCase()))), [lista, busca]);
  return <Box sx={{ bgcolor: '#F3F6F8', minHeight: '100vh', pt: { xs: 14, md: 17 }, pb: 8, px: { xs: 2, sm: 4 } }}><Container maxWidth="xl" sx={{ px: { xs: 0, md: 3 } }}>
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 3 }}><Box><Typography sx={{ color: ORANGE, fontWeight: 800, letterSpacing: 1.5, fontSize: 12 }}>CATOTECH / ÁREA DO CLIENTE</Typography><Typography variant="h4" sx={{ color: NAVY, fontWeight: 800, mt: .5 }}>Minhas solicitações</Typography><Typography sx={{ color: MUTED, mt: .5 }}>Acompanhe as solicitações registradas no Supabase.</Typography></Box><Button startIcon={<RefreshIcon />} variant="outlined" onClick={atualizar} disabled={carregando} sx={{ color: NAVY, borderColor: '#b8c8d8', textTransform: 'none' }}>Atualizar lista</Button></Stack>
    <Stack direction="row" spacing={1} sx={{ mb: 3, borderBottom: '1px solid #dce5ee', pb: 1.5 }}>
      <Button variant={aba === 'solicitacoes' ? 'contained' : 'outlined'} onClick={() => setAba('solicitacoes')} sx={{ bgcolor: aba === 'solicitacoes' ? ORANGE : 'transparent', color: aba === 'solicitacoes' ? '#fff' : NAVY, borderColor: '#b8c8d8', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: aba === 'solicitacoes' ? '#dd5900' : '#e8eef4' } }}>Minhas solicitações</Button>
      <Button variant={aba === 'projetos' ? 'contained' : 'outlined'} startIcon={<FolderOutlinedIcon />} onClick={() => setAba('projetos')} sx={{ bgcolor: aba === 'projetos' ? ORANGE : 'transparent', color: aba === 'projetos' ? '#fff' : NAVY, borderColor: '#b8c8d8', fontWeight: 800, textTransform: 'none', '&:hover': { bgcolor: aba === 'projetos' ? '#dd5900' : '#e8eef4' } }}>Meus projetos</Button>
    </Stack>
    {aba === 'solicitacoes' && <>
    <Alert severity="info" sx={{ mb: 3 }}>As propostas em Aguardando Aprovação podem ser aprovadas ou recusadas nesta página. O acompanhamento manual de pagamentos está em teste. Nenhuma cobrança é realizada por esta página. A confirmação do recebimento é exclusiva da administração.</Alert>
    {erroPagamento && <Alert severity="warning" sx={{ mb: 2 }}>{erroPagamento}</Alert>}
    {sucesso && <Alert severity="success" onClose={() => setSucesso('')} sx={{ mb: 2 }}>{sucesso}</Alert>}
    {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
    <TextField placeholder="Buscar por número, cliente ou status" fullWidth value={busca} onChange={e => setBusca(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: MUTED }} /></InputAdornment>, sx: { bgcolor: '#fff', borderRadius: 2, color: NAVY } }} sx={{ mb: 3 }} />
    <Card sx={{ bgcolor: '#fff', borderRadius: 3, border: '1px solid #dde6ef', boxShadow: 'none' }}><CardContent sx={{ p: { xs: 1, md: 3 }, overflowX: 'auto', '&:last-child': { pb: 3 } }}><Table sx={{ minWidth: 850, '& th': { color: NAVY, fontWeight: 800 }, '& td': { color: NAVY } }}><TableHead><TableRow><TableCell>Nº Solicitação</TableCell><TableCell>Data</TableCell><TableCell>Status</TableCell><TableCell>Valor da proposta</TableCell><TableCell>Descrição</TableCell><TableCell align="center">Ações</TableCell></TableRow></TableHead><TableBody>
    {filtradas.map(c => <TableRow key={c.id} hover><TableCell sx={{ fontWeight: 800 }}>{protocolo(c)}</TableCell><TableCell>{dataBR(c.created_at)}</TableCell><TableCell><Chip label={c.status || 'Nova'} color={cores[c.status] || 'default'} size="small" /></TableCell><TableCell>{moedaBR(c.valor_proposta)}</TableCell><TableCell sx={{ maxWidth: 260, overflowWrap: 'anywhere' }}>{c.descricao || 'Não informada'}</TableCell><TableCell align="center"><Stack direction="row" spacing={1} justifyContent="center" alignItems="center"><Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => setSelecionada(c)} sx={{ bgcolor: NAVY, '&:hover': { bgcolor: '#102e48' }, textTransform: 'none' }}>Visualizar</Button>{['Aguardando Pagamento', 'Pagamento Confirmado'].includes(c.status) && <Button size="small" variant="contained" startIcon={<PaymentIcon />} onClick={() => { setPagamentoSelecionado(c); setErroPagamento(''); }} sx={{ bgcolor: '#16804a', '&:hover': { bgcolor: '#106338' }, textTransform: 'none', fontWeight: 800 }}>Pagamento</Button>}</Stack></TableCell></TableRow>)}
    {!carregando && filtradas.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5 }}>{erro ? 'Não foi possível consultar as solicitações.' : 'Nenhuma solicitação encontrada.'}</TableCell></TableRow>}
    {carregando && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}><CircularProgress size={26} /></TableCell></TableRow>}
    </TableBody></Table></CardContent></Card><Button onClick={() => navigate('/cotacao')} sx={{ mt: 3, color: ORANGE, textTransform: 'none', fontWeight: 800 }}>Nova solicitação</Button></>}
    {aba === 'projetos' && <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ sm: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
        <Box><Typography variant="h5" sx={{ color: NAVY, fontWeight: 800 }}>Meus projetos</Typography>
          <Typography sx={{ color: MUTED, fontSize: 14 }}>Acompanhe a execução, os prazos e o histórico dos projetos contratados.</Typography></Box>
        <Button variant="outlined" startIcon={<RefreshIcon />} disabled={carregandoProjetos} onClick={atualizarProjetos} sx={{ color: NAVY, borderColor: '#b8c8d8', textTransform: 'none' }}>Atualizar projetos</Button>
      </Stack>
      <Alert severity="info" sx={{ mb: 2 }}>Somente projetos vinculados à sua conta são exibidos. Uma proposta aprovada com pagamento pendente ainda não gera um projeto nem libera sua execução.</Alert>
      {erroProjetos && <Alert severity="error" sx={{ mb: 2 }}>{erroProjetos}</Alert>}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
        {[{ label: 'Total de projetos', n: projetos.length, cor: ORANGE }, { label: 'Em desenvolvimento / revisão', n: projetos.filter(p => ['Em Desenvolvimento', 'Em Revisão'].includes(p.status)).length, cor: '#2563eb' }, { label: 'Concluídos', n: projetos.filter(p => p.status === 'Concluído').length, cor: '#16804a' }].map(item =>
          <Card key={item.label} sx={{ flex: 1, border: '1px solid #dce6ef', boxShadow: 'none', borderRadius: 2 }}><CardContent>
            <Typography sx={{ color: MUTED, fontSize: 13, fontWeight: 700 }}>{item.label}</Typography>
            <Typography sx={{ color: item.cor, fontSize: 30, fontWeight: 800 }}>{item.n}</Typography>
          </CardContent></Card>)}
      </Stack>
      <TextField fullWidth placeholder="Buscar projeto, título, situação ou cotação" value={buscaProjeto} onChange={e => setBuscaProjeto(e.target.value)} sx={{ mb: 2, '& .MuiOutlinedInput-root': { bgcolor: '#fff' } }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: MUTED }} /></InputAdornment> }} />
      <Card sx={{ border: '1px solid #dce6ef', boxShadow: 'none', borderRadius: 3 }}><CardContent sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 720 }}><TableHead><TableRow><TableCell>Projeto</TableCell><TableCell>Título</TableCell><TableCell>Situação</TableCell><TableCell>Progresso</TableCell><TableCell>Previsão</TableCell><TableCell>Ação</TableCell></TableRow></TableHead><TableBody>
          {projetosFiltrados.map(p => <TableRow key={p.id} hover>
            <TableCell sx={{ color: NAVY, fontWeight: 800 }}>{p.numero_projeto || `Projeto #${p.id}`}</TableCell>
            <TableCell>{p.titulo}</TableCell><TableCell><Chip label={p.status} size="small" /></TableCell>
            <TableCell>{p.percentual_conclusao}%</TableCell><TableCell>{dataProjeto(p.previsao_entrega)}</TableCell>
            <TableCell><Button size="small" startIcon={<VisibilityIcon />} onClick={() => abrirDetalhesProjeto(p)} sx={{ color: NAVY, textTransform: 'none' }}>Detalhes</Button></TableCell>
          </TableRow>)}
          {!carregandoProjetos && projetosFiltrados.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 5, color: MUTED }}>{projetos.length === 0 ? 'Nenhum projeto vinculado à sua conta até o momento.' : 'Nenhum projeto corresponde à pesquisa.'}</TableCell></TableRow>}
          {carregandoProjetos && <TableRow><TableCell colSpan={6} align="center"><CircularProgress size={25} sx={{ my: 3 }} /></TableCell></TableRow>}
        </TableBody></Table>
      </CardContent></Card>
    </Box>}
    </Container>
    <Dialog open={Boolean(projetoSelecionado)} onClose={() => setProjetoSelecionado(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: NAVY, color: '#fff', fontWeight: 800 }}>Projeto — {projetoSelecionado?.numero_projeto || (projetoSelecionado ? `#${projetoSelecionado.id}` : '')}</DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#fbfcfe' }}>{projetoSelecionado && <Stack spacing={1}>
        {detalhe('Título', projetoSelecionado.titulo)}
        {detalhe('Descrição', projetoSelecionado.descricao)}
        {detalhe('Situação', projetoSelecionado.status)}
        {detalhe('Progresso', `${projetoSelecionado.percentual_conclusao}%`)}
        {detalhe('Início', dataProjeto(projetoSelecionado.data_inicio))}
        {detalhe('Previsão de entrega', dataProjeto(projetoSelecionado.previsao_entrega))}
        {detalhe('Entrega realizada', dataProjeto(projetoSelecionado.data_entrega))}
        {detalhe('Observações', projetoSelecionado.observacoes)}
        <Typography sx={{ color: NAVY, fontWeight: 800, mt: 2 }}>Histórico de andamento</Typography>
        {carregandoHistorico && <CircularProgress size={22} />}
        {erroHistorico && <Alert severity="error">{erroHistorico}</Alert>}
        {!carregandoHistorico && !erroHistorico && historicoProjeto.length === 0 && <Typography sx={{ color: MUTED }}>Ainda não há atualizações registradas.</Typography>}
        {historicoProjeto.map(h => <Box key={h.id} sx={{ p: 1.5, bgcolor: '#eef3f8', borderRadius: 2 }}>
          <Typography sx={{ color: NAVY, fontWeight: 700 }}>{h.status_novo || 'Atualização'} — {h.percentual_novo ?? 0}%</Typography>
          <Typography sx={{ color: MUTED, fontSize: 12 }}>{dataBR(h.criado_em)}</Typography>
          {h.observacao && <Typography sx={{ color: NAVY, mt: .5, whiteSpace: 'pre-wrap' }}>{h.observacao}</Typography>}
        </Box>)}
      </Stack>}</DialogContent>
      <DialogActions><Button onClick={() => setProjetoSelecionado(null)} sx={{ color: NAVY }}>Fechar</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(selecionada)} onClose={() => setSelecionada(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}><DialogTitle sx={{ bgcolor: NAVY, color: '#fff', fontWeight: 800 }}>Solicitação {selecionada ? protocolo(selecionada) : ''}</DialogTitle><DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2.5, bgcolor: '#fbfcfe', maxHeight: 'min(72vh, 720px)' }}>{selecionada && <Stack gap={2}>{detalhe('Cliente', selecionada.cliente_nome)}{detalhe('E-mail', selecionada.cliente_email)}{detalhe('Status', selecionada.status)}{detalhe('Criada em', dataBR(selecionada.created_at))}{detalhe('Descrição', selecionada.descricao)}<Divider />{secaoEstruturada('Dados do cliente', selecionada.dados_cliente)}{secaoEstruturada('Itens solicitados', selecionada.itens_solicitados)}{secaoEstruturada('Agendamento', selecionada.agendamento)}<Divider /><Typography sx={{ color: NAVY, fontWeight: 800 }}>Proposta da engenharia</Typography>{detalhe('Valor', moedaBR(selecionada.valor_proposta))}{detalhe('Escopo', selecionada.escopo_proposta)}{detalhe('Prazo', selecionada.prazo_proposta)}{detalhe('Condições de pagamento', selecionada.condicoes_pagamento)}{selecionada.status === 'Aguardando Aprovação' && <Alert severity="info">Confira os valores, o escopo, o prazo e as condições antes de tomar sua decisão. A decisão será registrada no Supabase e não poderá ser repetida por esta tela.</Alert>}
      {selecionada.status === 'Aguardando Pagamento' && <Box sx={{ p: 2, border: '1px solid #dce6ef', borderRadius: 2 }}>
        <Typography sx={{ color: NAVY, fontWeight: 800, mb: 1 }}>Acompanhamento do pagamento</Typography>
        <Alert severity="info" sx={{ mb: 1.5 }}>Proposta aprovada. O pagamento é manual nesta etapa; não há cobrança automática nem confirmação de recebimento.</Alert>
        {pagamentos[selecionada.id] ? <>
          {detalhe('Situação', pagamentos[selecionada.id].status)}
          {detalhe('Valor registrado', moedaBR(pagamentos[selecionada.id].valor))}
          {detalhe('Método', pagamentos[selecionada.id].metodo)}
          {detalhe('Registrado em', dataBR(pagamentos[selecionada.id].criado_em))}
        </> : <>
          <Alert severity="warning" sx={{ mb: 1 }}>O registro pendente ainda não foi encontrado. Você pode tentar registrá-lo novamente, sem duplicar pagamentos.</Alert>
          <Button variant="outlined" disabled={registrandoPendente} onClick={() => registrarPendente(selecionada.id)} sx={{ textTransform: 'none' }}>
            {registrandoPendente ? 'Registrando...' : 'Registrar pagamento pendente'}
          </Button>
        </>}
        {erroPagamento && <Alert severity="error" sx={{ mt: 1 }}>{erroPagamento}</Alert>}
      </Box>}
      {selecionada.status === 'Pagamento Confirmado' && <Alert severity="success">Pagamento confirmado pela administração. A execução do projeto será liberada conforme o fluxo de gestão.</Alert>}
      {selecionada.status === 'Proposta Recusada' && <Alert severity="warning">Esta proposta foi recusada.</Alert>}
      {selecionada.status === 'Aguardando Aprovação' && <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 1 }}>
        <Button variant="contained" onClick={() => { setErroDecisao(''); setDecisao({ id: selecionada.id, numero: protocolo(selecionada), acao: 'aprovar' }); }} sx={{ bgcolor: '#16804a', textTransform: 'none', fontWeight: 800 }}>Aprovar proposta</Button>
        <Button variant="outlined" color="error" onClick={() => { setErroDecisao(''); setDecisao({ id: selecionada.id, numero: protocolo(selecionada), acao: 'recusar' }); }} sx={{ textTransform: 'none', fontWeight: 800 }}>Recusar proposta</Button>
      </Stack>}<ChatCliente cotacaoId={selecionada.id} /></Stack>}</DialogContent><DialogActions><Button onClick={() => setSelecionada(null)} sx={{ color: NAVY }}>Fechar</Button></DialogActions></Dialog>
    <Dialog open={Boolean(pagamentoSelecionado)} onClose={() => setPagamentoSelecionado(null)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle sx={{ bgcolor: NAVY, color: '#fff', fontWeight: 800 }}>Pagamento — {pagamentoSelecionado ? protocolo(pagamentoSelecionado) : ''}</DialogTitle>
      <DialogContent dividers sx={{ bgcolor: '#fbfcfe', py: 2.5 }}>
        {pagamentoSelecionado && <Stack spacing={1.5}>
          <Alert severity={pagamentoSelecionado.status === 'Pagamento Confirmado' ? 'success' : 'info'}>
            {pagamentoSelecionado.status === 'Pagamento Confirmado'
              ? 'Pagamento confirmado pela administração.'
              : 'Proposta aprovada. Nesta etapa o pagamento é manual: não há cobrança automática nem confirmação de recebimento pelo cliente.'}
          </Alert>
          {detalhe('Solicitação', protocolo(pagamentoSelecionado))}
          {detalhe('Status da solicitação', pagamentoSelecionado.status)}
          {pagamentos[pagamentoSelecionado.id] ? <>
            {detalhe('Situação do pagamento', pagamentos[pagamentoSelecionado.id].status)}
            {detalhe('Valor registrado', moedaBR(pagamentos[pagamentoSelecionado.id].valor))}
            {detalhe('Método', pagamentos[pagamentoSelecionado.id].metodo)}
            {detalhe('Registrado em', dataBR(pagamentos[pagamentoSelecionado.id].criado_em))}
            {pagamentos[pagamentoSelecionado.id].confirmado_em && detalhe('Confirmado em', dataBR(pagamentos[pagamentoSelecionado.id].confirmado_em))}
          </> : <>
            {detalhe('Valor da proposta', moedaBR(pagamentoSelecionado.valor_proposta))}
            <Alert severity="warning">Ainda não foi encontrado um registro de pagamento para esta solicitação.</Alert>
            {pagamentoSelecionado.status === 'Aguardando Pagamento' && <Button variant="outlined" disabled={registrandoPendente} onClick={() => registrarPendente(pagamentoSelecionado.id)} sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
              {registrandoPendente ? 'Registrando...' : 'Registrar pagamento pendente'}
            </Button>}
          </>}
          {erroPagamento && <Alert severity="error">{erroPagamento}</Alert>}
        </Stack>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}><Button onClick={() => setPagamentoSelecionado(null)} sx={{ color: NAVY }}>Fechar</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(decisao)} onClose={enviandoDecisao ? undefined : () => setDecisao(null)} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 800, color: NAVY }}>{decisao?.acao === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar recusa'}</DialogTitle>
      <DialogContent>
        <Typography sx={{ color: NAVY }}>Deseja realmente {decisao?.acao === 'aprovar' ? 'aprovar' : 'recusar'} a proposta da solicitação <strong>{decisao?.numero}</strong>?</Typography>
        {decisao?.acao === 'aprovar' && <Alert severity="info" sx={{ mt: 2 }}>A aprovação altera o status para Aguardando Pagamento. Não realiza cobrança nem confirma pagamento.</Alert>}
        {erroDecisao && <Alert severity="error" sx={{ mt: 2 }}>{erroDecisao}</Alert>}
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={enviandoDecisao} onClick={() => setDecisao(null)} sx={{ color: NAVY }}>Cancelar</Button>
        <Button variant="contained" disabled={enviandoDecisao} onClick={confirmarDecisao} color={decisao?.acao === 'recusar' ? 'error' : 'success'} sx={{ textTransform: 'none' }}>
          {enviandoDecisao ? <CircularProgress size={20} color="inherit" /> : decisao?.acao === 'aprovar' ? 'Confirmar aprovação' : 'Confirmar recusa'}
        </Button>
      </DialogActions>
    </Dialog>
  </Box>;
}
