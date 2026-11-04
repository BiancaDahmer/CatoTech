

import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

  Box,

  Container,

  Typography,

  Button,

  TextField,

  MenuItem,

  InputAdornment,

  Chip,

  Alert, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,

  Stack, Switch, FormControlLabel, ToggleButton, ToggleButtonGroup,

} from "@mui/material";

import SearchRoundedIcon from "@mui/icons-material/SearchRounded";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import ArrowOutwardRoundedIcon from "@mui/icons-material/ArrowOutwardRounded";

import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";

import TuneRoundedIcon from "@mui/icons-material/TuneRounded";

import { supabase, supabaseConfigurado } from "../lib/supabaseClient";

import usePerfilUsuario from "../hooks/usePerfilUsuario";

import hidraulico from "../assets/img/hidraulico.jpg";

import estrutura from "../assets/img/estrutura.jpg";

import skid from "../assets/img/skid.jpg";

import mecanismo from "../assets/img/mecanismo.jpg";

import tubo from "../assets/img/tubo.jpg";

import mesa from "../assets/img/mesa.jpg";

const LARANJA = "#ff650d";

const AZUL = "#061a2e";

const produtosOriginais = [

  {

    id: 1,

    nome: "Sistema Hidráulico",

    especificacao: "380V • 250 BAR • 60 L/MIN",

    categoria: "Hidráulica",

    imagem: hidraulico,

  },

  {

    id: 2,

    nome: "Estrutura Metálica Personalizada",

    especificacao: "Estruturas Sob Medidas para Diversas Aplicações",

    categoria: "Estrutural",

    imagem: estrutura,

  },

  {

    id: 3,

    nome: "Skid Bombas",

    especificacao: "Sistema Completo e Compacto para Bombeamento de Água",

    categoria: "Bombas",

    imagem: skid,

  },

  {

    id: 4,

    nome: "Mecanismo Mecânico",

    especificacao: "Elaboração de Mecanismos Personalizados",

    categoria: "Mecanismo",

    imagem: mecanismo,

  },

  {

    id: 5,

    nome: "Tubos Calandrados",

    especificacao: "Calandra de Tubo de 1/2 até 2.1/2",

    categoria: "Tubos",

    imagem: tubo,

  },

  {

    id: 6,

    nome: "Mesa Elevatória",

    especificacao: "Acionada por Fuso Manual",

    categoria: "Estrutural",

    imagem: mesa,

  },

];

const categorias = [

  "Todos",

  "Hidráulica",

  "Estrutural",

  "Bombas",

  "Tubos",

  "Mecanismo",

];

// Formatação monetária em centavos: 6500000 => R$ 65.000,00.

const formatarMoedaDigitada = (entrada) => {

  const digitos = String(entrada || "").replace(/\D/g, "");

  if (!digitos) return "";

  return (Number(digitos) / 100).toLocaleString("pt-BR", {

    style: "currency", currency: "BRL",

  });

};

const CAMPOS_TECNICOS_SUGERIDOS = [

  ["dimensoes", "Dimensões"], ["peso", "Peso"],

  ["material", "Material"], ["pressao", "Pressão"],

  ["vazao", "Vazão"], ["tensao", "Tensão"],

];

