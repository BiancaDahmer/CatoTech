import { useCallback, useEffect, useState } from 'react';
import { Box, Container, Card, Typography, Button, Stack, Alert, Divider, Chip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RefreshIcon from '@mui/icons-material/Refresh';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useNavigate, useParams } from 'react-router-dom';
import { listarCotacoesDemo } from '../utils/cotacoesDemo';

const LARANJA = '#ff6600';
const normalizar = (valor) => String(valor ?? '').replace(/^#+/, '');
const formatarMoeda = (numero) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero);

function converterMoeda(valor) {
  if (typeof valor === 'number') return Number.isFinite(valor) && valor > 0 ? valor : null;
  const texto = String(valor ?? '').trim();
  if (!texto || /aguardando|definir|informad/i.test(texto)) return null;
  const limpo = texto.replace(/[^\d,.-]/g, '');
  const normalizado = limpo.includes(',') ? limpo.replace(/\./g, '').replace(',', '.') : limpo;
  const numero = Number(normalizado);
  return Number.isFinite(numero) && numero > 0 ? numero : null;
}

function formatarDataProposta(valor) {
  if (valor === null || valor === undefined || String(valor).trim() === '') return 'Não informado';
  const texto = String(valor).trim();
  const oitoDigitos = texto.match(/^(\d{2})(\d{2})(\d{4})$/);
  if (oitoDigitos) {
    const [, dia, mes, ano] = oitoDigitos;
    const data = new Date(Number(ano), Number(mes) - 1, Number(dia));
    if (data.getFullYear() === Number(ano) && data.getMonth() === Number(mes) - 1 && data.getDate() === Number(dia)) {
      return `${dia}/${mes}/${ano}`;
    }
  }
  const dataComBarras = texto.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dataComBarras) return `${dataComBarras[1]}/${dataComBarras[2]}/${dataComBarras[3]}`;
  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})(?:T|$)/);
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`;
  return texto;
}

const linha = (titulo, conteudo) => (
  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1} sx={{ py: 1.5, borderBottom: '1px solid #2b4057' }}>
    <Typography sx={{ color: '#b6c8da' }}>{titulo}</Typography>
    <Typography sx={{ color: '#fff', fontWeight: 700, overflowWrap: 'anywhere', whiteSpace: 'pre-wrap', maxWidth: { sm: '65%' }, textAlign: { sm: 'right' } }}>{conteudo ?? 'Não informado'}</Typography>
  </Stack>
);

export default function Pagamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cotacoes, setCotacoes] = useState(() => listarCotacoesDemo());
  const atualizar = useCallback(() => setCotacoes(listarCotacoesDemo()), []);

  useEffect(() => {
    window.addEventListener('storage', atualizar);
    window.addEventListener('catotech-cotacoes-atualizadas', atualizar);
    window.addEventListener('cotacoesDemoAtualizadas', atualizar);
    window.addEventListener('focus', atualizar);
    return () => {
      window.removeEventListener('storage', atualizar);
      window.removeEventListener('catotech-cotacoes-atualizadas', atualizar);
      window.removeEventListener('cotacoesDemoAtualizadas', atualizar);
      window.removeEventListener('focus', atualizar);
    };
  }, [atualizar]);

  const cotacao = id ? cotacoes.find((item) => normalizar(item.id) === normalizar(id)) : null;
  const aprovada = Boolean(cotacao && ['Aprovada', 'Aguardando Pagamento'].includes(cotacao.status));
  const propostaDisponivel = Boolean(cotacao?.propostaDisponibilizada && cotacao?.escopoProposta?.trim());
  const valor = cotacao ? converterMoeda(cotacao.valorOrcado) ?? converterMoeda(cotacao.valor) : null;
  const verba = cotacao ? converterMoeda(cotacao.verba) : null;
  const elegivelConsulta = aprovada && propostaDisponivel && valor !== null;
  const diferenca = valor !== null && verba !== null ? valor - verba : null;

  return (
    <Box sx={{ bgcolor: '#071829', minHeight: '100vh', color: '#fff', pt: { xs: '120px', sm: '130px', md: '140px' }, pb: 8, px: 2 }}>
      <Container maxWidth="lg">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography sx={{ color: LARANJA, fontWeight: 800, fontSize: 12, letterSpacing: 1.6 }}>CATOTECH / ÁREA FINANCEIRA</Typography>
            <Typography variant="h4" sx={{ color: '#fff', fontWeight: 800, mt: 1 }}>Consulta de pagamento</Typography>
            <Typography sx={{ color: '#b6c8da', mt: 1 }}>Confira os dados da proposta antes de qualquer etapa financeira.</Typography>
          </Box>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button startIcon={<ArrowBackIcon />} variant="outlined" onClick={() => navigate('/meusOrcamentos')} sx={{ color: '#fff', borderColor: '#52677d', textTransform: 'none' }}>Meus orçamentos</Button>
            <Button startIcon={<RefreshIcon />} variant="outlined" onClick={atualizar} sx={{ color: '#fff', borderColor: '#52677d', textTransform: 'none' }}>Atualizar</Button>
          </Stack>
        </Stack>
        <Alert severity="warning" sx={{ mb: 3 }}>Ambiente demonstrativo. Não existe cobrança, Pix, boleto, cartão ou pagamento integrado. Nenhum dado financeiro deve ser informado.</Alert>
        {!id && <Alert severity="info">Selecione uma solicitação em Meus Orçamentos para consultar os dados da proposta.</Alert>}
        {id && !cotacao && <Alert severity="error">A solicitação #{normalizar(id)} não foi encontrada neste navegador. Verifique se os dados locais de teste estão disponíveis.</Alert>}
        {cotacao && <Stack direction={{ xs: 'column', md: 'row' }} alignItems="flex-start" gap={3}>
          <Card sx={{ flex: 1.7, width: '100%', bgcolor: '#10243a', border: '1px solid #29425b', borderRadius: 3, p: { xs: 2.5, md: 4 }, boxShadow: 'none' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>Proposta da solicitação #{normalizar(cotacao.id)}</Typography>
              <Chip label={cotacao.status || 'Sem status'} sx={{ bgcolor: '#273b51', color: '#ffb27f', fontWeight: 700 }} />
            </Stack>
            <Divider sx={{ borderColor: '#2b4057', my: 2 }} />
            {linha('Cliente', cotacao.cliente)}
            {linha('Escopo da proposta', cotacao.escopoProposta)}
            {linha('Prazo previsto', formatarDataProposta(cotacao.prazoProposta))}
            {linha('Condições comerciais', cotacao.condicoesPagamento)}
            {linha('Validade da proposta', formatarDataProposta(cotacao.validadeProposta))}
            {linha('Revisão da proposta', cotacao.revisaoProposta || '1')}
            {!elegivelConsulta && <Alert severity="info" sx={{ mt: 3 }}>Esta solicitação ainda não possui uma proposta aprovada e completa para consulta financeira.</Alert>}
            <Box sx={{ mt: 3, p: 2, bgcolor: '#1c3147', borderRadius: 2 }}>
              <Stack direction="row" gap={1} alignItems="center"><LockOutlinedIcon sx={{ color: '#ffb27f' }} /><Typography sx={{ color: '#fff', fontWeight: 700 }}>Pagamento real não habilitado</Typography></Stack>
              <Typography sx={{ color: '#b6c8da', mt: 1, fontSize: 14 }}>A aprovação libera automaticamente a etapa financeira demonstrativa. Cobranças reais exigem integração com um provedor de pagamentos e confirmação segura. Esta página não gera cobranças nem confirma pagamentos.</Typography>
            </Box>
          </Card>
          <Card sx={{ flex: 1, width: '100%', bgcolor: '#10243a', border: '1px solid #29425b', borderRadius: 3, p: { xs: 2.5, md: 4 }, boxShadow: 'none' }}>
            <Stack direction="row" alignItems="center" gap={1}><ReceiptLongIcon sx={{ color: LARANJA }} /><Typography variant="h6" sx={{ color: '#fff', fontWeight: 800 }}>Resumo financeiro</Typography></Stack>
            <Divider sx={{ borderColor: '#2b4057', my: 2 }} />
            {linha('Verba informada', verba !== null ? formatarMoeda(verba) : cotacao.verba)}
            {linha('Valor da proposta', valor !== null ? formatarMoeda(valor) : 'Não definido')}
            {diferenca !== null && diferenca > 0 && <Alert severity="warning" sx={{ mt: 2 }}>A proposta excede a verba informada em {formatarMoeda(diferenca)}. Confirme os valores e condições antes de prosseguir.</Alert>}
            {diferenca !== null && diferenca <= 0 && <Alert severity="info" sx={{ mt: 2 }}>A proposta não excede a verba informada. A cobrança real continua indisponível.</Alert>}
            <Typography sx={{ color: '#b6c8da', fontSize: 13, mt: 3 }}>Valor de referência da proposta aprovada</Typography>
            <Typography variant="h4" sx={{ color: LARANJA, fontWeight: 800, mt: 0.5 }}>{elegivelConsulta ? formatarMoeda(valor) : 'Indisponível'}</Typography>
            <Button fullWidth disabled variant="contained" sx={{ mt: 3, py: 1.5, fontWeight: 800, bgcolor: LARANJA }}>Pagamento não habilitado</Button>
            <Typography sx={{ color: '#b6c8da', fontSize: 12, mt: 2, textAlign: 'center' }}>Nenhum valor será cobrado nesta demonstração.</Typography>
          </Card>
        </Stack>}
      </Container>
    </Box>
  );
}
