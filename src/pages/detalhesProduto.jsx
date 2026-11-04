import { useEffect, useState } from "react";
import { Box, Container, Typography, Button, Chip, Divider, CircularProgress, Alert } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import EngineeringRoundedIcon from "@mui/icons-material/EngineeringRounded";
import FactCheckRoundedIcon from "@mui/icons-material/FactCheckRounded";
import hidraulico from "../assets/img/hidraulico.jpg";
import estrutura from "../assets/img/estrutura.jpg";
import skid from "../assets/img/skid.jpg";
import mecanismo from "../assets/img/mecanismo.jpg";
import tubo from "../assets/img/tubo.jpg";
import mesa from "../assets/img/mesa.jpg";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";

const AZUL = "#061a2e";
const LARANJA = "#ff650d";

const produtos = [
  {
    id: 1, nome: "Projeto de Sistema Hidráulico", categoria: "Hidráulica",
    descricao: "Desenvolvimento completo de sistemas hidráulicos industriais sob medida, incluindo dimensionamento, montagem e testes de operação. Projetado para alto desempenho em prensas, máquinas automatizadas e linhas de produção. Integra reservatórios, bombas, válvulas, filtros e sensores para controle preciso de pressão e vazão.",
    especificacoes: { dimensoes: "1200 x 800 x 600 mm", peso: "150 kg", material: "Aço inoxidável e alumínio anodizado", pressao: "250 bar", vazao: "60 L/min", tensao: "380V trifásico" }, imagem: hidraulico,
  },
  {
    id: 2, nome: "Estrutura Mecânica Personalizada", categoria: "Estrutural",
    descricao: "Fabricação de estruturas metálicas sob medida para máquinas, bancadas industriais, suportes e plataformas de manutenção. Desenvolvidas conforme o layout e necessidade do cliente, garantindo robustez, estabilidade e excelente acabamento superficial. Projeto otimizado por meio de simulações estruturais e análise de carga.",
    especificacoes: { dimensoes: "Sob medida", peso: "Variável conforme projeto", material: "Aço carbono, inox e alumínio", acabamento: "Pintura epóxi industrial ou galvanização a quente" }, imagem: estrutura,
  },
  {
    id: 3, nome: "Skid de Bombas", categoria: "Bombas e Processos",
    descricao: "Conjunto modular de bombas montado em skid para sistemas hidráulicos, de refrigeração ou transferência de fluidos. O design compacto permite fácil instalação e manutenção, garantindo alta eficiência operacional e redução de vibrações. Pode incluir reservatórios, válvulas de segurança, filtros e instrumentação de controle.",
    especificacoes: { dimensoes: "1200 x 1000 x 900 mm", capacidade: "Até 120 L/min", pressaoMax: "16 bar", estrutura: "Base metálica reforçada com suportes antivibração", conexoes: "Rosqueadas ou flangeadas" }, imagem: skid,
  },
  {
    id: 4, nome: "Mecanismo Mecânico de Transmissão", categoria: "Mecânica de Precisão",
    descricao: "Projeto e fabricação de mecanismos de transmissão mecânica para sistemas industriais, como redutores, eixos, acoplamentos e sistemas articulados. Produzidos com alta precisão dimensional, garantindo durabilidade, baixo ruído e eficiência mecânica superior em linhas automatizadas e equipamentos especiais.",
    especificacoes: { torqueMax: "Até 450 Nm", "rotação": "Até 3000 rpm", material: "Aço liga temperado e alumínio anodizado", montagem: "Acoplamento direto ou por correias" }, imagem: mecanismo,
  },
  {
    id: 5, nome: "Tubos Calandrados", categoria: "Tubulações e Caldeiraria",
    descricao: "Produção de tubos calandrados e curvados sob medida para sistemas industriais, hidráulicos e estruturais. Ideal para dutos de ar comprimido, sistemas de refrigeração e estruturas metálicas. A curvatura é executada com precisão para garantir o alinhamento perfeito e o mínimo de perda de pressão.",
    especificacoes: { comprimento: "2 a 12 metros", "diâmetro": "25 a 300 mm", espessura: "1,5 a 8 mm", material: "Aço inox, carbono ou alumínio", acabamento: "Jateado e pintura industrial" }, imagem: tubo,
  },
  {
    id: 6, nome: "Mesa Elevatória Hidráulica", categoria: "Equipamentos Industriais",
    descricao: "Mesa de elevação hidráulica projetada para movimentação e posicionamento ergonômico de cargas. Ideal para linhas de montagem, oficinas e almoxarifados. Sistema seguro com válvula de retenção, limitador de curso e estrutura reforçada para máxima estabilidade e segurança operacional.",
    especificacoes: { capacidade: "Até 1000 kg", alturaMax: "1500 mm", acionamento: "Elétrico, pedal ou controle remoto", estrutura: "Aço reforçado com pintura epóxi industrial", sistemaSeguranca: "Travas mecânicas e válvulas de retenção" }, imagem: mesa,
  },
];

