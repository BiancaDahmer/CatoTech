
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";
import usePerfilUsuario from "../hooks/usePerfilUsuario";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Drawer,
  Divider,
} from "@mui/material";

import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

const LARANJA = "#ff650d";
const ESCURO = "#03111f";

const projetos = [
  { nome: "PPCI Completo", rota: "/projeto/ppci-completo" },
  { nome: "Sprinklers", rota: "/projeto/sprinklers" },
  { nome: "Sistema Dilúvio", rota: "/projeto/sistema-diluvio" },
  { nome: "Hidrante", rota: "/projeto/hidrante" },
];

const areas = ["Pneumático", "Hidráulico", "Estrutural"];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === "/";

  const [scrolled, setScrolled] = useState(false);
  const [headerOculto, setHeaderOculto] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [menuServicosAberto, setMenuServicosAberto] =
    useState(false);
  const [submenuAberto, setSubmenuAberto] = useState(null);
  const [subnivelAberto, setSubnivelAberto] = useState(null);

  const { usuario } = usePerfilUsuario();
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    let posicaoAnterior = Math.max(0, window.scrollY);

    const handleScroll = () => {
      const posicaoAtual = Math.max(0, window.scrollY);
      setScrolled(posicaoAtual > 40);

      // No início da página, o menu permanece sempre visível.
      if (posicaoAtual < 110) {
        setHeaderOculto(false);
      } else if (posicaoAtual > posicaoAnterior + 5) {
        // Descendo: recolhe o cabeçalho para liberar a leitura.
        setHeaderOculto(true);
      } else if (posicaoAtual < posicaoAnterior - 5) {
        // Subindo: apresenta novamente os links de navegação.
        setHeaderOculto(false);
      }
      posicaoAnterior = posicaoAtual;
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setHeaderOculto(false);
    setMobileOpen(false);
    setMenuServicosAberto(false);
    setSubmenuAberto(null);
    setSubnivelAberto(null);
  }, [location.pathname, location.search]);

  const handleLogout = async () => {
    setAnchorEl(null);
    setMobileOpen(false);
    if (supabaseConfigurado) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        window.alert("Não foi possível encerrar a sessão. Tente novamente.");
        return;
      }
    }
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const navegar = (rota) => {
    setMobileOpen(false);
    setMenuServicosAberto(false);
    navigate(rota);
  };

  const rolarParaRodape = () => {
    setMobileOpen(false);

    const rolar = () => {
      const rodape = document.getElementById("footer");
      rodape?.scrollIntoView({ behavior: "smooth" });
    };

    if (location.pathname === "/") {
      rolar();
    } else {
      navigate("/");
      setTimeout(rolar, 500);
    }
  };

  const solicitarConsultoria = (area, tipo) => {
    navegar(
      `/cotacao?area=${area.toLowerCase()}&tipo=${tipo}`
    );
  };

  const estiloLink = {
    color: "#ffffff",
    backgroundColor: "transparent !important",
    backgroundImage: "none",
    boxShadow: "none !important",
    textTransform: "none",
    fontFamily: "'Manrope', Arial, sans-serif",
    fontSize: "12px",
    fontWeight: 600,
    letterSpacing: "0.1px",
    padding: "10px 7px",
    minWidth: "auto",
    borderRadius: "999px",
    transition: "color .25s ease",
    "&.MuiButton-root": {
      backgroundColor: "transparent !important",
      backgroundImage: "none !important",
      boxShadow: "none !important",
    },
    "&:hover": {
      color: LARANJA,
      backgroundColor: "transparent !important",
      boxShadow: "none !important",
    },
  };

  const estiloMenuItem = {
    px: 2.5,
    py: 1.3,
    fontSize: "13px",
    fontWeight: 500,
    color: "#e9edf2",
    transition: "all .2s ease",
    "&:hover": {
      color: LARANJA,
      backgroundColor: "rgba(255,255,255,0.06)",
    },
  };

  const botaoLaranja = {
    backgroundColor: LARANJA,
    color: "#fff",
    borderRadius: "999px",
    padding: "11px 15px",
    fontSize: "11px",
    fontWeight: 700,
    textTransform: "none",
    whiteSpace: "nowrap",
    boxShadow: "none",
    transition: "all .3s ease",
    "&:hover": {
      backgroundColor: "#e95700",
      transform: "translateY(-2px)",
      boxShadow: "none",
    },
  };

  // Navegação por perfil consultado no Supabase; RLS continua obrigatória.
  const isEngenheiro = usuario?.role === "engenheiro" || usuario?.role === "admin";
  const isCliente = usuario?.role === "cliente";
  const isAdmin = usuario?.role === "admin";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1300,
          background: "transparent",
          backgroundImage: "none",
          boxShadow: "none",
          border: "none",
          pointerEvents: "none",
          transform: headerOculto && !mobileOpen && !menuServicosAberto && !anchorEl
            ? "translateY(-125%)"
            : "translateY(0)",
          transition: "transform 260ms ease-in-out",
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Toolbar
          sx={{
            pointerEvents: "auto",
            width: "calc(100% - 32px)",
            maxWidth: "1120px",
            mx: "auto",
            mt: { xs: "12px", md: "18px" },
            px: { xs: "18px", md: "24px" },
            minHeight: { xs: "66px !important", md: "68px !important" },
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: { xs: 1, md: 1.5 },
            borderRadius: "999px",
            backgroundColor: scrolled
              ? "rgba(3, 17, 31, 0.94)"
              : "rgba(3, 17, 31, 0.76)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(46,75,105,0.65)",
            boxShadow: "0 12px 35px rgba(0,0,0,0.22)",
            transition: "background-color .3s ease",
          }}
        >
          {/* LOGOTIPO */}
          <Typography
            component={Link}
            to="/"
            sx={{
              textDecoration: "none",
              color: "#fff",
              fontFamily: "'Manrope', Arial, sans-serif",
              fontWeight: 800,
              fontSize: {
                xs: "23px",
                md: "25px",
              },
              letterSpacing: "-1px",
              whiteSpace: "nowrap",
              flexShrink: 0,
              "&:hover": {
                opacity: 0.9,
              },
            }}
          >
            Cato
            <Box component="span" sx={{ color: LARANJA }}>
              Tech
            </Box>
          </Typography>

          {/* NAVEGAÇÃO DESKTOP */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              justifyContent: "center",
              gap: { md: 0.5, lg: 1.2 },
              flex: 1,
            }}
          >
            <Button
              component={Link}
              to="/"
              sx={{
                ...estiloLink,
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  bottom: 3,
                  left: 9,
                  width: isHome ? "calc(100% - 18px)" : 0,
                  height: "2px",
                  backgroundColor: LARANJA,
                  transition: "width .25s ease",
                },
                "&:hover::after": {
                  width: "calc(100% - 18px)",
                },
              }}
            >
              Início
            </Button>

            {/* MENU SERVIÇOS */}
            <Box
              sx={{ position: "relative" }}
              onMouseEnter={() => setMenuServicosAberto(true)}
              onMouseLeave={() => {
                setMenuServicosAberto(false);
                setSubmenuAberto(null);
                setSubnivelAberto(null);
              }}
            >
              <Button
                sx={estiloLink}
                onClick={() =>
                  setMenuServicosAberto(!menuServicosAberto)
                }
              >
                Serviços
              </Button>

              {menuServicosAberto && (
                <Box
                  sx={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    display: "flex",
                    minHeight: 120,
                    backgroundColor: "rgba(5,20,35,.98)",
                    backdropFilter: "blur(18px)",
                    border: "1px solid rgba(255,255,255,.1)",
                    borderRadius: "14px",
                    boxShadow: "0 20px 55px rgba(0,0,0,.35)",
                    overflow: "hidden",
                    zIndex: 1500,
                  }}
                >
                  <Box
                    sx={{
                      minWidth: 190,
                      borderRight:
                        "1px solid rgba(255,255,255,.1)",
                    }}
                  >
                    {["Consultoria", "Projetos"].map((item) => (
                      <Box
                        key={item}
                        onMouseEnter={() => {
                          setSubmenuAberto(item);
                          setSubnivelAberto(null);
                        }}
                        sx={{
                          ...estiloMenuItem,
                          cursor: "pointer",
                          color:
                            submenuAberto === item
                              ? LARANJA
                              : "#fff",
                        }}
                      >
                        {item}
                      </Box>
                    ))}
                  </Box>

                  {submenuAberto === "Consultoria" && (
                    <Box
                      sx={{
                        minWidth: 190,
                        borderRight:
                          "1px solid rgba(255,255,255,.1)",
                      }}
                    >
                      {areas.map((area) => (
                        <Box
                          key={area}
                          sx={{
                            ...estiloMenuItem,
                            cursor: "pointer",
                            color:
                              subnivelAberto === area
                                ? LARANJA
                                : "#fff",
                          }}
                          onMouseEnter={() =>
                            setSubnivelAberto(area)
                          }
                        >
                          {area}
                        </Box>
                      ))}
                    </Box>
                  )}

                  {submenuAberto === "Consultoria" &&
                    areas.includes(subnivelAberto) && (
                      <Box sx={{ minWidth: 160 }}>
                        <Box
                          sx={{
                            ...estiloMenuItem,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            solicitarConsultoria(
                              subnivelAberto,
                              "online"
                            )
                          }
                        >
                          Online
                        </Box>
                        <Box
                          sx={{
                            ...estiloMenuItem,
                            cursor: "pointer",
                          }}
                          onClick={() =>
                            solicitarConsultoria(
                              subnivelAberto,
                              "presencial"
                            )
                          }
                        >
                          Presencial
                        </Box>
                      </Box>
                    )}

                  {submenuAberto === "Projetos" && (
                    <Box sx={{ minWidth: 220 }}>
                      {projetos.map((projeto) => (
                        <Box
                          key={projeto.rota}
                          sx={{
                            ...estiloMenuItem,
                            cursor: "pointer",
                          }}
                          onClick={() => navegar(projeto.rota)}
                        >
                          {projeto.nome}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Box>

            <Button
              component={Link}
              to="/produtos"
              sx={estiloLink}
            >
              Produtos
            </Button>

            <Button
              component={Link}
              to="/"
              sx={estiloLink}
              onClick={(event) => {
                event.preventDefault();
                navigate("/");
                setTimeout(() => {
                  document
                    .getElementById("projetos")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 150);
              }}
            >
              Projetos
            </Button>

            <Button
              component={Link}
              to="/quemSomos"
              sx={estiloLink}
            >
              Quem Somos
            </Button>

            <Button
              onClick={rolarParaRodape}
              sx={estiloLink}
            >
              Contato
            </Button>
          </Box>

          {/* AÇÕES DO USUÁRIO */}
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              gap: 1,
              flexShrink: 0,
            }}
          >
            {!usuario && (
              <>
                <Button
                  component={Link}
                  to="/login"
                  sx={{
                    ...estiloLink,
                    mr: 0,
                  }}
                >
                  Entrar
                </Button>

                <Button
                  component={Link}
                  to="/cotacao"
                  variant="contained"
                  endIcon={<ArrowForwardIcon />}
                  sx={botaoLaranja}
                >
                  Solicitar Orçamento
                </Button>
              </>
            )}

            {isCliente && (
              <>
                <Button
                  component={Link}
                  to="/cotacao"
                  variant="contained"
                  sx={botaoLaranja}
                >
                  Solicitar Orçamento
                </Button>

                <Tooltip title="Meus Orçamentos">
                  <IconButton
                    onClick={() => navegar("/meusOrcamentos")}
                    sx={{ color: "#fff" }}
                  >
                    <ShoppingCartIcon />
                  </IconButton>
                </Tooltip>
              </>
            )}

            {isEngenheiro && (
              <Tooltip title="Recebimento de Cotações">
                <IconButton
                  onClick={() =>
                    navegar("/recebimentoCotacao")
                  }
                  sx={{ color: "#fff" }}
                >
                  <RequestQuoteIcon />
                </IconButton>
              </Tooltip>
            )}

            {isAdmin && (
              <Tooltip title="Central Administrativa">
                <IconButton
                  aria-label="Central Administrativa"
                  onClick={() => navegar("/admin")}
                  sx={{ color: location.pathname === "/admin" ? LARANJA : "#fff" }}
                >
                  <AdminPanelSettingsIcon />
                </IconButton>
              </Tooltip>
            )}

            {usuario && (
              <Tooltip title="Minha conta">
                <IconButton
                  onClick={(event) =>
                    setAnchorEl(event.currentTarget)
                  }
                  sx={{ color: "#fff" }}
                >
                  <AccountCircleIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* MENU MOBILE */}
          <IconButton
            aria-label="Abrir menu"
            onClick={() => setMobileOpen(true)}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "#fff",
            }}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* MENU DA CONTA */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {usuario && (
          <MenuItem disabled>
            {usuario.email} ({usuario.role})
          </MenuItem>
        )}
        {isAdmin && (
          <MenuItem onClick={() => { setAnchorEl(null); navegar("/admin"); }}>
            Central Administrativa
          </MenuItem>
        )}
        {usuario && (
          <MenuItem onClick={handleLogout}>
            Sair
          </MenuItem>
        )}
      </Menu>

      {/* NAVEGAÇÃO MOBILE */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: "min(340px, 90vw)",
            backgroundColor: ESCURO,
            color: "#fff",
            px: 2,
            py: 2,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Typography
            sx={{ fontWeight: 800, fontSize: 23 }}
          >
            Cato
            <Box component="span" sx={{ color: LARANJA }}>
              Tech
            </Box>
          </Typography>

          <IconButton
            onClick={() => setMobileOpen(false)}
            sx={{ color: "#fff" }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        <Divider sx={{ borderColor: "#263747", mb: 2 }} />

        {[
          { nome: "Início", rota: "/" },
          { nome: "Produtos", rota: "/produtos" },
          { nome: "Quem Somos", rota: "/quemSomos" },
        ].map((item) => (
          <Button
            key={item.rota}
            fullWidth
            onClick={() => navegar(item.rota)}
            sx={{
              ...estiloLink,
              justifyContent: "flex-start",
              py: 1.5,
            }}
          >
            {item.nome}
          </Button>
        ))}

        <Typography
          sx={{
            color: LARANJA,
            fontSize: 12,
            fontWeight: 700,
            mt: 2,
            mb: 1,
          }}
        >
          SERVIÇOS E CONSULTORIA
        </Typography>

        {areas.map((area) => (
          <Box key={area} sx={{ mb: 1 }}>
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 600,
                py: 1,
              }}
            >
              {area}
            </Typography>

            <Box sx={{ display: "flex", gap: 1 }}>
              {["online", "presencial"].map((tipo) => (
                <Button
                  key={tipo}
                  size="small"
                  onClick={() =>
                    solicitarConsultoria(area, tipo)
                  }
                  sx={{
                    color: "#fff",
                    border: "1px solid #34465a",
                    borderRadius: "999px",
                    textTransform: "capitalize",
                    fontSize: 12,
                  }}
                >
                  {tipo}
                </Button>
              ))}
            </Box>
          </Box>
        ))}

        <Typography
          sx={{
            color: LARANJA,
            fontSize: 12,
            fontWeight: 700,
            mt: 2,
            mb: 1,
          }}
        >
          PROJETOS
        </Typography>

        {projetos.map((projeto) => (
          <Button
            key={projeto.rota}
            fullWidth
            onClick={() => navegar(projeto.rota)}
            sx={{
              ...estiloLink,
              justifyContent: "flex-start",
              py: 1,
            }}
          >
            {projeto.nome}
          </Button>
        ))}

        <Button
          onClick={rolarParaRodape}
          sx={{
            ...estiloLink,
            justifyContent: "flex-start",
            mt: 1,
          }}
        >
          Contato
        </Button>

        <Divider
          sx={{
            borderColor: "#263747",
            my: 2,
          }}
        />

        {isCliente && (
          <Button
            onClick={() => navegar("/meusOrcamentos")}
            sx={estiloLink}
          >
            Meus Orçamentos
          </Button>
        )}

        {isAdmin && (
          <Button
            fullWidth
            onClick={() => navegar("/admin")}
            sx={{ ...estiloLink, justifyContent: "flex-start", color: LARANJA }}
          >
            Central Administrativa
          </Button>
        )}

        {isEngenheiro && (
          <Button
            onClick={() => navegar("/recebimentoCotacao")}
            sx={estiloLink}
          >
            Recebimento de Cotações
          </Button>
        )}

        <Button
          fullWidth
          onClick={() => navegar("/cotacao")}
          variant="contained"
          sx={{
            ...botaoLaranja,
            mt: 1,
          }}
        >
          Solicitar Orçamento
        </Button>

        {!usuario ? (
          <Button
            onClick={() => navegar("/login")}
            sx={{ ...estiloLink, mt: 2 }}
          >
            Entrar
          </Button>
        ) : (
          <Button
            onClick={handleLogout}
            sx={{ ...estiloLink, mt: 2 }}
          >
            Sair
          </Button>
        )}
      </Drawer>
    </>
  );
}
