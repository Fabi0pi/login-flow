import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("auth_token");

  return Response.json({ success: true });
}

/*
 NOTE:
  Il logout è un'azione che modifica stato (cancella la sessione). Le richieste GET devono essere idempotenti e prive di side effects — un browser può pre-fetcharle, un proxy può cachecarle. POST
  segnala esplicitamente che stai eseguendo un'azione.

  cookies().delete('auth_token')
  "Cancellare" un cookie significa inviare al browser un header Set-Cookie con Max-Age=0 o Expires nel passato. Il browser lo rimuove. È next/headers che costruisce quell'header per te.

  ---
  Il limite fondamentale del logout con JWT

  Questo è il punto più importante da capire sui JWT stateless.

  Il cookie è cancellato — il browser non lo manda più. Ma il token JWT che esisteva è ancora crittograficamente valido fino alla sua scadenza (7 giorni). Se qualcuno lo avesse copiato prima del
  logout, potrebbe ancora usarlo.

  I JWT non hanno un meccanismo di revoca nativo. Le soluzioni in produzione sono:

  ┌─────────────────────────────────────┬─────────────────────────────────────────────────────────────────────────────────┬──────────────────────────┐
  │              Approccio              │                                  Come funziona                                  │          Costo           │
  ├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
  │ Token brevi (15min) + refresh token │ Il token scade presto da solo                                                   │ Complessità aggiuntiva   │
  ├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
  │ Token blacklist                     │ Salvi i token invalidati nel DB e li controlli ad ogni richiesta                │ Lookup su ogni request   │
  ├─────────────────────────────────────┼─────────────────────────────────────────────────────────────────────────────────┼──────────────────────────┤
  │ Versione utente                     │ Salvi un token_version nell'utente, lo includi nel JWT, lo incrementi al logout │ Query DB ad ogni request │
  └─────────────────────────────────────┴─────────────────────────────────────────────────────────────────────────────────┴──────────────────────────┘

  Per questo progetto accettiamo il trade-off: logout cancella il cookie, il token residuo scade da solo in 7 giorni. In produzione reale useresti token da 15 minuti.
*/
