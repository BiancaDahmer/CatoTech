import { useState, useMemo, useEffect } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";

import {

  Box,

  Container,

  Stepper,

  Step,

  StepLabel,

  Button,

  Typography,

  TextField,

  MenuItem,

  IconButton,

  Divider,

  Card,

  CardContent,

  InputAdornment,

  Grid,

  Tooltip,
  Alert,

  Chip,

} from "@mui/material";

import {

  Person,

  Business,

  Phone,

  LocationOn,

  Email,

  Numbers,

  ShoppingCart,

  Category,

  Description,

  MonetizationOn,

  Delete,

  AddCircle,

  AttachFile,

  InfoOutlined,

  VerifiedUserOutlined,

  AccessTimeOutlined,

  AssignmentTurnedInOutlined,

  SettingsOutlined,

  ArrowForward,

  ArrowBack,

} from "@mui/icons-material";

import { motion, AnimatePresence } from "framer-motion";

import { useNavigate, useLocation } from "react-router-dom";

import dayjs from "dayjs";

import bannerIndustrial from "../assets/img/bannerhome.jpg";

import { LocalizationProvider, DatePicker, TimePicker } from "@mui/x-date-pickers";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

export default function Cotacao() {

  const steps = ["Dados do Cliente", "Cotação", "Resumo", "Envio"];

  const [activeStep, setActiveStep] = useState(0);
  const [erroEtapa, setErroEtapa] = useState("");
  const [protocoloDemo, setProtocoloDemo] = useState("");
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const [dadosCliente, setDadosCliente] = useState({

    nome: "",

    cnpj: "",

    empresa: "",

    email: "",

    contato: "",

    cidade: "",

    estado: "",

    cep: "",

    numero: "",

    endereco: "",

    bairro: "",

    complemento: "",

  });

  const [itens, setItens] = useState([

    { produto: "", quantidade: "", unidade: "", descricao: "", valor: "", observacao: "", arquivo: "" },

  ]);

  const [areaSelecionada, setAreaSelecionada] = useState(null);

  const [tipoSelecionado, setTipoSelecionado] = useState(null);

  const [agData, setAgData] = useState(dayjs());

  const [agHora, setAgHora] = useState(dayjs());

  // 🔒 controla se o produto deve vir travado (consultoria vinda do header)

  const [bloquearProduto, setBloquearProduto] = useState(false);

  // Máscaras

  const formatarDocumento = (valor) => {

    const v = valor.replace(/\D/g, "");

    if (v.length <= 11) {

      return v

        .replace(/(\d{3})(\d)/, "$1.$2")

        .replace(/(\d{3})(\d)/, "$1.$2")

        .replace(/(\d{3})(\d{1,2})$/, "$1-$2")

        .slice(0, 14);

    }

    return v

      .replace(/^(\d{2})(\d)/, "$1.$2")

      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")

      .replace(/\.(\d{3})(\d)/, ".$1/$2")

      .replace(/(\d{4})(\d)/, "$1-$2")

      .slice(0, 18);

  };

  const formatarTelefone = (valor) => {

    const v = valor.replace(/\D/g, "");

    if (v.length <= 10) {

      return v

        .replace(/^(\d{2})(\d)/, "($1) $2")

        .replace(/(\d{4})(\d)/, "$1-$2")

        .slice(0, 14);

    }

    return v

      .replace(/^(\d{2})(\d)/, "($1) $2")

      .replace(/(\d{5})(\d)/, "$1-$2")

      .slice(0, 15);

  };

  const formatarCEP = (valor) => valor.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2").slice(0, 9);

  const handleChangeDados = (field, value) => {

    let novoValor = value;

    if (field === "cnpj") novoValor = formatarDocumento(value);

    if (field === "contato") novoValor = formatarTelefone(value);

    if (field === "cep") novoValor = formatarCEP(value);

    setDadosCliente((prev) => ({ ...prev, [field]: novoValor }));

  };

  const formatarHoras = (valor) => {

    const limpo = valor.replace(/\D/g, "");

    let horas = limpo.slice(0, 2);

    let minutos = limpo.slice(2, 4);

    if (limpo.length <= 2) {

      return horas.padStart(2, "0") + ":00";

    } else {

      if (Number(minutos) > 59) minutos = "59";

      return horas.padStart(2, "0") + ":" + minutos.padEnd(2, "0");

    }

  };

  const addItem = () =>

    setItens((prev) => [

      ...prev,

      { produto: "", quantidade: "", unidade: "", descricao: "", valor: "", observacao: "", arquivo: "" },

    ]);

  const removeItem = (index) => {

    // 🔒 não deixa excluir o primeiro item quando vier de consultoria

    if (bloquearProduto && index === 0) return;

    setItens((prev) => prev.filter((_, i) => i !== index));

  };

  const handleChangeItem = (index, field, value) => {

    setItens((prev) => {

      return prev.map((item, i) => i === index ? { ...item, [field]: value } : item);

    });

  };

  const handleFileChange = (index, file) => {

    const fileName = file ? file.name : "";

    handleChangeItem(index, "arquivo", fileName);

  };

  const formatarValorBRLInput = (valor) => {

    if (!valor) return "";

    const limpo = valor.toString().replace(/\D/g, "");

    const numero = Number(limpo) / 100;

    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  };

  const handleValorChange = (index, valorDigitado) => {

    handleChangeItem(index, "valor", formatarValorBRLInput(valorDigitado));

  };

  const somarTotal = useMemo(() => {

    try {

      const total = itens.reduce((acc, it) => {

        const limpo = (it.valor || "").toString().replace(/[^\d]/g, "");

        const numero = limpo ? Number(limpo) / 100 : 0;

        return acc + numero;

      }, 0);

      return total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

    } catch {

      return "R$ 0,00";

    }

  }, [itens]);

  // 🔥 Quando vem de Consultoria (header) já monta o item travado

  useEffect(() => {

    const params = new URLSearchParams(location.search);

    const area = params.get("area");

    const tipo = params.get("tipo");

    if (area && tipo) {

      const areaCap = area.charAt(0).toUpperCase() + area.slice(1).toLowerCase();

      const tipoCap = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase();

      setAreaSelecionada(areaCap);

      setTipoSelecionado(tipo.toLowerCase());

      setBloquearProduto(true); // trava produto da consultoria

      setItens([

        {

          produto: `Consultoria ${tipoCap} (${areaCap})`,

          quantidade: "01:00",

          unidade: "Horas (h)",

          descricao: "",

          valor: "",

          observacao: "",

          arquivo: "",

        },

      ]);

      setAgData(dayjs());

      setAgHora(dayjs());

    }

  }, [location]);

  // Render das etapas

  const renderStepContent = () => {

    switch (activeStep) {

      case 0:

        return (

          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.3, maxWidth: "900px", mx: "auto" }}>

            <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

              <TextField

                label="Nome completo"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.nome}

                onChange={(e) => handleChangeDados("nome", e.target.value)}

                InputProps={{ startAdornment: <Person sx={{ mr: 1, color: "gray" }} /> }}

              />

              <TextField

                label="CNPJ / CPF"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.cnpj}

                onChange={(e) => handleChangeDados("cnpj", e.target.value)}

                InputProps={{ startAdornment: <Numbers sx={{ mr: 1, color: "gray" }} /> }}

              />

            </Box>

            <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

              <TextField

                label="Empresa"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.empresa}

                onChange={(e) => handleChangeDados("empresa", e.target.value)}

                InputProps={{ startAdornment: <Business sx={{ mr: 1, color: "gray" }} /> }}

              />

              <TextField

                label="E-mail"

                type="email"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.email}

                onChange={(e) => handleChangeDados("email", e.target.value)}

                InputProps={{ startAdornment: <Email sx={{ mr: 1, color: "gray" }} /> }}

              />

            </Box>

            <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

              <TextField

                label="Contato"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.contato}

                onChange={(e) => handleChangeDados("contato", e.target.value)}

                InputProps={{ startAdornment: <Phone sx={{ mr: 1, color: "gray" }} /> }}

              />

              <TextField

                label="Cidade"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.cidade}

                onChange={(e) => handleChangeDados("cidade", e.target.value)}

              />

              <TextField

                label="Estado"

                select

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.estado}

                onChange={(e) => handleChangeDados("estado", e.target.value)}

              >

                {[

                  "AC",

                  "AL",

                  "AP",

                  "AM",

                  "BA",

                  "CE",

                  "DF",

                  "ES",

                  "GO",

                  "MA",

                  "MT",

                  "MS",

                  "MG",

                  "PA",

                  "PB",

                  "PR",

                  "PE",

                  "PI",

                  "RJ",

                  "RN",

                  "RS",

                  "RO",

                  "RR",

                  "SC",

                  "SP",

                  "SE",

                  "TO",

                ].map((uf) => (

                  <MenuItem key={uf} value={uf}>

                    {uf}

                  </MenuItem>

                ))}

              </TextField>

            </Box>

            <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

              <TextField

                label="CEP"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.cep}

                onChange={(e) => handleChangeDados("cep", e.target.value)}

              />

              <TextField

                label="Número"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.numero}

                onChange={(e) => handleChangeDados("numero", e.target.value)}

              />

            </Box>

            <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

              <TextField

                label="Endereço"

                fullWidth

                sx={{ flex: 2 }}

                value={dadosCliente.endereco}

                onChange={(e) => handleChangeDados("endereco", e.target.value)}

                InputProps={{ startAdornment: <LocationOn sx={{ mr: 1, color: "gray" }} /> }}

              />

              <TextField

                label="Bairro"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.bairro}

                onChange={(e) => handleChangeDados("bairro", e.target.value)}

              />

              <TextField

                label="Complemento"

                fullWidth

                sx={{ flex: 1 }}

                value={dadosCliente.complemento}

                onChange={(e) => handleChangeDados("complemento", e.target.value)}

              />

            </Box>

          </Box>

        );

      case 1: {

        const unidades = [

          "Unidade (un)",

          "Metro (m)",

          "Centímetro (cm)",

          "Milímetro (mm)",

          "Litro (L)",

          "Mililitro (mL)",

          "Quilograma (kg)",

          "Grama (g)",

          "Tonelada (t)",

          "Peça (pc)",

          "Conjunto (cj)",

          "Caixa (cx)",

          "Horas (h)",

        ];

        const produtosDisponiveis = [

          "Sistema Hidráulico",

          "Estrutura Metálica Personalizada",

          "Skid Bombas",

          "Mecanismo Mecânico",

          "Tubos Calandrados",

          "Mesa Elevatória",

          "Outro",

        ];

        return (

          <Box sx={{ maxWidth: "900px", mx: "auto", display: "flex", flexDirection: "column", gap: 2 }}>

            <AnimatePresence>

              {itens.map((item, index) => (

                <motion.div

                  key={index}

                  initial={{ opacity: 0, y: -10 }}

                  animate={{ opacity: 1, y: 0 }}

                  exit={{ opacity: 0, y: 10 }}

                >

                  <Card sx={{ p: 3, mb: 2, boxShadow: "0 3px 6px rgba(0,0,0,0.05)" }}>

                    <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

                      {/* Linha principal: Produto / Outro / Quantidade / Unidade */}

                      <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap", alignItems: "flex-start" }}>

                        {/* Produto */}

                        <TextField

                          select

                          label="Produto"

                          fullWidth

                          sx={{ flex: 1 }}

                          value={item.produto}

                          disabled={bloquearProduto && index === 0} // 🔒 trava o produto da consultoria

                          onChange={(e) => handleChangeItem(index, "produto", e.target.value)}

                          InputProps={{

                            startAdornment: <ShoppingCart sx={{ mr: 1, color: "gray" }} />,

                          }}

                        >

                          {bloquearProduto && index === 0 ? (

                            <MenuItem value={item.produto}>{item.produto}</MenuItem>

                          ) : (

                            produtosDisponiveis.map((produto) => (

                              <MenuItem key={produto} value={produto}>

                                {produto}

                              </MenuItem>

                            ))

                          )}

                        </TextField>

                        {/* Campo adicional ao escolher "Outro" (apenas se não estiver travado) */}

                        {!bloquearProduto && item.produto === "Outro" && (

                          <TextField

                            label="Descreva o produto desejado"

                            fullWidth

                            sx={{ flex: 1 }}

                            value={item.descricaoOutro || ""}

                            onChange={(e) => handleChangeItem(index, "descricaoOutro", e.target.value)}

                          />

                        )}

                        {/* Quantidade */}

                        <TextField

                          label="Quantidade"

                          fullWidth

                          sx={{ flex: 1 }}

                          value={

                            item.produto?.startsWith("Consultoria")

                              ? formatarHoras(item.quantidade || "")

                              : item.quantidade

                          }

                          onChange={(e) => {

                            const valor = e.target.value;

                            if (item.produto?.startsWith("Consultoria")) {

                              handleChangeItem(index, "quantidade", formatarHoras(valor));

                            } else {

                              handleChangeItem(index, "quantidade", valor);

                            }

                          }}

                          InputProps={{ startAdornment: <Category sx={{ mr: 1, color: "gray" }} /> }}

                        />

                        {/* Unidade */}

                        <TextField

                          select

                          label="Unidade"

                          fullWidth

                          sx={{ flex: 1 }}

                          value={item.produto?.startsWith("Consultoria") ? "Horas (h)" : item.unidade}

                          onChange={(e) => handleChangeItem(index, "unidade", e.target.value)}

                          disabled={item.produto?.startsWith("Consultoria")}

                        >

                          {unidades.map((uni) => (

                            <MenuItem key={uni} value={uni}>

                              {uni}

                            </MenuItem>

                          ))}

                        </TextField>

                      </Box>

                      {/* Descrição + Verba Disponível */}

                      <Box sx={{ display: "flex", gap: 1.8, flexWrap: "wrap" }}>

                        <TextField

                          label="Descrição"

                          fullWidth

                          sx={{ flex: 2 }}

                          value={item.descricao}

                          onChange={(e) => handleChangeItem(index, "descricao", e.target.value)}

                          InputProps={{ startAdornment: <Description sx={{ mr: 1, color: "gray" }} /> }}

                        />

                        <TextField

                          label="Verba Disponível"

                          fullWidth

                          sx={{ flex: 1 }}

                          value={item.valor}

                          onChange={(e) => handleValorChange(index, e.target.value)}

                          InputProps={{

                            startAdornment: (

                              <InputAdornment position="start">

                                <MonetizationOn sx={{ color: "gray" }} />

                              </InputAdornment>

                            ),

                            endAdornment: (

                              <InputAdornment position="end">

                                <Tooltip title="Não obrigatório" arrow>

                                  <IconButton size="small">

                                    <InfoOutlined sx={{ color: "#ff6600", fontSize: 18 }} />

                                  </IconButton>

                                </Tooltip>

                              </InputAdornment>

                            ),

                          }}

                        />

                      </Box>

                      {/* Observação */}

                      <TextField

                        label="Observação"

                        multiline

                        rows={2}

                        fullWidth

                        value={item.observacao}

                        onChange={(e) => handleChangeItem(index, "observacao", e.target.value)}

                      />

                      {/* Botão de anexo por item */}

                      <Box display="flex" alignItems="center" gap={2}>

                        <Button

                          component="label"

                          startIcon={<AttachFile />}

                          sx={{

                            mt: 1,

                            color: "#fff",

                            backgroundColor: "#001329",

                            "&:hover": { backgroundColor: "#001f40" },

                            px: 2.5,

                            py: 1,

                          }}

                        >

                          Anexar arquivo

                          <input

                            type="file"

                            hidden

                            onChange={(e) => handleFileChange(index, e.target.files[0])}

                          />

                        </Button>

                        {item.arquivo && (

                          <Typography variant="body2" sx={{ color: "gray" }}>

                            {item.arquivo}

                          </Typography>

                        )}

                      </Box>

                      {/* Botão Excluir (não mostra para o item travado) */}

                      {!bloquearProduto || index !== 0 ? (

                        <Box textAlign="right">

                          <IconButton color="error" onClick={() => removeItem(index)}>

                            <Delete />

                          </IconButton>

                        </Box>

                      ) : null}

                      {/* CALENDÁRIO DE AGENDAMENTO */}

                      {(tipoSelecionado === "online" || tipoSelecionado === "presencial") && (

                        <Card

                          sx={{

                            mt: 3,

                            border: "1px solid #ff6600",

                            background: "#fff9f4",

                            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",

                          }}

                        >

                          <CardContent>

                            <Box

                              sx={{

                                display: "flex",

                                alignItems: "center",

                                gap: 1,

                                mb: 2,

                                flexWrap: "wrap",

                              }}

                            >

                              <Chip

                                label={`Consultoria ${

                                  tipoSelecionado === "online" ? "Online" : "Presencial"

                                } (${areaSelecionada})`}

                                sx={{ backgroundColor: "#ff6600", color: "#fff", fontWeight: "bold" }}

                              />

                              <Typography variant="body2" sx={{ color: "#555" }}>

                                Escolha a data e hora da{" "}

                                {tipoSelecionado === "online" ? "reunião" : "visita"}.

                              </Typography>

                            </Box>

                            <LocalizationProvider dateAdapter={AdapterDayjs}>

                              <Box

                                sx={{

                                  display: "flex",

                                  alignItems: "flex-start",

                                  justifyContent: "flex-start",

                                  gap: 2,

                                  flexWrap: "nowrap",

                                  mb: 3,

                                  "& .MuiTextField-root": {

                                    backgroundColor: "#fff",

                                    borderRadius: 1,

                                  },

                                }}

                              >

                                <DatePicker

                                  label="Data"

                                  value={agData}

                                  onChange={(v) => setAgData(v)}

                                  slotProps={{

                                    textField: {

                                      size: "small",

                                      InputLabelProps: { shrink: true },

                                      sx: { width: 180 },

                                    },

                                  }}

                                />

                                <TimePicker

                                  label="Hora"

                                  value={agHora}

                                  onChange={(v) => setAgHora(v)}

                                  slotProps={{

                                    textField: {

                                      size: "small",

                                      InputLabelProps: { shrink: true },

                                      sx: { width: 150 },

                                    },

                                  }}

                                />

                                <TextField

                                  label="Observação"

                                  placeholder="Ex: Reunião via Teams"

                                  size="small"

                                  InputLabelProps={{ shrink: true }}

                                  sx={{ width: 260 }}

                                  value={item.observacaoReuniao || ""}

                                  onChange={(e) =>

                                    handleChangeItem(index, "observacaoReuniao", e.target.value)

                                  }

                                />

                              </Box>

                            </LocalizationProvider>

                            <Box textAlign="center">

                              <Button

                                variant="contained"

                                sx={{

                                  backgroundColor: "#ff6600",

                                  color: "#fff",

                                  fontWeight: "bold",

                                  textTransform: "none",

                                  px: 4,

                                  py: 1.2,

                                  "&:hover": { backgroundColor: "#e65500" },

                                }}

                                onClick={() => {

                                  alert(

                                    `Prévia de consultoria com o Engenheiro Felipe Binsfeld em ${agData?.format(

                                      "DD/MM/YYYY"

                                    )} às ${agHora?.format("HH:mm")}. O agendamento ainda não foi registrado; é necessária integração com o servidor.`

                                  );

                                }}

                              >

                                Ver prévia do agendamento

                              </Button>

                            </Box>

                          </CardContent>

                        </Card>

                      )}

                    </CardContent>

                  </Card>

                </motion.div>

              ))}

            </AnimatePresence>

            {/* Só permite adicionar outro item se NÃO estiver usando o fluxo de consultoria */}

            {!bloquearProduto && (

              <Button

                startIcon={<AddCircle />}

                onClick={addItem}

                sx={{

                  color: "#fff",

                  backgroundColor: "#001329",

                  "&:hover": { backgroundColor: "#001f40" },

                  fontWeight: "bold",

                  py: 1.5,

                }}

              >

                Adicionar outro item

              </Button>

            )}

            <Divider sx={{ my: 3 }} />

          </Box>

        );

      }

      case 2:

        return (

          <Box sx={{ maxWidth: "900px", mx: "auto", display: "flex", flexDirection: "column", gap: 3 }}>

            <Typography variant="h6" sx={{ fontWeight: "bold", color: "#ff6600", mb: 1 }}>

              Resumo do Orçamento

            </Typography>

            <Grid container spacing={2}>

              <Grid item xs={12} md={6}>

                <Card

                  sx={{

                    p: 3,

                    border: "1px solid #ff6600",

                    height: "100%",

                  }}

                >

                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>

                    Dados do Cliente

                  </Typography>

                  <Typography>{dadosCliente.nome}</Typography>

                  <Typography>{dadosCliente.empresa}</Typography>

                  <Typography>{dadosCliente.email}</Typography>

                  <Typography>{dadosCliente.contato}</Typography>

                  <Typography>

                    {dadosCliente.endereco}, {dadosCliente.numero} - {dadosCliente.bairro}

                  </Typography>

                  <Typography>

                    {dadosCliente.cidade}/{dadosCliente.estado} — CEP: {dadosCliente.cep}

                  </Typography>

                </Card>

              </Grid>

              <Grid item xs={12} md={6}>

                <Card

                  sx={{

                    p: 3,

                    border: "1px solid #ff6600",

                    height: "100%",

                  }}

                >

                  <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>

                    Itens

                  </Typography>

                  {itens.map((item, i) => (

                    <Box key={i} sx={{ mb: 1 }}>

                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>

                        {item.produto}

                      </Typography>

                      <Typography>

                        {item.quantidade} {item.unidade} — {item.valor || "R$ 0,00"}

                      </Typography>

                      {item.arquivo && (

                        <Typography variant="body2" sx={{ color: "gray" }}>

                          📎 {item.arquivo}

                        </Typography>

                      )}

                    </Box>

                  ))}

                  <Divider sx={{ my: 1.5 }} />

                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>

                    Total: {somarTotal}

                  </Typography>

                </Card>

              </Grid>

            </Grid>

          </Box>

        );

      case 3:

        return (

          <Box textAlign="center" py={8}>

            <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>

              {protocoloDemo ? `Solicitação ${protocoloDemo} registrada com sucesso` : "Envio da solicitação"}

            </Typography>

            <Typography>

              {protocoloDemo ? "Sua solicitação foi registrada no Supabase. Você pode acompanhar o andamento em Meus Orçamentos quando o painel estiver integrado ao banco." : "Confira os dados e clique em Enviar solicitação para registrar seu pedido. É necessário estar autenticado. Anexos ainda não são enviados nesta etapa."}

            </Typography>

          </Box>

        );

      default:

        return null;

    }

  };

  const etapaInfo = [

    { titulo: "Seus dados", descricao: "Informe seus dados para que possamos entrar em contato." },

    { titulo: "Sua necessidade", descricao: "Descreva os produtos, serviços ou consultorias desejados." },

    { titulo: "Confira sua solicitação", descricao: "Revise as informações antes de prosseguir." },

    { titulo: "Próximos passos", descricao: "Confira as informações sobre o envio da solicitação." },

  ];

  const voltar = () => {

    if (activeStep === 0) navigate("/");

    else setActiveStep((atual) => atual - 1);
    setErroEtapa("");

    window.scrollTo({ top: 0, behavior: "smooth" });

  };

  const avancar = async () => {
    if (enviando) return;
    if (activeStep === 0 && (!dadosCliente.nome.trim() || !dadosCliente.email.trim())) {
      setErroEtapa("Informe nome e e-mail para continuar.");
      return;
    }
    if (activeStep === 1 && (!itens.length || itens.some((item) => !item.produto || !String(item.quantidade).trim()))) {
      setErroEtapa("Informe produto e quantidade em todos os itens.");
      return;
    }
    if (activeStep === steps.length - 1) {
      if (protocoloDemo) {
        navigate("/meusOrcamentos");
        return;
      }
      if (!supabaseConfigurado) {
        setErroEtapa("A conexão com o Supabase não está configurada. Confira o arquivo .env.local.");
        return;
      }
      if (itens.some((item) => item.arquivo)) {
        setErroEtapa("Há arquivos anexados. O envio de anexos ainda não está habilitado. Remova os anexos antes de enviar a solicitação, para não perder documentos.");
        return;
      }
      setEnviando(true);
      setErroEtapa("");
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser();
        if (authError || !authData?.user) {
          throw new Error("Faça login na sua conta antes de enviar a solicitação.");
        }
        const user = authData.user;
        const agendamento = tipoSelecionado ? {
          tipo: tipoSelecionado,
          area: areaSelecionada,
          data: agData?.format("YYYY-MM-DD") || null,
          hora: agHora?.format("HH:mm") || null,
          observacao: itens[0]?.observacaoReuniao || "",
        } : null;
        const itensParaSalvar = itens.map(({ arquivo, ...item }) => item);
        const descricao = itensParaSalvar.map((item, index) =>
          `${index + 1}. ${item.produto === "Outro" ? (item.descricaoOutro || "Outro") : item.produto} — ${item.quantidade} ${item.unidade}${item.descricao ? ` — ${item.descricao}` : ""}`
        ).join("\n");
        const { data, error } = await supabase
          .from("cotacoes")
          .insert({
            cliente_id: user.id,
            cliente_nome: dadosCliente.nome.trim(),
            cliente_email: dadosCliente.email.trim(),
            descricao,
            dados_cliente: dadosCliente,
            itens_solicitados: itensParaSalvar,
            agendamento,
          })
          .select("id, numero_solicitacao")
          .single();
        if (error) throw error;
        if (!data) throw new Error("O banco não retornou a confirmação da solicitação.");
        setProtocoloDemo(data.numero_solicitacao || `CT-${String(data.id).padStart(6, "0")}`);
      } catch (error) {
        setErroEtapa(error?.message || "Não foi possível enviar a solicitação. Tente novamente.");
      } finally {
        setEnviando(false);
      }
      return;
    }
    setErroEtapa("");
    setActiveStep((atual) => Math.min(atual + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const informacoes = [

    { icon: <Person />, titulo: "Por que precisamos desses dados?", texto: "Essas informações nos ajudam a entender melhor sua necessidade e preparar uma proposta adequada ao seu projeto." },

    { icon: <VerifiedUserOutlined />, titulo: "Privacidade dos seus dados", texto: "Seus dados serão utilizados para analisar e responder à solicitação, conforme nossa política de privacidade." },

    { icon: <AccessTimeOutlined />, titulo: "Atendimento mais ágil", texto: "Nossa equipe poderá entrar em contato pelos canais informados." },

    { icon: <AssignmentTurnedInOutlined />, titulo: "Proposta personalizada", texto: "Com base nas informações fornecidas, poderemos avaliar uma solução para seu projeto." },

  ];

  return (

    <Box sx={{ minHeight: "100vh", bgcolor: "#EFF4F8", color: "#071B2E", pb: 10, overflow: "hidden" }}>

      {/* O header global permanece intocado. O fundo industrial passa por trás dele. */}

      <Box sx={{

        position: "relative", color: "white", pt: { xs: "125px", md: "108px" },

        pb: { xs: 12, md: 17 },

        backgroundImage: `linear-gradient(90deg, rgba(3,23,41,.97) 0%, rgba(3,23,41,.94) 46%, rgba(3,23,41,.66) 100%), url(${bannerIndustrial})`,

        backgroundSize: "cover", backgroundPosition: "center",

        "&::after": { content: '""', position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(180deg, transparent 75%, rgba(4,33,54,.4))" },

      }}>

        <Container maxWidth="xl" sx={{ maxWidth: "1280px !important", position: "relative", zIndex: 1 }}>

          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 4, alignItems: { md: "flex-end" } }}>

            <Box sx={{ maxWidth: 650 }}>

              <Typography sx={{ color: "#FF650D", fontWeight: 800, fontSize: 12, letterSpacing: 2.1, mb: 1.5 }}>CATOTECH / ORÇAMENTOS</Typography>

              <Typography component="h1" sx={{ fontWeight: 850, fontSize: { xs: 32, sm: 40, md: 48 }, lineHeight: 1.1, letterSpacing: "-.035em" }}>

                Vamos transformar sua ideia em uma <Box component="span" sx={{ color: "#FF650D" }}>solução.</Box>

              </Typography>

              <Typography sx={{ color: "#D6E2ED", mt: 2, fontSize: { xs: 14, md: 16 }, maxWidth: 590, lineHeight: 1.7 }}>

                Conte-nos sobre sua necessidade. Nossa equipe poderá avaliar os dados para preparar uma proposta personalizada.

              </Typography>

            </Box>

            <Box sx={{ display: { xs: "none", lg: "flex" }, gap: 2, pb: 1 }}>

              {[

                { icon: <SettingsOutlined />, a: "Soluções", b: "sob medida" },

                { icon: <VerifiedUserOutlined />, a: "Atendimento", b: "especializado" },

                { icon: <AccessTimeOutlined />, a: "Agilidade", b: "no atendimento" },

              ].map((item) => <Box key={item.a} sx={{ display: "flex", alignItems: "center", gap: 1, borderLeft: "1px solid #ffffff25", pl: 2 }}>

                <Box sx={{ p: 1, borderRadius: "50%", bgcolor: "#ffffff12", display: "flex" }}>{item.icon}</Box>

                <Typography sx={{ fontSize: 12, lineHeight: 1.45 }}><Box component="span" sx={{ color: "#FF650D", display: "block" }}>{item.a}</Box>{item.b}</Typography>

              </Box>)}

            </Box>

          </Box>

        </Container>

      </Box>

      <Container maxWidth="xl" sx={{ maxWidth: "1280px !important", mt: { xs: -8, md: -11 }, position: "relative", zIndex: 2 }}>

        <Box sx={{

          bgcolor: "#FFFFFF", borderRadius: { xs: "20px", md: "24px" },

          boxShadow: "0 20px 55px rgba(13,44,70,.10)", border: "1px solid #E5ECF2",

          px: { xs: 2, sm: 3, md: 4 }, py: { xs: 3, md: 4 },

          "& .MuiTextField-root": { minWidth: 0 },

          "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: "#fff", minHeight: 51, "&:hover fieldset": { borderColor: "#FF650D" }, "&.Mui-focused fieldset": { borderColor: "#FF650D" } },

          "& .MuiInputLabel-root.Mui-focused": { color: "#D95400" },

          "& .MuiCard-root": { borderRadius: "16px", border: "1px solid #E0E7EE", boxShadow: "none" },

          "& .MuiButton-root": { textTransform: "none", fontWeight: 700, boxShadow: "none" },

          "& .MuiButton-contained": { bgcolor: "#FF650D", color: "#fff", "&:hover": { bgcolor: "#E95700", boxShadow: "none" } },

          "& .MuiButton-outlined": { borderColor: "#FF650D", color: "#071B2E" },

        }}>

          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: { xs: 4, md: 5 }, mt: 0.5, px: { xs: 0, md: 4 },

            "& .MuiStepIcon-root": { color: "#A6B2BE", fontSize: 29 },

            "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": { color: "#FF650D" },

            "& .MuiStepLabel-label": { fontSize: { xs: 10, sm: 13 }, mt: 1, fontWeight: 600 },

            "& .MuiStepConnector-line": { borderColor: "#D1DCE6", borderTopWidth: 2 },

          }}>

            {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}

          </Stepper>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 285px" }, gap: { xs: 3, md: 4 } }}>

            <Box sx={{ minWidth: 0 }}>

              <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 4 }}>

                <Box sx={{ width: 58, height: 58, flexShrink: 0, borderRadius: "14px", bgcolor: "#FF650D", display: "grid", placeItems: "center", color: "white" }}>

                  {activeStep === 0 ? <Person sx={{ fontSize: 30 }} /> : activeStep === 1 ? <ShoppingCart sx={{ fontSize: 28 }} /> : activeStep === 2 ? <Description sx={{ fontSize: 28 }} /> : <AssignmentTurnedInOutlined sx={{ fontSize: 28 }} />}

                </Box>

                <Box>

                  <Typography sx={{ color: "#F26514", fontWeight: 800, fontSize: 11, letterSpacing: 1.8, mb: .5 }}>ETAPA {String(activeStep + 1).padStart(2, "0")} DE 04</Typography>

                  <Typography component="h2" sx={{ color: "#071B2E", fontWeight: 800, fontSize: { xs: 26, md: 30 }, lineHeight: 1.15 }}>{etapaInfo[activeStep].titulo}</Typography>

                  <Typography sx={{ color: "#61758B", mt: .8, fontSize: 13 }}>{etapaInfo[activeStep].descricao}</Typography>

                </Box>

              </Box>

              {erroEtapa && <Alert severity="error" sx={{ mb: 2 }}>{erroEtapa}</Alert>}
            {renderStepContent()}

            </Box>

            <Box component="aside" sx={{ bgcolor: "#FFF8F4", border: "1px solid #FFF0E7", borderRadius: "16px", p: { xs: 2.5, md: 2.7 }, alignSelf: "start" }}>

              {informacoes.map((item, index) => <Box key={item.titulo} sx={{ display: "flex", gap: 1.5, mb: index === informacoes.length - 1 ? 0 : 3.5, alignItems: "flex-start" }}>

                <Box sx={{ bgcolor: "#FFE8D8", color: "#F3650C", width: 48, height: 48, borderRadius: "14px", display: "grid", placeItems: "center", flexShrink: 0 }}>{item.icon}</Box>

                <Box><Typography sx={{ fontSize: 13, fontWeight: 800, color: "#071B2E", mb: .6, lineHeight: 1.35 }}>{item.titulo}</Typography>

                  <Typography sx={{ fontSize: 12, lineHeight: 1.65, color: "#4B6178" }}>{item.texto}</Typography></Box>

              </Box>)}

            </Box>

          </Box>

          <Divider sx={{ my: 3, borderColor: "#DFE7EF" }} />

          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>

            <Button variant="outlined" startIcon={<ArrowBack />} onClick={voltar} sx={{ px: 3, py: 1.25, borderRadius: "10px" }}>Voltar</Button>

            <Button variant="contained" endIcon={<ArrowForward />} onClick={avancar} disabled={enviando} sx={{ px: 3.5, py: 1.25, borderRadius: "10px" }}>

              {activeStep === steps.length - 1 ? (protocoloDemo ? "Ver minhas solicitações" : enviando ? "Enviando..." : "Enviar solicitação") : "Próxima etapa"}

            </Button>

          </Box>

        </Box>

      </Container>

    </Box>

  );

}
