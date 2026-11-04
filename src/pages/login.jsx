import { useEffect, useState } from "react";
import {
  Alert, Box, Button, Checkbox, FormControlLabel, IconButton,
  InputAdornment, TextField, Typography, Link as MuiLink,
} from "@mui/material";
import { EmailOutlined, LockOutlined, Visibility, VisibilityOff, ArrowForward } from "@mui/icons-material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";
import "./login.css";

export default function Login() {
  const [email, setEmail] = useState(() => localStorage.getItem("catotech_remember_email") || "");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem("catotech_remember_email")));
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!supabaseConfigurado) return undefined;
    let ativo = true;
    const finalizarRetornoOAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!ativo) return;
      if (error) { setErro(error.message); return; }
      if (data.session?.user) {
        // Compatibilidade visual temporária. NÃO é fonte de autorização.
        const usuario = data.session.user;
        localStorage.setItem("user", JSON.stringify({
          nome: usuario.user_metadata?.full_name || usuario.user_metadata?.name || usuario.email || "Cliente",
          email: usuario.email,
          role: "cliente",
          id: usuario.id,
        }));
        navigate("/", { replace: true });
        window.location.reload();
      }
    };
    finalizarRetornoOAuth();
    return () => { ativo = false; };
  }, [navigate]);

  const guardarEmail = (valor) => {
    if (remember) localStorage.setItem("catotech_remember_email", valor);
    else localStorage.removeItem("catotech_remember_email");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setErro("");
    if (!supabaseConfigurado) { setErro("Configure as variáveis do Supabase no arquivo .env.local."); return; }
    const emailNormalizado = email.trim().toLowerCase();
    if (!emailNormalizado || !senha) { setErro("Informe seu e-mail e sua senha."); return; }
    setCarregando(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: emailNormalizado, password: senha });
      if (error) throw error;
      if (!data.user) throw new Error("Não foi possível confirmar o acesso.");
      guardarEmail(emailNormalizado);
      // Somente compatibilidade com componentes antigos; acesso deve ser validado pela sessão e RLS.
      localStorage.setItem("user", JSON.stringify({
        nome: data.user.user_metadata?.full_name || data.user.email || "Cliente",
        email: data.user.email, role: "cliente", id: data.user.id,
      }));
      navigate("/", { replace: true });
      window.location.reload();
    } catch (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha inválidos." : (error.message || "Falha ao entrar."));
    } finally { setCarregando(false); }
  };

  const handleGoogle = async () => {
    setErro("");
    if (!supabaseConfigurado) { setErro("Configure as variáveis do Supabase no arquivo .env.local."); return; }
    setCarregando(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/login` },
      });
      if (error) throw error;
    } catch (error) {
      setErro(error.message || "Não foi possível iniciar o login com Google.");
      setCarregando(false);
    }
  };

  return (
    <main className="ct-login-page">
      <section className="ct-login-visual" aria-label="Engenharia CatoTech">
        <div className="ct-login-visual-content">
          <div className="ct-login-brand"><span className="ct-login-brand-icon">⚙</span><strong>CATOTECH</strong><span className="ct-login-brand-separator">|</span><span className="ct-login-brand-sub">ENGENHARIA</span></div>
          <div className="ct-login-accent" />
          <h1>Engenharia que<br />transforma <span>ideias<br />em soluções.</span></h1>
          <p>Tecnologia, precisão e inovação para construir o futuro da indústria.</p>
          <div className="ct-login-visual-footer">PROJETOS SOB MEDIDA <span>•</span> SOLUÇÕES INDUSTRIAIS</div>
        </div>
      </section>
      <section className="ct-login-form-side" aria-label="Acesso à conta">
        <div className="ct-login-form-wrap">
          <div className="ct-login-eyebrow">ÁREA DO CLIENTE</div>
          <Typography component="h2" className="ct-login-heading">Acesse sua conta<span>.</span></Typography>
          <Typography className="ct-login-intro">Entre com suas credenciais para acompanhar seus projetos e solicitações com a CatoTech.</Typography>
          {erro && <Alert severity="error" sx={{ mt: 2, mb: 1 }}>{erro}</Alert>}
          <Box component="form" onSubmit={handleLogin} className="ct-login-form" noValidate>
            <label className="ct-login-label" htmlFor="ct-email">E-mail</label>
            <TextField id="ct-email" fullWidth type="email" autoComplete="email" placeholder="seuemail@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} required
              InputProps={{ startAdornment: <InputAdornment position="start"><EmailOutlined /></InputAdornment> }} />
            <label className="ct-login-label ct-login-password-label" htmlFor="ct-password">Senha</label>
            <TextField id="ct-password" fullWidth type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Digite sua senha" value={senha} onChange={(e) => setSenha(e.target.value)} required
              InputProps={{ startAdornment: <InputAdornment position="start"><LockOutlined /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton type="button" aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"} onClick={() => setShowPassword((prev) => !prev)} edge="end">{showPassword ? <Visibility /> : <VisibilityOff />}</IconButton></InputAdornment> }} />
            <div className="ct-login-options">
              <FormControlLabel control={<Checkbox checked={remember} onChange={(e) => setRemember(e.target.checked)} size="small" />} label="Lembrar-me" />
              <MuiLink component={RouterLink} to="/esqueceuSenha" underline="hover">Esqueceu sua senha?</MuiLink>
            </div>
            <Button type="submit" fullWidth variant="contained" className="ct-login-submit" endIcon={<ArrowForward />} disabled={carregando}>{carregando ? "Aguarde..." : "Entrar na minha conta"}</Button>
          </Box>
          <div className="ct-login-divider"><span>OU</span></div>
          <Button type="button" fullWidth variant="outlined" onClick={handleGoogle} disabled={carregando} sx={{ mt: 1, mb: 2, py: 1.4, fontWeight: 700, textTransform: "none", borderRadius: 2, borderColor: "#c9d3df", color: "#061b30" }}>
            <Box component="span" aria-hidden="true" sx={{ fontWeight: 900, fontSize: 20, mr: 1.5, color: "#4285F4" }}>G</Box>
            Continuar com Google
          </Button>
          <MuiLink component={RouterLink} to="/cadastro" className="ct-login-register" underline="none">Ainda não tem uma conta? <strong>Cadastre-se</strong></MuiLink>
        </div>
        <footer className="ct-login-footer"><span>© {new Date().getFullYear()} CatoTech. Todos os direitos reservados.</span><span className="ct-login-footer-divider" /><span>Desenvolvido por <strong>Pandora<span>Code</span></strong></span></footer>
      </section>
    </main>
  );
}
