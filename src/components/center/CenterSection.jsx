export default function CenterSection({ icon: Icon, title, subtitle, accent, children }) {
  return (
    <section className="mb-6">
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${accent}14`, color: accent }}
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-black text-gray-900">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}