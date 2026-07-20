import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <p className="eyebrow">404</p>
      <h1>Lehte ei leitud</h1>
      <p className="section-copy">Otsitud sisu ei ole sellel lehel olemas.</p>
      <Link className="cta cta--primary" href="/">
        Ava avaleht
      </Link>
    </main>
  );
}
