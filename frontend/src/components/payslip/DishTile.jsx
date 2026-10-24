import { useState } from "react";
import Icon from "../dashboard/Icon";
import { formatPaisa, toPaisa } from "../../utils/money";
import Stepper from "./Stepper";

function Photo({ src, alt }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="flex h-28 w-full items-center justify-center bg-tint text-navy/30">
        <Icon name="dishes" className="h-8 w-8" />
      </div>
    );
  }
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className="h-28 w-full object-cover" />;
}

export default function DishTile({ dish, qty, onChange }) {
  return (
    <li className={`flex flex-col overflow-hidden rounded-2xl bg-white ring-2 ${qty > 0 ? "ring-leaf" : "ring-gold/30"}`}>
      <Photo key={`${dish.id}-${dish.image}`} src={dish.image} alt="" />
      <div className="flex flex-1 flex-col p-3">
        <p className="font-bold leading-tight text-navy">{dish.name.en}</p>
        {dish.name.bn && (
          <p lang="bn" className="text-xs text-navy-dark/70">
            {dish.name.bn}
          </p>
        )}
        <p className="mt-1 font-display text-lg font-extrabold text-orange-dark">{formatPaisa(toPaisa(dish.price))}</p>
        <div className="mt-auto pt-3">
          {qty === 0 ? (
            <button
              type="button"
              onClick={() => onChange(1)}
              aria-label={`Add ${dish.name.en}`}
              className="w-full rounded-full bg-orange px-4 py-2 text-sm font-bold text-white hover:bg-orange-dark"
            >
              Add
            </button>
          ) : (
            <Stepper name={dish.name.en} qty={qty} onChange={onChange} />
          )}
        </div>
      </div>
    </li>
  );
}
