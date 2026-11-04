import { useState } from "react";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate } from "react-router-dom";
import sprinklerImg from "../assets/img/sprinkler.jpg";

const AZUL = "#061a2e";
const LARANJA = "#ff650d";
const TEXTO = "#607287";
const componentes = [
  { nome: "Rede de distribuição", detalhe: "Tubulações de alimentação e ramais hidráulicos que conduzem a água até os pontos de proteção." },
  { nome: "Chuveiros automáticos", detalhe: "Dispositivos com elemento termossensível que atuam individualmente quando atingem sua temperatura de operação." },
  { nome: "Bombas e reservatórios", detalhe: "Conjunto de abastecimento e pressurização dimensionado conforme as condições de projeto." },
  { nome: "Válvula de governo e alarme", detalhe: "Conjunto para supervisão, controle e sinalização do funcionamento da rede." },
  { nome: "Instrumentação e testes", detalhe: "Manômetros, drenos e pontos de ensaio utilizados na inspeção e manutenção." },
  { nome: "Comando e monitoramento", detalhe: "Painel elétrico e dispositivos para acompanhamento das condições de operação." },
];
const tipos = [
  { nome: "Sistema Molhado", descricao: "Rede permanentemente cheia de água, ideal para ambientes internos sem risco de congelamento.", detalhe: "Água disponível na tubulação para descarga após a abertura térmica do chuveiro." },
  { nome: "Sistema Seco", descricao: "Utiliza ar comprimido ou nitrogênio na tubulação, indicado para áreas sujeitas a congelamento.", detalhe: "A abertura do chuveiro provoca a liberação do ar e a admissão de água na rede." },
  { nome: "Sistema Pré-Ação", descricao: "Combina detecção automática e liberação controlada de água, reduzindo o risco de descargas acidentais.", detalhe: "A lógica de liberação depende da configuração de detecção e supervisão adotada." },
  { nome: "Sistema Dilúvio", descricao: "Utiliza bicos abertos e descarga simultânea, aplicado em riscos especiais.", detalhe: "O acionamento da válvula permite descarga pelos bicos abertos da área protegida." },
];
const beneficios = [
  "Atuação automática para controle e supressão de incêndios",
  "Alta confiabilidade e cobertura direcionada",
  "Redução de danos materiais e riscos à vida",
  "Soluções de manutenção e longa vida útil conforme o sistema",
  "Projeto orientado às exigências aplicáveis do Corpo de Bombeiros",
];
const titulo = { color: AZUL, fontSize: { xs: 25, md: 34 }, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.2 };
const texto = { color: TEXTO, fontSize: 15, lineHeight: 1.9 };
function Rotulo({ children }) { return <Typography sx={{ color: LARANJA, fontSize: 11, fontWeight: 800, letterSpacing: 2, mb: 1.5 }}>{children}</Typography>; }

