import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate } from "react-router-dom";
import serviceImg from "../assets/img/hidrante.jpg";

const AZUL = "#061a2e";
const LARANJA = "#ff650d";
const TEXTO = "#607287";
const componentes = [
  { nome: "Reservatórios e bombas", detalhe: "Abastecimento e pressurização para atender às condições hidráulicas exigidas pelo projeto." },
  { nome: "Tubulações e colunas", detalhe: "Rede de distribuição que conduz a água aos pontos de hidrante." },
  { nome: "Abrigos e recalque", detalhe: "Abrigos para equipamentos e conexão de recalque, conforme a configuração prevista." },
  { nome: "Mangueiras e esguichos", detalhe: "Acessórios de combate selecionados de acordo com o sistema especificado." },
  { nome: "Comando das bombas", detalhe: "Painéis e dispositivos para partida, supervisão e operação dos conjuntos motobomba." },
  { nome: "Ensaios e instrumentação", detalhe: "Manômetros, válvulas e pontos de teste para inspeção e manutenção." }
];
const tipos = [
  { nome: "Levantamento de risco", descricao: "Análise da ocupação, da edificação e dos critérios de proteção.", detalhe: "Define as premissas e o alcance do projeto." },
  { nome: "Cálculo hidráulico", descricao: "Dimensionamento de vazão, pressão, tubulações, bombas e reservatórios.", detalhe: "Permite avaliar o desempenho hidráulico requerido." },
  { nome: "Traçado e localização", descricao: "Definição de percursos de rede e posicionamento de pontos de hidrante.", detalhe: "Busca cobertura e acessibilidade conforme critérios aplicáveis." },
  { nome: "Documentação técnica", descricao: "Plantas, detalhes, memoriais e responsabilidade técnica pertinente.", detalhe: "Organiza os documentos para execução e análise." }
];
const beneficios = [
  "Abastecimento e pressão dimensionados para o risco",
  "Maior segurança operacional para equipes treinadas",
  "Traçado de rede planejado para a edificação",
  "Documentação técnica para implantação e manutenção",
  "Adequação aos critérios normativos aplicáveis"
];
const titulo = { color: AZUL, fontSize: { xs: 25, md: 34 }, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.2 };
const texto = { color: TEXTO, fontSize: 15, lineHeight: 1.9 };
function Rotulo({ children }) { return <Typography sx={{ color: LARANJA, fontSize: 11, fontWeight: 800, letterSpacing: 2, mb: 1.5 }}>{children}</Typography>; }

