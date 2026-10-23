import { Navigate, Route, Routes } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";
import PagePlaceholder from "./components/common/PagePlaceholder";
import { navItems, pageRoutes } from "./data/navigation";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";
import Contact from "./pages/Contact";
import Home from "./pages/Home";
import CustomerReviews from "./pages/about/CustomerReviews";
import OurStory from "./pages/about/OurStory";
import Login from "./pages/auth/Login";
import Menu from "./pages/Menu";
import MenuSectionPage from "./pages/MenuSectionPage";
import Dishes from "./pages/dashboard/Dishes";
import Managers from "./pages/dashboard/Managers";
import MenuItems from "./pages/dashboard/MenuItems";
import Overview from "./pages/dashboard/Overview";
import { ROLES } from "./utils/constants";

const builtPages = {
  "/menu": <Menu />,
  "/contact": <Contact />,
  "/about/our-story": <OurStory />,
  "/about/reviews": <CustomerReviews />,
};

const groupRedirects = navItems.filter((item) => item.children);

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        {groupRedirects.map((group) => (
          <Route
            key={group.path}
            path={group.path}
            element={<Navigate to={group.children[0].path} replace />}
          />
        ))}
        <Route path="/menu/:slug" element={<MenuSectionPage />} />
        <Route path="/private-events" element={<Navigate to="/reservations/private-events" replace />} />
        {pageRoutes.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={builtPages[page.path] ?? <PagePlaceholder titleKey={page.labelKey} />}
          />
        ))}
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<PagePlaceholder titleKey="notFound.title" />} />
      </Route>

      <Route element={<RequireAuth roles={[ROLES.SUPER_ADMIN]} />}>
        <Route path="/dashboard" element={<AdminLayout />}>
          <Route index element={<Overview />} />
          <Route path="menu-items" element={<MenuItems />} />
          <Route path="dishes" element={<Dishes />} />
          <Route path="managers" element={<Managers />} />
        </Route>
      </Route>
    </Routes>
  );
}
