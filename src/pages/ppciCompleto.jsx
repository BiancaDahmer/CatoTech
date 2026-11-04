import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Box, Container, Typography, Button, Chip } from "@mui/material";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useNavigate } from "react-router-dom";
import serviceImg from "../assets/img/ppci.jpg";

const AZUL = "#061a2e";
const LARANJA = "#ff650d";
const TEXTO = "#607287";
const componentes = [
  { nome: "Plantas e sinalização", detalhe: "Representação das medidas de segurança, rotas de fuga e localização dos equipamentos." },
  { nome: "Memorial descritivo", detalhe: "Descrição das soluções previstas e dos critérios de segurança adotados." },
  { nome: "Responsabilidade técnica", detalhe: "Documentação de ART ou RRT, conforme atribuição e exigências aplicáveis." },
  { nome: "Sistemas de combate", detalhe: "Indicação dos sistemas de hidrantes, extintores, sprinklers e demais recursos previstos." },
  { nome: "Detecção e alarme", detalhe: "Integração das soluções de aviso e detecção quando exigidas para a ocupação." },
  { nome: "Cálculos e documentos", detalhe: "Memórias de cálculo, laudos e demais documentos pertinentes ao processo." }
];
const tipos = [
  { nome: "Diagnóstico", descricao: "Levantamento das características, uso, riscos e situação da edificação.", detalhe: "Identifica requisitos e necessidades de adequação." },
  { nome: "Concepção", descricao: "Definição das medidas de segurança e soluções técnicas cabíveis.", detalhe: "Integra os sistemas previstos para a edificação." },
  { nome: "Documentação", descricao: "Elaboração de plantas, memoriais, cálculos e responsabilidade técnica.", detalhe: "Prepara o conjunto documental conforme o escopo." },
  { nome: "Acompanhamento", descricao: "Suporte técnico nas etapas de análise e ajustes documentais contratados.", detalhe: "A tramitação e a aprovação dependem do órgão competente." }
];
const beneficios = [
  "Visão integrada das medidas de proteção",
  "Organização técnica dos documentos e sistemas",
  "Orientação para adequação às exigências aplicáveis",
  "Maior clareza para execução das medidas previstas",
  "Acompanhamento técnico conforme o serviço contratado"
];
const titulo = { color: AZUL, fontSize: { xs: 25, md: 34 }, fontWeight: 800, letterSpacing: "-.035em", lineHeight: 1.2 };
const texto = { color: TEXTO, fontSize: 15, lineHeight: 1.9 };
function Rotulo({ children }) { return <Typography sx={{ color: LARANJA, fontSize: 11, fontWeight: 800, letterSpacing: 2, mb: 1.5 }}>{children}</Typography>; }

