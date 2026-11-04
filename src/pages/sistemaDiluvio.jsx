import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate } from "react-router-dom";
import serviceImg from "../assets/img/diluvio.jpg";

const AZUL = "#061a2e";
const LARANJA = "#ff650d";
const TEXTO = "#607287";
const componentes = [
  { nome: "Válvula dilúvio", detalhe: "Conjunto de controle que libera água para a rede após o acionamento previsto." },
  { nome: "Rede de distribuição", detalhe: "Tubulações dimensionadas para alimentar os pontos de descarga da área protegida." },
  { nome: "Bicos abertos", detalhe: "Dispositivos que distribuem água conforme o padrão de descarga especificado." },
  { nome: "Detecção e comando", detalhe: "Sistema responsável pelos sinais de acionamento, lógica e supervisão." },
  { nome: "Bombas e reservação", detalhe: "Fonte de abastecimento com capacidade e pressão adequadas ao cenário." },
  { nome: "Testes e instrumentação", detalhe: "Drenos, manômetros e acessórios para supervisão e ensaios operacionais." }
];
const tipos = [
  { nome: "Indústria química", descricao: "Áreas de processo com riscos específicos de propagação de incêndio.", detalhe: "A configuração depende dos materiais e cenários avaliados." },
  { nome: "Armazenamento de combustíveis", descricao: "Zonas de armazenamento e instalações com líquidos inflamáveis.", detalhe: "A solução deve considerar o risco e os objetivos de proteção." },
  { nome: "Transformadores", descricao: "Equipamentos elétricos e instalações que exigem análise de proteção especial.", detalhe: "O arranjo e os critérios dependem da instalação." },
  { nome: "Instalações industriais", descricao: "Áreas com necessidade de cobertura simultânea em zonas delimitadas.", detalhe: "O sistema é dimensionado para a área de projeto." }
];
const beneficios = [
  "Descarga simultânea na zona protegida",
  "Integração com detecção e acionamento supervisionado",
  "Aplicação em cenários de risco especial",
  "Cobertura hidráulica dimensionada para a área",
  "Possibilidade de inspeção e testes planejados"
];
const titulo = { color: AZUL, fontSize: { xs: 25, md: 34 }, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.2 };
const texto = { color: TEXTO, fontSize: 15, lineHeight: 1.9 };
function Rotulo({ children }) { return <Typography sx={{ color: LARANJA, fontSize: 11, fontWeight: 800, letterSpacing: 2, mb: 1.5 }}>{children}</Typography>; }

