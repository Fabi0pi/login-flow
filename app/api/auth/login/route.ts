import { signToken } from "@/Lib/jwt";
import { supabase } from "@/Lib/supabase";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { use } from "react";
import { success, z } from "zod";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

const DUMMY_HASH =
  "$2b$12$K8GpHR3P7q.dJL5MNNjXyO1234567890abcdefghijklmnopqrstu";

export async function POST(req: Request) {
  const body = await req.json();
  const result = loginSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = result.data;

  const { data: user } = await supabase
    .from("users")
    .select("id, email, password_hash")
    .eq("email", email)
    .single();

  const hashToCheck = user?.password_hash ?? DUMMY_HASH;
  const valid = await bcrypt.compare(password, hashToCheck);

  if (!user || !valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken({ email: user.email, sub: user.id });
  const cookieStore = await cookies();
  cookieStore.set("auth_tkn", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return Response.json({ success: true });
}

/**
 * NOTE
 * 
 * DUMMY_HASH e timing attack
   Se l'utente non esiste, potresti pensare di rispondere subito con 401. Non farlo. Un attaccante che misura i tempi di risposta noterebbe che "email inesistente" risponde in ~1ms mentre "password
   sbagliata" risponde in ~300ms (il tempo di bcrypt). Confrontando i tempi, può capire quali email sono registrate senza mai fare login. La soluzione: eseguiamo bcrypt.compare sempre, anche se
   l'utente non esiste, usando un hash dummy. Il tempo di risposta diventa uniforme in entrambi i casi.

   sub: user.id
   Nel JWT standard, sub (subject) identifica l'utente. Usiamo l'UUID, mai l'email — l'email può cambiare, l'UUID no.

   httpOnly: true
   Il cookie non è accessibile da JavaScript (document.cookie). Questo blocca completamente gli attacchi XSS: anche se un attaccante riesce a iniettare script nella pagina, non può leggere il token.

   secure: process.env.NODE_ENV === 'production'
   In produzione il cookie viene inviato solo su HTTPS. 
   In sviluppo lo disabilitiamo altrimenti localhost non funziona.

   sameSite: 'lax'
   Protezione CSRF: il cookie viene inviato solo nelle richieste che partono dal tuo stesso sito, non da form su siti esterni. strict è più sicuro ma rompe i link da email (es. "torna all'app"). lax è
   il giusto compromesso.
 */
