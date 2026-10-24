import { useRef } from "react";
import Modal from "../dashboard/Modal";
import { buttonPrimary, buttonSecondary } from "../dashboard/styles";
import SlipDocument from "./SlipDocument";
import { printSlip } from "./printSlip";
import { slipCss } from "./slipStyles";

export default function SlipModal({ slip, onClose }) {
  const slipRef = useRef(null);
  const title = slip.kind === "kitchen" ? "Kitchen order slip" : "Customer pay slip";

  return (
    <Modal title={title} onClose={onClose} widthClass="max-w-md">
      <style>{slipCss}</style>
      <div className="overflow-x-auto rounded-2xl bg-tint p-3">
        <div className="mx-auto w-fit bg-white px-3 shadow-sm ring-1 ring-black/10">
          <SlipDocument ref={slipRef} slip={slip} />
        </div>
      </div>
      <div className="mt-5 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={onClose} className={buttonSecondary}>
          Close
        </button>
        <button type="button" onClick={() => printSlip(slipRef.current)} className={buttonPrimary}>
          Print slip
        </button>
      </div>
    </Modal>
  );
}