// Esquema vetorial ilustrativo, em perspectiva isométrica. Não é um modelo CAD nem um projeto executivo.
function EsquemaTecnico({ ativo, onSelecionar, tipo = 0 }) {
  const agua = tipo === 0 || tipo === 3;
  return (
    <Box sx={{ width: "100%", overflow: "hidden", borderRadius: "20px", background: "radial-gradient(circle at 60% 30%, #203d54, #081e32 70%)", position: "relative" }}>
      <svg viewBox="0 0 760 430" role="img" aria-label="Esquema ilustrativo isométrico de rede de sprinklers, com tubulações, chuveiros e conjunto de alimentação" style={{ display: "block", width: "100%" }}>
        <defs>
          <linearGradient id="cano" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stopColor="#ffb37e"/><stop offset=".5" stopColor="#e85517"/><stop offset="1" stopColor="#a92b12"/></linearGradient>
          <linearGradient id="metal" x1="0" x2="1"><stop offset="0" stopColor="#e1e9ed"/><stop offset="1" stopColor="#748a9c"/></linearGradient>
        </defs>
        <g opacity=".17" stroke="#90aabe" strokeWidth="1">
          {Array.from({length:11},(_,i)=><path key={`g${i}`} d={`M${-100+i*90} 345 L${250+i*90} 140`} />)}
          {Array.from({length:7},(_,i)=><path key={`h${i}`} d={`M80 ${195+i*34} L680 ${195+i*34}`} />)}
        </g>
        <path d="M130 265 L365 126 L630 251 L395 392 Z" fill="#17364c" stroke="#44647b" strokeWidth="2" opacity=".6" />
        <g fill="none" stroke="#7c1c12" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round" opacity=".55" transform="translate(6 8)">
          <path d="M170 250 L366 137 L604 250"/><path d="M278 188 L278 293"/><path d="M410 157 L410 312"/><path d="M530 215 L530 330"/>
        </g>
        <g fill="none" stroke="url(#cano)" strokeWidth="15" strokeLinecap="round" strokeLinejoin="round">
          <path d="M170 250 L366 137 L604 250"/><path d="M278 188 L278 293"/><path d="M410 157 L410 312"/><path d="M530 215 L530 330"/>
        </g>
        <g fill="none" stroke="#ffd0a6" strokeWidth="2" opacity=".7"><path d="M170 245 L366 132 L604 245"/><path d="M273 190 L273 291"/><path d="M405 159 L405 310"/></g>
        {[{x:278,y:293},{x:410,y:312},{x:530,y:330}].map((p,i)=><g key={i} transform={`translate(${p.x} ${p.y})`}><path d="M-9 0 L9 0 L5 13 L-5 13 Z" fill="url(#metal)"/><path d="M-16 16 Q0 29 16 16" fill="none" stroke="#b8cad6" strokeWidth="4"/>{agua && <path d="M0 26 L-15 52 M0 26 L0 56 M0 26 L15 52" stroke="#7ecbfa" strokeWidth="3" opacity=".85"/>}</g>)}
        <g transform="translate(95 260)"><rect x="0" y="-10" width="66" height="65" rx="8" fill="#60788a" stroke="#b8cad6"/><rect x="13" y="-35" width="40" height="33" rx="7" fill="url(#metal)"/><circle cx="33" cy="22" r="19" fill="#21394b" stroke="#a5b9c5" strokeWidth="6"/><circle cx="33" cy="22" r="7" fill={LARANJA}/></g>
        <g transform="translate(360 125)"><rect x="-16" y="-20" width="32" height="40" rx="5" fill="#b5c5d0"/><path d="M-25 -8 L25 -8" stroke="#fff" strokeWidth="5"/><circle cx="0" cy="-30" r="13" fill="#e6eff4" stroke="#819aaa" strokeWidth="3"/><path d="M0 -30 L7 -34" stroke={LARANJA} strokeWidth="3"/></g>
        <g transform="translate(620 260)"><rect width="55" height="63" rx="5" fill="#a3b8c8"/><rect x="7" y="9" width="41" height="29" rx="3" fill="#0d273b"/><circle cx="20" cy="23" r="4" fill="#63d6a0"/><circle cx="33" cy="23" r="4" fill={LARANJA}/></g>
        {[{x:145,y:243,n:3},{x:290,y:180,n:1},{x:435,y:303,n:2},{x:365,y:95,n:4},{x:595,y:247,n:5},{x:665,y:298,n:6}].map(p=><g key={p.n} onClick={()=>onSelecionar(p.n-1)} style={{cursor:"pointer"}} role="button" tabIndex="0" aria-label={`Ver componente ${p.n}`} onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onSelecionar(p.n-1);}}}><circle cx={p.x} cy={p.y} r="18" fill={ativo===p.n-1?LARANJA:"#102b40"} stroke={ativo===p.n-1?"#fff":"#e2eef5"} strokeWidth="2"/><text x={p.x} y={p.y+5} textAnchor="middle" fill="#fff" fontFamily="Arial" fontSize="14" fontWeight="bold">{String(p.n).padStart(2,"0")}</text></g>)}
      </svg>
      <Typography sx={{ position: "absolute", bottom: 10, left: 16, color: "#a8bfce", fontSize: 10, letterSpacing: 1 }}>VISUALIZAÇÃO ESQUEMÁTICA • NÃO REPRESENTA PROJETO EXECUTIVO</Typography>
    </Box>
  );
}

