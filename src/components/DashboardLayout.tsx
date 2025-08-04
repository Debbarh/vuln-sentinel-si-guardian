import { useState } from "react";
import { Shield, Database, AlertTriangle, TrendingUp, Users, Settings, LogOut, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";

interface DashboardLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

// Profil utilisateur simulé
const userProfile = {
  name: "Jean Dupont",
  email: "jean.dupont@entreprise.com",
  role: "Analyste Sécurité",
  avatar: "", // URL vide pour utiliser les initiales
  organization: "Entreprise Corp"
};

const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: Shield },
    { id: "inventory", label: "Inventaire SI", icon: Database },
    { id: "alerts", label: "Alertes", icon: AlertTriangle },
    { id: "reports", label: "Rapports", icon: TrendingUp },
    { id: "maturity", label: "Maturité ISO 27001", icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    if (tabId === "maturity") {
      navigate("/maturity");
    } else {
      onTabChange(tabId);
    }
  };

  const handleLogout = () => {
    // Logique de déconnexion (pour l'instant simple redirection)
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec navigation et profil */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo et titre */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">VulnGuard</h1>
                <p className="text-xs text-gray-600 hidden sm:block">Gestion des vulnérabilités SI</p>
              </div>
            </div>

            {/* Navigation desktop */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeTab === item.id ? "default" : "ghost"}
                    onClick={() => handleTabClick(item.id)}
                    className="flex items-center space-x-2"
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>

            {/* Profil utilisateur et menu mobile */}
            <div className="flex items-center space-x-4">
              {/* Menu mobile */}
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              {/* Profil dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative flex items-center space-x-2 h-10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {userProfile.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-gray-900">{userProfile.name}</p>
                      <p className="text-xs text-gray-600">{userProfile.role}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userProfile.organization}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/organization")}>
                    <Users className="mr-2 h-4 w-4" />
                    <span>Organisation</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Navigation mobile */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => {
                  const IconComponent = item.icon;
                  return (
                    <Button
                      key={item.id}
                      variant={activeTab === item.id ? "default" : "ghost"}
                      onClick={() => {
                        handleTabClick(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-start space-x-2 w-full"
                    >
                      <IconComponent className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Contenu principal */}
      <main className="container mx-auto p-6">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;