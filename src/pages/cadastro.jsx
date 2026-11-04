import { useState } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";
import {
  Box, Typography, TextField, Button, IconButton, InputAdornment,
  Alert, Link as MuiLink
} from "@mui/material";
import { Visibility, VisibilityOff, ArrowForward, MailOutline, LockOutlined, PersonOutline } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./cadastro.css";

export default function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [provedorAtivo, setProvedorAtivo] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErro("");
    setAviso("");

    if (!nome.trim() || !email.trim() || !senha || !confirmarSenha) {
      setErro("Preencha todos os campos para continuar.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (!supabaseConfigurado) {
      setErro("Supabase não configurado. Verifique as variáveis REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_ANON_KEY.");
      return;
    }

    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: senha,
        options: {
          data: { full_name: nome.trim(), nome: nome.trim() },
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });
      if (error) throw error;
      setSenha("");
      setConfirmarSenha("");
      if (data?.session) {
        setAviso("Conta criada! Você já está autenticado. Acesse a área do cliente pelo menu.");
      } else {
        setAviso("Solicitação recebida. Se necessário, confirme seu e-mail pelo link enviado e depois entre na sua conta.");
      }
    } catch (error) {
      setErro(error?.message || "Não foi possível criar a conta. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  };

  const entrarComGoogle = async () => {
    setErro("");
    setAviso("");
    if (!supabaseConfigurado) {
      setErro("Supabase não configurado. Verifique o arquivo .env.local.");
      return;
    }
    setProvedorAtivo("google");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/login`,
          queryParams: { prompt: "select_account" },
        },
      });
      if (error) throw error;
    } catch (error) {
      setErro(error?.message || "Não foi possível iniciar a autenticação.");
    } finally {
      setProvedorAtivo("");
    }
  };

  return (
    <Box className="cadastro-page">
      <Box className="cadastro-layout">
        <Box className="cadastro-visual">
          <Box className="cadastro-brand"><span className="cadastro-brand-mark">⚙</span> CATOTECH <span className="cadastro-brand-divider">|</span> <span className="cadastro-brand-accent">ENGENHARIA</span></Box>
          <Box className="cadastro-visual-copy">
            <Box className="cadastro-accent-line" />
            <Typography component="h1" className="cadastro-visual-title">Sua próxima solução <span>começa aqui.</span></Typography>
            <Typography className="cadastro-visual-description">Tecnologia, precisão e inovação para transformar suas ideias em projetos reais.</Typography>
          </Box>
          <Typography className="cadastro-visual-footer">PROJETOS SOB MEDIDA <span>•</span> SOLUÇÕES INDUSTRIAIS</Typography>
        </Box>

        <Box className="cadastro-form-side">
          <Box component="form" onSubmit={handleSubmit} className="cadastro-form" noValidate>
            <Typography className="cadastro-eyebrow">ÁREA DO CLIENTE</Typography>
            <Typography component="h2" className="cadastro-title">Crie sua conta<span>.</span></Typography>
            <Typography className="cadastro-subtitle">Cadastre-se para acompanhar seus projetos e solicitações com a CatoTech.</Typography>

            {erro && <Alert severity="error" className="cadastro-alert">{erro}</Alert>}
            {aviso && <Alert severity="info" className="cadastro-alert">{aviso}</Alert>}

            <Box className="cadastro-fields">
              <Box className="cadastro-field"><Typography component="label" htmlFor="cadastro-nome">Nome completo</Typography><TextField id="cadastro-nome" fullWidth placeholder="Seu nome completo" value={nome} onChange={(e) => setNome(e.target.value)} autoComplete="name" InputProps={{ startAdornment: <InputAdornment position="start"><PersonOutline /></InputAdornment> }} /></Box>
              <Box className="cadastro-field"><Typography component="label" htmlFor="cadastro-email">E-mail</Typography><TextField id="cadastro-email" fullWidth type="email" placeholder="seuemail@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" InputProps={{ startAdornment: <InputAdornment position="start"><MailOutline /></InputAdornment> }} /></Box>
              <Box className="cadastro-field"><Typography component="label" htmlFor="cadastro-senha">Senha</Typography><TextField id="cadastro-senha" fullWidth type={showPassword ? "text" : "password"} placeholder="Mínimo de 8 caracteres" value={senha} onChange={(e) => setSenha(e.target.value)} autoComplete="new-password" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((v) => !v)} edge="end">{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} /></Box>
              <Box className="cadastro-field"><Typography component="label" htmlFor="cadastro-confirmar">Confirmar senha</Typography><TextField id="cadastro-confirmar" fullWidth type={showConfirm ? "text" : "password"} placeholder="Digite a senha novamente" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} autoComplete="new-password" InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton aria-label={showConfirm ? "Ocultar confirmação" : "Mostrar confirmação"} onClick={() => setShowConfirm((v) => !v)} edge="end">{showConfirm ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} /></Box>
            </Box>

            <Button className="cadastro-submit" type="submit" variant="contained" fullWidth disabled={carregando || !!provedorAtivo} endIcon={<ArrowForward />}>{carregando ? "Criando conta..." : "Criar minha conta"}</Button>
            <Box className="cadastro-separator"><span>OU CONTINUE COM</span></Box>
            <Box className="cadastro-social-options">
              <Button type="button" className="cadastro-social-button" variant="outlined" disabled={carregando || !!provedorAtivo} onClick={entrarComGoogle} startIcon={<Box component="span" className="cadastro-google-mark">G</Box>}>
                {provedorAtivo === "google" ? "Conectando..." : "Google"}
              </Button>
            </Box>
            <MuiLink className="cadastro-login-link" component={RouterLink} to="/login" underline="none">Já tem uma conta? <strong>Entrar</strong></MuiLink>
          </Box>
          <Box className="cadastro-copyright"><span>© {new Date().getFullYear()} CatoTech. Todos os direitos reservados.</span><span>Desenvolvido por <strong>Panda<span>Code</span></strong></span></Box>
        </Box>
      </Box>
    </Box>
  );
}
