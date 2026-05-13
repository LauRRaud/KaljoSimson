import Link from "next/link";
import { redirect } from "next/navigation";
import AdminArtworksStudio from "@/components/AdminArtworksStudio";
import ThemeToggle from "@/components/ThemeToggle";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Galerii | Admin",
  description: "BeyondFrames galerii haldus",
};

export default async function AdminArtworksPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const artworks = await getAdminArtworks();

  return (
    <div className="page-shell admin-page-shell">
      <main className="admin-page">
        <section className="admin-shell">
          <div className="admin-shell__top">
            <div className="section-heading">
              <p className="eyebrow">Galerii haldus</p>
              <h1>BeyondFrames</h1>
              <p className="admin-shell__copy">
                Eraldi galerii haldus jääb samasse visuaalsesse keelde nagu peamine
                sisuhaldus ja avalik vaade.
              </p>
            </div>

            <div className="admin-actions-inline admin-actions-inline--stacked">
              <nav
                className="site-nav admin-topbar admin-topbar--subpage"
                aria-label="Admini vaated"
              >
                <div className="site-nav__links admin-topbar__links">
                  <Link href="/admin">Üldsisuhaldus</Link>
                </div>

                <div className="site-nav__controls admin-topbar__controls">
                  <span className="admin-topbar__locale-copy">Vaade</span>
                  <ThemeToggle locale="et" />
                </div>
              </nav>

              <form action={logoutAction}>
                <button className="button button--ghost button--admin-ghost" type="submit">
                  Logi välja
                </button>
              </form>
            </div>
          </div>

          <AdminArtworksStudio artworks={artworks} />
        </section>
      </main>
    </div>
  );
}