// Modelo 3D simplificado: representação conceitual, não é um projeto executivo.
function ModeloHidrantes3D({ ativo, onSelecionar }) {
  const area = useRef(null);
  const selecionarRef = useRef(onSelecionar);
  const ativoRef = useRef(ativo);
  const destacarRef = useRef(() => {});
  useEffect(() => { selecionarRef.current = onSelecionar; }, [onSelecionar]);
  useEffect(() => { ativoRef.current = ativo; destacarRef.current(ativo); }, [ativo]);

  useEffect(() => {
    const el = area.current;
    if (!el) return;
    let renderer;
    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color("#0b2236");
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
      camera.position.set(9, 7, 11);
      const canvasRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer = canvasRenderer;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      el.appendChild(renderer.domElement);
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.075;
      controls.minDistance = 7;
      controls.maxDistance = 23;
      controls.maxPolarAngle = Math.PI / 2.05;
      controls.target.set(0, 1.4, 0);
      controls.update();

      scene.add(new THREE.HemisphereLight("#dcefff", "#314153", 2.1));
      const sun = new THREE.DirectionalLight("#ffffff", 3.0);
      sun.position.set(-4, 10, 8);
      scene.add(sun);
      const rim = new THREE.DirectionalLight("#ff7b39", 1.2);
      rim.position.set(6, 5, -6);
      scene.add(rim);

      const mat = (color, metalness = .2, roughness = .4) =>
        new THREE.MeshStandardMaterial({ color, metalness, roughness });
      const red = mat("#e34d29", .38), redBright = mat("#ff702d", .38);
      const steel = mat("#9db3c2", .65), pale = mat("#dbe7ed", .42);
      const dark = mat("#254354", .35), water = mat("#4fa8d0", .15, .24);
      const orange = mat("#ff650d", .25);
      const groups = Array.from({length:6},()=>new THREE.Group());
      groups.forEach(g=>scene.add(g));
      const base = new THREE.Mesh(new THREE.BoxGeometry(12.4,.18,7),mat("#173449",.25,.7));
      base.position.y=-.12; scene.add(base);
      const grid = new THREE.GridHelper(12,12,"#36546a","#29465a");
      grid.position.y=.01;scene.add(grid);

      function box(parent,w,h,d,x,y,z,material) {
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
        mesh.position.set(x,y,z);parent.add(mesh);return mesh;
      }
      function cyl(parent,r1,r2,h,x,y,z,material,rotation) {
        const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,28),material);
        mesh.position.set(x,y,z);
        if(rotation) mesh.rotation.set(...rotation);
        parent.add(mesh);return mesh;
      }
      function pipe(parent,points,r=.105,material=red) {
        for(let i=1;i<points.length;i++){
          const p=new THREE.Vector3(...points[i-1]);
          const q=new THREE.Vector3(...points[i]);
          const d=new THREE.Vector3().subVectors(q,p);
          const tube=new THREE.Mesh(new THREE.CylinderGeometry(r,r,d.length(),18),material);
          tube.position.copy(p).add(q).multiplyScalar(.5);
          tube.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
          parent.add(tube);
          const elbow=new THREE.Mesh(new THREE.SphereGeometry(r,14,12),material);
          elbow.position.copy(q);parent.add(elbow);
        }
      }
      // 01 Reservatório vertical com indicação de volume de água.
      cyl(groups[0],1.05,1.05,2.6,-4.3,1.35,-.7,steel);
      cyl(groups[0],1.07,1.07,.12,-4.3,2.68,-.7,pale);
      cyl(groups[0],1.07,1.07,.12,-4.3,.08,-.7,dark);
      cyl(groups[0],1.055,1.055,.65,-4.3,.55,-.7,water);
      // 02 Rede hidráulica e colunas.
      pipe(groups[1],[[-3.2,.55,-.7],[-1.85,.55,-.7],[-1.85,1.05,-.7],[.7,1.05,-.7],[.7,2.65,-.7],[3.3,2.65,-.7],[3.3,1.7,-.7]],.13,redBright);
      pipe(groups[1],[[.7,2.65,-.7],[.7,2.65,1.5],[2.5,2.65,1.5]],.095,red);
      // 03 Abrigo e tomada de recalque.
      box(groups[2],1.4,2.15,.55,3.4,1.25,-.7,pale);
      box(groups[2],1.15,1.85,.05,3.4,1.25,-.39,red);
      // 04 Mangueira enrolada e esguicho.
      const reel=new THREE.Mesh(new THREE.TorusGeometry(.43,.075,12,44),pale);
      reel.position.set(3.4,1.38,-.33);groups[3].add(reel);
      const reel2=new THREE.Mesh(new THREE.TorusGeometry(.29,.062,12,44),pale);
      reel2.position.set(3.4,1.38,-.28);groups[3].add(reel2);
      pipe(groups[3],[[3.4,.97,-.29],[3.75,.77,-.29]],.055,pale);
      // 05 Painel de comando de bombas.
      box(groups[4],1.05,1.2,.48,-.95,.72,2.05,steel);
      box(groups[4],.85,.75,.035,-.95,.84,2.31,dark);
      for(let i=0;i<3;i++) {
        const led=new THREE.Mesh(new THREE.SphereGeometry(.07,12,10),i===0?mat("#4ce8aa"):i===1?orange:pale);
        led.position.set(-1.19+i*.24,.94,2.34);groups[4].add(led);
      }
      // 06 Bomba, motor e manômetro.
      box(groups[5],2.0,.16,1.2,-1.9,.18,-.7,dark);
      cyl(groups[5],.52,.52,.95,-1.9,.75,-.7,steel,[0,0,Math.PI/2]);
      cyl(groups[5],.42,.42,.18,-1.9,.75,-.7,red,[0,0,Math.PI/2]);
      cyl(groups[5],.33,.33,.78,-2.55,.73,-.7,dark,[0,0,Math.PI/2]);
      pipe(groups[5],[[-1.8,1.05,-.7],[-1.8,1.78,-.7]],.06,steel);
      cyl(groups[5],.24,.24,.08,-1.8,1.85,-.7,pale,[Math.PI/2,0,0]);
      // Hit targets for mouse/touch selection, grouped by component.
      const hit = [];
      const targets=[
        [-4.3,1.4,-.7,2.1,2.9,2.1],
        [.6,2,-.7,4.8,1.1,1.0],
        [3.4,1.3,-.7,1.5,2.2,.8],
        [3.4,1.4,-.27,1.0,1.1,.4],
        [-.95,.8,2.05,1.1,1.4,.8],
        [-1.9,.85,-.7,2.1,1.8,1.4]
      ];
      targets.forEach(([x,y,z,w,h,d],index)=>{
        const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),
          new THREE.MeshBasicMaterial({visible:false}));
        mesh.position.set(x,y,z);mesh.userData.index=index;
        scene.add(mesh);hit.push(mesh);
      });
      const selectedRings=groups.map((group,i)=>{
        const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.035,10,32),orange);
        ring.rotation.x=Math.PI/2;
        const anchors=[[-4.3,2.95,-.7],[.7,3.1,-.7],[3.4,2.6,-.7],
          [3.4,1.4,.04],[-.95,1.55,2.05],[-1.9,2.25,-.7]];
        ring.position.set(...anchors[i]);scene.add(ring);return ring;
      });
      destacarRef.current=index=>selectedRings.forEach((ring,i)=>{
        ring.visible=i===index;
        groups[i].scale.setScalar(i===index?1.025:1);
      });
      destacarRef.current(ativoRef.current);
      const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
      let down=null;
      function pointerDown(e){down={x:e.clientX,y:e.clientY};}
      function pointerUp(e){
        if(!down||Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)return;
        const rect=renderer.domElement.getBoundingClientRect();
        mouse.set(((e.clientX-rect.left)/rect.width)*2-1,
          -((e.clientY-rect.top)/rect.height)*2+1);
        raycaster.setFromCamera(mouse,camera);
        const found=raycaster.intersectObjects(hit,false);
        if(found.length)selecionarRef.current(found[0].object.userData.index);
      }
      renderer.domElement.addEventListener("pointerdown",pointerDown);
      renderer.domElement.addEventListener("pointerup",pointerUp);
      const resize=()=>{
        const w=el.clientWidth,h=el.clientHeight;
        if(!w||!h)return;
        camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
      };
      const observer=new ResizeObserver(resize);observer.observe(el);resize();
      let frame,alive=true;
      const animate=()=>{
        if(!alive)return;
        frame=requestAnimationFrame(animate);
        controls.update();renderer.render(scene,camera);
      };
      animate();
      return ()=>{
        alive=false;cancelAnimationFrame(frame);observer.disconnect();
        renderer.domElement.removeEventListener("pointerdown",pointerDown);
        renderer.domElement.removeEventListener("pointerup",pointerUp);
        controls.dispose();
        scene.traverse(obj=>{
          if(obj.geometry)obj.geometry.dispose();
          if(obj.material){
            (Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose());
          }
        });
        renderer.dispose();renderer.domElement.remove();
        destacarRef.current=()=>{};
      };
    } catch(error) {
      console.error("Visualização 3D indisponível:",error);
      if(renderer){renderer.dispose();renderer.domElement?.remove();}
    }
  }, []);
  return (
    <Box sx={{bgcolor:"#0b2236",borderRadius:"20px",overflow:"hidden",position:"relative",height:{xs:330,md:420}}}>
      <Box ref={area} sx={{width:"100%",height:"100%",touchAction:"none","& canvas":{display:"block"}}}/>
      <Box sx={{position:"absolute",top:14,left:18,color:"#d9e9f2",fontSize:11,fontWeight:800,letterSpacing:1,pointerEvents:"none"}}>
        MODELO 3D • SISTEMA DE HIDRANTES
      </Box>
      <Box sx={{position:"absolute",bottom:12,left:18,right:18,color:"#b7cad7",fontSize:11,pointerEvents:"none"}}>
        Arraste para girar • Role para aproximar • Clique no equipamento para selecionar
      </Box>
    </Box>
  );
}