// Modelo 3D simplificado: representação conceitual, não é um projeto executivo.
function ModeloDiluvio3D({ ativo, onSelecionar }) {
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
      camera.position.set(11, 8, 13);
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
      controls.target.set(0, 1.5, 0);
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
      const red = mat("#e34d29", .38);
      const steel = mat("#9db3c2", .65), pale = mat("#dbe7ed", .42);
      const dark = mat("#254354", .35);
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
      // Conjunto de dilúvio isolado: alimentação, válvula principal, rede e bicos abertos.
      const green=mat("#24c58e",.18);
      const yellow=mat("#ffd16c",.2), flange=mat("#b5c7d1",.65);
      const redBright=mat("#ff6c3a",.42);
      const reservoir=groups[4];
      // 05 Reservatório e bomba centrífuga com motor e base.
      cyl(reservoir,.78,.78,2.15,-4.35,1.18,-1.25,steel);
      cyl(reservoir,.80,.80,.11,-4.35,2.31,-1.25,pale);
      cyl(reservoir,.80,.80,.11,-4.35,.12,-1.25,dark);
      box(reservoir,2.35,.18,1.05,-2.65,.16,-1.25,dark);
      cyl(reservoir,.40,.40,.96,-3.05,.73,-1.25,steel,[0,0,Math.PI/2]);
      cyl(reservoir,.44,.44,.28,-2.36,.73,-1.25,red,[0,0,Math.PI/2]);
      cyl(reservoir,.24,.24,.12,-2.18,.73,-1.25,flange,[0,0,Math.PI/2]);
      for(let i=0;i<7;i++) {
        const fin=box(reservoir,.045,.72,.72,-3.43+i*.12,.73,-1.25,flange);
        fin.rotation.x=0;
      }
      // 01 Válvula de dilúvio principal, corpo, câmaras e trim.
      const valve=groups[0];
      cyl(valve,.34,.34,1.05,-.55,1.08,-1.25,red);
      cyl(valve,.53,.53,.17,-.55,.54,-1.25,flange);
      cyl(valve,.53,.53,.17,-.55,1.62,-1.25,flange);
      cyl(valve,.41,.41,.27,-.55,1.77,-1.25,redBright);
      cyl(valve,.26,.26,.12,-.55,1.98,-1.25,flange);
      pipe(valve,[[-.55,1.8,-1.25],[-.55,2.25,-1.25],[.04,2.25,-1.25],[.04,1.10,-1.25]],.052,steel);
      cyl(valve,.20,.20,.12,.04,1.1,-1.25,flange);
      pipe(valve,[[-.55,.82,-1.25],[-1.18,.82,-1.25],[-1.18,1.45,-1.25]],.045,steel);
      cyl(valve,.19,.19,.10,-1.18,1.52,-1.25,pale,[Math.PI/2,0,0]);
      // 02 Rede de distribuição: coletor e ramais em vermelho.
      const network=groups[1];
      pipe(network,[[-2.12,.74,-1.25],[-1.85,.74,-1.25],[-1.85,.48,-1.25],[-.55,.48,-1.25]],.16,red);
      pipe(network,[[-.55,1.67,-1.25],[-.55,2.65,-1.25],[1.6,2.65,-1.25],[4.25,2.65,-1.25]],.14,redBright);
      pipe(network,[[1.65,2.65,-1.25],[1.65,2.65,1.45]],.105,red);
      pipe(network,[[4.1,2.65,-1.25],[4.1,2.65,1.45]],.105,red);
      // Braçadeiras, suportes e flanges.
      for(const x of [1.65,4.1]){
        box(network,.11,2.35,.11,x,1.24,-1.25,steel);
        cyl(network,.21,.21,.08,x,2.65,-1.25,flange,[0,0,Math.PI/2]);
      }
      // 03 Bicos abertos: três ramais com descarga demonstrativa opcional.
      const nozzles=groups[2];
      for(const [x,z] of [[1.65,-1.25],[4.1,-1.25],[1.65,1.45],[4.1,1.45]]){
        pipe(nozzles,[[x,2.65,z],[x,2.28,z]],.052,red);
        cyl(nozzles,.14,.20,.12,x,2.19,z,flange);
        cyl(nozzles,.10,.18,.09,x,2.10,z,pale);
        const deflector=cyl(nozzles,.21,.21,.025,x,1.98,z,flange);
        deflector.rotation.z=.05;
      }
      // 04 Detecção e comando: painel de acionamento e detector.
      const control=groups[3];
      box(control,1.0,1.42,.46,-.15,.91,2.0,steel);
      box(control,.80,.93,.04,-.15,1.03,2.25,dark);
      for(let i=0;i<3;i++){
        const led=new THREE.Mesh(new THREE.SphereGeometry(.075,12,10),i===0?green:i===1?yellow:red);
        led.position.set(-.42+i*.27,1.20,2.29);control.add(led);
      }
      box(control,.58,.14,.04,-.15,.70,2.29,red);
      cyl(control,.19,.19,.11,1.35,2.85,1.9,pale);
      cyl(control,.10,.10,.05,1.35,2.77,1.9,red);
      // 06 Instrumentação: manômetros e ramal de teste/dreno.
      const instruments=groups[5];
      pipe(instruments,[[-.55,1.40,-1.25],[-1.3,1.40,-1.25],[-1.3,1.95,-1.25]],.055,steel);
      cyl(instruments,.26,.26,.10,-1.3,2.02,-1.25,pale,[Math.PI/2,0,0]);
      pipe(instruments,[[.2,.72,-1.25],[.2,.34,-1.25],[.9,.34,-1.25]],.055,steel);
      cyl(instruments,.15,.15,.18,.65,.34,-1.25,red);
      const handle=box(instruments,.48,.055,.09,.65,.56,-1.25,orange);
      handle.rotation.y=.25;
      // Hit targets for mouse/touch selection, grouped by component.
      const hit = [];
      const targets=[
        [-.55,1.3,-1.25,1.1,1.65,1.15],
        [2.8,2.65,-1.25,3.8,.42,.6],
        [4.1,2.16,1.45,.75,.65,.8],
        [-.15,.91,2.0,1.15,1.55,.7],
        [-3.35,1.0,-1.25,3.8,2.5,1.8],
        [-1.3,2.02,-1.25,.65,.7,.55]
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
        const anchors=[[-.55,2.28,-1.25],[2.7,3.12,-1.25],
          [4.1,2.72,1.45],[-.15,1.87,2.0],[-4.35,2.7,-1.25],[-1.3,2.55,-1.25]];
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
        MODELO 3D • SISTEMA DILÚVIO
      </Box>
      <Box sx={{position:"absolute",bottom:12,left:18,right:18,color:"#b7cad7",fontSize:11,pointerEvents:"none"}}>
        Arraste para girar • Role para aproximar • Clique no equipamento para selecionar
      </Box>
    </Box>
  );
}

