import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const navy = "#071B2E";
const orange = "#ff6600";

export default function Admin() {
  const [aba, setAba] = useState("pagamentos");
  const [pagamentos, setPagamentos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [cotacoes, setCotacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    async function carregar() {
      setCarregando(true);
      setErro("");
      const [p, pr, c] = await Promise.all([
        supabase.from("cotacoes_pagamentos").select("id,cotacao_id,valor,status,metodo,criado_em,confirmado_em").order("criado_em", { ascending: false }),
        supabase.from("projetos").select("id,cotacao_id,numero_projeto,titulo,status,percentual_conclusao,previsao_entrega,criado_em").order("criado_em", { ascending: false }),
        supabase.from("cotacoes").select("id,numero_solicitacao,cliente_nome,status"),
      ]);
      if (!ativo) return;
      const falha = [p, pr, c].find((x) => x.error);
      if (falha) setErro(falha.error.message || "Não foi possível consultar os registros.");
      else {
        setPagamentos(p.data || []);
        setProjetos(pr.data || []);
        setCotacoes(c.data || []);
      }
      setCarregando(false);
    }
    carregar();
    return () => { ativo = false; };
  }, []);

  const mapa = new Map(cotacoes.map((c) => [c.id, c]));
  const dinheiro = (v) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(v || 0));
  const data = (v) => v ? new Date(v).toLocaleDateString("pt-BR") : "—";
  const th = { padding: "13px 15px", textAlign: "left", borderBottom: "1px solid #dce3e9", whiteSpace: "nowrap", color: navy };
  const td = { padding: "13px 15px", borderBottom: "1px solid #e7ecf0", color: navy };
  const botao = (id, texto) => ({
    type: "button", onClick: () => setAba(id),
    style: { border: "none", borderBottom: aba === id ? `3px solid ${orange}` : "3px solid transparent", background: "transparent", padding: "13px 18px", cursor: "pointer", color: navy, fontWeight: aba === id ? 800 : 500, fontSize: 15 },
    children: texto,
  });

  return (
    <main style={{ minHeight: "75vh", padding: "125px 24px 70px", background: "#f3f6f8" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ color: orange, fontSize: 12, fontWeight: 800, letterSpacing: 2 }}>CATO TECH · ADMINISTRAÇÃO</div>
        <h1 style={{ color: navy, margin: "8px 0" }}>Central Administrativa</h1>
        <p style={{ color: "#526476", marginBottom: 24 }}>Acompanhamento de pagamentos e projetos. Área somente para consulta.</p>
        <section style={{ background: "white", borderRadius: 12, border: "1px solid #e0e7ed", overflow: "hidden" }}>
          <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #e0e7ed", paddingLeft: 12 }}>
            <button {...botao("pagamentos", `Pagamentos (${pagamentos.length})`)} />
            <button {...botao("projetos", `Projetos (${projetos.length})`)} />
          </div>
          {carregando ? <p style={{ padding: 24, color: navy }}>Carregando informações...</p> : erro ? <p role="alert" style={{ padding: 24, color: "#a32020" }}>Erro ao consultar o Supabase: {erro}</p> : (
            <div style={{ overflowX: "auto" }}>
              {aba === "pagamentos" ? pagamentos.length === 0 ? <p style={{ padding: 24 }}>Nenhum pagamento registrado.</p> : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead><tr>{["Solicitação", "Cliente", "Valor", "Situação", "Método", "Criado em", "Confirmado em"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>{pagamentos.map((p) => { const c = mapa.get(p.cotacao_id); return <tr key={p.id}><td style={td}>{c?.numero_solicitacao || `#${p.cotacao_id}`}</td><td style={td}>{c?.cliente_nome || "—"}</td><td style={td}>{dinheiro(p.valor)}</td><td style={td}>{p.status || "—"}</td><td style={td}>{p.metodo || "—"}</td><td style={td}>{data(p.criado_em)}</td><td style={td}>{data(p.confirmado_em)}</td></tr>; })}</tbody>
                </table>
              ) : projetos.length === 0 ? <p style={{ padding: 24 }}>Nenhum projeto cadastrado.</p> : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead><tr>{["Projeto", "Título", "Cliente", "Status", "Conclusão", "Previsão de entrega"].map((h) => <th key={h} style={th}>{h}</th>)}</tr></thead>
                  <tbody>{projetos.map((p) => { const c = mapa.get(p.cotacao_id); return <tr key={p.id}><td style={td}>{p.numero_projeto || `#${p.id}`}</td><td style={td}>{p.titulo || "—"}</td><td style={td}>{c?.cliente_nome || "—"}</td><td style={td}>{p.status || "—"}</td><td style={td}>{p.percentual_conclusao ?? 0}%</td><td style={td}>{data(p.previsao_entrega)}</td></tr>; })}</tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
