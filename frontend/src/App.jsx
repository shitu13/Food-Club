import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import OurStory from "./pages/about/OurStory";
import CustomerReviews from "./pages/about/CustomerReviews";
import Login from "./pages/auth/Login";
import PagePlaceholder from "./components/common/PagePlaceholder";
import { navItems, pageRoutes } from "./data/navigation";

const builtPages = {
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
    </Routes>
  );
}