export default function SistemaDiluvio() {
  const navigate = useNavigate();
  const [componenteAtivo, setComponenteAtivo] = useState(0);
  const [tipoAtivo, setTipoAtivo] = useState(0);
  const irParaCotacao = () => navigate("/cotacao?area=sistema-diluvio&tipo=projeto");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f8", color: AZUL, fontFamily: "'Manrope', Arial, sans-serif" }}>
      <Box sx={{ background: "linear-gradient(125deg, #061a2e 0%, #0b2a44 100%)", pt: { xs: 17, md: 20 }, pb: { xs: 9, md: 12 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", right: -160, top: -170, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 0 65px rgba(255,255,255,.015), 0 0 0 130px rgba(255,255,255,.015)", pointerEvents: "none" }} />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Rotulo>CATOTECH / ENGENHARIA DE PROTEÇÃO CONTRA INCÊNDIO</Rotulo>
          <Typography component="h1" sx={{ color: "#fff", fontSize: { xs: 36, sm: 46, md: 60 }, fontWeight: 800, letterSpacing: "-.045em", lineHeight: 1.12, maxWidth: 850, mb: 3 }}>Sistema de <Box component="span" sx={{ color: LARANJA }}>Dilúvio</Box></Typography>
          <Typography sx={{ color: "#c4d0db", maxWidth: 690, fontSize: { xs: 15, md: 17 }, lineHeight: 1.85 }}>Proteção por descarga simultânea de água através de bicos abertos, indicada para aplicações de risco especial conforme avaliação técnica.</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 9, md: 13 } }}>
        <Rotulo>CONHEÇA A SOLUÇÃO</Rotulo>
        <Typography component="h2" sx={{ ...titulo, mb: 1 }}>Soluções de proteção para instalações de risco especial.</Typography>
        <Typography sx={{ ...texto, mb: 4, maxWidth: 780 }}>Explore os componentes, as etapas e os critérios técnicos desta solução.</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, gap: 3, mb: { xs: 7, md: 10 }, alignItems: "stretch" }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", overflow: "hidden", minHeight: { xs: 240, md: 390 } }}><Box component="img" src={serviceImg} alt="SistemaDiluvio — ilustração fotográfica" sx={{ display: "block", width: "100%", height: "100%", minHeight: { xs: 240, md: 390 }, objectFit: "cover" }} /></Box>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rotulo>01 / VISÃO GERAL</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>O que é um sistema dilúvio?</Typography>
            <Typography sx={texto}>Em um sistema dilúvio, os bicos de descarga permanecem abertos e a água é liberada por uma válvula principal comandada por lógica de detecção e acionamento. Quando a válvula abre, a descarga ocorre nos pontos da zona protegida, conforme a configuração hidráulica projetada.</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>02 / INFRAESTRUTURA</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Explore os componentes técnicos</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Gire o modelo 3D, aproxime e selecione os componentes do sistema dilúvio. Representação conceitual, não executiva.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 3, alignItems: "stretch" }}>
            <ModeloDiluvio3D ativo={componenteAtivo} onSelecionar={setComponenteAtivo}/>
            <Box sx={{ bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "20px", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Rotulo>COMPONENTE {String(componenteAtivo+1).padStart(2,"0")} / 06</Rotulo>
              <Typography component="h3" sx={{ ...titulo, fontSize: { xs: 22, md: 27 }, mb: 2 }}>{componentes[componenteAtivo].nome}</Typography>
              <Typography sx={{ ...texto, mb: 3 }}>{componentes[componenteAtivo].detalhe}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{componentes.map((item,i)=><Button key={item.nome} onClick={()=>setComponenteAtivo(i)} aria-label={`Mostrar ${item.nome}`} variant={i===componenteAtivo?"contained":"outlined"} sx={{ minWidth: 40, height: 40, borderRadius: "10px", bgcolor: i===componenteAtivo?LARANJA:"transparent", borderColor: "#dbe4eb", color: i===componenteAtivo?"#fff":AZUL, fontWeight: 800, "&:hover":{bgcolor:i===componenteAtivo?"#e95b00":"#f0f4f7",borderColor:LARANJA} }}>{String(i+1).padStart(2,"0")}</Button>)}</Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>03 / SOLUÇÕES</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Aplicações do sistema dilúvio</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Selecione uma aplicação para conhecer os cenários de uso.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>{tipos.map((item,i)=><Button key={item.nome} onClick={()=>setTipoAtivo(i)} variant={i===tipoAtivo?"contained":"outlined"} sx={{ borderRadius: "999px", px: 2.5, py: 1.1, textTransform: "none", fontWeight: 800, bgcolor: i===tipoAtivo?AZUL:"#fff", color: i===tipoAtivo?"#fff":AZUL, borderColor: "#dce5eb", "&:hover":{bgcolor:i===tipoAtivo?"#123550":"#eaf0f4",borderColor:AZUL} }}>{item.nome}</Button>)}</Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3, bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "22px", p: { xs: 2, md: 3 } }}>
            <Box sx={{minHeight:260,borderRadius:"18px",background:"linear-gradient(140deg,#102b40,#071b2e)",p:{xs:3,md:4},display:"flex",flexDirection:"column",justifyContent:"center",gap:2}}>
                <Typography sx={{color:"#ff650d",fontSize:11,fontWeight:800,letterSpacing:2}}>CENÁRIO DE APLICAÇÃO</Typography>
                {["Avaliação do risco e da área protegida","Definição do acionamento e da descarga","Dimensionamento hidráulico e seleção de equipamentos","Documentação, testes e comissionamento"].map((passo,i)=><Box key={passo} sx={{display:"flex",gap:2,alignItems:"center",color:"#dce8f0"}}><Box sx={{width:34,height:34,flexShrink:0,borderRadius:"50%",border:"1px solid #557286",display:"grid",placeItems:"center",color:i===tipoAtivo?"#ff650d":"#dce8f0",fontWeight:800,fontSize:12}}>{String(i+1).padStart(2,"0")}</Box><Typography sx={{fontSize:13,lineHeight:1.5}}>{passo}</Typography></Box>)}
              </Box>
            <Box sx={{ p: { xs: 1, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "center" }}><Rotulo>APLICAÇÃO {String(tipoAtivo+1).padStart(2,"0")} / 04</Rotulo><Typography component="h3" sx={{ ...titulo, fontSize: { xs: 24, md: 30 }, mb: 2 }}>{tipos[tipoAtivo].nome}</Typography><Typography sx={{ ...texto, mb: 2 }}>{tipos[tipoAtivo].descricao}</Typography><Typography sx={{ ...texto, color: AZUL }}>{tipos[tipoAtivo].detalhe}</Typography><Chip label="Aplicação sujeita à avaliação técnica" size="small" sx={{ mt: 3, alignSelf: "flex-start", bgcolor: "#eef3f6", color: "#536b7d" }}/></Box>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 5, md: 8 }, mb: { xs: 6, md: 9 }, borderTop: "1px solid #dce5eb", pt: { xs: 5, md: 7 } }}>
          <Box><Rotulo>04 / CRITÉRIOS TÉCNICOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Engenharia orientada por normas</Typography><Typography sx={{ ...texto, mb: 3 }}>O projeto considera referências pertinentes, como a NFPA 15 para sistemas fixos de aspersão de água, além das normas brasileiras e exigências locais aplicáveis ao risco. A seleção do sistema, sua atuação e seu desempenho dependem de avaliação técnica específica.</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{["NFPA 15", "Critérios de risco", "Exigências locais"].map(n=><Chip key={n} label={n} sx={{ bgcolor: "#e7edf2", color: AZUL, fontWeight: 700 }}/>)}</Box></Box>
          <Box><Rotulo>05 / BENEFÍCIOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Benefícios da solução</Typography><Box sx={{ display: "grid", gap: 2.2 }}>{beneficios.map(item=><Box key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}><CheckCircleOutlineRoundedIcon sx={{ color: LARANJA, fontSize: 22, mt: .35, flexShrink: 0 }}/><Typography sx={texto}>{item}</Typography></Box>)}</Box></Box>
        </Box>
      </Container>
      <Box sx={{ bgcolor: AZUL, py: { xs: 8, md: 11 } }}><Container maxWidth="lg"><Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 4 }}><Box sx={{ maxWidth: 650 }}><Rotulo>SOLUÇÕES PERSONALIZADAS</Rotulo><Typography component="h2" sx={{ color: "#fff", fontSize: { xs: 29, md: 40 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-.035em", mb: 2 }}>Precisa de um sistema dilúvio?</Typography><Typography sx={{ color: "#b9c8d6", fontSize: 15, lineHeight: 1.8 }}>Conte sua necessidade para a CatoTech. Nossa equipe poderá avaliar a solução técnica adequada ao seu empreendimento.</Typography></Box><Button onClick={irParaCotacao} endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: LARANJA, color: "#fff", borderRadius: "999px", px: 4, py: 1.8, fontWeight: 800, fontSize: 13, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: "#e95b00", boxShadow: "none" } }}>Solicitar meu orçamento</Button></Box></Container></Box>
    </Box>
  );
}
