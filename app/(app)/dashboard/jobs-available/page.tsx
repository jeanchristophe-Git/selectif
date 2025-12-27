"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Building2, MapPin, Search, Globe, Lock, Sparkles, ExternalLink, Filter } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"
import { useSessionZustand } from "@/lib/use-session-zustand"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { JobsListSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface JobOffer {
  id: string
  publicId: string
  title: string
  description: string
  location: string | null
  jobType: string
  salaryRange: string | null
  publishedAt: string
  expiresAt: string | null
  company: {
    companyName: string
    logo: string | null
  }
}

interface ExternalJobOffer {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: string
  postedDate?: string
}

export default function JobsAvailablePage() {
  const { user } = useSessionZustand()
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [externalJobs, setExternalJobs] = useState<ExternalJobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const showLoading = useMinimumLoading(loading, 800)
  const [searchingExternal, setSearchingExternal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [externalSearchQuery, setExternalSearchQuery] = useState("")
  const [showPremiumDialog, setShowPremiumDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("selectif")

  // Filtres pour la recherche Internet
  const [country, setCountry] = useState("CI") // Côte d'Ivoire par défaut
  const [jobType, setJobType] = useState("all")
  const [experienceLevel, setExperienceLevel] = useState("all")
  const [datePosted, setDatePosted] = useState("all")

  // Vérifier si l'utilisateur a accès à la recherche internet
  const hasInternetSearchAccess =
    (user?.subscription?.plan === 'CANDIDATE_PREMIUM' ||
     user?.subscription?.plan === 'COMPANY_BUSINESS' ||
     user?.subscription?.plan === 'COMPANY_ENTERPRISE') || false

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/jobs/public")
      if (!response.ok) {
        throw new Error("Failed to fetch jobs")
      }
      const data = await response.json()
      setJobs(data.jobs)
    } catch (error) {
      console.error("Error fetching jobs:", error)
      toast.error("Erreur lors du chargement des offres")
    } finally {
      setLoading(false)
    }
  }

  const searchExternalJobs = async () => {
    if (!hasInternetSearchAccess) {
      setShowPremiumDialog(true)
      return
    }

    if (!externalSearchQuery.trim()) {
      toast.error("Veuillez entrer un mot-clé de recherche")
      return
    }

    setSearchingExternal(true)
    try {
      const response = await fetch("/api/jobs/external-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: externalSearchQuery,
          country,
          jobType: jobType !== "all" ? jobType : undefined,
          experienceLevel: experienceLevel !== "all" ? experienceLevel : undefined,
          datePosted: datePosted !== "all" ? datePosted : undefined,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to search external jobs")
      }

      const data = await response.json()
      setExternalJobs(data.jobs || [])
      toast.success(`${data.jobs?.length || 0} offres trouvées sur Internet`)
    } catch (error) {
      console.error("Error searching external jobs:", error)
      toast.error("Erreur lors de la recherche sur Internet")
    } finally {
      setSearchingExternal(false)
    }
  }

  const handleTabChange = (value: string) => {
    if (value === "internet" && !hasInternetSearchAccess) {
      setShowPremiumDialog(true)
      return
    }
    setActiveTab(value)
  }

  const filteredJobs = jobs.filter((job) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      job.title.toLowerCase().includes(query) ||
      job.company.companyName.toLowerCase().includes(query) ||
      job.location?.toLowerCase().includes(query)
    )
  })

  if (showLoading) {
    return <JobsListSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Offres disponibles</h1>
        <p className="text-muted-foreground">
          Découvrez les opportunités qui vous correspondent
        </p>
      </div>

      {/* Tabs pour Selectif vs Internet */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="selectif">
            <Building2 className="h-4 w-4 mr-2" />
            Offres Selectif
          </TabsTrigger>
          <TabsTrigger value="internet" className="relative">
            <Globe className="h-4 w-4 mr-2" />
            Recherche Internet
            {!hasInternetSearchAccess && (
              <Lock className="h-3 w-3 ml-1 text-yellow-600" />
            )}
            {!hasInternetSearchAccess && (
              <Badge variant="secondary" className="ml-2 text-xs">Premium</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Onglet Offres Selectif */}
        <TabsContent value="selectif" className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Rechercher par titre, entreprise ou localisation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Jobs Grid */}
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune offre trouvée</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "Essayez avec d'autres mots-clés"
                    : "Aucune offre d'emploi disponible pour le moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building2 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-muted-foreground">
                            {job.company.companyName}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                        <CardDescription className="line-clamp-2">
                          {job.description}
                        </CardDescription>
                      </div>
                      <Badge className="ml-4">{job.jobType}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {job.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{job.location}</span>
                          </div>
                        )}
                        {job.salaryRange && (
                          <div>
                            <span className="font-medium">{job.salaryRange}</span>
                          </div>
                        )}
                        <div>
                          Publiée le{" "}
                          {format(new Date(job.publishedAt), "dd MMM yyyy", {
                            locale: fr,
                          })}
                        </div>
                      </div>
                      <Button asChild>
                        <a href={`/apply/${job.publicId}`} target="_blank" rel="noopener noreferrer">
                          Postuler
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Onglet Recherche Internet */}
        <TabsContent value="internet" className="space-y-4">
          {!hasInternetSearchAccess ? (
            <Card className="border-dashed border-2">
              <CardContent className="flex min-h-[400px] flex-col items-center justify-center py-12">
                <div className="rounded-full bg-yellow-100 dark:bg-yellow-900/20 p-4 mb-4">
                  <Lock className="h-12 w-12 text-yellow-600" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">Fonctionnalité Premium</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
                  La recherche d'offres sur Internet est réservée aux membres Premium. Accédez à des milliers d'offres depuis LinkedIn, Indeed, Glassdoor et plus encore.
                </p>
                <div className="flex gap-2 mt-6">
                  <Button onClick={() => setShowPremiumDialog(true)} className="gap-2">
                    <Sparkles className="h-4 w-4" />
                    Passer à Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Search Bar */}
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher sur Internet (ex: développeur, commercial, comptable)..."
                      value={externalSearchQuery}
                      onChange={(e) => setExternalSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && searchExternalJobs()}
                      className="pl-10"
                    />
                  </div>
                  <Button onClick={searchExternalJobs} disabled={searchingExternal}>
                    {searchingExternal ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent mr-2"></div>
                        Recherche...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Rechercher
                      </>
                    )}
                  </Button>
                </div>

                {/* Filtres */}
                <div className="flex flex-wrap gap-3 items-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Filter className="h-4 w-4" />
                    <span className="font-medium">Filtres:</span>
                  </div>

                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Pays" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CI">🇨🇮 Côte d'Ivoire</SelectItem>
                      <SelectItem value="SN">🇸🇳 Sénégal</SelectItem>
                      <SelectItem value="BF">🇧🇫 Burkina Faso</SelectItem>
                      <SelectItem value="ML">🇲🇱 Mali</SelectItem>
                      <SelectItem value="BJ">🇧🇯 Bénin</SelectItem>
                      <SelectItem value="TG">🇹🇬 Togo</SelectItem>
                      <SelectItem value="GH">🇬🇭 Ghana</SelectItem>
                      <SelectItem value="NG">🇳🇬 Nigeria</SelectItem>
                      <SelectItem value="all">🌍 Toute l'Afrique</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les types</SelectItem>
                      <SelectItem value="FULLTIME">CDI / Temps plein</SelectItem>
                      <SelectItem value="PARTTIME">Temps partiel</SelectItem>
                      <SelectItem value="CONTRACTOR">Freelance</SelectItem>
                      <SelectItem value="INTERN">Stage</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Expérience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous niveaux</SelectItem>
                      <SelectItem value="under_3_years_experience">Débutant (0-3 ans)</SelectItem>
                      <SelectItem value="more_than_3_years_experience">Expérimenté (3+ ans)</SelectItem>
                      <SelectItem value="no_experience">Sans expérience</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={datePosted} onValueChange={setDatePosted}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes dates</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="3days">3 derniers jours</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* External Jobs Results */}
              {externalJobs.length === 0 && !searchingExternal ? (
                <Card className="border-dashed">
                  <CardContent className="flex min-h-[300px] flex-col items-center justify-center py-12">
                    <Globe className="h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Recherchez des offres sur Internet</h3>
                    <p className="mt-2 text-center text-sm text-muted-foreground max-w-md">
                      Utilisez la barre de recherche ci-dessus pour trouver des offres d'emploi depuis LinkedIn, Indeed, Glassdoor et d'autres plateformes.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {externalJobs.map((job) => (
                    <Card key={job.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium text-muted-foreground">
                                {job.company}
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {job.source}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                            <CardDescription className="line-clamp-2">
                              {job.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{job.location}</span>
                            </div>
                            {job.postedDate && (
                              <div>Publiée il y a {job.postedDate}</div>
                            )}
                          </div>
                          <Button asChild variant="outline">
                            <a href={job.url} target="_blank" rel="noopener noreferrer" className="gap-2">
                              Voir l'offre
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Premium Dialog */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-yellow-600" />
              Passez à Premium
            </DialogTitle>
            <DialogDescription>
              Débloquez la recherche d'offres sur Internet et bien plus encore
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-1">
                  <Globe className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Recherche sur Internet</p>
                  <p className="text-xs text-muted-foreground">
                    Accédez à des milliers d'offres depuis LinkedIn, Indeed, Glassdoor
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-1">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">50 analyses IA par mois</p>
                  <p className="text-xs text-muted-foreground">
                    Optimisez vos candidatures avec l'IA
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-1">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">Support prioritaire</p>
                  <p className="text-xs text-muted-foreground">
                    Assistance rapide et personnalisée
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)}>
              Plus tard
            </Button>
            <Button asChild className="gap-2">
              <a href="/dashboard/settings/billing">
                <Sparkles className="h-4 w-4" />
                Voir les plans
              </a>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
