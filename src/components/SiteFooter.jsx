export default function SiteFooter({ content }) {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner site-footer__inner--centered">
        <div className="brand-lockup brand-lockup--footer">
          <span className="brand-lockup__title">{content.site.title}</span>
          <span className="site-footer__year">2026</span>
        </div>
      </div>
    </footer>
  );
}
