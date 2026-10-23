import { useContext } from "react";
import { MenuSectionsContext } from "./context";

export function useMenuSections() {
  const value = useContext(MenuSectionsContext);
  if (!value) {
    throw new Error("useMenuSections must be used inside MenuSectionsProvider");
  }
  return value;
}
