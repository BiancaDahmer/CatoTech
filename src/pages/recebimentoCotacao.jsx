import { buscarCotacoes, moedaBR, dataBR, protocolo } from "../utils/cotacoesSupabase";
import { supabase } from "../lib/supabaseClient";
import { Alert, CircularProgress } from "@mui/material";
import {
  Box,
  Card,
  Typography,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import FolderOutlinedIcon from "@mui/icons-material/FolderOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


// ✅ LOGO (ajuste o nome se o arquivo for diferente)
import catotechLogo from "../assets/img/catotech.jpg";

const statusColors = {
    "Nova": "#00C49F",
    "Em Andamento": "#FFBB28",
    "Falta Informação": "#FF4C4C",
    "Aguardando Aprovação": "#FF6600",
    "Revisão Técnica": "#8B5CF6",
    "Concluído": "#2563EB",
    "Concluída": "#2563EB",
    "Aprovada": "#22C55E",
    "Aguardando Pagamento": "#FF8A36",
    "Pagamento Confirmado": "#2DD4BF",
    "Em Execução": "#60A5FA",
    "Proposta Recusada": "#EF4444",
    "Cancelada": "#94A3B8",
  };

export default function RecebimentoCotacao() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("cotacoes");
  const [cotacaoParaResponder, setCotacaoParaResponder] = useState(null);
  const abrirCentralDemonstrativa = () => {
    if (!cotacaoParaResponder) return;
    localStorage.setItem("cotacaoSelecionada", JSON.stringify(cotacaoParaResponder));
    navigate(`/responderCotacao/${encodeURIComponent(String(cotacaoParaResponder.bancoId))}`);
    setCotacaoParaResponder(null);
  };
  // Consultas reais ao Supabase, protegidas pelas políticas RLS.
  const [cotacoes, setCotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const atualizarCotacoes = async () => {
    setCarregando(true);
    setErroCarregamento("");
    try {
      const linhas = await buscarCotacoes({ engenharia: true });
      setCotacoes(linhas.map(c => ({
        ...c,
        id: protocolo(c),
        bancoId: c.id,
        cliente: c.cliente_nome || c.dados_cliente?.nome || 'Não informado',
        data: dataBR(c.created_at),
        verba: c.itens_solicitados?.[0]?.verba || c.dados_cliente?.verba || 'Não informada',
        valorOrcado: moedaBR(c.valor_proposta),
        caracteristicas: (c.itens_solicitados || []).map(i => i.caracteristicas || i.descricao || '').filter(Boolean).join(' | '),
        tamanho: (c.itens_solicitados || []).map(i => i.tamanho || i.dimensoes || '').filter(Boolean).join(' | '),
        materiais: (c.itens_solicitados || []).map(i => i.materiais || '').filter(Boolean).join(' | '),
        observacao: c.agendamento ? JSON.stringify(c.agendamento) : '',
      })));
    } catch (e) {
      setCotacoes([]);
      setErroCarregamento(e?.message || 'Não foi possível carregar as cotações.');
    } finally { setCarregando(false); }
  };
  useEffect(() => {
    atualizarCotacoes();
    const onFocus = () => { if (document.visibilityState === 'visible') atualizarCotacoes(); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // Projetos reais: leitura sob as políticas RLS do Supabase.
  const [projetos, setProjetos] = useState([]);
  const [carregandoProjetos, setCarregandoProjetos] = useState(true);
  const [erroProjetos, setErroProjetos] = useState("");
  const [buscaProjeto, setBuscaProjeto] = useState("");
  const [filtroProjeto, setFiltroProjeto] = useState("Todos");

  const atualizarProjetos = async () => {
    setCarregandoProjetos(true);
    setErroProjetos("");
    try {
      const { data: auth, error: erroAuth } = await supabase.auth.getUser();
      if (erroAuth) throw erroAuth;
      if (!auth?.user) throw new Error("Entre na conta da engenharia para consultar os projetos.");
      const { data, error } = await supabase.from("projetos")
        .select("id,cotacao_id,numero_projeto,titulo,status,percentual_conclusao,data_inicio,previsao_entrega,data_entrega,criado_em")
        .order("criado_em", { ascending: false });
      if (error) throw error;
      setProjetos(data || []);
    } catch (e) {
      setProjetos([]);
      setErroProjetos(e?.message || "Não foi possível consultar os projetos.");
    } finally {
      setCarregandoProjetos(false);
    }
  };

  useEffect(() => { atualizarProjetos(); }, []);

  const projetosFiltrados = useMemo(() => {
    const q = buscaProjeto.trim().toLocaleLowerCase("pt-BR");
    return projetos.filter((p) => {
      if (filtroProjeto !== "Todos" && p.status !== filtroProjeto) return false;
      return !q || [p.numero_projeto, p.titulo, p.status, String(p.cotacao_id)]
        .some((v) => String(v || "").toLocaleLowerCase("pt-BR").includes(q));
    });
  }, [projetos, buscaProjeto, filtroProjeto]);

  const abrirProjeto = (projeto) => {
    // Reutiliza a rota já existente, sem alterar o App.jsx.
    navigate(`/responderCotacao/${encodeURIComponent(String(projeto.cotacao_id))}`);
  };

  // Filtragem (busca simples por cliente/id)
  const [busca, setBusca] = useState("");

  const dadosFiltrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return cotacoes;
    return cotacoes.filter((c) => [c.cliente, c.id, c.status, c.descricao].some((v) => String(v || "").toLocaleLowerCase("pt-BR").includes(q.toLocaleLowerCase("pt-BR"))));
  }, [busca, cotacoes]);

  const total = cotacoes.length;
  const contarStatus = (status) => cotacoes.filter((c) => c.status === status).length;
  const concluidas = contarStatus("Concluído") + contarStatus("Concluída");
  const pendentes = total - concluidas - contarStatus("Cancelada");
  const aguardandoAprovacao = contarStatus("Aguardando Aprovação");
  const aguardandoPagamento = contarStatus("Aguardando Pagamento");
  const emExecucao = contarStatus("Em Execução");
  const semInformacao = contarStatus("Falta Informação");
  const [filtroStatus, setFiltroStatus] = useState("Todas");
  const dadosExibidos = dadosFiltrados.filter((c) => filtroStatus === "Todas" || c.status === filtroStatus);
  const valorVisivel = (c) => moedaBR(c.valor_proposta);

  // -------------------------------
  // Visualização + PDF
  // -------------------------------
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState(null);
  const [open, setOpen] = useState(false);

  const handleOpen = (cotacao) => {
    setCotacaoSelecionada(cotacao);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setCotacaoSelecionada(null);
  };

  // 🔹 converter imagem importada em Base64
  const getBase64FromUrl = async (url) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Não foi possível carregar a logo.");
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  };

  // 🔹 PDF com logo + assinatura
  const gerarPDF = async () => {
    if (!cotacaoSelecionada) return;

    const doc = new jsPDF();
    const margem = 15;

    // Logo
    try {
      const logoBase64 = await getBase64FromUrl(catotechLogo);
      doc.addImage(logoBase64, "JPEG", margem, 10, 25, 25);
    } catch (_) {
      // se falhar a imagem, apenas segue sem ela
    }

    // Cabeçalho
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 102, 0);
    doc.text("CatoTech Engenharia", margem + 35, 20);
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text("Especialista em projetos mecânicos", margem + 35, 28);
    doc.line(margem, 37, 195, 37);

    // Título
    doc.setFontSize(14);
    doc.setFont("Helvetica", "bold");
    doc.text("Detalhes do Orçamento", 105, 47, { align: "center" });
    doc.setFontSize(9);
    doc.setTextColor(160, 65, 0);
    doc.text("DOCUMENTO DEMONSTRATIVO - SEM VALIDADE COMERCIAL", 105, 52, { align: "center" });

    // Regra: Valor Orçado = 0,00 em status específicos
    const precisaZerar = ["Nova", "Falha", "Falta Informação"].includes(
      cotacaoSelecionada.status
    );
    const valorOrcadoPDF = precisaZerar
      ? "R$ 0,00"
      : cotacaoSelecionada.valorOrcado;

    // Tabela principal
    const info = [
      ["Cliente", cotacaoSelecionada.cliente],
      ["Nº da Solicitação", cotacaoSelecionada.id],
      ["Data", cotacaoSelecionada.data],
      ["Status", cotacaoSelecionada.status],
      ["Verba Disponível", cotacaoSelecionada.verba],
      ["Valor Orçado", valorOrcadoPDF],
    ];

    autoTable(doc, {
      startY: 59,
      head: [["Campo", "Informação"]],
      body: info,
      theme: "grid",
      headStyles: { fillColor: [255, 102, 0] },
      styles: { halign: "left", valign: "middle", fontSize: 10 },
    });

    let y = doc.lastAutoTable.finalY + 10;

    // Seções detalhadas
    const secoes = [
      ["Descrição", cotacaoSelecionada.descricao],
      ["Características Técnicas", cotacaoSelecionada.caracteristicas],
      ["Tamanho / Dimensões", cotacaoSelecionada.tamanho],
      ["Materiais", cotacaoSelecionada.materiais],
      ["Observações", cotacaoSelecionada.observacao],
    ];

    secoes.forEach(([titulo, texto]) => {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      const textoQuebrado = doc.splitTextToSize(String(texto || "Não informado"), 180);
      const altura = 6 + textoQuebrado.length * 5 + 5;
      if (y + altura > 265) {
        doc.addPage();
        y = 20;
      }
      doc.setFont("Helvetica", "bold");
      doc.setTextColor(255, 102, 0);
      doc.text(titulo, margem, y);
      y += 6;
      doc.setFont("Helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(textoQuebrado, margem, y);
      y += textoQuebrado.length * 5 + 5;
    });

    // Rodapé na última página, sem sobrepor o conteúdo.
    if (y > 270) doc.addPage();
    doc.line(margem, 280, 195, 280);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      "CatoTech Engenharia de Projetos | CNPJ: 54.879.295/0001-47",
      margem,
      285
    );
    doc.text(
      "Piaui, 595 - Panambi/RS | contato@catotech.com.br | www.catotech.com.br",
      margem,
      291
    );
    doc.text("Emitido por CatoTech Engenharia", 150, 275);

    doc.save(`Orcamento_${String(cotacaoSelecionada.id).replace(/[^a-zA-Z0-9_-]/g, "")}_CatoTech.pdf`);
  };

  // Painel visual preservado; consulta de dados reais via Supabase.
  const cardSx = { color: "#f4f8ff", bgcolor: "#101f33", border: "1px solid #263950", borderRadius: 3, boxShadow: "0 12px 28px rgba(0,0,0,.12)" };
  const titulos = ["Cliente", "Solicitação", "Verba disponível", "Valor orçado", "Status", "Ações"];
  const statusList = ["Todas", ...Object.keys(statusColors)];
  // Os filtros podem quebrar linha sem criar uma barra horizontal clara.
  // O cabeçalho fixo permanece independente do painel.
  return (
    <Box sx={{ bgcolor: "#071526", color: "#f4f8ff", minHeight: "100vh", pt: { xs: "116px", md: "136px" }, pb: 8, px: { xs: 2, sm: 3, lg: 5 }, boxSizing: "border-box" }}>
      <Box sx={{ maxWidth: 1440, mx: "auto" }}>
        <Box sx={{ mb: 3 }}>
          <Typography sx={{ color: "#ff873e", fontSize: 12, fontWeight: 800, letterSpacing: 2, mb: 1 }}>CATOTECH / ENGENHARIA</Typography>
          <Typography component="h1" sx={{ fontSize: { xs: 27, sm: 34 }, fontWeight: 800, color: "#fff", mb: 1 }}>Central de Gestão</Typography>
          <Typography sx={{ color: "#a9b9cc", fontSize: 14 }}>Gerencie as solicitações comerciais e acompanhe a execução dos projetos em áreas separadas.</Typography>
        </Box>
        <Box role="tablist" aria-label="Módulos da Central de Gestão" sx={{ display: "flex", gap: 1.5, mb: 3, borderBottom: "1px solid #30435a", pb: 1.5 }}>
          <Button role="tab" aria-selected={abaAtiva === "cotacoes"} onClick={() => setAbaAtiva("cotacoes")} sx={{ px: 3, color: "#fff", textTransform: "none", fontWeight: 800, bgcolor: abaAtiva === "cotacoes" ? "#ff6600" : "#17283d", "&:hover": { bgcolor: abaAtiva === "cotacoes" ? "#e65c00" : "#263a51" } }}>Cotações</Button>
          <Button role="tab" aria-selected={abaAtiva === "projetos"} onClick={() => setAbaAtiva("projetos")} sx={{ px: 3, color: "#fff", textTransform: "none", fontWeight: 800, bgcolor: abaAtiva === "projetos" ? "#ff6600" : "#17283d", "&:hover": { bgcolor: abaAtiva === "projetos" ? "#e65c00" : "#263a51" } }}>Projetos</Button>
        </Box>
        {abaAtiva === "cotacoes" && <Box role="tabpanel">
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Box><Typography component="h2" sx={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>Recebimento de Cotações</Typography><Typography sx={{ color: "#a9b9cc", fontSize: 13 }}>Acompanhe, consulte e responda às solicitações cadastradas.</Typography></Box>
            <Button startIcon={<RefreshIcon />} onClick={atualizarCotacoes} variant="outlined" sx={{ borderColor: "#3d536c", color: "#fff", textTransform: "none", fontWeight: 700 }}>Atualizar lista</Button>
          </Box>
          {erroCarregamento && <Alert severity="error" sx={{ mb: 2 }}>{erroCarregamento}</Alert>}
          {carregando && <CircularProgress size={24} sx={{ mb: 2, color: "#ff6600" }} />}
          <Alert severity="info" sx={{ mb: 3 }}>Solicitações reais consultadas no Supabase. Para responder, utilize o botão Responder e a Central de Gestão.</Alert>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0,1fr))", md: "repeat(3, minmax(0,1fr))", lg: "repeat(6, minmax(0,1fr))" }, gap: 2, mb: 3 }}>
          {[
            { label: "Total de cotações", value: total, color: "#ff6600", detail: "Solicitações registradas" },
            { label: "Novas", value: contarStatus("Nova"), color: "#27d3b0", detail: "Aguardando análise" },
            { label: "Em andamento", value: contarStatus("Em Andamento") + contarStatus("Revisão Técnica"), color: "#f5b942", detail: "Em atendimento" },
            { label: "Aguardando aprovação", value: aguardandoAprovacao, color: "#fb923c", detail: "Decisão do cliente" },
            { label: "Aguardando pagamento", value: aguardandoPagamento, color: "#ff6600", detail: "Aguardando recebimento" },
            { label: "Em execução", value: emExecucao, color: "#60a5fa", detail: "Projetos em andamento" },
          ].map((item) => (
            <Card key={item.label} sx={{ ...cardSx, p: { xs: 2, md: 2.5 }, minHeight: 125, position: "relative", overflow: "hidden" }}>
              <Box sx={{ position: "absolute", top: 0, left: 0, width: 4, height: "100%", bgcolor: item.color }} />
              <Typography sx={{ color: "#aabbd0", fontSize: { xs: 11, md: 13 }, fontWeight: 600 }}>{item.label}</Typography>
              <Typography sx={{ color: "#fff", fontSize: { xs: 31, md: 38 }, fontWeight: 800, lineHeight: 1.5 }}>{item.value}</Typography>
              <Typography sx={{ color: "#7f94ad", fontSize: 11 }}>{item.detail}</Typography>
            </Card>
          ))}
        </Box>

        </Box>}
        {abaAtiva === "projetos" && <Box role="tabpanel">
        {/* Painel geral de projetos — separado das cotações. */}
        <Card sx={{ ...cardSx, p: { xs: 2, md: 3 }, mb: 3 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>
            <Box>
              <Typography sx={{ color: "#ff873e", fontSize: 11, fontWeight: 800, letterSpacing: 1.5 }}>CATOTECH / ENGENHARIA</Typography>
              <Typography component="h2" sx={{ color: "#fff", fontSize: 22, fontWeight: 800, display: "flex", gap: 1, alignItems: "center" }}>
                <FolderOutlinedIcon sx={{ color: "#ff6600" }} /> Painel Geral de Projetos
              </Typography>
              <Typography sx={{ color: "#a9b9cc", fontSize: 13, mt: 0.5 }}>Projetos vinculados às cotações, consultados diretamente no Supabase.</Typography>
            </Box>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={atualizarProjetos} disabled={carregandoProjetos}
              sx={{ color: "#fff", borderColor: "#3d536c", textTransform: "none", fontWeight: 700 }}>Atualizar projetos</Button>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1.5, mb: 2.5 }}>
            {[
              { label: "Total de projetos", n: projetos.length, cor: "#ff6600" },
              { label: "Em desenvolvimento / revisão", n: projetos.filter(p => ["Em Desenvolvimento", "Em Revisão"].includes(p.status)).length, cor: "#60a5fa" },
              { label: "Concluídos", n: projetos.filter(p => p.status === "Concluído").length, cor: "#22c55e" },
            ].map(item => <Box key={item.label} sx={{ bgcolor: "#17283d", border: "1px solid #30435a", borderRadius: 2, p: 2 }}>
              <Typography sx={{ color: "#aabbd0", fontSize: 12 }}>{item.label}</Typography>
              <Typography sx={{ color: item.cor, fontSize: 30, fontWeight: 800 }}>{item.n}</Typography>
            </Box>)}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
            <TextField size="small" value={buscaProjeto} onChange={e => setBuscaProjeto(e.target.value)} placeholder="Buscar projeto, título ou cotação"
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#9eb0c5" }} /></InputAdornment> }}
              sx={{ flex: "1 1 250px", "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "#1b2b40", "& fieldset": { borderColor: "#30435a" } } }} />
            <TextField select size="small" label="Situação" value={filtroProjeto} onChange={e => setFiltroProjeto(e.target.value)}
              SelectProps={{ native: true }} InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180, "& .MuiOutlinedInput-root": { color: "#fff", bgcolor: "#1b2b40", "& fieldset": { borderColor: "#30435a" } }, "& .MuiInputLabel-root": { color: "#aabbd0" } }}>
              {["Todos", "Aguardando Início", "Em Desenvolvimento", "Em Revisão", "Entregue", "Concluído", "Cancelado"].map(v => <option key={v} value={v} style={{ color: "#071526" }}>{v}</option>)}
            </TextField>
          </Box>
          {erroProjetos && <Alert severity="error" sx={{ mb: 2 }}>{erroProjetos}</Alert>}
          {carregandoProjetos ? <Box sx={{ py: 3, textAlign: "center" }}><CircularProgress size={24} sx={{ color: "#ff6600" }} /></Box> : (
            <Box sx={{ overflowX: "auto" }}>
              <Table size="small" sx={{ minWidth: 700, "& .MuiTableCell-root": { borderColor: "#30435a" } }}>
                <TableHead><TableRow>{["Projeto", "Título", "Situação", "Progresso", "Previsão", "Ação"].map(t => <TableCell key={t} sx={{ color: "#aabbd0", fontWeight: 800 }}>{t}</TableCell>)}</TableRow></TableHead>
                <TableBody>
                  {projetosFiltrados.map(p => <TableRow key={p.id}>
                    <TableCell sx={{ color: "#ffad79", fontWeight: 800 }}>{p.numero_projeto || `Projeto #${p.id}`}</TableCell>
                    <TableCell sx={{ color: "#fff" }}>{p.titulo}</TableCell>
                    <TableCell sx={{ color: "#dce5ef" }}>{p.status}</TableCell>
                    <TableCell sx={{ color: "#dce5ef" }}>{p.percentual_conclusao}%</TableCell>
                    <TableCell sx={{ color: "#dce5ef" }}>{p.previsao_entrega ? new Date(`${p.previsao_entrega}T12:00:00`).toLocaleDateString("pt-BR") : "—"}</TableCell>
                    <TableCell><Button size="small" startIcon={<OpenInNewIcon />} onClick={() => abrirProjeto(p)} sx={{ color: "#ffad79", textTransform: "none" }}>Abrir</Button></TableCell>
                  </TableRow>)}
                  {projetosFiltrados.length === 0 && <TableRow><TableCell colSpan={6} sx={{ color: "#b8c9dc", py: 4, textAlign: "center" }}>
                    {projetos.length === 0 ? "Nenhum projeto cadastrado ou atribuído à sua conta. A execução só será liberada após a confirmação do pagamento." : "Nenhum projeto corresponde aos filtros selecionados."}
                  </TableCell></TableRow>}
                </TableBody>
              </Table>
            </Box>
          )}
          <Alert severity="info" sx={{ mt: 2 }}>Painel somente de leitura. Nenhum projeto será criado e nenhum pagamento será confirmado nesta tela.</Alert>
        </Card>

        </Box>}
        {abaAtiva === "cotacoes" && <Box role="tabpanel">
        <Card sx={{ ...cardSx, overflow: "hidden", mb: 3 }}>
          <Box sx={{ px: { xs: 2, md: 3 }, pt: 3, pb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
            <Box>
              <Typography component="h2" sx={{ fontSize: 20, fontWeight: 800, color: "#f4f8ff" }}>Solicitações recebidas</Typography>
              <Typography sx={{ color: "#9eb0c5", fontSize: 12, mt: 0.5 }}>{dadosExibidos.length} de {total} solicitação(ões) exibida(s)</Typography>
            </Box>
            <TextField value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar cliente, número ou status" size="small" InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "#8ca1b9" }} /></InputAdornment> }} sx={{ width: { xs: "100%", sm: 320 }, "& .MuiOutlinedInput-root": { bgcolor: "#1b2b40", color: "#fff", borderRadius: 2, "& fieldset": { borderColor: "#30435a" }, "&:hover fieldset": { borderColor: "#ff6600" }, "&.Mui-focused fieldset": { borderColor: "#ff6600" } }, "& input::placeholder": { color: "#aabbd0", opacity: 1 } }} />
          </Box>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, px: { xs: 2, md: 3 }, pb: 2, overflow: "hidden", alignItems: "center" }}>
            {statusList.map((s) => <Button key={s} size="small" onClick={() => setFiltroStatus(s)} sx={{ flexShrink: 0, borderRadius: 5, px: 2, textTransform: "none", fontWeight: 700, fontSize: 12, bgcolor: filtroStatus === s ? "#ff6600" : "#1b2b40", color: filtroStatus === s ? "#fff" : "#b8c7d8", border: "1px solid", borderColor: filtroStatus === s ? "#ff6600" : "#31445b", "&:hover": { bgcolor: filtroStatus === s ? "#e65c00" : "#263a51" } }}>{s}</Button>)}
          </Box>
          <Box sx={{ overflowX: "auto", scrollbarWidth: "thin", scrollbarColor: "#38516b #101f33", "&::-webkit-scrollbar": { height: 8 }, "&::-webkit-scrollbar-track": { bgcolor: "#101f33" }, "&::-webkit-scrollbar-thumb": { bgcolor: "#38516b", borderRadius: 8 } }}>
            <Table sx={{ minWidth: 780, "& .MuiTableCell-root": { borderColor: "#25384d" } }}>
              <TableHead><TableRow sx={{ bgcolor: "#17283d" }}>{titulos.map((t) => <TableCell key={t} sx={{ color: "#b8c9dc", fontWeight: 800, fontSize: 12, py: 2 }}>{t}</TableCell>)}</TableRow></TableHead>
              <TableBody>
                {dadosExibidos.map((item) => <TableRow key={item.id} sx={{ "&:hover": { bgcolor: "rgba(255,255,255,.035)" } }}>
                  <TableCell sx={{ color: "#fff", fontWeight: 700 }}>{item.cliente || "Não informado"}</TableCell>
                  <TableCell sx={{ color: "#ffad79", fontWeight: 700 }}>{item.id}</TableCell>
                  <TableCell sx={{ color: "#dce5ef" }}>{item.verba || "Não informado"}</TableCell>
                  <TableCell sx={{ color: "#dce5ef" }}>{valorVisivel(item)}</TableCell>
                  <TableCell><Chip label={item.status || "Sem status"} size="small" sx={{ bgcolor: `${statusColors[item.status] || "#64748b"}25`, color: statusColors[item.status] || "#cbd5e1", border: `1px solid ${statusColors[item.status] || "#64748b"}`, fontWeight: 800 }} /></TableCell>
                  <TableCell><Box sx={{ display: "flex", gap: 1, whiteSpace: "nowrap" }}>
                    <Button size="small" startIcon={<VisibilityOutlinedIcon />} onClick={() => handleOpen(item)} sx={{ color: "#d8e7fa", border: "1px solid #435a72", textTransform: "none", borderRadius: 2, fontWeight: 700 }}>Visualizar</Button>
                    {<Button size="small" startIcon={<ChatBubbleOutlineIcon />} onClick={() => setCotacaoParaResponder(item)} sx={{ bgcolor: "#ff6600", color: "white", textTransform: "none", borderRadius: 2, fontWeight: 800, "&:hover": { bgcolor: "#e45b00" } }}>Responder</Button>}
                  </Box></TableCell>
                </TableRow>)}
                {dadosExibidos.length === 0 && <TableRow><TableCell colSpan={6} sx={{ color: "#aabbd0", textAlign: "center", py: 6 }}>Nenhuma solicitação encontrada para os filtros selecionados.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </Box>
        </Card>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
          <Card sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 17, mb: 2, color: "#f4f8ff" }}>Resumo operacional</Typography>
            {[
              { label: "Cotações concluídas", n: concluidas, color: "#76a9ff" },
              { label: "Cotações pendentes", n: pendentes, color: "#ffb43d" },
              { label: "Falta de informação", n: semInformacao, color: "#f87171" },
              { label: "Aguardando aprovação", n: aguardandoAprovacao, color: "#fb923c" },
              { label: "Aguardando pagamento", n: aguardandoPagamento, color: "#ff6600" },
              { label: "Em execução", n: emExecucao, color: "#60a5fa" },
            ].map((item) => <Box key={item.label} sx={{ mb: 2.5 }}><Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}><Typography sx={{ fontSize: 13, color: "#c2d0df" }}>{item.label}</Typography><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#f4f8ff" }}>{item.n}</Typography></Box><Box sx={{ bgcolor: "#28394c", height: 7, borderRadius: 8, overflow: "hidden" }}><Box sx={{ bgcolor: item.color, width: `${total ? item.n / total * 100 : 0}%`, height: "100%", borderRadius: 8 }} /></Box></Box>)}
          </Card>
          <Card sx={{ ...cardSx, p: 3 }}>
            <Typography sx={{ fontWeight: 800, fontSize: 17, mb: 2, color: "#f4f8ff" }}>Informações do painel</Typography>
            <Typography sx={{ color: "#b9c9da", fontSize: 13, mb: 2 }}>As solicitações são consultadas diretamente no Supabase, conforme as permissões do perfil de engenharia.</Typography>
            <Typography sx={{ color: "#b9c9da", fontSize: 13, mb: 2 }}>Utilize <b>Visualizar</b> para consultar os detalhes e gerar o PDF demonstrativo.</Typography>
            <Typography sx={{ color: "#b9c9da", fontSize: 13 }}>Utilize a Central de Gestão para responder e acompanhar as propostas. O pagamento automático ainda não está integrado.</Typography>
          </Card>
        </Box>
        </Box>}
      </Box>

      <Dialog open={Boolean(cotacaoParaResponder)} onClose={() => setCotacaoParaResponder(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: "#071B2E", fontWeight: 800 }}>Responder cotação {cotacaoParaResponder?.id || ""}</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mt: 1 }}>
            A solicitação será aberta na Central de Gestão. Confira os dados antes de enviar ou atualizar a proposta.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setCotacaoParaResponder(null)}>Cancelar</Button>
          <Button variant="contained" onClick={abrirCentralDemonstrativa} sx={{ bgcolor: "#ff6600", '&:hover': { bgcolor: '#e45b00' } }}>Abrir central</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { bgcolor: "#101f33", color: "#fff", border: "1px solid #31455b", borderRadius: 3 } }}>
        <DialogTitle sx={{ color: "#ff873e", fontWeight: 800 }}>Detalhes da solicitação {cotacaoSelecionada?.id || ""}</DialogTitle>
        <DialogContent dividers sx={{ borderColor: "#30445a" }}>
          {cotacaoSelecionada && <Box sx={{ display: "grid", gap: 1.5 }}>
            {[["Cliente", cotacaoSelecionada.cliente], ["Nº da solicitação", cotacaoSelecionada.id], ["Data", cotacaoSelecionada.data], ["Status", cotacaoSelecionada.status], ["Descrição", cotacaoSelecionada.descricao], ["Características técnicas", cotacaoSelecionada.caracteristicas], ["Dimensões", cotacaoSelecionada.tamanho], ["Materiais", cotacaoSelecionada.materiais], ["Observações", cotacaoSelecionada.observacao], ["Verba disponível", cotacaoSelecionada.verba], ["Valor orçado", valorVisivel(cotacaoSelecionada)]].map(([label, value]) => <Box key={label}><Typography component="span" sx={{ color: "#ffad79", fontWeight: 800, fontSize: 13 }}>{label}: </Typography><Typography component="span" sx={{ color: "#e3ebf4", fontSize: 13 }}>{value || "Não informado"}</Typography></Box>)}
          </Box>}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}><Button startIcon={<PictureAsPdfOutlinedIcon />} onClick={gerarPDF} sx={{ color: "#ffad79", fontWeight: 800, textTransform: "none" }}>Baixar PDF</Button><Button onClick={handleClose} sx={{ color: "#fff", textTransform: "none" }}>Fechar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
