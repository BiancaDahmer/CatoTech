import { useLayoutEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import MainLayout from "./layouts/mainLayout";
import Home from "./pages/home";
import Login from "./pages/login";
import Cadastro from "./pages/cadastro";
import EsqueceuSenha from "./pages/esqueceuSenha";
import Cotacao from "./pages/cotacao";
import RecebimentoCotacao from "./pages/recebimentoCotacao";
import CatalogoProdutos from "./pages/catalogoProdutos";
import DetalhesProduto from "./pages/detalhesProduto";
import QuemSomos from "./pages/quemSomos";
import ResponderCotacao from "./pages/responderCotacao";
import Pagamento from "./pages/pagamento";
import PpciCompleto from "./pages/ppciCompleto";
import Hidrante from "./pages/hidrante";
import SistemaDiluvio from "./pages/sistemaDiluvio";
import Sprinklers from "./pages/sprinklers";
import MeusOrcamentos from "./pages/meusOrcamentos";
import Admin from "./pages/admin";
import usePerfilUsuario from "./hooks/usePerfilUsuario";

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    const anterior = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    return () => { window.history.scrollRestoration = anterior; };
  }, [pathname]);
  return null;
}

function RotaProtegida({ children, roles }) {
  const location = useLocation();
  const { usuario, carregando } = usePerfilUsuario();
  if (carregando) return <div role="status" style={{ minHeight: "60vh", padding: "140px 24px", textAlign: "center" }}>Verificando acesso...</div>;
  if (!usuario) return <Navigate to="/login" replace state={{ from: location }} />;
  if (roles && !roles.includes(usuario.role)) return <Navigate to="/" replace />;
  return children;
}

function ChatClientePendente() {
  return (
    <div style={{ minHeight: "55vh", padding: "120px 24px 48px", background: "#F3F6F8", color: "#071B2E", textAlign: "center" }}>
      <h2>Atendimento da solicitação</h2>
      <p>O chat do cliente ainda está em desenvolvimento.</p>
      <p>Suas mensagens serão disponibilizadas após a integração do atendimento.</p>
    </div>
  );
}

const equipe = ["engenheiro", "admin"];

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/cotacao" element={<RotaProtegida roles={["cliente"]}><Cotacao /></RotaProtegida>} />
          <Route path="/recebimentoCotacao" element={<RotaProtegida roles={equipe}><RecebimentoCotacao /></RotaProtegida>} />
          <Route path="/produtos" element={<CatalogoProdutos />} />
          <Route path="/produto/:id" element={<DetalhesProduto />} />
          <Route path="/quemSomos" element={<QuemSomos />} />
          <Route path="/responderCotacao" element={<RotaProtegida roles={equipe}><ResponderCotacao /></RotaProtegida>} />
          <Route path="/responderCotacao/:id" element={<RotaProtegida roles={equipe}><ResponderCotacao /></RotaProtegida>} />
          <Route path="/pagamento" element={<RotaProtegida roles={["cliente"]}><Pagamento /></RotaProtegida>} />
          <Route path="/pagamento/:id" element={<RotaProtegida roles={["cliente"]}><Pagamento /></RotaProtegida>} />
          <Route path="/chat/:id" element={<RotaProtegida roles={["cliente"]}><ChatClientePendente /></RotaProtegida>} />
          <Route path="/projeto/ppci-completo" element={<PpciCompleto />} />
          <Route path="/projeto/hidrante" element={<Hidrante />} />
          <Route path="/projeto/sistema-diluvio" element={<SistemaDiluvio />} />
          <Route path="/projeto/sprinklers" element={<Sprinklers />} />
          <Route path="/meusOrcamentos" element={<RotaProtegida roles={["cliente"]}><MeusOrcamentos /></RotaProtegida>} />
          <Route path="/admin" element={<RotaProtegida roles={["admin"]}><Admin /></RotaProtegida>} />
        </Route>
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceuSenha" element={<EsqueceuSenha />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
