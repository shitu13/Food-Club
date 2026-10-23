import { useCallback, useEffect, useMemo, useState } from "react";
import { listMenuSections } from "../services/menuSection.service";
import { MenuSectionsContext } from "./context";

// Loads the visible menu items once so the navbar, footer, home page and menu pages share them.
// Call `refresh()` after the super admin changes them.
export default function MenuSectionsProvider({ children }) {
  const [state, setState] = useState({ sections: [], loading: true, error: false });

  const refresh = useCallback(async () => {
    try {
      const all = await listMenuSections();
      // A logged-in staff member also receives hidden items, but visitors must never see them in the site menu.
      setState({ sections: all.filter((section) => section.isActive !== false), loading: false, error: false });
    } catch {
      setState((prev) => ({ ...prev, loading: false, error: true }));
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ ...state, refresh }), [state, refresh]);

  return <MenuSectionsContext.Provider value={value}>{children}</MenuSectionsContext.Provider>;
}
