import { Box, Container, Grid, Typography, Link, IconButton } from "@mui/material";
import { Instagram, LinkedIn, YouTube } from "@mui/icons-material";
import pandoraIcon from "../assets/img/pandoracode.png";

export default function Footer() {
  return (
    <>
      {/* Linha laranja acima do rodapé */}
      <Box sx={{ height: "4px", bgcolor: "#ff6600", width: "100%" }} />

      <Box
        component="footer"
        sx={{
          background: "linear-gradient(180deg, #001329 0%, #000814 100%)",
          color: "#fff",
          pt: 5,
          pb: 5,
          width: "100%",
          fontFamily: "Roboto, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container
          maxWidth={false}
          sx={{
            px: { xs: 3, md: 8, lg: 12 },
          }}
        >
          {/* Seções principais */}
          <Grid
            container
            spacing={3}
            alignItems="flex-start"
            justifyContent="space-between"
          >
            {/* CatoTech */}
            <Grid item xs={12} md={3.5}>
              <Typography
                variant="h6"
                sx={{
                  color: "#ff6600",
                  fontWeight: "bold",
                  mb: 1.5,
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                CatoTech
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.95rem",
                  lineHeight: 1.6,
                  color: "#cdd6e0",
                  maxWidth: 280,
                }}
              >
                Projetos e soluções inteligentes em engenharia mecânica.
              </Typography>
            </Grid>

            {/* Contato */}
            <Grid item xs={12} md={4}>
              <Typography
                variant="h6"
                sx={{
                  color: "#ff6600",
                  fontWeight: "bold",
                  mb: 1.5,
                  textAlign: "center",
                  textTransform: "uppercase",
                }}
              >
                Contato
              </Typography>
              <Box sx={{ textAlign: "center" }}>
                <Typography sx={{ mb: 0.8, fontSize: "0.95rem", color: "#d9e2ef" }}>
                  <strong>Email:</strong>{" "}
                  <Link
                    href="mailto:orcamento.catotech@outlook.com"
                    color="#fff"
                    underline="hover"
                    sx={{
                      transition: "color 0.3s",
                      "&:hover": { color: "#ff6600" },
                    }}
                  >
                    orcamento.catotech@outlook.com
                  </Link>
                </Typography>
                <Typography sx={{ mb: 0.8, fontSize: "0.95rem", color: "#d9e2ef" }}>
                  <strong>WhatsApp:</strong> (55) 99138-4824
                </Typography>
                <Typography sx={{ fontSize: "0.95rem", color: "#d9e2ef" }}>
                  <strong>Endereço:</strong> Rua Piauí, 595 - Panambi, RS
                </Typography>
              </Box>
            </Grid>

            {/* Redes Sociais */}
            <Grid item xs={12} md={3.5} sx={{ textAlign: "right" }}>
              <Typography
                variant="h6"
                sx={{
                  color: "#ff6600",
                  fontWeight: "bold",
                  mb: 1.5,
                  textTransform: "uppercase",
                }}
              >
                Redes Sociais
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-end" },
                  gap: 1.8,
                  pr: { md: 2 },
                }}
              >
                <IconButton
                  href="https://www.instagram.com/catotechoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#fff",
                    transition: "color 0.3s, transform 0.3s",
                    "&:hover": {
                      color: "#ff6600",
                      transform: "scale(1.15)",
                    },
                  }}
                >
                  <Instagram fontSize="medium" />
                </IconButton>
                <IconButton
                  href="https://www.linkedin.com/company/catotech"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#fff",
                    transition: "color 0.3s, transform 0.3s",
                    "&:hover": {
                      color: "#ff6600",
                      transform: "scale(1.15)",
                    },
                  }}
                >
                  <LinkedIn fontSize="medium" />
                </IconButton>
                <IconButton
                  href="https://www.youtube.com/@catotech"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: "#fff",
                    transition: "color 0.3s, transform 0.3s",
                    "&:hover": {
                      color: "#ff6600",
                      transform: "scale(1.15)",
                    },
                  }}
                >
                  <YouTube fontSize="medium" />
                </IconButton>
              </Box>
            </Grid>
          </Grid>

          {/* Rodapé inferior com logo à direita e texto centralizado */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mt: 4.5,
            }}
          >
            {/* Texto centralizado */}
            <Typography
              sx={{
                textAlign: "center",
                fontSize: "0.9rem",
                color: "#bfcad8",
                letterSpacing: "0.3px",
              }}
            >
              © {new Date().getFullYear()} <strong>CatoTech</strong>. Todos os direitos
              reservados.
            </Typography>

            {/* Logo PandoraCode fixo à direita na mesma linha */}
            <Box
              component="img"
              src={pandoraIcon}
              alt="PandoraCode"
              sx={{
                width: 110, // 🔹 aumentado para o tamanho que você marcou
                height: 110,
                objectFit: "contain",
                position: "absolute",
                right: { xs: 16, md: 40 },
                bottom: -12, // leve ajuste para alinhar visualmente
                opacity: 0.98,
                transition: "transform 0.3s ease, filter 0.3s ease",
                "&:hover": {
                  transform: "scale(1.05)",
                  filter: "drop-shadow(0 0 10px rgba(104,0,255,0.6))",
                },
              }}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
}
