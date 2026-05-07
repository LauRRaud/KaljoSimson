import AdminStudio from "@/components/AdminStudio";
import { loginAction, logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getDemoContent, getSiteContent } from "@/lib/content-store";

export const metadata = {
  title: "Admin",
  description: "BeyondFrames sisuhaldus",
};

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="admin-page admin-page--login">
        <section className="admin-login">
          <div className="admin-login__header">
            <h1>BeyondFrames</h1>
            <p className="admin-login__label">Sisuhaldus</p>
          </div>

          {params?.error === "password" ? (
            <p className="admin-status">Vale parool. Proovi uuesti.</p>
          ) : null}

          <form action={loginAction} className="admin-login__form">
            <div className="form-field form-field--tight">
              <input
                className="input input--admin"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Parool"
                required
              />
            </div>
            <button className="button button--admin" type="submit">
              Logi sisse
            </button>
          </form>
        </section>
      </main>
    );
  }

  const [content, demoContent] = await Promise.all([
    getSiteContent(),
    getDemoContent(),
  ]);

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-shell__top">
          <div className="section-heading">
            <h1>BeyondFrames</h1>
            <p className="admin-login__label">Sisuhaldus</p>
          </div>

          <form action={logoutAction}>
            <button className="button button--ghost button--admin-ghost" type="submit">
              Logi välja
            </button>
          </form>
        </div>

        <AdminStudio initialContent={content} demoContent={demoContent} />
      </section>
    </main>
  );
}
