import { useEffect, useState } from "react";
import { supabase, supabaseConfigurado } from "../lib/supabaseClient";

export default function usePerfilUsuario() {
  const [estado, setEstado] = useState({ carregando: true, usuario: null });
  useEffect(() => {
    let ativo = true;
    let versao = 0;
    const consultar = async () => {
      const atual = ++versao;
      if (!supabaseConfigurado) {
        if (ativo) setEstado({ carregando: false, usuario: null });
        return;
      }
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        if (!user) {
          if (ativo && atual === versao) setEstado({ carregando: false, usuario: null });
          return;
        }
        const { data: perfil, error: erroPerfil } = await supabase
          .from("perfis").select("nome,tipo").eq("id", user.id).single();
        if (erroPerfil) throw erroPerfil;
        const usuario = {
          id: user.id, email: user.email,
          nome: perfil.nome || user.user_metadata?.full_name || user.email,
          role: perfil.tipo,
        };
        if (ativo && atual === versao) setEstado({ carregando: false, usuario });
      } catch (erro) {
        console.error("Não foi possível consultar o perfil:", erro);
        if (ativo && atual === versao) setEstado({ carregando: false, usuario: null });
      }
    };
    consultar();
    if (!supabaseConfigurado) return () => { ativo = false; };
    const { data } = supabase.auth.onAuthStateChange(() => {
      // Evita consultas ao Supabase dentro do callback de autenticação.
      setTimeout(consultar, 0);
    });
    return () => { ativo = false; versao++; data.subscription.unsubscribe(); };
  }, []);
  return estado;
}
