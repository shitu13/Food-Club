import { useEffect, useRef } from "react";
import Icon from "./Icon";

// Uses the native <dialog> element: focus is trapped and Escape closes it.
export default function Modal({ title, onClose, children, widthClass = "max-w-xl" }) {
  const ref = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby="modal-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${widthClass} rounded-3xl border-4 border-gold bg-white p-0 text-navy-dark backdrop:bg-navy-dark/60`}
    >
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="modal-title" className="text-2xl font-extrabold">
            {title}
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-1.5 text-navy hover:bg-tint">
            <Icon name="close" />
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </dialog>
  );
}