const rotulos = {
  dimensoes: "Dimensões", peso: "Peso", material: "Material", pressao: "Pressão",
  vazao: "Vazão", tensao: "Tensão", acabamento: "Acabamento", capacidade: "Capacidade",
  pressaoMax: "Pressão máxima", estrutura: "Estrutura", conexoes: "Conexões",
  torqueMax: "Torque máximo", "rotação": "Rotação", montagem: "Montagem",
  comprimento: "Comprimento", "diâmetro": "Diâmetro", espessura: "Espessura",
  alturaMax: "Altura máxima", acionamento: "Acionamento", sistemaSeguranca: "Sistema de segurança",
};

const botaoPrincipal = {
  borderRadius: "999px", backgroundColor: LARANJA, color: "#fff", px: 3.5,
  py: 1.6, fontWeight: 800, textTransform: "none", boxShadow: "none",
  "&:hover": { backgroundColor: "#e85b00", boxShadow: "none" },
};

export default function DetalhesProduto() {
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const produtoOriginal = produtos.find((item) => String(item.id) === String(id));
  const [produtoBanco, setProdutoBanco] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    if (!supabaseConfigurado) { setErro("Supabase não configurado."); setCarregando(false); return; }
    setCarregando(true);
    setErro("");
    setProdutoBanco(null);
    supabase.from("produtos_catalogo")
      .select("id,produto_original_id,nome,especificacao,descricao,especificacoes,categoria,imagem_url,ativo")
      .eq(produtoOriginal ? "produto_original_id" : "id", id)
.maybeSingle()
      .then(({ data, error }) => {
        if (!ativo) return;
        if (error) setErro(error.message);
        else if (data) setProdutoBanco({
          ...data,
          imagem: data.imagem_url || produtoOriginal?.imagem || "",
          descricao: data.descricao?.trim() || data.especificacao || "Descrição técnica ainda não informada.",
          especificacoes: data.especificacoes && typeof data.especificacoes === "object" && !Array.isArray(data.especificacoes)
            ? data.especificacoes : {},
        });
        setCarregando(false);
      });
    return () => { ativo = false; };
  }, [id, produtoOriginal]);

  const produto = produtoBanco || produtoOriginal;
  const produtoOculto = produtoBanco && !produtoBanco.ativo;

  if (carregando) return (
    <Box sx={{ minHeight: "80vh", pt: 22, textAlign: "center", backgroundColor: "#f5f7f8" }}>
      <CircularProgress sx={{ color: LARANJA }} />
      <Typography sx={{ mt: 2, color: AZUL }}>Carregando detalhes do produto...</Typography>
    </Box>
  );

  if (!produto || produtoOculto) {
    return (
      <Box sx={{ minHeight: "100vh", pt: 20, pb: 10, backgroundColor: "#f5f7f8", textAlign: "center" }}>
        <Typography variant="h4" sx={{ color: AZUL, fontWeight: 800, mb: 3 }}>Produto não encontrado</Typography>
        {erro && <Alert severity="warning" sx={{ maxWidth: 560, mx: "auto", mb: 3 }}>{erro}</Alert>}
        <Button sx={botaoPrincipal} onClick={() => navigate("/produtos")}>Voltar ao catálogo</Button>
      </Box>
    );
  }

  const especificacoes = Object.entries(produto.especificacoes || {}).filter(([, valor]) => valor != null && String(valor).trim());
  const destaques = especificacoes.slice(0, 3);

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7f8", color: AZUL, mt: { xs: "-78px", md: "-86px" }, pb: { xs: 8, md: 12 } }}>
      <Box sx={{ background: "linear-gradient(125deg, #061a2e, #0c2a43)", pt: { xs: 17, md: 18 }, pb: { xs: 7, md: 9 } }}>
        <Container maxWidth="lg">
          <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/produtos")}
            sx={{ color: "#c8d5df", textTransform: "none", mt: { xs: 4, md: 5 }, mb: 2, px: 0, "&:hover": { color: "#fff", backgroundColor: "transparent" } }}>
            Voltar ao catálogo
          </Button>
          <Typography sx={{ color: LARANJA, fontWeight: 800, letterSpacing: 2, fontSize: 11, mb: 1 }}>CATOTECH / DETALHES DO PRODUTO</Typography>
          <Typography component="h1" sx={{ color: "#fff", fontWeight: 800, fontSize: { xs: 32, md: 49 }, lineHeight: 1.16, letterSpacing: "-.035em", maxWidth: 820 }}>
            {produto.nome}
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -6 }, position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.1fr) minmax(0, .9fr)" }, alignItems: "stretch", backgroundColor: "#fff", border: "1px solid #e3e9ee", borderRadius: "24px", overflow: "hidden", boxShadow: "0 18px 45px rgba(6,26,46,.08)" }}>
          <Box sx={{ p: { xs: 2, md: 3 }, display: "flex", alignItems: "center", justifyContent: "center", minHeight: { xs: 290, md: 470 }, backgroundColor: "#fff", borderBottom: { xs: "1px solid #e9eef2", md: "none" }, borderRight: { xs: "none", md: "1px solid #e9eef2" } }}>
            {produto.imagem ? <Box component="img" src={produto.imagem} alt={produto.nome}
              sx={{ width: "100%", maxHeight: { xs: 320, md: 430 }, objectFit: "contain", display: "block" }} />
              : <Typography sx={{ color: "#647487" }}>Imagem não disponível</Typography>}
          </Box>
          <Box sx={{ backgroundColor: "#fff", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", minWidth: 0 }}>
            <Chip label={produto.categoria} sx={{ alignSelf: "flex-start", borderRadius: "999px", backgroundColor: "#fff0e7", color: "#bf4c00", fontWeight: 800, mb: 2 }} />
            <Typography component="h2" sx={{ fontSize: { xs: 25, md: 30 }, lineHeight: 1.25, fontWeight: 800, mb: 2 }}>Engenharia para sua aplicação.</Typography>
            <Typography sx={{ color: "#647487", fontSize: 14, lineHeight: 1.85, mb: 3 }}>
              Conheça os principais dados deste projeto e solicite uma avaliação para sua necessidade.
            </Typography>
            <Divider sx={{ borderColor: "#e5ebf0", mb: 3 }} />
            <Typography sx={{ fontWeight: 800, fontSize: 15, mb: 2 }}>Destaques técnicos</Typography>
            <Box sx={{ display: "grid", gap: 1.5, mb: 4 }}>
              {(destaques.length ? destaques : [["Informações", produto.especificacao || "Sob consulta"]]).map(([chave, valor]) => (
                <Box key={chave} sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, backgroundColor: "#f4f7f9", borderRadius: "12px", px: 2, py: 1.5 }}>
                  <Typography sx={{ color: "#647487", fontSize: 12 }}>{rotulos[chave] || chave}</Typography>
                  <Typography sx={{ color: AZUL, fontSize: 12, fontWeight: 800, textAlign: "right", overflowWrap: "anywhere" }}>{valor}</Typography>
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: "auto" }}>
              <Button fullWidth endIcon={<ArrowForwardRoundedIcon />} sx={botaoPrincipal} onClick={() => navigate("/cotacao")}>
                Solicitar orçamento
              </Button>
            </Box>
          </Box>
        </Box>

        <Box component="section" sx={{ backgroundColor: "#fff", border: "1px solid #e3e9ee", borderRadius: "24px", p: { xs: 3, md: 5 }, mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <EngineeringRoundedIcon sx={{ color: LARANJA }} />
            <Typography sx={{ color: LARANJA, fontWeight: 800, fontSize: 11, letterSpacing: 2 }}>SOBRE O PROJETO</Typography>
          </Box>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: 25, md: 34 }, letterSpacing: "-.03em", mb: 2 }}>Engenharia aplicada a cada detalhe.</Typography>
          <Chip label={produto.categoria} sx={{ borderRadius: "999px", backgroundColor: "#eef2f5", color: AZUL, fontWeight: 700, mb: 3 }} />
          <Typography sx={{ color: "#536477", lineHeight: 1.95, fontSize: { xs: 14, md: 16 }, maxWidth: 960, whiteSpace: "pre-wrap" }}>{produto.descricao}</Typography>
        </Box>

        {especificacoes.length > 0 && <Box component="section" sx={{ backgroundColor: "#fff", border: "1px solid #e3e9ee", borderRadius: "24px", p: { xs: 3, md: 5 }, mt: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
            <FactCheckRoundedIcon sx={{ color: LARANJA }} />
            <Typography sx={{ color: LARANJA, fontWeight: 800, fontSize: 11, letterSpacing: 2 }}>DADOS DO PROJETO</Typography>
          </Box>
          <Typography component="h2" sx={{ fontWeight: 800, fontSize: { xs: 25, md: 34 }, letterSpacing: "-.03em", mb: 3 }}>Especificações técnicas</Typography>
          <Box sx={{ border: "1px solid #e5ebf0", borderRadius: "16px", overflow: "hidden" }}>
            {especificacoes.map(([chave, valor], index) => (
              <Box key={chave} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(150px, 35%) 1fr" }, gap: { xs: .5, sm: 3 }, px: { xs: 2, md: 3 }, py: 2, backgroundColor: index % 2 === 0 ? "#f5f8fa" : "#fff", borderBottom: index === especificacoes.length - 1 ? "none" : "1px solid #e5ebf0" }}>
                <Typography sx={{ color: "#647487", fontSize: 14 }}>{rotulos[chave] || chave}</Typography>
                <Typography sx={{ color: AZUL, fontWeight: 700, fontSize: 14, overflowWrap: "anywhere" }}>{valor}</Typography>
              </Box>
            ))}
          </Box>
        </Box>}

        <Box sx={{ backgroundColor: AZUL, borderRadius: "24px", p: { xs: 3, md: 5 }, mt: 4, display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { xs: "flex-start", md: "center" }, justifyContent: "space-between", gap: 3 }}>
          <Box>
            <Typography sx={{ color: LARANJA, fontSize: 11, fontWeight: 800, letterSpacing: 2, mb: 1 }}>FALE COM A CATOTECH</Typography>
            <Typography sx={{ color: "#fff", fontSize: { xs: 23, md: 30 }, fontWeight: 800, mb: 1 }}>Vamos desenvolver sua solução?</Typography>
            <Typography sx={{ color: "#c4d0db", fontSize: 14 }}>Solicite um orçamento para avaliar as necessidades do seu projeto.</Typography>
          </Box>
          <Button endIcon={<ArrowForwardRoundedIcon />} onClick={() => navigate("/cotacao")} sx={{ ...botaoPrincipal, flexShrink: 0 }}>Solicitar orçamento</Button>
        </Box>
      </Container>
    </Box>
  );
}
