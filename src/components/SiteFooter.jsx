export default function SiteFooter({ content, locale = "et" }) {
  const role = locale === "en" ? "Painter" : "Maalikunstnik";

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__name">{content.site.title}</p>
        <p className="site-footer__meta">
          <span>{role}</span>
          <span aria-hidden="true" className="site-footer__dot" />
          <span>© 2026</span>
        </p>
        <p className="site-footer__byline">by L. Raudsoo</p>
      </div>
    </footer>
  );
}
