import { useState } from "react";
import {
  Alert,
  Box,
  Button,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  EmailOutlined,
  LockResetOutlined,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./esqueceuSenha.css";

export default function EsqueceuSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    setErro("");
    setAviso("");

    const emailNormalizado = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setErro("Informe um endereço de e-mail válido.");
      return;
    }

    // Pendente: integrar uma API de recuperação de senha no servidor.
    // Não afirmar que um e-mail foi enviado sem confirmação do serviço.
    setAviso(
      "E-mail válido. O envio do link de recuperação precisa ser conectado ao serviço de autenticação da CatoTech."
    );
  };

  return (
    <main className="recuperacao-page">
      <section className="recuperacao-visual" aria-label="Engenharia CatoTech">
        <div className="recuperacao-brand">
          <span className="recuperacao-brand-icon">✦</span> CATOTECH
          <span className="recuperacao-brand-suffix"> / ENGENHARIA</span>
        </div>
        <div className="recuperacao-visual-content">
          <div className="recuperacao-accent" />
          <Typography component="h1" className="recuperacao-visual-title">
            Tecnologia que conecta <span>você às suas soluções.</span>
          </Typography>
          <Typography className="recuperacao-visual-text">
            Seus projetos e suas ideias continuam sendo nossa prioridade.
          </Typography>
        </div>
        <div className="recuperacao-visual-footer">
          PROJETOS SOB MEDIDA <span>•</span> SOLUÇÕES INDUSTRIAIS
        </div>
      </section>

      <section className="recuperacao-form-side">
        <Box component="form" onSubmit={handleSubmit} className="recuperacao-form" noValidate>
          <div className="recuperacao-symbol">
            <LockResetOutlined fontSize="large" />
          </div>
          <Typography className="recuperacao-eyebrow">
            ÁREA DO CLIENTE / SEGURANÇA
          </Typography>
          <Typography component="h2" className="recuperacao-title">
            Recuperar acesso.
          </Typography>
          <Typography className="recuperacao-description">
            Esqueceu sua senha? Informe o e-mail cadastrado para solicitar um link de recuperação de acesso.
          </Typography>

          {erro && <Alert severity="error" sx={{ mb: 2 }}>{erro}</Alert>}
          {aviso && <Alert severity="info" sx={{ mb: 2 }}>{aviso}</Alert>}

          <Typography component="label" htmlFor="recuperacao-email" className="recuperacao-label">
            E-mail cadastrado
          </Typography>
          <TextField
            id="recuperacao-email"
            name="email"
            type="email"
            fullWidth
            required
            placeholder="seuemail@empresa.com"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (erro) setErro("");
              if (aviso) setAviso("");
            }}
            autoComplete="email"
            inputProps={{ "aria-label": "E-mail cadastrado" }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlined />
                </InputAdornment>
              ),
            }}
          />

          <Button type="submit" fullWidth className="recuperacao-submit" endIcon={<ArrowForward />}>
            Solicitar recuperação
          </Button>
          <Button component={RouterLink} to="/login" className="recuperacao-back" startIcon={<ArrowBack />}>
            Voltar para o login
          </Button>
          <div className="recuperacao-note">
            CatoTech <span>•</span> Engenharia e inovação
          </div>
        </Box>
      </section>
    </main>
  );
}
