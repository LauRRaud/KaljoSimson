import Link from "next/link";

export default function NotFound() {
  return (
    <main className="admin-page">
      <section className="admin-login">
        <p className="eyebrow">404</p>
        <h1>Lehte ei leitud</h1>
        <p className="admin-login__copy">
          Otsitud sisu ei ole praegu selles galeriis olemas.
        </p>
        <div className="admin-toolbar__group">
          <Link className="button" href="/">
            Ava avaleht
          </Link>
          <Link className="button button--ghost" href="/admin">
            Ava admin
          </Link>
        </div>
      </section>
    </main>
  );
}