// Modelo 3D simplificado: representação conceitual, não é um projeto executivo.
function ModeloPPCI3D({ ativo, onSelecionar }) {
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
      controls.target.set(0, 1.55, 0);
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
      // Edificação industrial em corte, sem paredes frontais para visualização interna.
      const floor = mat("#a4b4bc",.15,.75);
      const wall = mat("#cbd7dc",.08,.8);
      const glass = new THREE.MeshStandardMaterial({color:"#b8e3f5",transparent:true,opacity:.24,side:THREE.DoubleSide});
      const green = mat("#20c58a",.1);
      const yellow = mat("#ffd16c",.1);
      const blue = mat("#65bce8",.3);
      // 01 Rotas de fuga, sinalização e planta da instalação.
      box(groups[0],8.4,.14,5.6,0,.12,0,floor);
      box(groups[0],8.4,2.8,.14,0,1.55,-2.75,wall);
      box(groups[0],.14,2.8,5.6,-4.2,1.55,0,wall);
      box(groups[0],8.4,.13,5.6,0,2.98,0,glass);
      for(let i=0;i<5;i++) box(groups[0],.09,2.5,.09,-3.4+i*1.7,1.55,-2.65,steel);
      box(groups[0],.8,.38,.08,2.65,2.12,-2.63,green);
      // Setas indicativas de fuga, piso e porta.
      for(let i=0;i<3;i++){
        const arrow=new THREE.Mesh(new THREE.ConeGeometry(.18,.42,3),green);
        arrow.rotation.x=-Math.PI/2;arrow.rotation.z=Math.PI/2;
        arrow.position.set(-2.6+i*1.4,.24,1.9);groups[0].add(arrow);
      }
      box(groups[0],.95,2.1,.09,3.3,1.18,-2.61,dark);
      // 02 Memoriais: mesa com desenhos técnicos ilustrativos.
      box(groups[1],1.8,.10,1.0,-1.4,.8,1.5,steel);
      for(const x of [-2.1,-.7])for(const z of [1.12,1.88])box(groups[1],.09,.7,.09,x,.4,z,dark);
      box(groups[1],1.18,.025,.72,-1.4,.88,1.5,pale);
      for(let i=0;i<5;i++)box(groups[1],.8,.012,.015,-1.4,.9,1.2+i*.12,blue);
      // 03 Responsabilidade técnica: painel de documentação.
      box(groups[2],1.2,1.35,.08,-3.8,1.65,.8,steel);
      box(groups[2],.96,1.13,.02,-3.73,1.65,.8,pale);
      for(let i=0;i<5;i++)box(groups[2],.72,.028,.015,-3.7,2.02-i*.15,.81,dark);
      // 04 Sistemas de combate: rede de sprinklers, hidrante e bomba.
      pipe(groups[3],[[-3.45,2.63,-1.75],[-.9,2.63,-1.75],[1.9,2.63,-1.75],[1.9,2.63,.7]],.085,red);
      for(const x of [-2.6,-.9,.8,1.9]){
        const z=x===1.9?.7:-1.75;
        pipe(groups[3],[[x,2.63,z],[x,2.37,z]],.045,red);
        cyl(groups[3],.13,.20,.09,x,2.31,z,steel);
      }
      box(groups[3],.95,1.35,.22,3.5,1.1,1.15,red);
      box(groups[3],.75,1.12,.045,3.5,1.1,1.28,pale);
      const reel=new THREE.Mesh(new THREE.TorusGeometry(.25,.06,12,36),red);
      reel.position.set(3.5,1.12,1.34);groups[3].add(reel);
      cyl(groups[3],.28,.28,.72,-3.35,.6,-1.75,steel,[0,0,Math.PI/2]);
      box(groups[3],1.2,.15,.8,-3.35,.2,-1.75,dark);
      // 05 Detecção e alarme.
      for(const x of [-1.8,1.7]){
        cyl(groups[4],.16,.16,.08,x,2.83,.85,pale);
        cyl(groups[4],.075,.075,.06,x,2.77,.85,red);
      }
      box(groups[4],.5,.7,.16,3.88,1.6,-1.45,red);
      box(groups[4],.3,.3,.02,3.88,1.68,-1.35,pale);
      // 06 Cálculos, painel e instrumentos.
      box(groups[5],1.0,1.35,.45,-2.2,.85,-2.05,steel);
      box(groups[5],.76,.82,.035,-2.2,.99,-1.78,dark);
      for(let i=0;i<3;i++){
        const led=new THREE.Mesh(new THREE.SphereGeometry(.055,12,10),i===0?green:i===1?yellow:red);
        led.position.set(-2.42+i*.22,1.15,-1.74);groups[5].add(led);
      }
      cyl(groups[5],.19,.19,.075,-2.2,1.48,-1.77,pale,[Math.PI/2,0,0]);
      // Hit targets for mouse/touch selection, grouped by component.
      const hit = [];
      const targets=[
        [2.65,2.12,-2.63,.85,.45,.4],
        [-1.4,.88,1.5,1.9,.25,1.1],
        [-3.73,1.65,.8,.35,1.4,1.2],
        [1.9,2.5,-1.75,5,.65,1.2],
        [3.88,1.6,-1.45,.7,.9,.5],
        [-2.2,.85,-2.05,1.2,1.5,.8]
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
        const anchors=[[2.65,2.5,-2.63],[-1.4,1.4,1.5],[-3.65,2.55,.8],
          [1.9,3.2,-1.75],[3.88,2.2,-1.45],[-2.2,1.8,-2.05]];
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
        MODELO 3D • PPCI COMPLETO
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

export default function PpciCompleto() {
  const navigate = useNavigate();
  const [componenteAtivo, setComponenteAtivo] = useState(0);
  const [tipoAtivo, setTipoAtivo] = useState(0);
  const irParaCotacao = () => navigate("/cotacao?area=ppci-completo&tipo=projeto");
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f5f7f8", color: AZUL, fontFamily: "'Manrope', Arial, sans-serif" }}>
      <Box sx={{ background: "linear-gradient(125deg, #061a2e 0%, #0b2a44 100%)", pt: { xs: 17, md: 20 }, pb: { xs: 9, md: 12 }, position: "relative", overflow: "hidden" }}>
        <Box sx={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", right: -160, top: -170, border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 0 0 65px rgba(255,255,255,.015), 0 0 0 130px rgba(255,255,255,.015)", pointerEvents: "none" }} />
        <Container maxWidth="lg" sx={{ position: "relative" }}>
          <Rotulo>CATOTECH / ENGENHARIA DE PROTEÇÃO CONTRA INCÊNDIO</Rotulo>
          <Typography component="h1" sx={{ color: "#fff", fontSize: { xs: 36, sm: 46, md: 60 }, fontWeight: 800, letterSpacing: "-.045em", lineHeight: 1.12, maxWidth: 850, mb: 3 }}>Projeto de <Box component="span" sx={{ color: LARANJA }}>PPCI</Box> Completo</Typography>
          <Typography sx={{ color: "#c4d0db", maxWidth: 690, fontSize: { xs: 15, md: 17 }, lineHeight: 1.85 }}>Planejamento integrado de prevenção e proteção contra incêndio, com documentação técnica orientada às exigências aplicáveis à sua edificação.</Typography>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ pt: { xs: 5, md: 7 }, pb: { xs: 9, md: 13 } }}>
        <Rotulo>CONHEÇA A SOLUÇÃO</Rotulo>
        <Typography component="h2" sx={{ ...titulo, mb: 1 }}>Planejamento técnico integrado para a segurança da sua edificação.</Typography>
        <Typography sx={{ ...texto, mb: 4, maxWidth: 780 }}>Explore os componentes, as etapas e os critérios técnicos desta solução.</Typography>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.05fr 1fr" }, gap: 3, mb: { xs: 7, md: 10 }, alignItems: "stretch" }}>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", overflow: "hidden", minHeight: { xs: 240, md: 390 } }}><Box component="img" src={serviceImg} alt="PpciCompleto — ilustração fotográfica" sx={{ display: "block", width: "100%", height: "100%", minHeight: { xs: 240, md: 390 }, objectFit: "cover" }} /></Box>
          <Box sx={{ bgcolor: "#fff", border: "1px solid #e4e9ee", borderRadius: "22px", p: { xs: 3, md: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Rotulo>01 / VISÃO GERAL</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>O que é um projeto de PPCI?</Typography>
            <Typography sx={texto}>O Plano de Prevenção e Proteção Contra Incêndio reúne medidas de segurança destinadas à proteção das pessoas, do patrimônio e à evacuação segura. O escopo é definido conforme a ocupação, as características da edificação e as regras do Corpo de Bombeiros competente.</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>02 / INFRAESTRUTURA</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Explore os componentes técnicos</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Gire o modelo 3D, aproxime e selecione os sistemas de segurança. Representação conceitual, não executiva.</Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.6fr 1fr" }, gap: 3, alignItems: "stretch" }}>
            <ModeloPPCI3D ativo={componenteAtivo} onSelecionar={setComponenteAtivo}/>
            <Box sx={{ bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "20px", p: { xs: 3, md: 4 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <Rotulo>COMPONENTE {String(componenteAtivo+1).padStart(2,"0")} / 06</Rotulo>
              <Typography component="h3" sx={{ ...titulo, fontSize: { xs: 22, md: 27 }, mb: 2 }}>{componentes[componenteAtivo].nome}</Typography>
              <Typography sx={{ ...texto, mb: 3 }}>{componentes[componenteAtivo].detalhe}</Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{componentes.map((item,i)=><Button key={item.nome} onClick={()=>setComponenteAtivo(i)} aria-label={`Mostrar ${item.nome}`} variant={i===componenteAtivo?"contained":"outlined"} sx={{ minWidth: 40, height: 40, borderRadius: "10px", bgcolor: i===componenteAtivo?LARANJA:"transparent", borderColor: "#dbe4eb", color: i===componenteAtivo?"#fff":AZUL, fontWeight: 800, "&:hover":{bgcolor:i===componenteAtivo?"#e95b00":"#f0f4f7",borderColor:LARANJA} }}>{String(i+1).padStart(2,"0")}</Button>)}</Box>
            </Box>
          </Box>
        </Box>
        <Box sx={{ mb: { xs: 8, md: 11 } }}>
          <Rotulo>03 / DESENVOLVIMENTO</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 1.5 }}>Etapas de desenvolvimento do PPCI</Typography>
          <Typography sx={{ ...texto, mb: 3 }}>Selecione uma etapa para conhecer o desenvolvimento técnico do PPCI.</Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 3 }}>{tipos.map((item,i)=><Button key={item.nome} onClick={()=>setTipoAtivo(i)} variant={i===tipoAtivo?"contained":"outlined"} sx={{ borderRadius: "999px", px: 2.5, py: 1.1, textTransform: "none", fontWeight: 800, bgcolor: i===tipoAtivo?AZUL:"#fff", color: i===tipoAtivo?"#fff":AZUL, borderColor: "#dce5eb", "&:hover":{bgcolor:i===tipoAtivo?"#123550":"#eaf0f4",borderColor:AZUL} }}>{item.nome}</Button>)}</Box>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.15fr 1fr" }, gap: 3, bgcolor: "#fff", border: "1px solid #e0e7ed", borderRadius: "22px", p: { xs: 2, md: 3 } }}>
            <EtapasProjeto ativo={tipoAtivo}/>
            <Box sx={{ p: { xs: 1, md: 3 }, display: "flex", flexDirection: "column", justifyContent: "center" }}><Rotulo>ETAPA {String(tipoAtivo+1).padStart(2,"0")} / 04</Rotulo><Typography component="h3" sx={{ ...titulo, fontSize: { xs: 24, md: 30 }, mb: 2 }}>{tipos[tipoAtivo].nome}</Typography><Typography sx={{ ...texto, mb: 2 }}>{tipos[tipoAtivo].descricao}</Typography><Typography sx={{ ...texto, color: AZUL }}>{tipos[tipoAtivo].detalhe}</Typography></Box>
          </Box>
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: { xs: 5, md: 8 }, mb: { xs: 6, md: 9 }, borderTop: "1px solid #dce5eb", pt: { xs: 5, md: 7 } }}>
          <Box><Rotulo>04 / CRITÉRIOS TÉCNICOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Engenharia orientada por normas</Typography><Typography sx={{ ...texto, mb: 3 }}>O PPCI deve observar a legislação estadual e as normas e instruções técnicas vigentes do Corpo de Bombeiros competente. Os requisitos variam conforme uso, área, altura, riscos e outras características da edificação; a aprovação não é automática.</Typography><Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>{["Legislação estadual", "Normas ABNT aplicáveis", "Corpo de Bombeiros"].map(n=><Chip key={n} label={n} sx={{ bgcolor: "#e7edf2", color: AZUL, fontWeight: 700 }}/>)}</Box></Box>
          <Box><Rotulo>05 / BENEFÍCIOS</Rotulo><Typography component="h2" sx={{ ...titulo, mb: 2 }}>Benefícios da solução</Typography><Box sx={{ display: "grid", gap: 2.2 }}>{beneficios.map(item=><Box key={item} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}><CheckCircleOutlineRoundedIcon sx={{ color: LARANJA, fontSize: 22, mt: .35, flexShrink: 0 }}/><Typography sx={texto}>{item}</Typography></Box>)}</Box></Box>
        </Box>
      </Container>
      <Box sx={{ bgcolor: AZUL, py: { xs: 8, md: 11 } }}><Container maxWidth="lg"><Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", alignItems: { xs: "flex-start", md: "center" }, gap: 4 }}><Box sx={{ maxWidth: 650 }}><Rotulo>SOLUÇÕES PERSONALIZADAS</Rotulo><Typography component="h2" sx={{ color: "#fff", fontSize: { xs: 29, md: 40 }, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-.035em", mb: 2 }}>Precisa elaborar ou atualizar seu PPCI?</Typography><Typography sx={{ color: "#b9c8d6", fontSize: 15, lineHeight: 1.8 }}>Conte sua necessidade para a CatoTech. Nossa equipe poderá avaliar a solução técnica adequada ao seu empreendimento.</Typography></Box><Button onClick={irParaCotacao} endIcon={<ArrowForwardRoundedIcon />} sx={{ bgcolor: LARANJA, color: "#fff", borderRadius: "999px", px: 4, py: 1.8, fontWeight: 800, fontSize: 13, textTransform: "none", whiteSpace: "nowrap", boxShadow: "none", "&:hover": { bgcolor: "#e95b00", boxShadow: "none" } }}>Solicitar meu orçamento</Button></Box></Container></Box>
    </Box>
  );
}
