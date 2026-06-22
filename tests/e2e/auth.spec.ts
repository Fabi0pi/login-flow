import { test, expect } from "@playwright/test";

test.describe("Auth flow", () => {
  const email = `test-${Date.now()}@example.com`;
  const password = "Password123!";

  test("register → login → dashboard → logout → protezione rotta", async ({
    page,
  }) => {
    // 1. Registrazione
    await page.goto("/register");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password").fill(password);
    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL("/login");

    // 2. Login
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password").fill(password);
    await page.getByRole("button", { name: /sign in/i }).click();

    await page.waitForURL("/dashboard");
    await expect(page.getByText(email)).toBeVisible();

    // 3. Logout
    await page.getByRole("button", { name: /sign out/i }).click();
    await page.waitForURL("/login");

    // 4. Rotta protetta senza sessione → redirect a /login
    await page.goto("/dashboard");
    await page.waitForURL("/login");
  });
});

/**
 * NOTE
 *   
   Un test unico per l'intero flusso
   L'E2E non è il posto per testare ogni edge case — quello lo fanno i test unitari e di componente. Il valore dell'E2E è verificare che i pezzi si connettano correttamente end-to-end. Un singolo test
   che copre il golden path (register → login → dashboard → logout → protezione) è più prezioso di dieci test E2E che duplicano ciò che già testa RTL.
  
   Date.now() nell'email
   Ogni run dei test crea un utente con email unica (test-1750123456789@example.com). Non devi gestire cleanup del DB o isolare ambienti — ogni esecuzione è indipendente. Il trade-off: il DB si riempie
   di utenti di test col tempo. In produzione si userebbe un DB di test separato con teardown, ma per apprendimento va benissimo così.

   getByLabel e getByRole
   Playwright usa selettori semantici: getByLabel('Email') trova l'input associato alla label "Email" — esattamente come lo trova un utente o uno screen reader. { exact: true } su Password serve perché
   senza di esso Playwright troverebbe anche "Confirm password" (che contiene "Password") e solleverebbe un'eccezione di ambiguità.
 */