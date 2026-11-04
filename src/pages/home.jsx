import React, { useState } from "react";
import { Box, Typography, Button, Container, Modal, Fade, Divider, IconButton } from "@mui/material";
import { motion, useReducedMotion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import Footer from "../components/footer";
import heroImage from "../assets/img/industrial-hero.jpg";
import solutionImage from "../assets/img/industrial-solution.jpg";
import proj1 from "../assets/img/proj_mesa_elevatoria.jpg";
import proj2 from "../assets/img/skid.jpg";
import proj3 from "../assets/img/estrutura.jpg";
import proj4 from "../assets/img/proj_mecanismo.jpg";
import ppci from "../assets/img/ppci.jpg";
import hidrante from "../assets/img/hidrante.jpg";
import diluvio from "../assets/img/diluvio.jpg";
import sprinkler from "../assets/img/sprinkler.jpg";
import "./homePremium.css";

const highlights = [
  {icon: <PrecisionManufacturingOutlinedIcon />, title: "Soluções personalizadas", text: "Projetos sob medida para cada necessidade."},
  {icon: <VerifiedOutlinedIcon />, title: "Qualidade e precisão", text: "Atenção técnica a cada detalhe."},
  {icon: <SupportAgentOutlinedIcon />, title: "Atendimento próximo", text: "Comunicação clara em todas as etapas."},
  {icon: <EngineeringOutlinedIcon />, title: "Da ideia à solução", text: "Acompanhamento do conceito à entrega."}
];
const services = [
  {title:"PPCI Completo", desc:"Conheça as soluções e informações sobre prevenção e combate a incêndio.", image:ppci, route:"/projeto/ppci-completo"},
  {title:"Hidrantes", desc:"Projetos e soluções para sistemas de hidrantes.", image:hidrante, route:"/projeto/hidrante"},
  {title:"Sistema de Dilúvio", desc:"Conheça aplicações e detalhes dos sistemas de dilúvio.", image:diluvio, route:"/projeto/sistema-diluvio"},
  {title:"Sprinklers", desc:"Informações sobre soluções com chuveiros automáticos.", image:sprinkler, route:"/projeto/sprinklers"}
];
const steps = [
  ["01","Entendemos sua necessidade","Conversamos sobre o projeto e seus objetivos."],
  ["02","Desenvolvemos a solução","Definimos uma proposta técnica personalizada."],
  ["03","Executamos com atenção","Acompanhamos as etapas e os detalhes."],
  ["04","Entrega e acompanhamento","Mantemos um canal de comunicação com o cliente."]
];
export default function Home() {
 const navigate = useNavigate();
 const reduceMotion = useReducedMotion();
 const [openModal,setOpenModal]=useState(false);
 const [selectedProject,setSelectedProject]=useState(null);
 const handleOpenModal=(p)=>{setSelectedProject(p);setOpenModal(true)};
 const handleCloseModal=()=>{setOpenModal(false);setSelectedProject(null)};
 const handleVerModelos=()=>{navigate('/produtos');handleCloseModal()};
 const reveal={initial:reduceMotion?false:{opacity:0,y:35},whileInView:{opacity:1,y:0},viewport:{once:true,amount:.12},transition:{duration:.65}};
  const projetos = [
    {
      img: proj1,
      titulo: "Mesa Elevatória",
      descricao:
        "Estrutura robusta e segura, projetada para elevação e movimentação de cargas com precisão e estabilidade.",
      fichaTecnica: [
        { label: "Capacidade Máxima", valor: "2.000 kg" },
        { label: "Altura Máxima", valor: "1.500 mm" },
        { label: "Altura Mínima", valor: "300 mm" },
        { label: "Acionamento", valor: "Hidráulico" },
        { label: "Material", valor: "Aço carbono pintado" },
      ],
    },
    {
      img: proj2,
      titulo: "Skid Bombas",
      descricao:
        "Sistema modular montado em estrutura metálica para bombeamento de fluidos industriais, com montagem simplificada.",
      fichaTecnica: [
        { label: "Vazão", valor: "Até 500 m³/h" },
        { label: "Pressão Máxima", valor: "10 bar" },
        { label: "Motor", valor: "Elétrico trifásico" },
        { label: "Material da Base", valor: "Aço carbono" },
        { label: "Revestimento", valor: "Pintura epóxi industrial" },
      ],
    },
    {
      img: proj3,
      titulo: "Estrutura Metálica",
      descricao:
        "Projetos sob medida para galpões e suportes industriais, com cálculo estrutural e segurança certificada.",
      fichaTecnica: [
        { label: "Altura Máxima", valor: "12 m" },
        { label: "Material", valor: "Aço galvanizado" },
        { label: "Tipo de Montagem", valor: "Parafusada" },
        { label: "Tratamento", valor: "Zincagem a quente" },
        { label: "Durabilidade", valor: "Mais de 20 anos" },
      ],
    },
    {
      img: proj4,
      titulo: "Mecanismo Mecânico",
      descricao:
        "Componentes e sistemas de transmissão projetados para alta eficiência e longa vida útil.",
      fichaTecnica: [
        { label: "Tipo", valor: "Redutor e engrenagem" },
        { label: "Torque Máximo", valor: "1.200 Nm" },
        { label: "Precisão", valor: "0.02 mm" },
        { label: "Lubrificação", valor: "Óleo sintético industrial" },
        { label: "Material", valor: "Aço temperado" },
      ],
    },
  ];


 return <Box className="cato-premium">
 <section className="cato-hero" style={{'--hero-image':`url(${heroImage})`}}>
   <div className="cato-hero-photo" />
   <Container maxWidth="lg" className="cato-hero-inner">
    <motion.div initial={reduceMotion?false:{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:.85}} className="cato-hero-copy">
     <div className="cato-eyebrow">IDEIAS QUE SE TRANSFORMAM EM SOLUÇÕES</div>
     <h1>ENGENHARIA<br/><em>MECÂNICA</em> PARA<br/>UM FUTURO MAIS EFICIENTE</h1>
     <p>Projetos, soluções técnicas e produtos pensados para transformar necessidades em resultados.</p>
     <div className="cato-actions"><button className="cato-btn primary" onClick={()=>navigate('/cotacao')}>Solicitar Orçamento <ArrowForwardRoundedIcon/></button><button className="cato-btn outline" onClick={()=>document.getElementById('cato-services')?.scrollIntoView({behavior:reduceMotion?'auto':'smooth'})}>Conhecer nossas soluções</button></div>
    </motion.div>
   </Container>
 </section>
 <section className="cato-highlights"><Container maxWidth="lg"><div className="cato-highlights-grid">{highlights.map((x)=><motion.div {...reveal} className="cato-highlight" key={x.title}><span>{x.icon}</span><div><h3>{x.title}</h3><p>{x.text}</p></div></motion.div>)}</div></Container></section>
 <section id="cato-services" className="cato-solutions"><Container maxWidth="lg"><div className="cato-solution-grid"><motion.div {...reveal} className="cato-solution-copy"><div className="cato-eyebrow">NOSSAS SOLUÇÕES</div><h2>Projetos que unem<br/><em>técnica e inovação.</em></h2><p>Conheça nossas possibilidades em engenharia mecânica e encontre o melhor caminho para desenvolver sua ideia.</p><button className="cato-btn primary" onClick={()=>navigate('/produtos')}>Explorar produtos <ArrowForwardRoundedIcon/></button></motion.div><motion.div {...reveal} className="cato-solution-visual"><img src={solutionImage} alt="Componente mecânico e desenho técnico"/><div className="cato-overlay"><strong>Do conceito<br/>à realidade</strong><span>Ideias transformadas em soluções técnicas.</span></div></motion.div></div></Container></section>
 <section className="cato-services" id="areas-atuacao"><Container maxWidth="lg"><motion.div {...reveal} className="cato-section-head"><div><div className="cato-eyebrow">ÁREAS DE ATUAÇÃO</div><h2>Conheça nossas soluções</h2></div><button className="cato-text-link" onClick={()=>navigate('/produtos')}>Ver produtos <ArrowForwardRoundedIcon/></button></motion.div><div className="cato-service-grid">{services.map((s,i)=><motion.button {...reveal} transition={{duration:.6,delay:i*.07}} className="cato-service-card" key={s.route} onClick={()=>navigate(s.route)}><img src={s.image} alt=""/><span className="cato-service-gradient"/><span className="cato-service-copy"><strong>{s.title}</strong><small>{s.desc}</small></span><span className="cato-round-arrow"><ArrowForwardRoundedIcon/></span></motion.button>)}</div></Container></section>
 <section className="cato-process"><Container maxWidth="lg"><div className="cato-process-grid"><motion.div {...reveal}><div className="cato-eyebrow">COMO TRABALHAMOS</div><h2>Um processo claro<br/>para <em>grandes resultados.</em></h2><p>Da sua necessidade à entrega final, buscamos um processo eficiente, transparente e com suporte técnico.</p></motion.div><div className="cato-steps">{steps.map((s,i)=><motion.div {...reveal} className="cato-step" key={s[0]}><span className={'cato-step-number '+(i===0?'active':'')}>{s[0]}</span><strong>{s[1]}</strong><small>{s[2]}</small></motion.div>)}</div></div></Container></section>
 <section className="cato-portfolio" id="projetos-destaque"><Container maxWidth="lg"><motion.div {...reveal} className="cato-section-head"><div><div className="cato-eyebrow">PORTFÓLIO</div><h2>Projetos em destaque</h2></div><span>Selecione um projeto para visualizar sua ficha técnica</span></motion.div><div className="cato-portfolio-grid">{projetos.map((p,i)=><motion.button {...reveal} className="cato-portfolio-card" key={p.titulo} onClick={()=>handleOpenModal(p)}><img src={p.img} alt={p.titulo}/><span><strong>{p.titulo}</strong><small>Ver ficha técnica <ArrowForwardRoundedIcon fontSize="small"/></small></span></motion.button>)}</div></Container></section>
 <section className="cato-bottom"><Container maxWidth="lg"><motion.div {...reveal} className="cato-bottom-inner"><div><div className="cato-eyebrow">VAMOS CONVERSAR?</div><h2>Pronto para transformar<br/>seu projeto em <em>realidade?</em></h2><p>Conte sua necessidade e solicite um orçamento à CatoTech.</p></div><button className="cato-btn primary" onClick={()=>navigate('/cotacao')}>Solicitar Orçamento <ArrowForwardRoundedIcon/></button></motion.div></Container></section>
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        closeAfterTransition
        aria-labelledby="cato-ficha-titulo"
        aria-describedby="cato-ficha-descricao"
        slotProps={{ backdrop: { sx: { backgroundColor: 'rgba(1, 12, 23, .68)', backdropFilter: 'blur(7px)' } } }}
      >
        <Fade in={openModal} timeout={reduceMotion ? 0 : 300}>
          <Box
            sx={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'calc(100% - 32px)', maxWidth: 680,
              maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto',
              bgcolor: '#fff', color: '#071b2e', borderRadius: { xs: '18px', sm: '24px' },
              boxShadow: '0 28px 90px rgba(0,0,0,.35)', outline: 'none',
              '&::-webkit-scrollbar': { width: 7 },
              '&::-webkit-scrollbar-thumb': { background: '#b9c7d2', borderRadius: 10 },
            }}
          >
            {selectedProject && (
              <>
                <Box sx={{ bgcolor: '#071b2e', color: '#fff', p: { xs: 2.5, sm: 3.5 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                  <Box>
                    <Typography sx={{ color: '#ff650d', fontSize: 11, letterSpacing: 2, fontWeight: 800, mb: 1 }}>
                      CATOTECH / PROJETOS
                    </Typography>
                    <Typography id="cato-ficha-titulo" component="h2" sx={{ fontWeight: 800, fontSize: { xs: 23, sm: 29 }, lineHeight: 1.2 }}>
                      {selectedProject.titulo}
                    </Typography>
                    <Typography sx={{ color: '#c7d3df', fontSize: 13, mt: 1 }}>
                      Soluções em engenharia mecânica
                    </Typography>
                  </Box>
                  <IconButton aria-label="Fechar ficha técnica" onClick={handleCloseModal}
                    sx={{ color: '#fff', bgcolor: 'rgba(255,255,255,.10)', '&:hover': { bgcolor: 'rgba(255,255,255,.2)' }, flexShrink: 0 }}>
                    <CloseRoundedIcon />
                  </IconButton>
                </Box>

                <Box sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                  <Box sx={{ bgcolor: '#f3f6f8', borderRadius: '16px', height: { xs: 190, sm: 245 }, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', mb: 2.5 }}>
                    <Box component="img" src={selectedProject.img} alt={selectedProject.titulo}
                      sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 1, boxSizing: 'border-box' }} />
                  </Box>
                  <Typography id="cato-ficha-descricao" sx={{ color: '#506070', lineHeight: 1.75, fontSize: 14, mb: 3 }}>
                    {selectedProject.descricao}
                  </Typography>
                  <Divider sx={{ mb: 2.5, borderColor: '#e3e9ee' }} />
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, mb: 2 }}>
                    <DescriptionOutlinedIcon sx={{ color: '#ff650d', fontSize: 23 }} />
                    <Typography component="h3" sx={{ fontSize: 18, fontWeight: 800, color: '#071b2e' }}>
                      Especificações técnicas
                    </Typography>
                  </Box>
                  <Box sx={{ bgcolor: '#f3f6f8', borderRadius: '16px', px: { xs: 2, sm: 2.5 }, py: 1 }}>
                    {selectedProject.fichaTecnica?.map((item, idx) => (
                      <Box key={`${item.label}-${idx}`}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 2, py: 1.5 }}>
                          <Typography sx={{ color: '#5b6875', fontSize: 13 }}>{item.label}</Typography>
                          <Typography sx={{ color: '#071b2e', fontSize: 13, fontWeight: 700, textAlign: 'right' }}>{item.valor}</Typography>
                        </Box>
                        {idx < selectedProject.fichaTecnica.length - 1 && <Divider sx={{ borderColor: '#e0e7ec' }} />}
                      </Box>
                    ))}
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column-reverse', sm: 'row' }, gap: 1.5, mt: 3 }}>
                    <Button onClick={handleCloseModal} variant="outlined" fullWidth
                      sx={{ borderRadius: '999px', py: 1.5, color: '#071b2e', borderColor: '#cbd5dd', fontWeight: 700, textTransform: 'none', '&:hover': { borderColor: '#071b2e', bgcolor: '#f5f7f9' } }}>
                      Fechar
                    </Button>
                    <Button onClick={handleVerModelos} variant="contained" fullWidth endIcon={<ArrowForwardRoundedIcon />}
                      sx={{ borderRadius: '999px', py: 1.5, bgcolor: '#ff650d', color: '#fff', fontWeight: 700, textTransform: 'none', boxShadow: 'none', '&:hover': { bgcolor: '#e95700', boxShadow: 'none' } }}>
                      Verificar Modelos
                    </Button>
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>

 <Footer/>
 </Box>;
}
