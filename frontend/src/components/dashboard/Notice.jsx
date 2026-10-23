import Icon from "./Icon";

export default function Notice({ notice, onDismiss }) {
  if (!notice) return null;
  const isError = notice.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`mb-4 flex items-start justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ring-1 ${
        isError ? "bg-red-50 text-red-800 ring-red-200" : "bg-leaf/10 text-leaf-dark ring-leaf/30"
      }`}
    >
      <p>{notice.text}</p>
      <button type="button" onClick={onDismiss} aria-label="Dismiss message" className="shrink-0 rounded-full p-1 hover:bg-black/5">
        <Icon name="close" className="h-4 w-4" />
      </button>
    </div>
  );
}
