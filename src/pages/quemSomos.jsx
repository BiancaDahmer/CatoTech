import React from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import industrialSolution from "../assets/img/estrutura.jpg";
import equipe from "../assets/img/equipe.jpg";
// Ícones SVG locais: não exigem instalação de bibliotecas adicionais.
const paths = {
  Settings: <><path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l-1.86 1.86A1.7 1.7 0 0 0 16 18.4l-1.1.45a1.7 1.7 0 0 0-1 1.56V22h-3.8v-1.59a1.7 1.7 0 0 0-1-1.56L8 18.4a1.7 1.7 0 0 0-1.88.34l-1.86-1.86A1.7 1.7 0 0 0 4.6 15l-.45-1.1a1.7 1.7 0 0 0-1.56-1H1v-1.8h1.59a1.7 1.7 0 0 0 1.56-1L4.6 9a1.7 1.7 0 0 0-.34-1.88l1.86-1.86A1.7 1.7 0 0 0 8 5.6l1.1-.45a1.7 1.7 0 0 0 1-1.56V2h3.8v1.59a1.7 1.7 0 0 0 1 1.56L16 5.6a1.7 1.7 0 0 0 1.88-.34l1.86 1.86A1.7 1.7 0 0 0 19.4 9l.45 1.1a1.7 1.7 0 0 0 1.56 1H23v1.8h-1.59a1.7 1.7 0 0 0-1.56 1Z"/></>,
  TrendingUp: <><path d="m3 17 6-6 4 4 8-8"/><path d="M15 7h6v6"/></>,
  ShieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></>,
  Target: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></>,
  Eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  HeartHandshake: <><path d="M12 20 4 13a5 5 0 0 1 7-7l1 1 1-1a5 5 0 0 1 7 7Z"/><path d="m8 13 3 3 5-5"/></>,
  ArrowRight: <><path d="M4 12h16"/><path d="m14 6 6 6-6 6"/></>,
  CheckCircle2: <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>,
};
function Icon({ name, size = 24, color = "currentColor", style }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">{paths[name]}</svg>;
}
const Settings = (props) => <Icon name="Settings" {...props} />;
const TrendingUp = (props) => <Icon name="TrendingUp" {...props} />;
const ShieldCheck = (props) => <Icon name="ShieldCheck" {...props} />;
const Target = (props) => <Icon name="Target" {...props} />;
const Eye = (props) => <Icon name="Eye" {...props} />;
const HeartHandshake = (props) => <Icon name="HeartHandshake" {...props} />;
const ArrowRight = (props) => <Icon name="ArrowRight" {...props} />;
const CheckCircle2 = (props) => <Icon name="CheckCircle2" {...props} />;


const NAVY = "#061a2e";
const DARK = "#001329";
const ORANGE = "#ff6600";
const LIGHT = "#f4f7f9";
const MUTED = "#526985";

const pilares = [
  { titulo: "Missão", descricao: "Desenvolver projetos mecânicos personalizados que unam inovação e eficiência, promovendo o crescimento e a sustentabilidade da indústria.", Icone: Target },
  { titulo: "Visão", descricao: "Ser referência nacional no desenvolvimento de soluções tecnológicas para a engenharia mecânica, reconhecida pela qualidade e excelência.", Icone: Eye },
  { titulo: "Valores", descricao: "Ética, inovação, compromisso com a qualidade, respeito às pessoas e sustentabilidade são pilares que norteiam cada projeto desenvolvido pela CatoTech.", Icone: HeartHandshake },
];

