import { Route, Routes } from "react-router-dom";
import About from "@/pages/About";
import Admin from "@/pages/Admin";
import Auth from "@/user/auth/pages/AuthPage";
import Contact from "@/pages/Contact";
import Events from "@/pages/Events";
import Gallery from "@/pages/Gallery";
import Giving from "@/pages/Giving";
import Index from "@/pages/Index";
import Ministries from "@/pages/Ministries";
import Moderator from "@/pages/Moderator";
import NotFound from "@/pages/NotFound";
import Profile from "@/pages/Profile";
import Sermons from "@/pages/Sermons";
import Services from "@/pages/Services";
import UpdatePassword from "@/user/auth/pages/UpdatePasswordPage";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<Index />} path="/" />
      <Route element={<About />} path="/about" />
      <Route element={<Services />} path="/services" />
      <Route element={<Ministries />} path="/ministries" />
      <Route element={<Events />} path="/events" />
      <Route element={<Sermons />} path="/sermons" />
      <Route element={<Contact />} path="/contact" />
      <Route element={<Giving />} path="/giving" />
      <Route element={<Gallery />} path="/gallery" />
      <Route element={<Auth />} path="/auth" />
      <Route element={<UpdatePassword />} path="/update-password" />
      <Route element={<Profile />} path="/profile" />
      <Route element={<Admin />} path="/admin" />
      <Route element={<Moderator />} path="/moderator" />
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}
