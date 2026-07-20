export default function SiteFooter({ content, locale = "et" }) {
  const role = locale === "en" ? "Painter" : "Maalikunstnik";

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p className="site-footer__name">{content.site.title}</p>
        <p className="site-footer__role">{role}</p>
      </div>
      <div className="site-footer__base">
        <p className="site-footer__year">© 2026</p>
        <p className="site-footer__byline">by L. Raudsoo</p>
      </div>
    </footer>
  );
}