function EtapasProjeto({ ativo }) {
  return (
    <Box sx={{ bgcolor:"#0b2236", borderRadius:"20px", p:{xs:3,md:4}, display:"flex", flexDirection:"column", justifyContent:"center", minHeight:300 }}>
      <Typography sx={{ color:"#9bb5c6", fontSize:11, letterSpacing:2, fontWeight:800, mb:3 }}>FLUXO DE DESENVOLVIMENTO</Typography>
      <Box sx={{ display:"grid", gridTemplateColumns:"repeat(4,minmax(0,1fr))", gap:1, alignItems:"center", mb:3 }}>
        {["01","02","03","04"].map((n,i)=><Box key={n} sx={{ borderRadius:2, bgcolor:i===ativo?"#ff650d":"#19394e", border:"1px solid #426076", py:2, textAlign:"center", color:"#fff", fontSize:{xs:18,md:26}, fontWeight:800 }}>{n}</Box>)}
      </Box>
      <Box sx={{ width:"100%", height:4, bgcolor:"#34566b", borderRadius:4, overflow:"hidden", mb:3 }}>
        <Box sx={{ width:`${(ativo+1)*25}%`, height:"100%", bgcolor:"#ff650d", transition:"width .25s" }}/>
      </Box>
      <Typography sx={{ color:"#fff", fontSize:19, fontWeight:800 }}>{tipos[ativo].nome}</Typography>
      <Typography sx={{ color:"#b7cbd7", mt:1, lineHeight:1.7 }}>{tipos[ativo].descricao}</Typography>
    </Box>
  );
}

