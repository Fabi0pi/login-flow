import { supabase } from "@/Lib/supabase";
import bcrypt from "bcryptjs";
import { z } from "zod";

const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

export type Login = z.infer<typeof LoginSchema>;

export async function POST(req: Request) {
  const body = await req.json();
  const result = LoginSchema.safeParse(body); //Zod valida che email sia una email valida e che password abbia almeno 8 caratteri

  if (!result.success) {
    return Response.json({ error: "Invalid input" }, { status: 400 });
  }

  const { email, password } = result.data;

  const { data: existing } = await supabase // Controlliamo se l'email esiste già prima di fare l'insert. Restituiamo 409 Conflict — errore semanticamente corretto ("la risorsa che vuoi creare esiste già").
    .from("users")
    .select("id")
    .eq("email", email)
    .single();

  if (existing) {
    return Response.json({ error: "Email already in use" }, { status: 409 });
  }

  const pw_hash = await bcrypt.hash(password, 12); // Il 12 è il cost factor: bcrypt esegue 2^12 = 4096 iterazioni interne. Ogni punto in più raddoppia il tempo. A 12 rounds un hash richiede ~300-400ms — abbastanza lento da rendere il brute force
  // impraticabile, abbastanza veloce da non impattare l'UX del login.

  const { error } = await supabase.from("users").insert({ email, pw_hash });

  if (error) {
    return Response.json({ error: "Registration failed" }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 201 });
}

/**
 * Nota di sicurezza:
 *
 * rispondere "email already in use" è tecnicamente una user enumeration — un attaccante può scoprire quali email sono registrate. In produzione si restituisce sempre lo stesso
 * messaggio generico ("if this email is not registered, you'll receive a link"). Per ora lo teniamo esplicito perché è più didattico.
 *
 */
