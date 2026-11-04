import { Box, Typography, Button, Container, Link, TextField } from "@mui/material";

export default function Dashboard() {
  return (
    <Box>
      {/* Cabeçalho */}
      <Box
        sx={{
          width: "100%",
          background: "#0a1a2f",
          color: "#fff",
          py: 2,
        }}
      >
        <Container sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ fontWeight: 900, color: "#ff5a18" }}>
            CatoTech
          </Typography>

          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Link href="#" color="inherit" underline="none">HOME</Link>
            <Link href="#" color="inherit" underline="none">SERVIÇOS</Link>
            <Link href="#" color="inherit" underline="none">PRODUTOS</Link>
            <Link href="#" color="inherit" underline="none">QUEM SOMOS</Link>
            <Link href="#" color="inherit" underline="none">CONTATO</Link>

            {/* Botões à direita */}
            <Button
              sx={{
                ml: 3,
                background: "#ff5a18",
                color: "#fff",
                fontWeight: "bold",
                "&:hover": { background: "#e04e14" }
              }}
            >
              Cadastro
            </Button>
            <Button
              sx={{
                ml: 1,
                background: "#0a1a2f",
                color: "#fff",
                border: "1px solid #fff",
                fontWeight: "bold",
                "&:hover": { background: "#132d4d" }
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Banner */}
      <Box
        sx={{
          backgroundImage: "url('./img/bannerhome.jpg')", // troque pela imagem de engrenagens que você mostrou
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: 500,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 2
        }}
      >
        <Container>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "#ff5a18"
            }}
          >
            Imaginou: A Catotech projeta para você.
          </Typography>

          <Typography
            sx={{
              mb: 4,
              color: "#fff",
              maxWidth: "800px",
              mx: "auto"
            }}
          >
            Catotech é uma empresa especialista em orçamentos e projetos mecânicos, unindo tecnologia,
            precisão e inovação para entregar soluções sob medida que otimizam a sua produção e impulsionam
            sua indústria.
          </Typography>

          {/* Campo de pesquisa */}
          <Box sx={{ display: "flex", justifyContent: "center", maxWidth: 800, mx: "auto" }}>
            <TextField
              fullWidth
              placeholder="Digite o que você gostaria de procurar"
              variant="outlined"
              sx={{
                background: "#fff",
                borderRadius: "4px 0 0 4px",
              }}
            />
            <Button
              variant="contained"
              sx={{
                background: "#ff5a18",
                color: "#fff",
                fontWeight: "bold",
                borderRadius: "0 4px 4px 0",
                px: 4
              }}
            >
              Pesquisar
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
