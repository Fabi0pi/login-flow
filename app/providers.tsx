"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./context/auth/auth-provider";
import { useState } from "react";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

/**
 * NOTE
    
  La factory function () => new QueryClient() viene eseguita una sola volta, al primo render. useState tiene il valore stabile per tutta la vita del componente.
  
  staleTime: 60 * 1000
  Di default TanStack Query considera i dati immediatamente "stale" (vecchi) e li richiede ad ogni focus della finestra. Con staleTime: 60000 i dati restano freschi per 60 secondi — evita refetch
  inutili per dati che non cambiano spesso.
  
  ReactQueryDevtools fuori da AuthProvider ma dentro QueryClientProvider
  Deve essere dentro QueryClientProvider per accedere al client, ma non ha bisogno di essere dentro AuthProvider. Posizionarlo dopo i children lo rende visivamente separato nella UI (appare sempre
  come overlay).
  
  QueryClientProvider wrappa AuthProvider
  In questo progetto l'ordine non cambia il comportamento — i due provider sono indipendenti. Ma come convenzione, i provider più "infrastrutturali" (networking, cache) stanno fuori, quelli più "di
  dominio" (auth) stanno dentro.
  
  Perché non usiamo TanStack Query per /api/auth/me
  TanStack Query è per lo stato server della tua app (lista di post, profilo utente, dati del dashboard). Lo stato auth è diverso: è globale, sincrono con il cookie, e viene aggiornato da azioni
  esplicite (login/logout) — non da refetch in background. React Context è lo strumento giusto per questo.

 */