export default function CatalogoProdutos() {

  const navigate = useNavigate();

  const [busca, setBusca] = useState("");

  const [categoria, setCategoria] = useState("Todos");

  const { usuario, carregando: carregandoPerfil } = usePerfilUsuario();

  const podeGerenciar = usuario?.role === "engenheiro" || usuario?.role === "admin";

  const [produtosBanco, setProdutosBanco] = useState([]);

  const [carregandoProdutos, setCarregandoProdutos] = useState(true);

  const [erroBanco, setErroBanco] = useState("");

  const [aviso, setAviso] = useState("");

  const [modalAberto, setModalAberto] = useState(false);

  const [editandoId, setEditandoId] = useState(null);
  const [editandoOriginalId, setEditandoOriginalId] = useState(null);

  
  const [salvando, setSalvando] = useState(false);

  const [imagemArquivo, setImagemArquivo] = useState(null);

  const [imagemPreview, setImagemPreview] = useState("");

  const [modoImagem, setModoImagem] = useState("url");

  const [outraCategoria, setOutraCategoria] = useState("");

  const [especificacoesTecnicas, setEspecificacoesTecnicas] = useState([]);

  const [formulario, setFormulario] = useState({ nome: "", especificacao: "", descricao: "", categoria: "Hidráulica", imagem_url: "", ativo: true });

  const carregarProdutos = async () => {

    if (!supabaseConfigurado) {

      setErroBanco("Supabase não configurado. Os produtos originais continuam disponíveis.");

      setCarregandoProdutos(false);

      return;

    }

    setCarregandoProdutos(true);

    const { data, error } = await supabase.from("produtos_catalogo")

      .select("id,produto_original_id,nome,especificacao,descricao,especificacoes,categoria,imagem_url,ativo,criado_em")

      .order("criado_em", { ascending: false });

    if (error) {

      setErroBanco(`Não foi possível carregar os produtos cadastrados: ${error.message}`);

    } else {

      setErroBanco("");

      setProdutosBanco(data || []);

    }

    setCarregandoProdutos(false);

  };

  useEffect(() => { carregarProdutos(); }, []);

  const produtos = useMemo(() => {

    const alteracoes = new Map(produtosBanco.filter((item) => item.produto_original_id != null)

      .map((item) => [Number(item.produto_original_id), item]));

    const originais = produtosOriginais.map((original) => {

      const alterado = alteracoes.get(original.id);

      return alterado ? {

        ...original, ...alterado, id: original.id,

        imagem: alterado.imagem_url || original.imagem,

        imagem_url: alterado.imagem_url || "",

        cadastrado: true, originalId: original.id, registroId: alterado.id,

      } : {

        ...original, ativo: true, originalId: original.id,

        imagem_url: "", descricao: "", especificacoes: {},

      };

    }).filter((item) => item.ativo || podeGerenciar);

    const novos = produtosBanco.filter((item) => item.produto_original_id == null)

      .filter((item) => item.ativo || podeGerenciar)

      .map((item) => ({ ...item, imagem: item.imagem_url || "", cadastrado: true }));

    return [...originais, ...novos];

  }, [produtosBanco, podeGerenciar]);

  const categoriasDisponiveis = useMemo(() => Array.from(new Set([

    ...categorias, ...produtosBanco.map((item) => item.categoria).filter(Boolean),

  ])), [produtosBanco]);

  const limparImagemTemporaria = () => {

    setImagemArquivo(null);

    setImagemPreview((anterior) => { if (anterior) URL.revokeObjectURL(anterior); return ""; });

    setModoImagem("url");

  };

  const abrirNovo = () => {

    limparImagemTemporaria();

    setOutraCategoria("");

    setEspecificacoesTecnicas([]);

    setEditandoId(null);
    setEditandoOriginalId(null);


    setFormulario({ nome: "", especificacao: "", descricao: "", categoria: "Hidráulica", imagem_url: "", ativo: true });

    setModalAberto(true);

    setAviso("");

  };

  const abrirEdicao = (produto) => {

    limparImagemTemporaria();

    setOutraCategoria("");

    setEspecificacoesTecnicas(Object.entries(produto.especificacoes || {}).map(([chave, valor]) => ({ chave, valor: String(valor), tipo: /^R\$\s/.test(String(valor)) ? "moeda" : "texto" })));

    setEditandoId(produto.registroId || (produto.originalId ? null : produto.id));
    setEditandoOriginalId(produto.originalId || null);


    setFormulario({ nome: produto.nome, especificacao: produto.especificacao || "", descricao: produto.descricao || "",

      categoria: produto.categoria, imagem_url: produto.imagem_url || "", ativo: produto.ativo });

    setModalAberto(true);

    setAviso("");

  };

  const salvarProduto = async () => {

    if (!podeGerenciar || !supabaseConfigurado) return;

    const categoriaFinal = formulario.categoria === "__outra__" ? outraCategoria.trim() : formulario.categoria.trim();

    if (!formulario.nome.trim() || !categoriaFinal) {

      setAviso("Informe o nome e a categoria do produto."); return;

    }

    const imagem = formulario.imagem_url.trim();

    if (modoImagem === "url" && imagem && !/^https:\/\//i.test(imagem)) {

      setAviso("A imagem deve utilizar um endereço HTTPS válido."); return;

    }

    setSalvando(true);

    setAviso("");

    let imagemFinal = imagem || null;

    let caminhoUpload = null;

    if (modoImagem === "arquivo" && imagemArquivo) {

      const { data: sessao } = await supabase.auth.getUser();

      if (!sessao?.user?.id) { setAviso("Sua sessão expirou. Entre novamente."); setSalvando(false); return; }

      const extensao = imagemArquivo.type === "image/png" ? "png" : imagemArquivo.type === "image/webp" ? "webp" : "jpg";

      caminhoUpload = `${sessao.user.id}/${crypto.randomUUID()}.${extensao}`;

      const upload = await supabase.storage.from("imagens-produtos").upload(caminhoUpload, imagemArquivo, {

        contentType: imagemArquivo.type, upsert: false, cacheControl: "3600",

      });

      if (upload.error) { setAviso(`Falha ao enviar imagem: ${upload.error.message}`); setSalvando(false); return; }

      imagemFinal = supabase.storage.from("imagens-produtos").getPublicUrl(caminhoUpload).data.publicUrl;

    }

    const registro = {
      ...(!editandoId && editandoOriginalId ? { produto_original_id: editandoOriginalId } : {}),

      nome: formulario.nome.trim(), especificacao: formulario.especificacao.trim(),

      categoria: categoriaFinal, imagem_url: imagemFinal, ativo: formulario.ativo,

      descricao: formulario.descricao.trim(),

      especificacoes: Object.fromEntries(especificacoesTecnicas.filter((item) => item.chave.trim() && item.valor.trim()).map((item) => [item.chave.trim(), item.valor.trim()])),

    };

    const resultado = editandoId

      ? await supabase.from("produtos_catalogo").update(registro).eq("id", editandoId).select("id")

      : await supabase.from("produtos_catalogo").insert(registro).select("id");

    setSalvando(false);

    if (resultado.error) { setAviso(`Não foi possível salvar: ${resultado.error.message}`); return; }

    if (!resultado.data?.length) { setAviso("Operação não autorizada. Verifique o perfil e as políticas RLS."); return; }

    setModalAberto(false);

    limparImagemTemporaria();

    await carregarProdutos();

  };

  const alterarAtivo = async (produto) => {

    if (!podeGerenciar || !window.confirm(`${produto.ativo ? "Desativar" : "Reativar"} ${produto.nome}?`)) return;

    let resultado;

    if (produto.originalId && !produto.registroId) {

      resultado = await supabase.from("produtos_catalogo").insert({

        produto_original_id: produto.originalId, nome: produto.nome,

        especificacao: produto.especificacao || "", descricao: produto.descricao || "",

        especificacoes: produto.especificacoes || {}, categoria: produto.categoria,

        imagem_url: null, ativo: false,

      }).select("id");

    } else {

      resultado = await supabase.from("produtos_catalogo")

        .update({ ativo: !produto.ativo }).eq("id", produto.registroId || produto.id).select("id");

    }

    if (resultado.error || !resultado.data?.length) {

      setAviso(resultado.error?.message || "Operação não autorizada."); return;

    }

    await carregarProdutos();

  };

  const excluirProduto = async (produto) => {

    if (!podeGerenciar || !window.confirm(

      `Excluir permanentemente "${produto.nome}"? Esta ação não poderá ser desfeita.`

    )) return;

    if (produto.originalId) {

      setAviso("Produtos originais não podem ser excluídos definitivamente. Use Desativar.");

      return;

    }

    const { data, error } = await supabase.from("produtos_catalogo")

      .delete().eq("id", produto.id).select("id");

    if (error || !data?.length) {

      setAviso(error?.message || "Exclusão não autorizada pelas políticas RLS."); return;

    }

    await carregarProdutos();

  };

  const produtosFiltrados = useMemo(() => {

    const termo = busca.trim().toLocaleLowerCase("pt-BR");

    return produtos.filter((produto) => {

      const correspondeCategoria =

        categoria === "Todos" ||

        produto.categoria === categoria;

      const texto = [

        produto.nome,

        produto.especificacao,

        produto.categoria,

      ].join(" ").toLocaleLowerCase("pt-BR");

      return correspondeCategoria && texto.includes(termo);

    });

  }, [busca, categoria, produtos]);

  const limparFiltros = () => {

    setBusca("");

    setCategoria("Todos");

  };

  return (

    <Box

      sx={{

        minHeight: "100vh",

        backgroundColor: "#f5f7f8",

        color: AZUL,

        fontFamily: "'Manrope', Arial, sans-serif",

      }}

    >

      {/* APRESENTAÇÃO DO CATÁLOGO */}

      <Box

        sx={{

          background:

            "linear-gradient(125deg, #061a2e 0%, #0b2a44 100%)",

          pt: { xs: 17, md: 20 },

          pb: { xs: 9, md: 12 },

          position: "relative",

          overflow: "hidden",

        }}

      >

        <Box

          sx={{

            position: "absolute",

            width: 400,

            height: 400,

            borderRadius: "50%",

            right: -160,

            top: -170,

            border: "1px solid rgba(255,255,255,.08)",

            boxShadow:

              "0 0 0 65px rgba(255,255,255,.015), 0 0 0 130px rgba(255,255,255,.015)",

            pointerEvents: "none",

          }}

        />

        <Container maxWidth="lg" sx={{ position: "relative" }}>

          <Typography

            sx={{

              color: LARANJA,

              fontSize: 12,

              fontWeight: 800,

              letterSpacing: 2.5,

              mb: 2,

            }}

          >

            CATOTECH / CATÁLOGO

          </Typography>

          <Typography

            component="h1"

            sx={{

              color: "#fff",

              fontSize: { xs: 36, sm: 46, md: 60 },

              fontWeight: 800,

              letterSpacing: "-.045em",

              lineHeight: 1.12,

              maxWidth: 740,

              mb: 3,

            }}

          >

            Soluções para cada{" "}

            <Box component="span" sx={{ color: LARANJA }}>

              desafio.

            </Box>

          </Typography>

          <Typography

            sx={{

              color: "#c4d0db",

              maxWidth: 590,

              fontSize: { xs: 15, md: 17 },

              lineHeight: 1.85,

            }}

          >

            Explore nossos produtos, equipamentos e soluções

            de engenharia mecânica para diferentes

            necessidades e aplicações.

          </Typography>

        </Container>

      </Box>

      {/* CATÁLOGO E FILTROS */}

      <Container

        maxWidth="lg"

        sx={{

          pt: { xs: 3, md: 4 },

          pb: { xs: 9, md: 13 },

        }}

      >

        <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

          <Box>

          <Typography

            sx={{

              color: LARANJA,

              fontSize: 11,

              letterSpacing: 2,

              fontWeight: 800,

              mb: 1.5,

            }}

          >

            EXPLORE NOSSAS SOLUÇÕES

          </Typography>

          <Typography

            component="h2"

            sx={{

              fontSize: { xs: 27, md: 36 },

              fontWeight: 800,

              letterSpacing: "-.035em",

              mb: 1,

            }}

          >

            Nosso catálogo

          </Typography>

          <Typography sx={{ color: "#647487", fontSize: 14 }}>

            Encontre a solução ideal para o seu projeto.

          </Typography>

          </Box>

          {podeGerenciar && (

            <Button variant="contained" onClick={abrirNovo}

              sx={{ bgcolor: LARANJA, borderRadius: "999px", textTransform: "none",

                fontWeight: 800, "&:hover": { bgcolor: "#e95b00" } }}>

              + Novo produto

            </Button>

          )}

        </Box>

        {erroBanco && <Alert severity="warning" sx={{ mb: 3 }}>{erroBanco}</Alert>}

        {aviso && <Alert severity="error" onClose={() => setAviso("")} sx={{ mb: 3 }}>{aviso}</Alert>}

        {carregandoPerfil || carregandoProdutos ? <Box sx={{ mb: 2 }}><CircularProgress size={20} /></Box> : null}

        {/* PESQUISA */}

        <Box

          sx={{

            display: "grid",

            gridTemplateColumns: {

              xs: "1fr",

              md: "minmax(0, 2fr) minmax(220px, 1fr)",

            },

            gap: 2,

            mb: 3,

          }}

        >

          <TextField

            fullWidth

            placeholder="Buscar produtos ou soluções..."

            value={busca}

            onChange={(event) => setBusca(event.target.value)}

            inputProps={{ "aria-label": "Buscar produtos" }}

            InputProps={{

              startAdornment: (

                <InputAdornment position="start">

                  <SearchRoundedIcon sx={{ color: "#82909e" }} />

                </InputAdornment>

              ),

            }}

            sx={{

              "& .MuiOutlinedInput-root": {

                backgroundColor: "#fff",

                borderRadius: "999px",

                minHeight: 56,

                "& fieldset": {

                  borderColor: "#dce3e9",

                },

                "&:hover fieldset": {

                  borderColor: "#aab8c5",

                },

                "&.Mui-focused fieldset": {

                  borderColor: LARANJA,

                },

              },

            }}

          />

          <TextField

            select

            fullWidth

            value={categoria}

            onChange={(event) => setCategoria(event.target.value)}

            SelectProps={{

              displayEmpty: true,

              renderValue: (value) =>

                value === "Todos" ? "Todas as categorias" : value,

            }}

            InputProps={{

              startAdornment: (

                <InputAdornment position="start">

                  <TuneRoundedIcon sx={{ color: LARANJA }} />

                </InputAdornment>

              ),

            }}

            sx={{

              "& .MuiOutlinedInput-root": {

                backgroundColor: "#fff",

                borderRadius: "999px",

                minHeight: 56,

                "& fieldset": {

                  borderColor: "#dce3e9",

                },

                "&:hover fieldset": {

                  borderColor: "#aab8c5",

                },

                "&.Mui-focused fieldset": {

                  borderColor: LARANJA,

                },

              },

            }}

          >

            {categoriasDisponiveis.map((item) => (

              <MenuItem key={item} value={item}>

                {item === "Todos" ? "Todas as categorias" : item}

              </MenuItem>

            ))}

          </TextField>

        </Box>

        {/* FILTROS RÁPIDOS */}

        <Box

          sx={{

            display: "flex",

            flexWrap: "wrap",

            gap: 1,

            mb: 5,

          }}

        >

          {categoriasDisponiveis.map((item) => {

            const ativo = categoria === item;

            return (

              <Chip

                key={item}

                label={item}

                clickable

                onClick={() => setCategoria(item)}

                sx={{

                  height: 36,

                  borderRadius: "999px",

                  px: 1,

                  fontWeight: 600,

                  fontSize: 12,

                  backgroundColor: ativo ? AZUL : "#fff",

                  color: ativo ? "#fff" : "#516172",

                  border: ativo

                    ? "1px solid transparent"

                    : "1px solid #dce3e9",

                  "&:hover": {

                    backgroundColor: ativo ? "#123451" : "#e9eef2",

                  },

                }}

              />

            );

          })}

        </Box>

        <Box

          sx={{

            display: "flex",

            justifyContent: "space-between",

            alignItems: "center",

            gap: 2,

            mb: 3,

          }}

        >

          <Typography

            sx={{

              fontSize: 14,

              fontWeight: 700,

              color: AZUL,

            }}

          >

            {produtosFiltrados.length}{" "}

            {produtosFiltrados.length === 1

              ? "produto encontrado"

              : "produtos encontrados"}

          </Typography>

          {(busca || categoria !== "Todos") && (

            <Button

              onClick={limparFiltros}

              sx={{

                textTransform: "none",

                color: LARANJA,

                fontWeight: 700,

              }}

            >

              Limpar filtros

            </Button>

          )}

        </Box>

        {/* CARDS DE PRODUTOS */}

        <Box

          sx={{

            display: "grid",

            gridTemplateColumns: {

              xs: "1fr",

              sm: "repeat(2, minmax(0, 1fr))",

              lg: "repeat(3, minmax(0, 1fr))",

            },

            gap: 3,

          }}

        >

          {produtosFiltrados.map((produto) => (

            <Box

              key={produto.id}

              sx={{

                backgroundColor: "#fff",

                border: "1px solid #e4e9ee",

                borderRadius: "22px",

                overflow: "hidden",

                display: "flex",

                flexDirection: "column",

                minWidth: 0,

                transition:

                  "transform .3s ease, box-shadow .3s ease",

                "&:hover": {

                  transform: "translateY(-6px)",

                  boxShadow: "0 18px 45px rgba(6,26,46,.10)",

                },

                "&:hover .produto-imagem": {

                  transform: "scale(1.045)",

                },

              }}

            >

              <Box

                sx={{

                  height: { xs: 230, md: 245 },

                  backgroundColor: "#f8fafb",

                  overflow: "hidden",

                  position: "relative",

                }}

              >

                <Box

                  component="img"

                  className="produto-imagem"

                  src={produto.imagem}

                  alt={produto.nome}

                  loading="lazy"

                  sx={{

                    width: "100%",

                    height: "100%",

                    objectFit: "contain",

                    transition: "transform .5s ease",

                  }}

                />

                <Box

                  sx={{

                    position: "absolute",

                    top: 16,

                    left: 16,

                    backgroundColor: "rgba(255,255,255,.95)",

                    borderRadius: "999px",

                    px: 1.5,

                    py: 0.6,

                    fontSize: 10,

                    fontWeight: 800,

                    color: AZUL,

                  }}

                >

                  {produto.categoria}

                </Box>

              </Box>

              <Box

                sx={{

                  p: 3,

                  display: "flex",

                  flexDirection: "column",

                  flexGrow: 1,

                }}

              >

                <Typography

                  sx={{

                    color: LARANJA,

                    fontSize: 10,

                    letterSpacing: 1.5,

                    fontWeight: 800,

                    mb: 1,

                  }}

                >

                  CATOTECH / SOLUÇÕES

                </Typography>

                <Typography

                  component="h3"

                  sx={{

                    color: AZUL,

                    fontSize: 19,

                    fontWeight: 800,

                    lineHeight: 1.35,

                    mb: 1.5,

                  }}

                >

                  {produto.nome}

                </Typography>

                <Typography

                  sx={{

                    color: "#69798a",

                    fontSize: 13,

                    lineHeight: 1.75,

                    mb: 3,

                    flexGrow: 1,

                  }}

                >

                  {produto.especificacao}

                </Typography>

                <Button

                  fullWidth

                  endIcon={<ArrowOutwardRoundedIcon />}

                  onClick={() => navigate(`/produto/${produto.id}`)}

                  sx={{

                    color: AZUL,

                    border: "1px solid #dce4ea",

                    backgroundColor: "#f7f9fa",

                    borderRadius: "999px",

                    minHeight: 46,

                    textTransform: "none",

                    fontSize: 13,

                    fontWeight: 800,

                    justifyContent: "space-between",

                    px: 2.5,

                    boxShadow: "none",

                    "&:hover": {

                      backgroundColor: LARANJA,

                      color: "#fff",

                      borderColor: LARANJA,

                      boxShadow: "none",

                    },

                  }}

                >

                  Ver detalhes

                </Button>

                {podeGerenciar && (

                  <Stack direction="row" spacing={1} sx={{ mt: 2 }}>

                    <Button size="small" onClick={() => abrirEdicao(produto)} sx={{ textTransform: "none" }}>Editar</Button>

                    <Button size="small" color={produto.ativo ? "warning" : "success"}

                      onClick={() => alterarAtivo(produto)} sx={{ textTransform: "none" }}>

                      {produto.ativo ? "Desativar" : "Reativar"}

                    </Button>

                    {!produto.originalId && (
                    <Button size="small" color="error" onClick={() => excluirProduto(produto)}
                      sx={{ textTransform: "none" }}>Excluir</Button>
                  )}
                  {!produto.ativo && <Chip label="Inativo" size="small" />}

                  </Stack>

                )}

              </Box>

            </Box>

          ))}

        </Box>

        {/* NENHUM RESULTADO */}

        {produtosFiltrados.length === 0 && (

          <Box

            sx={{

              textAlign: "center",

              backgroundColor: "#fff",

              borderRadius: "22px",

              p: { xs: 5, md: 8 },

              border: "1px solid #e4e9ee",

            }}

          >

            <SearchRoundedIcon

              sx={{ fontSize: 42, color: "#9baab8", mb: 2 }}

            />

            <Typography

              sx={{ fontSize: 21, fontWeight: 800, mb: 1 }}

            >

              Nenhum produto encontrado

            </Typography>

            <Typography

              sx={{ color: "#718092", mb: 3 }}

            >

              Tente outro termo ou selecione uma categoria diferente.

            </Typography>

            <Button

              onClick={limparFiltros}

              sx={{

                backgroundColor: AZUL,

                color: "#fff",

                borderRadius: "999px",

                px: 3,

                py: 1.3,

                textTransform: "none",

                "&:hover": { backgroundColor: "#123451" },

              }}

            >

              Ver todos os produtos

            </Button>

          </Box>

        )}

      </Container>

      <Dialog open={modalAberto && podeGerenciar} onClose={() => !salvando && setModalAberto(false)}

        fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: "24px", overflow: "hidden", bgcolor: "#f5f7f8" } }}>

        <DialogTitle sx={{ bgcolor: AZUL, color: "#fff", px: 3.5, py: 3 }}>

          <Typography sx={{ color: LARANJA, fontSize: 11, letterSpacing: 2, fontWeight: 800, mb: 1 }}>CATOTECH / GESTÃO DE PRODUTOS</Typography>

          <Typography component="span" sx={{ fontSize: 24, fontWeight: 800 }}>{editandoId || editandoOriginalId ? "Editar produto" : "Cadastrar novo produto"}</Typography>

        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2.5, sm: 3.5 }, pt: "24px !important" }}>

          <Stack spacing={2.5} sx={{ "& .MuiOutlinedInput-root": { bgcolor: "#fff", borderRadius: "13px" }, "& .MuiInputLabel-root.Mui-focused": { color: LARANJA }, "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: `${LARANJA} !important` } }}>

            {aviso && <Alert severity="error">{aviso}</Alert>}

            <TextField label="Nome do produto" required value={formulario.nome} inputProps={{ maxLength: 160 }}

              onChange={(e) => setFormulario((v) => ({ ...v, nome: e.target.value }))} fullWidth />

            <TextField label="Especificação / descrição" multiline minRows={3} value={formulario.especificacao}

              onChange={(e) => setFormulario((v) => ({ ...v, especificacao: e.target.value }))} fullWidth />

                          <TextField label="Descrição detalhada do projeto" multiline minRows={4}

                value={formulario.descricao}

                onChange={(e) => setFormulario((v) => ({ ...v, descricao: e.target.value }))}

                helperText="Texto exibido na seção Sobre o projeto. Se ficar vazio, será usada a descrição resumida." fullWidth />

              <Box sx={{ bgcolor: "#fff", border: "1px solid #dce3e9", borderRadius: "14px", p: 2 }}>

                <Typography sx={{ color: AZUL, fontWeight: 800, mb: 0.5 }}>Especificações técnicas</Typography>

                <Typography sx={{ color: "#647487", fontSize: 12, mb: 2 }}>Use “Incluir campos técnicos sugeridos” para adicionar Dimensões, Peso, Material, Pressão, Vazão e Tensão. Para preços, selecione Moeda (R$); para medidas, mantenha Texto.</Typography>

                <Stack spacing={1.5}>

                  {especificacoesTecnicas.map((item, index) => (

                    <Box key={index} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "minmax(0,1fr) minmax(0,1fr)" }, gap: 1, p: 1.3, border: "1px solid #e5ebf0", borderRadius: "12px", bgcolor: "#f8fafb" }}>

                      <TextField size="small" label="Característica" value={item.chave}

                        placeholder="Ex.: Peso, Material, Preço"

                        onChange={(e) => setEspecificacoesTecnicas((v) => v.map((x, i) => i === index ? { ...x, chave: e.target.value } : x))} />

                      <TextField size="small" select label="Formato do valor" value={item.tipo || "texto"}

                        onChange={(e) => setEspecificacoesTecnicas((v) => v.map((x, i) => i === index ? { ...x, tipo: e.target.value, valor: "" } : x))}>

                        <MenuItem value="texto">Texto / medida técnica</MenuItem>

                        <MenuItem value="moeda">Moeda (R$)</MenuItem>

                      </TextField>

                      <TextField size="small" label={item.tipo === "moeda" ? "Valor (R$)" : "Descrição"}

                        value={item.valor} fullWidth

                        placeholder={item.tipo === "moeda" ? "R$ 0,00" : "Ex.: 150 kg, aço inoxidável"}

                        inputProps={item.tipo === "moeda" ? { inputMode: "numeric" } : undefined}

                        onChange={(e) => setEspecificacoesTecnicas((v) => v.map((x, i) => i === index ? {

                          ...x, valor: x.tipo === "moeda" ? formatarMoedaDigitada(e.target.value) : e.target.value,

                        } : x))} />

                      <Button color="error" size="small" onClick={() => setEspecificacoesTecnicas((v) => v.filter((_, i) => i !== index))}

                        sx={{ textTransform: "none", justifySelf: "start" }}>Remover</Button>

                    </Box>

                  ))}

                  <Button variant="text" onClick={() => setEspecificacoesTecnicas((atual) => {

                    const existentes = new Set(atual.map((item) => item.chave.trim().toLocaleLowerCase("pt-BR")));

                    return [...atual, ...CAMPOS_TECNICOS_SUGERIDOS.filter(([chave, rotulo]) =>

                      !existentes.has(chave.toLocaleLowerCase("pt-BR")) && !existentes.has(rotulo.toLocaleLowerCase("pt-BR"))

                    ).map(([chave]) => ({ chave, valor: "", tipo: "texto" }))];

                  })} sx={{ alignSelf: "flex-start", textTransform: "none", color: AZUL, fontWeight: 800 }}>

                    + Incluir campos técnicos sugeridos

                  </Button>

                  <Button variant="outlined" onClick={() => setEspecificacoesTecnicas((v) => [...v, { chave: "", valor: "", tipo: "texto" }])}

                    sx={{ alignSelf: "flex-start", borderColor: LARANJA, color: AZUL, borderRadius: "999px", textTransform: "none", fontWeight: 800 }}>+ Adicionar especificação</Button>

                </Stack>

              </Box>

