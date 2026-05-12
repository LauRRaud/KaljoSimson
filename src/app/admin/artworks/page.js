import Link from "next/link";
import { redirect } from "next/navigation";
import AdminArtworksStudio from "@/components/AdminArtworksStudio";
import { logoutAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAdminArtworks } from "@/lib/artworks";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kunstiteosed | Admin",
  description: "BeyondFrames kunstiteoste haldus",
};

export default async function AdminArtworksPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin");
  }

  const artworks = await getAdminArtworks();

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <div className="admin-shell__top">
          <div className="section-heading">
            <h1>BeyondFrames</h1>
            <p className="admin-login__label">Kunstiteoste haldus</p>
          </div>

          <div className="admin-actions-inline">
            <Link className="button button--ghost button--admin-ghost" href="/admin">
              Üldsisuhaldus
            </Link>
            <form action={logoutAction}>
              <button
                className="button button--ghost button--admin-ghost"
                type="submit"
              >
                Logi välja
              </button>
            </form>
          </div>
        </div>

        <AdminArtworksStudio artworks={artworks} />
      </section>
    </main>
  );
}
