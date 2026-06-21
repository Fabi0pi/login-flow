import { verifyToken } from "@/Lib/jwt";
import { supabase } from "@/Lib/supabase";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    return Response.json({ user: null }, { status: 401 });
  }

  const payload = await verifyToken(token);

  if (!payload) {
    return Response.json({ user: null }, { status: 401 });
  }

  const { data: user } = await supabase
    .from("users")
    .select("id, email, created_at")
    .eq("id", payload.sub)
    .single();

  if (!user) {
    return Response.json({ user: null }, { status: 401 });
  }

  return Response.json({ user });
}

/**
 * NOTE
  Tre controlli in cascata
  Il flusso ha tre punti di fallimento separati, ognuno con il suo motivo:

  1. Cookie assente → utente non loggato, fine.
  2. Token non valido → token scaduto, manomesso, o firmato con un secret diverso. verifyToken ritorna null in tutti questi casi.
  3. Utente non trovato nel DB → il token è crittograficamente valido, ma l'utente è stato cancellato dal database dopo il login. Senza questa query, un utente eliminato potrebbe continuare ad
  accedere fino alla scadenza del token.

  Perché facciamo la query al DB invece di usare solo il payload del JWT
  Il JWT contiene { sub: user.id, email } — dati congelati al momento del login. Se nel frattempo l'utente ha cambiato email, o è stato sospeso, il JWT non lo sa. Interrogando il DB ottieni sempre lo
  stato corrente dell'utente. Il JWT serve solo per autenticare l'identità (sub), non come fonte di dati.

  select('id, email, created_at') — mai *
  Selezioniamo esplicitamente i campi che vogliamo restituire. Se scrivessi select('*'), risponderesti al browser con il password_hash. Non è un rischio diretto (l'utente già autenticato lo
  riceverebbe su se stesso), ma è buona pratica non trasmettere mai campi sensibili.

  status: 401 in tutti i casi di errore
  Non distinguiamo tra "token assente", "token scaduto" e "utente non trovato". Al client interessa solo una cosa: sei autenticato o no. Messaggi d'errore dettagliati aiuterebbero un attaccante a
  capire lo stato del sistema.
 */
