import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { 
  Shield, 
  AlertTriangle, 
  Server, 
  Users, 
  Zap, 
  Lock, 
  Globe, 
  CheckCircle,
  ArrowRight,
  Star,
  Building,
  Cloud,
  Award,
  TrendingUp,
  FileCheck
} from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";

const Home = () => {
  const carouselRef = useRef<any>(null);

  // Timer automatique de 8 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      if (carouselRef.current?.api) {
        carouselRef.current.api.scrollNext();
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);
  const features = [
    {
      icon: Shield,
      title: "Surveillance Continue",
      description: "Monitoring 24/7 de vos actifs SI avec détection proactive des vulnérabilités"
    },
    {
      icon: AlertTriangle,
      title: "Alertes Intelligentes",
      description: "Système d'alertes prioritaires avec classification automatique des risques"
    },
    {
      icon: Users,
      title: "Workflows Collaboratifs",
      description: "Processus de traitement structurés avec responsables et suivis RSSI"
    },
    {
      icon: Server,
      title: "Inventaire Centralisé",
      description: "Cartographie complète de votre infrastructure et gestion des assets"
    },
    {
      icon: Zap,
      title: "Intégration MaCERT",
      description: "Synchronisation automatique avec les bases de vulnérabilités nationales"
    },
    {
      icon: Lock,
      title: "Conformité RGPD",
      description: "Solution certifiée conforme aux exigences de sécurité européennes"
    },
    {
      icon: Award,
      title: "Évaluation ISO 27001",
      description: "Audit automatisé de maturité et plans d'action pour la certification"
    },
    {
      icon: TrendingUp,
      title: "Suivi de Progression",
      description: "Tableaux de bord et métriques pour piloter votre niveau de sécurité"
    },
    {
      icon: FileCheck,
      title: "Rapports Conformité",
      description: "Documentation automatique pour audits et certifications"
    }
  ];

  const maturityFeatures = [
    {
      icon: Award,
      title: "Évaluation Initiale",
      description: "Audit complet de votre maturité ISO 27001 avec diagnostic précis",
      features: ["140+ contrôles analysés", "Score de maturité détaillé", "Identification des écarts"],
      highlight: "Inclus"
    },
    {
      icon: TrendingUp,
      title: "Plans d'Action",
      description: "Workflows personnalisés pour atteindre vos objectifs de certification",
      features: ["Actions prioritaires", "Responsables assignés", "Suivi temporel"],
      highlight: "Automatisé"
    },
    {
      icon: FileCheck,
      title: "Documentation",
      description: "Génération automatique des preuves et rapports pour audits",
      features: ["Preuves de conformité", "Rapports d'audit", "Suivi d'amélioration"],
      highlight: "Certifié"
    }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "RSSI, Entreprise Tech",
      content: "VulnGuard nous a permis de réduire de 80% notre temps de traitement des vulnérabilités critiques.",
      rating: 5
    },
    {
      name: "Jean Martin",
      role: "DSI, Groupe Financier",
      content: "L'intégration avec MaCERT et les workflows personnalisables sont exactement ce dont nous avions besoin.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">VulnGuard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link to="/register">
                <Button>Commencer</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Carousel Full Width */}
      <section className="pt-0 pb-0 min-h-screen flex items-center">
        <div className="w-full">
          <Carousel ref={carouselRef} className="w-full h-screen" opts={{ loop: true, align: "center" }}>
            <CarouselContent className="-ml-0">
              {/* Module VulnGuard */}
              <CarouselItem className="pl-0">
                <div className="relative h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-indigo-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-indigo-600/10"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="mb-6" variant="outline">
                      🚀 Nouvelle version disponible - Workflows avancés
                    </Badge>
                  </div>
                  
                  <div className="relative container mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl">
                          <Shield className="h-20 w-20 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
                      VulnGuard
                    </h1>
                    <div className="h-2 w-32 bg-gradient-to-r from-blue-600 to-indigo-600 mx-auto mb-8 rounded-full"></div>
                    <h2 className="text-3xl font-semibold text-blue-700 mb-8">
                      Gestion des Vulnérabilités
                    </h2>
                    
                    <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                      Centralise la surveillance, l'analyse et le traitement de vos vulnérabilités 
                      avec des workflows intelligents et une intégration MaCERT native.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                      <Link to="/register">
                        <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                          Accéder au module
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                      </Link>
                      <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2 border-blue-600 text-blue-700 hover:bg-blue-600 hover:text-white transition-all duration-500 shadow-xl transform hover:-translate-y-2">
                        Demander une démo
                      </Button>
                    </div>

                    {/* Stats pour VulnGuard */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">500+</div>
                        <div className="text-gray-700 font-medium">Organisations</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">50K+</div>
                        <div className="text-gray-700 font-medium">Vulnérabilités traitées</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">99.9%</div>
                        <div className="text-gray-700 font-medium">Disponibilité</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">24/7</div>
                        <div className="text-gray-700 font-medium">Support</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>

              {/* Module ISO 27001 */}
              <CarouselItem className="pl-0">
                <div className="relative h-screen bg-gradient-to-br from-emerald-50 via-green-100 to-teal-200 flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 to-teal-600/10"></div>
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="mb-6" variant="outline">
                      🏆 Certification ISO 27001 - Module Expert
                    </Badge>
                  </div>
                  
                  <div className="relative container mx-auto px-6 text-center">
                    <div className="flex justify-center mb-8">
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-600 rounded-3xl blur-2xl opacity-30 animate-pulse"></div>
                        <div className="relative p-8 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl shadow-2xl">
                          <Award className="h-20 w-20 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-4">
                      ISO 27001
                    </h1>
                    <div className="h-2 w-32 bg-gradient-to-r from-emerald-600 to-teal-600 mx-auto mb-8 rounded-full"></div>
                    <h2 className="text-3xl font-semibold text-emerald-700 mb-8">
                      Évaluation de Maturité
                    </h2>
                    
                    <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
                      Évaluez et pilotez votre maturité ISO 27001 avec des audits automatisés, 
                      des plans d'action personnalisés et un suivi de progression vers la certification.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                      <Link to="/maturity">
                        <Button size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-2">
                          Commencer l'évaluation
                          <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                      </Link>
                      <Button size="lg" variant="outline" className="text-xl px-12 py-8 border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all duration-500 shadow-xl transform hover:-translate-y-2">
                        Voir l'audit
                      </Button>
                    </div>

                    {/* Stats pour ISO 27001 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">140+</div>
                        <div className="text-gray-700 font-medium">Contrôles analysés</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">95%</div>
                        <div className="text-gray-700 font-medium">Précision audit</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">200+</div>
                        <div className="text-gray-700 font-medium">Certifications aidées</div>
                      </div>
                      <div className="text-center group hover:scale-110 transition-transform duration-300">
                        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">6 mois</div>
                        <div className="text-gray-700 font-medium">Temps moyen</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            </CarouselContent>

            {/* Indicateurs de slide dynamiques */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-4">
              <div className="h-3 w-12 bg-white/80 rounded-full shadow-lg backdrop-blur-sm"></div>
              <div className="h-3 w-3 bg-white/40 rounded-full shadow-lg backdrop-blur-sm"></div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Une solution complète pour votre sécurité
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tous les outils nécessaires pour une gestion efficace des vulnérabilités
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-600 transition-colors">
                      <feature.icon className="h-6 w-6 text-blue-600 group-hover:text-white" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ISO 27001 Maturity Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Évaluez et améliorez votre maturité ISO 27001
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Obtenez une évaluation complète de votre niveau de conformité ISO 27001 et suivez 
              votre progression vers la certification avec des plans d'action personnalisés.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {maturityFeatures.map((feature, index) => (
              <Card key={index} className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300">
                <div className="absolute top-4 right-4">
                  <Badge className="bg-green-100 text-green-800">{feature.highlight}</Badge>
                </div>
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center mb-4">
                    <div className="p-4 bg-blue-100 rounded-full">
                      <feature.icon className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{feature.title}</CardTitle>
                  <CardDescription className="text-lg">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="text-center">
                    <Link to="/maturity">
                      <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                        {index === 0 ? "Commencer l'évaluation" : index === 1 ? "Créer un plan" : "Générer rapport"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-lg p-8 shadow-lg max-w-4xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Processus d'évaluation en 3 étapes</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">1</div>
                  <h4 className="font-semibold mb-2">Audit Initial</h4>
                  <p className="text-gray-600 text-sm">Évaluation automatisée de vos 140+ contrôles ISO 27001</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">2</div>
                  <h4 className="font-semibold mb-2">Plan d'Action</h4>
                  <p className="text-gray-600 text-sm">Génération de workflows personnalisés par priorité</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold">3</div>
                  <h4 className="font-semibold mb-2">Suivi Continu</h4>
                  <p className="text-gray-600 text-sm">Monitoring de progression et préparation certification</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ils nous font confiance
            </h2>
            <p className="text-xl text-gray-600">
              Plus de 500 organisations sécurisent leur SI avec VulnGuard
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg text-gray-700 mb-6 italic">
                    "{testimonial.content}"
                  </blockquote>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">
            Prêt à sécuriser votre infrastructure ?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Rejoignez les centaines d'organisations qui font confiance à VulnGuard 
            pour leur gestion des vulnérabilités.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                Commencer gratuitement
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 text-white border-white hover:bg-white hover:text-blue-600">
              Parler à un expert
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">VulnGuard</span>
              </div>
              <p className="text-gray-400">
                La solution leader pour la gestion des vulnérabilités SI.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Fonctionnalités</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Sécurité</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Intégrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Centre d'aide</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Formation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Entreprise</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">À propos</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Carrières</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Partenaires</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2025 VulnGuard. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;