export default function Sprinklers() {
  const navigate = useNavigate();
  const [componenteAtivo, setComponenteAtivo] = useState(0);
  const [tipoAtivo, setTipoAtivo] = useState(0);
  const irParaCotacao = () => navigate("/cotacao?area=sprinklers&tipo=projeto");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f8", color: AZUL, fontFamily: "'Manrope', Arial, sans-serif" }}>
      <Box sx={{ background: "linear-gradient(125deg, #061a2e 0%, #0b2a44 100%)", pt: { xs: 17, md: 20 }, pb: { xs: 9, md: 12 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", right: -160, top: -170, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 0 65px rgba(255,255,255,.015), 0 0 0 130px rgba(255,255,255,.015)", pointerEvents: "none" }} />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Rotulo>CATOTECH / ENGENHARIA DE PROTEÇÃO CONTRA INCÊNDIO</Rotulo>
          <Typography component="h1" sx={{ color: "#fff", fontSize: { xs: 36, sm: 46, md: 60 }, fontWeight: 800, letterSpacing: "-.045em", lineHeight: 1.12, maxWidth: 850, mb: 3 }}>Sistema de <Box component="span" sx={{ color: LARANJA }}>Sprinklers</Box> Automáticos</Typography>
          <Typography sx={{ color: "#c4d0db", maxWidth: 690, fontSize: { xs: 15, md: 17 }, lineHeight: 1.85 }}>Sistemas automáticos de combate a incêndio por chuveiros automáticos, desenvolvidos conforme normas nacionais e internacionais, com foco em segurança, confiabilidade e eficiência hidráulica.</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 9, md: 13 } }}>
        <Rotulo>CONHEÇA A SOLUÇÃO</Rotulo>
        <Typography component="h2" sx={{ ...titulo, mb: 1 }}>Proteção inteligente para sua edificação</Typography>
        <Typography sx={{ ...texto, mb: 4, maxWidth: 780 }}>Conheça os principais componentes, aplicações e critérios de projeto dos sistemas de sprinklers.</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, gap: 3, mb: { xs: 7, md: 10 }, alignItems: "stretch" }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", overflow: "hidden", minHeight: { xs: 240, md: 390 } }}><Box component="img" src={sprinklerImg} alt="Instalação de sistema de sprinklers automáticos" sx={{ display: "block", width: "100%", height: "100%", minHeight: { xs: 240, md: 390 }, objectFit: "cover" }} /></Box>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rotulo>01 / VISÃO GERAL</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>O que é um sistema de sprinklers?</Typography>
            <Typography sx={texto}>O sistema de sprinklers automáticos é composto por uma rede de tubulações pressurizadas que libera água quando o elemento termossensível do chuveiro é acionado pelo calor. Em sistemas convencionais, cada chuveiro opera individualmente na área afetada, contribuindo para controlar o incêndio em seu estágio inicial. É amplamente utilizado em edificações industriais, comerciais e de grande porte.</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>02 / INFRAESTRUTURA</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Conheça a anatomia do sistema</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Explore o esquema técnico ilustrativo. Selecione os pontos numerados para conhecer os componentes.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 3, alignItems: "stretch" }}>
            <EsquemaTecnico ativo={componenteAtivo} onSelecionar={setComponenteAtivo}/>
            <Box sx={{ bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "20px", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Rotulo>COMPONENTE {String(componenteAtivo+1).padStart(2,"0")} / 06</Rotulo>
              <Typography component="h3" sx={{ ...titulo, fontSize: { xs: 22, md: 27 }, mb: 2 }}>{componentes[componenteAtivo].nome}</Typography>
              <Typography sx={{ ...texto, mb: 3 }}>{componentes[componenteAtivo].detalhe}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{componentes.map((item,i)=><Button key={item.nome} onClick={()=>setComponenteAtivo(i)} aria-label={`Mostrar ${item.nome}`} variant={i===componenteAtivo?"contained":"outlined"} sx={{ minWidth: 40, height: 40, borderRadius: "10px", bgcolor: i===componenteAtivo?LARANJA:"transparent", borderColor: "#dbe4eb", color: i===componenteAtivo?"#fff":AZUL, fontWeight: 800, "&:hover":{bgcolor:i===componenteAtivo?"#e95b00":"#f0f4f7",borderColor:LARANJA} }}>{String(i+1).padStart(2,"0")}</Button>)}</Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>03 / SOLUÇÕES</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Quatro configurações. Diferentes aplicações.</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Selecione o tipo de sistema para entender seu princípio de funcionamento.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>{tipos.map((item,i)=><Button key={item.nome} onClick={()=>setTipoAtivo(i)} variant={i===tipoAtivo?"contained":"outlined"} sx={{ borderRadius: "999px", px: 2.5, py: 1.1, textTransform: "none", fontWeight: 800, bgcolor: i===tipoAtivo?AZUL:"#fff", color: i===tipoAtivo?"#fff":AZUL, borderColor: "#dce5eb", "&:hover":{bgcolor:i===tipoAtivo?"#123550":"#eaf0f4",borderColor:AZUL} }}>{item.nome}</Button>)}</Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3, bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "22px", p: { xs: 2, md: 3 } }}>
            <EsquemaTecnico ativo={1} onSelecionar={()=>{}} tipo={tipoAtivo}/>
            <Box sx={{ p: { xs: 1, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "center" }}><Rotulo>CONFIGURAÇÃO {String(tipoAtivo+1).padStart(2,"0")} / 04</Rotulo><Typography component="h3" sx={{ ...titulo, fontSize: { xs: 24, md: 30 }, mb: 2 }}>{tipos[tipoAtivo].nome}</Typography><Typography sx={{ ...texto, mb: 2 }}>{tipos[tipoAtivo].descricao}</Typography><Typography sx={{ ...texto, color: AZUL }}>{tipos[tipoAtivo].detalhe}</Typography><Chip label="Ilustração conceitual" size="small" sx={{ mt: 3, alignSelf: "flex-start", bgcolor: "#eef3f6", color: "#536b7d" }}/></Box>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 5, md: 8 }, mb: { xs: 6, md: 9 }, borderTop: "1px solid #dce5eb", pt: { xs: 5, md: 7 } }}>
          <Box><Rotulo>04 / CRITÉRIOS TÉCNICOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Engenharia orientada por normas</Typography><Typography sx={{ ...texto, mb: 3 }}>Os projetos são desenvolvidos considerando a ABNT NBR 10897, com critérios de dimensionamento, pressão, densidade de descarga e espaçamento dos chuveiros. Quando aplicável, também são avaliadas as interfaces com sistemas de hidrantes (ABNT NBR 13714), detecção e alarme (ABNT NBR 17240) e referências internacionais como a NFPA 13. Os requisitos finais dependem da ocupação, dos riscos e das exigências locais vigentes.</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{["ABNT NBR 10897","ABNT NBR 13714","ABNT NBR 17240","NFPA 13"].map(n=><Chip key={n} label={n} sx={{ bgcolor: "#e7edf2", color: AZUL, fontWeight: 700 }}/>)}</Box></Box>
          <Box><Rotulo>05 / BENEFÍCIOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Proteção que faz diferença</Typography><Box sx={{ display: "grid", gap: 2.2 }}>{beneficios.map(item=><Box key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}><CheckCircleOutlineRoundedIcon sx={{ color: LARANJA, fontSize: 22, mt: .35, flexShrink: 0 }}/><Typography sx={texto}>{item}</Typography></Box>)}</Box></Box>
        </Box>
      </Container>
      <Box sx={{ bgcolor: AZUL, py: { xs: 8, md: 11 } }}><Container maxWidth="lg"><Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 4 }}><Box sx={{ maxWidth: 650 }}><Rotulo>SOLUÇÕES PERSONALIZADAS</Rotulo><Typography component="h2" sx={{ color: "#fff", fontSize: { xs: 29, md: 40 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-.035em", mb: 2 }}>Precisa de um projeto de sprinklers?</Typography><Typography sx={{ color: "#b9c8d6", fontSize: 15, lineHeight: 1.8 }}>Conte sua necessidade para a CatoTech. Podemos avaliar uma solução adequada à sua edificação.</Typography></Box><Button onClick={irParaCotacao} endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: LARANJA, color: "#fff", borderRadius: "999px", px: 4, py: 1.8, fontWeight: 800, fontSize: 13, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: "#e95b00", boxShadow: "none" } }}>Solicitar meu orçamento</Button></Box></Container></Box>
    </Box>
  );
}
