"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  ArrowUpRight,
  Check,
  Zap,
  FileSearch,
  Brain,
  Crown
} from "lucide-react"
import Image from "next/image"
import { ThemeToggle } from "@/components/shared/theme-toggle"
import { PricingSection } from "@/components/landing/pricing-section"
import { GridBackground } from "@/components/ui/grid-background"

export default function Home() {
  const [userType, setUserType] = useState<"company" | "candidate">("company")

  return (
    <GridBackground className="min-h-screen">
      <div className="relative w-full min-h-screen flex flex-col">

        {/* Animated glow */}
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-t from-primary/10 via-primary/5 to-transparent blur-[120px] rounded-full mix-blend-screen animate-pulse pointer-events-none" />

        {/* --- HEADER --- */}
        <header className="relative z-50 flex justify-center sticky top-0 backdrop-blur-md border-b border-border/40 bg-background/95">
          <nav className="flex items-center justify-between w-full max-w-7xl px-6 md:px-12 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo.svg"
                  alt="Selectif Logo"
                  fill
                  className="object-contain dark:invert"
                />
              </div>
              <span className="font-bold text-lg tracking-tight hidden md:block text-foreground">SELECTIF</span>
            </Link>

            {/* Nav */}
            <div className="hidden md:flex items-center gap-1 bg-muted/50 border border-border backdrop-blur-xl px-2 py-1.5 rounded-full shadow-lg">
              <Link href="#produit" className="px-6 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-full transition-all duration-300">
                Produit
              </Link>
              <Link href="#methode" className="px-6 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-full transition-all duration-300">
                Méthode
              </Link>
              <a href="#tarifs" className="px-6 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-full transition-all duration-300">
                Tarifs
              </a>
              <Link href="#faq" className="px-6 py-2.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-accent rounded-full transition-all duration-300">
                FAQ
              </Link>
            </div>

            {/* CTA */}
            <div className="flex gap-4 items-center">
              <ThemeToggle />
              <Link href="/login">
                <Button variant="ghost" className="text-sm font-medium hidden sm:block text-foreground">
                  Connexion
                </Button>
              </Link>
              <Link href="/register">
                <Button className="rounded-full px-6 py-3 text-sm font-medium group">
                  Commencer
                  <ArrowUpRight size={16} className="ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </Button>
              </Link>
            </div>
          </nav>
        </header>

        {/* --- HERO SECTION --- */}
        <main className="relative z-10 flex flex-col items-center justify-center text-center px-6 mt-16 md:mt-24">

          <Badge className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors text-primary">
            <Sparkles size={12} className="text-primary" />
            <span className="text-xs font-semibold tracking-wide uppercase text-primary">Intelligence Artificielle</span>
          </Badge>

          <h1 className="max-w-6xl mx-auto font-medium tracking-tight leading-[1.1] text-5xl md:text-7xl lg:text-8xl mb-8 text-foreground">
            Trouvez les meilleurs talents{" "}
            <span className="italic text-primary">en 90% moins de temps</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-light mb-8">
            Selectif utilise l'intelligence artificielle pour analyser automatiquement chaque CV.
            Plus besoin de trier des centaines de candidatures manuellement.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-8 mb-12 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-muted border border-border"></div>
                <div className="w-8 h-8 rounded-full bg-muted border border-border"></div>
                <div className="w-8 h-8 rounded-full bg-muted border border-border"></div>
              </div>
              <span>500+ entreprises utilisent Selectif</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              <span>Gratuit pour démarrer</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={16} className="text-primary" />
              <span>Setup en 5 minutes</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
            <Link href="/register">
              <Button size="lg" className="rounded-full px-8 py-6 text-base font-semibold min-w-[200px]">
                Créer une offre
              </Button>
            </Link>

            <Link href="#demo">
              <Button variant="outline" size="lg" className="rounded-full px-8 py-6 text-base font-medium min-w-[160px]">
                Voir la démo
              </Button>
            </Link>
          </div>

          {/* --- DASHBOARD PREVIEW --- */}
          <div className="relative w-full max-w-5xl mx-auto mb-32">
            <Card className="relative bg-card border-border overflow-hidden shadow-2xl">
              {/* Window Controls */}
              <div className="h-12 border-b border-border bg-muted/50 flex items-center px-4 gap-2">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="ml-4 px-3 py-1 bg-muted rounded text-xs font-mono text-muted-foreground border border-border">
                  selectif.io/dashboard
                </div>
              </div>

              <CardContent className="p-8 grid md:grid-cols-3 gap-8 text-left min-h-[500px]">
                {/* Sidebar */}
                <div className="hidden md:flex flex-col gap-6 border-r border-border pr-6">
                  <div className="space-y-1">
                    <div className="p-3 bg-accent border border-border rounded-lg text-sm font-medium flex items-center justify-between">
                      <span>Senior Frontend</span>
                      <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    </div>
                    <div className="p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                      Product Manager
                    </div>
                    <div className="p-3 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                      Sales Executive
                    </div>
                  </div>

                  <Card className="mt-auto bg-primary/10 border-primary/20">
                    <CardContent className="p-4">
                      <div className="text-xs text-primary font-bold mb-1">IA STATUS</div>
                      <div className="text-sm mb-2">Analyse en cours...</div>
                      <div className="w-full bg-muted h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full w-2/3 animate-pulse"></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Main Content */}
                <div className="col-span-2 flex flex-col">
                  <div className="flex justify-between items-end mb-8">
                    <div>
                      <h3 className="text-2xl font-bold">Candidats</h3>
                      <p className="text-muted-foreground text-sm">324 reçus · 12 retenus par l'IA</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">
                        Shortlist
                      </Button>
                      <Button size="sm" variant="outline">
                        Tout voir
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Card 1 */}
                    <Card className="bg-accent/50 border-border hover:border-primary/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold">
                              TD
                            </div>
                            <div>
                              <div className="font-medium">Thomas Dubois</div>
                              <div className="text-xs text-muted-foreground">React Expert • 6 ans exp</div>
                            </div>
                          </div>
                          <Badge className="bg-primary/20 border-primary/30">
                            <Zap size={10} className="mr-1" fill="currentColor" /> 98%
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          "Candidat idéal. Maîtrise parfaite de la stack technique. A déjà géré des équipes de 5+ devs."
                        </p>
                      </CardContent>
                    </Card>

                    {/* Card 2 (Skeleton) */}
                    <Card className="border-border hover:bg-accent/50 transition-colors opacity-60 cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-muted"></div>
                            <div className="w-32 h-4 bg-muted rounded"></div>
                          </div>
                          <Badge variant="outline">
                            84%
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Glow behind dashboard */}
            <div className="absolute -inset-4 bg-primary/10 blur-3xl -z-10 rounded-[50px] opacity-20"></div>
          </div>

          {/* --- FEATURES SECTION --- */}
          <div id="produit" className="max-w-6xl w-full mb-32 px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Comment Selectif révolutionne votre recrutement
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Une plateforme complète qui automatise le tri, analyse les candidatures et vous fait gagner des heures chaque semaine
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow group">
                <CardHeader className="p-0 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <FileSearch size={24} />
                  </div>
                  <CardTitle className="text-xl">Analyse IA en 2 minutes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Upload un CV, Selectif extrait automatiquement les compétences, l'expérience et attribue un score de compatibilité.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary">→</span> Score /100 avec justification
                  </div>
                </CardContent>
              </Card>

              {/* Feature 2 */}
              <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow group">
                <CardHeader className="p-0 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Brain size={24} />
                  </div>
                  <CardTitle className="text-xl">Shortlist automatique</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    L'IA présélectionne les 10% meilleurs profils selon vos critères. Vous ne voyez que les candidats qualifiés.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary">→</span> Économisez 15h par offre
                  </div>
                </CardContent>
              </Card>

              {/* Feature 3 */}
              <Card className="p-8 bg-card border-border hover:shadow-lg transition-shadow group">
                <CardHeader className="p-0 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                    <Zap size={24} />
                  </div>
                  <CardTitle className="text-xl">Emails automatiques</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    Changez le statut d'un candidat, l'email part automatiquement. Invitation, refus, shortlist : tout est géré.
                  </p>
                  <div className="text-sm text-muted-foreground">
                    <span className="text-primary">→</span> Notifications en temps réel
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- SOCIAL PROOF / TESTIMONIALS --- */}
          <div className="max-w-4xl w-full mb-32 px-4 text-center">
            <h3 className="text-3xl font-bold mb-12">Ils ont déjà réduit leur temps de recrutement de 90%</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card border-border">
                <CardContent className="p-0">
                  <p className="text-muted-foreground mb-4 italic">
                    "Avant Selectif, je passais 2 jours à trier 200 CVs. Maintenant, l'IA me présente les 10 meilleurs en 5 minutes. Game changer."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Marie D.</div>
                      <div className="text-muted-foreground text-xs">RH Manager, Startup Tech</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6 bg-card border-border">
                <CardContent className="p-0">
                  <p className="text-muted-foreground mb-4 italic">
                    "Le score IA est bluffant de précision. On a embauché 3 devs ce mois-ci, tous recommandés par Selectif avec 95%+."
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20"></div>
                    <div className="text-left">
                      <div className="text-sm font-medium">Thomas L.</div>
                      <div className="text-muted-foreground text-xs">CTO, Agence Digital</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- FAQ SECTION --- */}
          <div id="faq" className="max-w-4xl w-full mb-32 px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Questions fréquentes
              </h2>
              <p className="text-muted-foreground text-lg">
                Tout ce que vous devez savoir sur Selectif
              </p>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">Comment fonctionne l'analyse IA ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Notre IA analyse chaque CV en comparant les compétences, l'expérience et le parcours du candidat avec votre description de poste. En 2 secondes, elle attribue un score de compatibilité sur 100 et génère une justification détaillée.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ 2 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">Puis-je tester gratuitement ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Oui ! Notre plan FREE vous permet de créer jusqu'à 5 offres actives avec 50 candidatures chacune et 20 analyses IA par mois. Aucune carte bancaire requise pour commencer.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ 3 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">Mes données sont-elles sécurisées ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Absolument. Selectif est 100% conforme au RGPD. Toutes les données sont chiffrées, stockées en Europe, et automatiquement supprimées après la période légale de rétention. Vous gardez le contrôle total de vos données.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ 4 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">Combien de temps faut-il pour démarrer ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Moins de 5 minutes ! Créez votre compte, ajoutez une offre d'emploi, et commencez à recevoir des candidatures. L'IA se met au travail dès la première candidature reçue.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ 5 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">Puis-je passer d'un plan à l'autre ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Oui, vous pouvez changer de plan à tout moment. L'upgrade est immédiat, et en cas de downgrade, les changements prennent effet à la fin de votre période de facturation actuelle.
                  </p>
                </CardContent>
              </Card>

              {/* FAQ 6 */}
              <Card className="p-6 bg-card border-border hover:shadow-lg transition-shadow">
                <CardHeader className="p-0 mb-3">
                  <CardTitle className="text-lg">L'IA remplace-t-elle complètement le recruteur ?</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <p className="text-muted-foreground leading-relaxed">
                    Non, l'IA est un assistant, pas un remplacement. Elle fait le tri initial et vous présente les meilleurs profils, mais c'est vous qui prenez les décisions finales. Vous gagnez du temps sur les tâches répétitives pour vous concentrer sur l'humain.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* --- PRICING SECTION --- */}
          <div id="tarifs" className="w-full max-w-6xl mb-20 px-4">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple. Transparent.</h2>
              <p className="text-muted-foreground text-lg mb-8">Choisissez le plan qui correspond à vos besoins</p>

              {/* Toggle Entreprise/Candidat */}
              <div className="inline-flex items-center gap-1 bg-muted border border-border p-1.5 rounded-full">
                <button
                  onClick={() => setUserType("company")}
                  className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                    userType === "company"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Entreprises
                </button>
                <button
                  onClick={() => setUserType("candidate")}
                  className={`px-8 py-3 text-sm font-medium rounded-full transition-all duration-300 ${
                    userType === "candidate"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Candidats
                </button>
              </div>
            </div>

            <PricingSection userType={userType} />
            {false && userType === "company" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* FREE */}
                <Card className="border-border bg-card hover:shadow-xl transition-all">
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Free</CardTitle>
                    <CardDescription>Idéal pour démarrer</CardDescription>
                    <div className="text-5xl font-bold mt-4">0€</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left text-muted-foreground mb-8">
                      {PLAN_LIMITS.COMPANY_FREE.features.map((feature, i) => (
                        <li key={i} className="flex gap-2 text-sm items-start">
                          <Check size={16} className="shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register?type=company&plan=free">
                      <Button variant="outline" className="w-full rounded-xl">
                        Commencer
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* BUSINESS */}
                <Card className="border-primary/50 bg-primary/5 hover:shadow-xl transition-all relative overflow-hidden scale-105">
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    POPULAIRE
                  </Badge>
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-primary mb-2">Business</CardTitle>
                    <CardDescription>Pour les PME en croissance</CardDescription>
                    <div className="text-5xl font-bold mt-4">39€<span className="text-lg text-muted-foreground">/mois</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left text-muted-foreground mb-8">
                      {PLAN_LIMITS.COMPANY_BUSINESS.features.map((feature, i) => (
                        <li key={i} className="flex gap-2 text-sm items-start">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register?type=company&plan=business">
                      <Button className="w-full rounded-xl">
                        Choisir Business
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* ENTERPRISE */}
                <Card className="border-border bg-card hover:shadow-xl transition-all relative">
                  <Badge variant="secondary" className="absolute top-4 right-4">Pro</Badge>
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <Crown className="w-16 h-16" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Enterprise</CardTitle>
                    <CardDescription>Pour les grandes entreprises</CardDescription>
                    <div className="text-5xl font-bold mt-4">199€<span className="text-lg text-muted-foreground">/mois</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left text-muted-foreground mb-8">
                      {PLAN_LIMITS.COMPANY_ENTERPRISE.features.map((feature, i) => (
                        <li key={i} className="flex gap-2 text-sm items-start">
                          <Check size={16} className="shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register?type=company&plan=enterprise">
                      <Button variant="outline" className="w-full rounded-xl">
                        Contacter l'équipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Plans Candidats */}
            {userType === "candidate" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* GRATUIT */}
                <Card className="border-border bg-card hover:shadow-xl transition-all">
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <Sparkles className="w-16 h-16" />
                    </div>
                    <CardTitle className="text-2xl mb-2">Gratuit</CardTitle>
                    <CardDescription>Accès basique aux offres</CardDescription>
                    <div className="text-5xl font-bold mt-4">0€</div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left text-muted-foreground mb-8">
                      {PLAN_LIMITS.CANDIDATE_FREE.features.map((feature, i) => (
                        <li key={i} className="flex gap-2 text-sm items-start">
                          <Check size={16} className="shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register?type=candidate">
                      <Button variant="outline" className="w-full rounded-xl">
                        S'inscrire gratuitement
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                {/* PREMIUM */}
                <Card className="border-primary/50 bg-primary/5 hover:shadow-xl transition-all relative overflow-hidden scale-105">
                  <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">
                    POPULAIRE
                  </Badge>
                  <CardHeader className="text-center pb-8">
                    <div className="flex justify-center mb-4">
                      <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <CardTitle className="text-2xl text-primary mb-2">Premium</CardTitle>
                    <CardDescription>Fonctionnalités avancées</CardDescription>
                    <div className="text-5xl font-bold mt-4">10$<span className="text-lg text-muted-foreground">/mois</span></div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 text-left text-muted-foreground mb-8">
                      {PLAN_LIMITS.CANDIDATE_PREMIUM.features.map((feature, i) => (
                        <li key={i} className="flex gap-2 text-sm items-start">
                          <Check size={16} className="text-primary shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/register?type=candidate&plan=premium">
                      <Button className="w-full rounded-xl">
                        Passer Premium
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

        </main>

        {/* --- FOOTER --- */}
        <footer className="relative z-10 w-full border-t border-border pt-16 pb-8 px-6 md:px-12 mt-auto bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto">
            {/* Footer Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              {/* Brand Column */}
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-2 mb-4">
                  <div className="relative w-8 h-8">
                    <Image
                      src="/logo.svg"
                      alt="Selectif Logo"
                      fill
                      className="object-contain dark:invert"
                    />
                  </div>
                  <span className="text-xl font-bold">SELECTIF</span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  L'intelligence artificielle au service du recrutement. Trouvez les meilleurs talents 90% plus rapidement.
                </p>
                <div className="flex items-center gap-4">
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                  </a>
                </div>
              </div>

              {/* Produit Column */}
              <div>
                <h3 className="font-semibold mb-4">Produit</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#produit" className="text-muted-foreground hover:text-foreground transition-colors">Fonctionnalités</a></li>
                  <li><a href="#tarifs" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</a></li>
                  <li><a href="#demo" className="text-muted-foreground hover:text-foreground transition-colors">Démo</a></li>
                  <li><a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Entreprise Column */}
              <div>
                <h3 className="font-semibold mb-4">Entreprise</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">À propos</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Carrières</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Légal Column */}
              <div>
                <h3 className="font-semibold mb-4">Légal</h3>
                <ul className="space-y-3 text-sm">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Mentions légales</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">Confidentialité</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">CGU</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground transition-colors">RGPD</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-border">
              <div className="text-muted-foreground text-xs font-mono">
                © 2025 Selectif. Tous droits réservés.
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <Link href="/login" className="hover:text-foreground transition-colors">
                  Connexion
                </Link>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  S'inscrire
                </Link>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </GridBackground>
  )
}
