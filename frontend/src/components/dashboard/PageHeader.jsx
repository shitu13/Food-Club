export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-navy-dark/70">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
