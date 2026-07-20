import AdminPanel from "@/components/AdminPanel";
import AdminRecovery from "@/components/AdminRecovery";
import { isAdminAuthenticated, isRecoveryEnabled } from "@/lib/admin-auth";
import { getSiteContent } from "@/lib/content-store";
import { loginAction, logoutAction } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage({ searchParams }) {
  const params = await searchParams;
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="admin-login-page">
        {/* Taastamise vorm on login-vormi kõrval, mitte sees — HTML ei luba pesastatud form'i. */}
        <div className="admin-login">
          <form action={loginAction} className="admin-login__form">
            <p className="eyebrow">Kaljo Simson</p>
            <h1>Admin</h1>
            <p className="section-copy">
              Sisu haldamiseks sisesta administraatori parool.
            </p>
            {params?.error === "password" ? (
              <p className="admin-error">Vale parool. Proovi uuesti.</p>
            ) : null}
            <label className="admin-field">
              <span className="admin-field__label">Parool</span>
              <input
                autoComplete="current-password"
                autoFocus
                className="admin-input"
                name="password"
                required
                type="password"
              />
            </label>
            <button className="cta cta--primary" type="submit">
              Logi sisse
            </button>
          </form>
          {isRecoveryEnabled() ? <AdminRecovery /> : null}
        </div>
      </main>
    );
  }

  const content = await getSiteContent();

  return (
    <main className="admin-page">
      <AdminPanel initialContent={content} logoutAction={logoutAction} />
    </main>
  );
}
