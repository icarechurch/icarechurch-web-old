import { Route, Routes } from "react-router-dom";
import AboutPage from "@/user/about/pages/AboutPage";
import Admin from "@/pages/Admin";
import Auth from "@/user/auth/pages/AuthPage";
import ContactPage from "@/user/contact/pages/ContactPage";
import Events from "@/user/events/pages/EventsPage";
import Gallery from "@/user/gallery/pages/GalleryPage";
import Giving from "@/user/giving/pages/GivingPage";
import HomePage from "@/user/home/pages/HomePage";
import Ministries from "@/user/ministries/pages/MinistriesPage";
import Moderator from "@/pages/Moderator";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Sermons from "@/user/sermons/pages/SermonsPage";
import Services from "@/user/service-times/pages/ServicesPage";
import UpdatePassword from "@/user/auth/pages/UpdatePasswordPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<AboutPage />} path="/about" />
      <Route element={<Services />} path="/services" />
      <Route element={<Ministries />} path="/ministries" />
      <Route element={<Events />} path="/events" />
      <Route element={<Sermons />} path="/sermons" />
      <Route element={<ContactPage />} path="/contact" />
      <Route element={<GivingPage />} path="/giving" />
      <Route element={<GalleryPage />} path="/gallery" />
      <Route element={<Auth />} path="/auth" />
      <Route element={<UpdatePassword />} path="/update-password" />
      <Route element={<Profile />} path="/profile" />
      <Route element={<Admin />} path="/admin" />
      <Route element={<Moderator />} path="/moderator" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}
