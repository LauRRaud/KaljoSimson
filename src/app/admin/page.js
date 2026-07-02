import Link from "next/link";
import AdminStudio from "@/components/AdminStudio";
import ThemeToggle from "@/components/ThemeToggle";
import { loginAction, logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/content-store";

export const metadata = {
  title: "Admin",
  description: "BeyondFrames sisuhaldus",
};

export const dynamic = "force-dynamic";

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <div className="page-shell admin-page-shell">
        <main className="admin-page admin-page--login">
          <div className="admin-login-wrap">
            <nav
              className="site-nav admin-topbar admin-topbar--login"
              aria-label="Sisuhalduse vaade"
            >
              <div className="site-nav__links admin-topbar__links">
                <Link href="/">Avaleht</Link>
                <span className="admin-topbar__current">Sisuhaldus</span>
              </div>

              <div className="site-nav__controls admin-topbar__controls">
                <span className="admin-topbar__locale-copy">Vaade</span>
                <ThemeToggle locale="et" />
              </div>
            </nav>

            <section className="admin-login">
              <div className="admin-login__header">
                <p className="eyebrow">Sisuhaldus</p>
                <h1>BeyondFrames</h1>
                <p className="admin-login__copy">
                  Halda kunstnikke, teoseid ja lehtede tekste — eesti ja
                  inglise keeles.
                </p>
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
          </div>
        </main>
      </div>
    );
  }

  const content = await getSiteContent();

  return (
    <div className="page-shell admin-page-shell">
      <main className="admin-page">
        <section className="admin-shell">
          <div className="admin-shell__top">
            <div className="section-heading">
              <p className="eyebrow">Sisuhaldus</p>
              <h1>BeyondFrames</h1>
              <p className="admin-shell__copy">
                Muuda avalehe, galerii ja kunstnike sisu samas klaaspaneeli
                keskkonnas, mida külastaja näeb ka live-lehtedel.
              </p>
            </div>

            <div className="admin-actions-inline">
              <Link className="button button--ghost button--admin-ghost" href="/">
                Avalehele
              </Link>
              <form action={logoutAction}>
                <button className="button button--ghost button--admin-ghost" type="submit">
                  Logi välja
                </button>
              </form>
            </div>
          </div>

          <AdminStudio initialContent={content} />
        </section>
      </main>
    </div>
  );
}
