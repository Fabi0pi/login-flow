// @vitest-environment node
import { signToken, verifyToken } from "@/Lib/jwt";
import { SignJWT } from "jose";
import { describe, it, expect, vi, afterEach } from "vitest";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
const payload = { sub: "user-123", email: "email@test.it" };

describe("signToke", () => {
  it("returns a three-part jwt string", async () => {
    const token = await signToken(payload);
    expect(token.split(".")).toHaveLength(3);
  });
});

describe("verifyToken", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns the original payload for a valid token", async () => {
    const token = await signToken(payload);
    const result = await verifyToken(token);

    expect(result?.sub).toBe(payload.sub);
    expect(result?.email).toBe(payload.email);
  });

  it("returns null for a malformed token", async () => {
    const result = await verifyToken("not.a.jwt");
    expect(result).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const wrongSecret = new TextEncoder().encode("wrong-secret");
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(wrongSecret);

    const result = await verifyToken(token);
    expect(result).toBeNull();
  });

  it("returns null for an expired token", async () => {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("1s")
      .sign(secret);

    vi.useFakeTimers();
    vi.setSystemTime(new Date(Date.now() + 5000));

    const result = await verifyToken(token);
    expect(result).toBeNull();
  });
});


/**
 * NOTE
 * 
  env.JWT_SECRET in vitest.config.ts
  I test girano in un processo separato da Next.js — il file .env.local non viene caricato. Devi fornire le variabili d'ambiente direttamente nella config di Vitest. Il valore può essere qualsiasi
  stringa: non è il secret di produzione, serve solo a far firmare e verificare i token nello stesso modo.
  
  environment: 'jsdom'
  Simula il DOM del browser in Node.js. Non serve per i test JWT (che sono puri Node), ma servirà per i component test del prossimo step — è più semplice impostarlo una volta sola per tutti.

  setupFiles: ['./vitest.setup.ts']
  Viene eseguito prima di ogni test file. @testing-library/jest-dom aggiunge matcher come toBeInTheDocument() e toHaveValue() che useremo nel step 15.

  afterEach(() => vi.useRealTimers())
  Ogni test che usa timer finti deve ripristinare quelli reali alla fine, altrimenti contamina il test successivo. Mettendolo in afterEach è garantito anche se il test fallisce.

  Il test con wrongSecret
  Verifica che un token firmato da qualcun altro venga rifiutato. È il test di sicurezza più importante: se verifyToken accettasse qualsiasi firma, chiunque potrebbe creare token validi impersonando
  utenti.
  
  Il test con vi.useFakeTimers() e vi.setSystemTime()
  jose usa Date.now() internamente per controllare l'expiry del token. Vitest può sostituire l'orologio di sistema con uno finto — così possiamo "avanzare il tempo" di 5 secondi senza aspettare
  davvero. Il token firmato con setExpirationTime('1s') risulta scaduto nel momento in cui viene verificato.
 */