export default function Hidrante() {
  const navigate = useNavigate();
  const [componenteAtivo, setComponenteAtivo] = useState(0);
  const [tipoAtivo, setTipoAtivo] = useState(0);
  const irParaCotacao = () => navigate("/cotacao?area=hidrante&tipo=projeto");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f8", color: AZUL, fontFamily: "'Manrope', Arial, sans-serif" }}>
      <Box sx={{ background: "linear-gradient(125deg, #061a2e 0%, #0b2a44 100%)", pt: { xs: 17, md: 20 }, pb: { xs: 9, md: 12 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", right: -160, top: -170, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 0 65px rgba(255,255,255,.015), 0 0 0 130px rgba(255,255,255,.015)", pointerEvents: "none" }} />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Rotulo>CATOTECH / ENGENHARIA DE PROTEÇÃO CONTRA INCÊNDIO</Rotulo>
          <Typography component="h1" sx={{ color: "#fff", fontSize: { xs: 36, sm: 46, md: 60 }, fontWeight: 800, letterSpacing: "-.045em", lineHeight: 1.12, maxWidth: 850, mb: 3 }}>Sistema de <Box component="span" sx={{ color: LARANJA }}>Hidrantes</Box></Typography>
          <Typography sx={{ color: "#c4d0db", maxWidth: 690, fontSize: { xs: 15, md: 17 }, lineHeight: 1.85 }}>Dimensionamento hidráulico, traçado de redes, abrigos de mangueiras e especificação técnica para sistemas de combate a incêndio.</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 9, md: 13 } }}>
        <Rotulo>CONHEÇA A SOLUÇÃO</Rotulo>
        <Typography component="h2" sx={{ ...titulo, mb: 1 }}>Infraestrutura hidráulica para proteção da sua edificação.</Typography>
        <Typography sx={{ ...texto, mb: 4, maxWidth: 780 }}>Explore os componentes, as etapas e os critérios técnicos desta solução.</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, gap: 3, mb: { xs: 7, md: 10 }, alignItems: "stretch" }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", overflow: "hidden", minHeight: { xs: 240, md: 390 } }}><Box component="img" src={serviceImg} alt="Hidrante — ilustração fotográfica" sx={{ display: "block", width: "100%", height: "100%", minHeight: { xs: 240, md: 390 }, objectFit: "cover" }} /></Box>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rotulo>01 / VISÃO GERAL</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>O que é um sistema de hidrantes?</Typography>
            <Typography sx={texto}>O sistema de hidrantes disponibiliza água em vazão e pressão adequadas para operações de combate a incêndio por equipes treinadas. Seu projeto integra reservação, pressurização, tubulações, válvulas, mangueiras e pontos de utilização, conforme o risco e as exigências aplicáveis.</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>02 / INFRAESTRUTURA</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Explore os componentes técnicos</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Gire o modelo 3D, aproxime os equipamentos e clique para conhecer seus componentes. Representação conceitual, não executiva.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 3, alignItems: "stretch" }}>
            <ModeloHidrantes3D ativo={componenteAtivo} onSelecionar={setComponenteAtivo}/>
            <Box sx={{ bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "20px", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Rotulo>COMPONENTE {String(componenteAtivo+1).padStart(2,"0")} / 06</Rotulo>
              <Typography component="h3" sx={{ ...titulo, fontSize: { xs: 22, md: 27 }, mb: 2 }}>{componentes[componenteAtivo].nome}</Typography>
              <Typography sx={{ ...texto, mb: 3 }}>{componentes[componenteAtivo].detalhe}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{componentes.map((item,i)=><Button key={item.nome} onClick={()=>setComponenteAtivo(i)} aria-label={`Mostrar ${item.nome}`} variant={i===componenteAtivo?"contained":"outlined"} sx={{ minWidth: 40, height: 40, borderRadius: "10px", bgcolor: i===componenteAtivo?LARANJA:"transparent", borderColor: "#dbe4eb", color: i===componenteAtivo?"#fff":AZUL, fontWeight: 800, "&:hover":{bgcolor:i===componenteAtivo?"#e95b00":"#f0f4f7",borderColor:LARANJA} }}>{String(i+1).padStart(2,"0")}</Button>)}</Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>03 / DESENVOLVIMENTO</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Etapas do projeto de hidrantes</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Selecione uma etapa para conhecer o desenvolvimento técnico do projeto.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>{tipos.map((item,i)=><Button key={item.nome} onClick={()=>setTipoAtivo(i)} variant={i===tipoAtivo?"contained":"outlined"} sx={{ borderRadius: "999px", px: 2.5, py: 1.1, textTransform: "none", fontWeight: 800, bgcolor: i===tipoAtivo?AZUL:"#fff", color: i===tipoAtivo?"#fff":AZUL, borderColor: "#dce5eb", "&:hover":{bgcolor:i===tipoAtivo?"#123550":"#eaf0f4",borderColor:AZUL} }}>{item.nome}</Button>)}</Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3, bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "22px", p: { xs: 2, md: 3 } }}>
            <EtapasProjeto ativo={tipoAtivo}/>
            <Box sx={{ p: { xs: 1, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "center" }}><Rotulo>ETAPA {String(tipoAtivo+1).padStart(2,"0")} / 04</Rotulo><Typography component="h3" sx={{ ...titulo, fontSize: { xs: 24, md: 30 }, mb: 2 }}>{tipos[tipoAtivo].nome}</Typography><Typography sx={{ ...texto, mb: 2 }}>{tipos[tipoAtivo].descricao}</Typography><Typography sx={{ ...texto, color: AZUL }}>{tipos[tipoAtivo].detalhe}</Typography></Box>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 5, md: 8 }, mb: { xs: 6, md: 9 }, borderTop: "1px solid #dce5eb", pt: { xs: 5, md: 7 } }}>
          <Box><Rotulo>04 / CRITÉRIOS TÉCNICOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Engenharia orientada por normas</Typography><Typography sx={{ ...texto, mb: 3 }}>O dimensionamento considera a ABNT NBR 13714 e as instruções técnicas do Corpo de Bombeiros aplicáveis à ocupação e à localidade. Interfaces com outros sistemas devem ser verificadas conforme as normas pertinentes e o escopo contratado.</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{["ABNT NBR 13714", "Instruções do CBM", "Memorial hidráulico"].map(n=><Chip key={n} label={n} sx={{ bgcolor: "#e7edf2", color: AZUL, fontWeight: 700 }}/>)}</Box></Box>
          <Box><Rotulo>05 / BENEFÍCIOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Benefícios da solução</Typography><Box sx={{ display: "grid", gap: 2.2 }}>{beneficios.map(item=><Box key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}><CheckCircleOutlineRoundedIcon sx={{ color: LARANJA, fontSize: 22, mt: .35, flexShrink: 0 }}/><Typography sx={texto}>{item}</Typography></Box>)}</Box></Box>
        </Box>
      </Container>
      <Box sx={{ bgcolor: AZUL, py: { xs: 8, md: 11 } }}><Container maxWidth="lg"><Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 4 }}><Box sx={{ maxWidth: 650 }}><Rotulo>SOLUÇÕES PERSONALIZADAS</Rotulo><Typography component="h2" sx={{ color: "#fff", fontSize: { xs: 29, md: 40 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-.035em", mb: 2 }}>Precisa de um projeto de hidrantes?</Typography><Typography sx={{ color: "#b9c8d6", fontSize: 15, lineHeight: 1.8 }}>Conte sua necessidade para a CatoTech. Nossa equipe poderá avaliar a solução técnica adequada ao seu empreendimento.</Typography></Box><Button onClick={irParaCotacao} endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: LARANJA, color: "#fff", borderRadius: "999px", px: 4, py: 1.8, fontWeight: 800, fontSize: 13, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: "#e95b00", boxShadow: "none" } }}>Solicitar meu orçamento</Button></Box></Container></Box>
    </Box>
  );
}
