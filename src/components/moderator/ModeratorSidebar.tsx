import {
  BarChart3,
  BookOpen,
  Calendar,
  Home,
  ImageIcon,
  LogOut,
  UserCog,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shared/components/ui/alert-dialog";
import { Button } from "@/shared/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const menuItems = [
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "events", label: "Events", icon: Calendar },
  { id: "sermons", label: "Sermons", icon: BookOpen },
  { id: "ministries", label: "Ministries", icon: Users },
  { id: "gallery", label: "Gallery", icon: ImageIcon },
];

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function ModeratorSidebar({ activeTab, setActiveTab }: Props) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <Sidebar className="border-r">
      <SidebarContent className="p-4">
        <div className="mb-6 md:mt-4 md:mb-10">
          <span className="font-bold font-display text-lg md:text-2xl">
            I Care Center | Moderator
          </span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    className={`h-auto px-4 py-3 text-base md:py-4 md:text-xl ${activeTab === item.id ? "bg-sidebar-accent" : ""}`}
                    onClick={() => setActiveTab(item.id)}
                  >
                    <item.icon className="mr-3 h-4 w-4 md:mr-4 md:h-7 md:w-7" />
                    {item.label}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <div className="mt-auto space-y-2 pt-6">
          <Button
            className="h-auto w-full justify-start px-4 py-3 text-base md:py-4 md:text-xl"
            onClick={() => navigate("/")}
            variant="ghost"
          >
            <Home className="mr-3 h-4 w-4 md:mr-4 md:h-7 md:w-7" /> Back to Site
          </Button>
          <Button
            className={`h-auto w-full justify-start px-4 py-3 text-base md:py-4 md:text-xl ${activeTab === "profile" ? "bg-sidebar-accent" : ""}`}
            onClick={() => setActiveTab("profile")}
            variant="ghost"
          >
            <UserCog className="mr-3 h-4 w-4 md:mr-4 md:h-7 md:w-7" /> My
            Profile
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="h-auto w-full justify-start px-4 py-3 text-base text-destructive md:py-4 md:text-xl"
                variant="ghost"
              >
                <LogOut className="mr-3 h-4 w-4 md:mr-4 md:h-7 md:w-7" /> Sign
                Out
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to sign out?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  You will be returned to the login screen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={signOut}>
                  Sign Out
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