<TextField select label="Categoria" required value={categoriasDisponiveis.includes(formulario.categoria) ? formulario.categoria : "__outra__"}

              onChange={(e) => { const valor = e.target.value; setFormulario((v) => ({ ...v, categoria: valor })); if (valor !== "__outra__") setOutraCategoria(""); }} fullWidth>

              {categoriasDisponiveis.filter((c) => c !== "Todos").map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}

              <MenuItem value="__outra__" sx={{ color: LARANJA, fontWeight: 800 }}>+ Outra categoria</MenuItem>

            </TextField>

            {(formulario.categoria === "__outra__" || !categoriasDisponiveis.includes(formulario.categoria)) && (

              <TextField label="Nome da nova categoria" required value={outraCategoria || (!categoriasDisponiveis.includes(formulario.categoria) && formulario.categoria !== "__outra__" ? formulario.categoria : "")}

                onChange={(e) => setOutraCategoria(e.target.value)} inputProps={{ maxLength: 80 }} helperText="A categoria aparecerá automaticamente nos filtros após salvar." fullWidth />

            )}

            <Box>

              <Typography sx={{ fontWeight: 800, color: AZUL, mb: 1.3, fontSize: 14 }}>Imagem do produto</Typography>

              <ToggleButtonGroup exclusive fullWidth size="small" value={modoImagem} onChange={(_, valor) => { if (valor) setModoImagem(valor); }}

                sx={{ mb: 2, "& .MuiToggleButton-root": { textTransform: "none", fontWeight: 700, borderRadius: "12px", py: 1.1 }, "& .Mui-selected": { color: `${AZUL} !important`, bgcolor: "#e5ecf3 !important" } }}>

                <ToggleButton value="url">Informar URL</ToggleButton>

                <ToggleButton value="arquivo">Anexar imagem</ToggleButton>

              </ToggleButtonGroup>

              {modoImagem === "url" ? (

                <TextField label="URL da imagem (HTTPS)" value={formulario.imagem_url}

                  onChange={(e) => setFormulario((v) => ({ ...v, imagem_url: e.target.value }))} fullWidth />

              ) : (

                <Box sx={{ border: "2px dashed #b9c9d7", borderRadius: "16px", bgcolor: "#fff", p: 2.5, textAlign: "center" }}>

                  <Button component="label" startIcon={<CloudUploadRoundedIcon />} variant="outlined"

                    sx={{ borderColor: LARANJA, color: AZUL, textTransform: "none", borderRadius: "999px", fontWeight: 800 }}>

                    Escolher imagem do computador

                    <input hidden type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => {

                      const arquivo = e.target.files?.[0];

                      if (!arquivo) return;

                      if (!["image/jpeg", "image/png", "image/webp"].includes(arquivo.type) || arquivo.size > 5 * 1024 * 1024) {

                        setAviso("Selecione JPG, PNG ou WebP com até 5 MB."); return;

                      }

                      setImagemArquivo(arquivo); setImagemPreview((anterior) => { if (anterior) URL.revokeObjectURL(anterior); return URL.createObjectURL(arquivo); }); setAviso("");

                    }} />

                  </Button>

                  <Typography sx={{ mt: 1, fontSize: 12, color: "#647487" }}>{imagemArquivo?.name || "JPG, PNG ou WebP • máximo 5 MB"}</Typography>

                  {imagemPreview && <Box component="img" src={imagemPreview} alt="Prévia do produto" sx={{ display: "block", mt: 2, mx: "auto", maxWidth: "100%", maxHeight: 190, objectFit: "contain", borderRadius: 2 }} />}

                  {!imagemArquivo && formulario.imagem_url && <Typography sx={{ mt: 1, fontSize: 12, color: "#647487" }}>Se não escolher um novo arquivo, a imagem atual será mantida.</Typography>}

                </Box>

              )}

            </Box>

            <FormControlLabel control={<Switch checked={formulario.ativo} sx={{ "& .MuiSwitch-switchBase.Mui-checked": { color: LARANJA }, "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: LARANJA } }}

              onChange={(e) => setFormulario((v) => ({ ...v, ativo: e.target.checked }))} />}

              label="Produto ativo (visível ao público)" />

          </Stack>

        </DialogContent>

        <DialogActions sx={{ px: 3.5, pb: 3, gap: 1 }}>

          <Button disabled={salvando} onClick={() => setModalAberto(false)} sx={{ textTransform: "none", color: AZUL, fontWeight: 800 }}>Cancelar</Button>

          <Button disabled={salvando} variant="contained" onClick={salvarProduto}

            sx={{ bgcolor: LARANJA, borderRadius: "999px", px: 3, py: 1.3, textTransform: "none", fontWeight: 800, "&:hover": { bgcolor: "#e95b00" } }}>

            {salvando ? "Salvando..." : "Salvar produto"}

          </Button>

        </DialogActions>

      </Dialog>

      {/* CHAMADA FINAL */}

      <Box

        sx={{

          backgroundColor: AZUL,

          py: { xs: 8, md: 11 },

        }}

      >

        <Container maxWidth="lg">

          <Box

            sx={{

              display: "flex",

              flexDirection: { xs: "column", md: "row" },

              justifyContent: "space-between",

              alignItems: { xs: "flex-start", md: "center" },

              gap: 4,

            }}

          >

            <Box sx={{ maxWidth: 630 }}>

              <Typography

                sx={{

                  color: LARANJA,

                  fontSize: 11,

                  fontWeight: 800,

                  letterSpacing: 2,

                  mb: 2,

                }}

              >

                SOLUÇÕES PERSONALIZADAS

              </Typography>

              <Typography

                component="h2"

                sx={{

                  color: "#fff",

                  fontSize: { xs: 29, md: 40 },

                  fontWeight: 800,

                  lineHeight: 1.2,

                  letterSpacing: "-.035em",

                  mb: 2,

                }}

              >

                Não encontrou o que procura?

              </Typography>

              <Typography

                sx={{

                  color: "#b9c8d6",

                  fontSize: 15,

                  lineHeight: 1.8,

                }}

              >

                Conte sua necessidade para a CatoTech.

                Podemos avaliar uma solução personalizada

                para o seu projeto.

              </Typography>

            </Box>

            <Button

              onClick={() => navigate("/cotacao")}

              endIcon={<ArrowForwardRoundedIcon />}

              sx={{

                backgroundColor: LARANJA,

                color: "#fff",

                borderRadius: "999px",

                px: 4,

                py: 1.8,

                fontWeight: 800,

                fontSize: 13,

                textTransform: "none",

                whiteSpace: "nowrap",

                boxShadow: "none",

                "&:hover": {

                  backgroundColor: "#e95b00",

                  boxShadow: "none",

                },

              }}

            >

              Solicitar orçamento

            </Button>

          </Box>

        </Container>

      </Box>

    </Box>

  );

}