export default function QuemSomos() {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: LIGHT, overflowX: "hidden" }}>
      {/* O header global permanece no componente existente; não adicionar outro aqui. */}
      <Box sx={{ position: "relative", bgcolor: DARK, color: "#fff", pt: { xs: 14, md: 19 }, pb: { xs: 9, md: 13 }, backgroundImage: `linear-gradient(90deg, rgba(0,19,41,.96) 0%, rgba(0,19,41,.85) 45%, rgba(0,19,41,.35) 100%), url(${industrialSolution})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 720 }}>
            <Typography sx={{ color: ORANGE, fontWeight: 800, fontSize: 12, letterSpacing: 2, mb: 3 }}>— SOBRE A CATOTECH</Typography>
            <Typography component="h1" sx={{ fontWeight: 900, fontSize: { xs: "2.5rem", md: "3.7rem" }, lineHeight: 1.12, letterSpacing: -1.5, mb: 3 }}>
              Engenharia que transforma ideias em <Box component="span" sx={{ color: ORANGE }}>soluções reais.</Box>
            </Typography>
            <Typography sx={{ fontSize: { xs: 15, md: 17 }, lineHeight: 1.9, color: "#dbe4ed", maxWidth: 570 }}>
              Somos apaixonados por engenharia, tecnologia e inovação. Transformamos ideias em soluções mecânicas sob medida para impulsionar a produtividade industrial.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mt: 5 }}>
              {[
                { texto: "Soluções sob medida", Icone: Settings },
                { texto: "Eficiência industrial", Icone: TrendingUp },
                { texto: "Compromisso com a qualidade", Icone: ShieldCheck },
              ].map(({ texto, Icone }) => (
                <Stack key={texto} direction="row" spacing={1.2} alignItems="center">
                  <Icone size={24} color={ORANGE} />
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>{texto}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* NOSSA HISTÓRIA */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "center", gap: { xs: 5, md: 8 } }}>
            <Box>
              <Typography sx={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, mb: 2 }}>— NOSSA HISTÓRIA</Typography>
              <Typography component="h2" sx={{ color: NAVY, fontWeight: 900, fontSize: { xs: 30, md: 38 }, lineHeight: 1.2, mb: 3 }}>Paixão por engenharia e resultados</Typography>
              <Typography sx={{ color: MUTED, fontSize: 15, lineHeight: 1.9, mb: 3 }}>
                A CatoTech é uma empresa especializada em orçamentos e projetos mecânicos, comprometida em unir tecnologia, precisão e inovação para entregar soluções que otimizam a produção e impulsionam a indústria.
              </Typography>
              <Typography sx={{ color: MUTED, fontSize: 15, lineHeight: 1.9 }}>
                Nossa missão é garantir a excelência em cada projeto, aplicando tecnologias de ponta e metodologias inteligentes para obter resultados precisos e sustentáveis.
              </Typography>
            </Box>
            <Box sx={{ position: "relative", pb: { xs: 4, md: 3 } }}>
              <Box component="img" src={industrialSolution} alt="Engenharia mecânica industrial" sx={{ display: "block", width: "100%", height: { xs: 280, md: 365 }, objectFit: "cover", objectPosition: "center", borderRadius: "20px" }} />
              <Box sx={{ position: "absolute", right: { xs: 12, md: 0 }, bottom: 0, bgcolor: DARK, color: "#fff", borderRadius: "16px", p: 3, maxWidth: 255, boxShadow: "0 14px 30px rgba(0,0,0,.15)" }}>
                <Typography sx={{ color: ORANGE, fontSize: 27, lineHeight: 1 }}>“</Typography>
                <Typography sx={{ fontWeight: 700, fontSize: 18, lineHeight: 1.35 }}>Imaginou? A CatoTech projeta para você.</Typography>
                <Box sx={{ width: 35, height: 3, bgcolor: ORANGE, mt: 2, borderRadius: 3 }} />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* NOSSA EQUIPE — imagem sem corte, esticamento ou filtros */}
      <Box sx={{ bgcolor: "#fff", py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "center", gap: { xs: 5, md: 7 } }}>
            <Box sx={{ width: "100%", overflow: "hidden", borderRadius: "20px", bgcolor: "#eef2f5", lineHeight: 0 }}>
              <Box component="img" src={equipe} alt="Fotografia da equipe CatoTech" loading="lazy" decoding="async" sx={{ display: "block", width: "100%", height: "auto", maxWidth: "100%", objectFit: "contain", imageRendering: "auto", filter: "none", transform: "none" }} />
            </Box>
            <Box>
              <Typography sx={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, mb: 2 }}>— NOSSA EQUIPE</Typography>
              <Typography component="h2" sx={{ color: NAVY, fontWeight: 900, fontSize: { xs: 30, md: 38 }, lineHeight: 1.2, mb: 3 }}>Pessoas que fazem a diferença</Typography>
              <Typography sx={{ color: MUTED, fontSize: 15, lineHeight: 1.9, mb: 3 }}>
                Por trás de cada solução existe dedicação, atenção aos detalhes e compromisso com as necessidades de cada cliente. Valorizamos a comunicação próxima em todas as etapas do projeto.
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mt: 4 }}>
                {["Atendimento próximo", "Projetos personalizados", "Foco em resultados"].map((item) => (
                  <Stack key={item} direction="row" alignItems="flex-start" spacing={1}>
                    <CheckCircle2 size={19} color={ORANGE} style={{ flexShrink: 0 }} />
                    <Typography sx={{ color: NAVY, fontSize: 13, fontWeight: 700, lineHeight: 1.4 }}>{item}</Typography>
                  </Stack>
                ))}
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* NOSSOS PILARES */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography sx={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, mb: 2 }}>— O QUE NOS MOVE</Typography>
            <Typography component="h2" sx={{ color: NAVY, fontWeight: 900, fontSize: { xs: 30, md: 38 } }}>Nossos Pilares</Typography>
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
            {pilares.map(({ titulo, descricao, Icone }) => (
              <Box key={titulo} sx={{ bgcolor: "#fff", border: "1px solid #e0e8ef", borderRadius: "20px", p: { xs: 3, md: 4 }, height: "100%", boxSizing: "border-box", transition: "transform .25s ease, box-shadow .25s ease", "&:hover": { transform: "translateY(-5px)", boxShadow: "0 16px 35px rgba(0,19,41,.08)" } }}>
                <Box sx={{ width: 56, height: 56, borderRadius: "15px", bgcolor: "#fff1e8", display: "flex", alignItems: "center", justifyContent: "center", mb: 3 }}><Icone size={27} color={ORANGE} /></Box>
                <Typography component="h3" sx={{ color: NAVY, fontSize: 22, fontWeight: 800, mb: 2 }}>{titulo}</Typography>
                <Typography sx={{ color: MUTED, fontSize: 14, lineHeight: 1.9 }}>{descricao}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* CHAMADA FINAL */}
      <Box sx={{ pb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ bgcolor: NAVY, borderRadius: "24px", px: { xs: 3, md: 6 }, py: { xs: 5, md: 6 }, display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 4 }}>
            <Box>
              <Typography sx={{ color: ORANGE, fontSize: 12, fontWeight: 800, letterSpacing: 1.5, mb: 2 }}>FALE COM A CATOTECH</Typography>
              <Typography component="h2" sx={{ color: "#fff", fontSize: { xs: 27, md: 34 }, fontWeight: 900, mb: 1 }}>Vamos desenvolver sua solução?</Typography>
              <Typography sx={{ color: "#cbd5df", fontSize: 14, lineHeight: 1.8 }}>Conte com nossa equipe para transformar suas ideias em projetos reais.</Typography>
            </Box>
            <Button onClick={() => navigate("/cotacao")} endIcon={<ArrowRight size={18} />} sx={{ bgcolor: ORANGE, color: "#fff", borderRadius: "50px", px: 4, py: 1.7, fontWeight: 800, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: "#e65c00", boxShadow: "none" } }}>Solicitar orçamento</Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
