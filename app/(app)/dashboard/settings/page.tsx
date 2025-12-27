"use client"

import { useSessionZustand } from "@/lib/use-session-zustand"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Loader2, Check, Sparkles, Zap, Crown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SettingsPageSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface CandidateProfile {
  firstName: string
  lastName: string
  phone: string
  linkedinUrl?: string
  portfolioUrl?: string
  bio?: string
}

interface CompanyProfile {
  companyName: string
  industry: string
  companySize: string
  location: string
  website: string
  description: string
}

interface Subscription {
  plan: string
  planName: string
  price: number
  status: string
  maxJobs: number
  maxAppsPerJob: number
  maxAIAnalysesMonth: number
  currentJobs: number
  currentAIUses: number
  features: string[]
  promoCodeUsed?: string
  discountPercent: number
  currentPeriodEnd: string
}

export default function SettingsPage() {
  const { user, loading } = useSessionZustand()
  const router = useRouter()
  const [profileData, setProfileData] = useState<CandidateProfile | CompanyProfile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [promoCode, setPromoCode] = useState("")
  const [applyingPromo, setApplyingPromo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const showLoading = useMinimumLoading(loading || isLoading, 800)
  const [isSaving, setIsSaving] = useState(false)

  const isCandidate = user?.userType === "CANDIDATE"
  const isCompany = user?.userType === "COMPANY"

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
      return
    }

    if (user) {
      fetchProfile()
      fetchSubscription()
    }
  }, [user, loading])

  const fetchSubscription = async () => {
    try {
      const res = await fetch("/api/subscription")
      if (res.ok) {
        const data = await res.json()
        setSubscription(data.subscription)
      }
    } catch (error) {
      console.error("Failed to fetch subscription:", error)
    }
  }

  const applyPromo = async () => {
    if (!promoCode.trim()) {
      toast.error("Veuillez entrer un code promo")
      return
    }

    setApplyingPromo(true)
    try {
      const res = await fetch("/api/subscription/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.toUpperCase() }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.message)
        return
      }

      toast.success(data.message)
      setPromoCode("")
      fetchSubscription()
    } catch (error) {
      toast.error("Impossible d'appliquer le code")
    } finally {
      setApplyingPromo(false)
    }
  }

  const fetchProfile = async () => {
    try {
      const endpoint = isCandidate ? "/api/me/candidate" : "/api/me/company"
      const response = await fetch(endpoint)

      if (!response.ok) {
        throw new Error("Erreur lors du chargement du profil")
      }

      const data = await response.json()

      // Si pas de profil candidat/company, pré-remplir avec le nom de l'utilisateur
      if (isCandidate && !data.firstName && user?.name) {
        const nameParts = user.name.split(" ")
        setProfileData({
          firstName: nameParts[0] || "",
          lastName: nameParts.slice(1).join(" ") || "",
          phone: "",
          linkedinUrl: "",
          portfolioUrl: "",
          bio: "",
        })
      } else if (isCompany && !data.companyName && user?.name) {
        setProfileData({
          companyName: user.name,
          industry: "",
          companySize: "",
          location: "",
          website: "",
          description: "",
        })
      } else {
        setProfileData(data)
      }
    } catch (error) {
      toast.error("Impossible de charger le profil")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!profileData) return

    setIsSaving(true)
    try {
      const endpoint = isCandidate ? "/api/me/candidate" : "/api/me/company"
      const response = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la sauvegarde")
      }

      toast.success("Profil mis à jour avec succès")
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde du profil")
    } finally {
      setIsSaving(false)
    }
  }

  if (showLoading) {
    return <SettingsPageSkeleton />
  }

  if (!profileData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Aucun profil trouvé</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres</h1>
        <p className="text-muted-foreground">
          Gérez vos informations personnelles et vos préférences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="subscription">Abonnement</TabsTrigger>
          <TabsTrigger value="account">Compte</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          {isCandidate && (
            <Card>
              <CardHeader>
                <CardTitle>Informations du candidat</CardTitle>
                <CardDescription>
                  Modifiez vos informations personnelles et professionnelles
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={(profileData as CandidateProfile).firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={(profileData as CandidateProfile).lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={(profileData as CandidateProfile).phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl">LinkedIn (optionnel)</Label>
                  <Input
                    id="linkedinUrl"
                    placeholder="https://linkedin.com/in/..."
                    value={(profileData as CandidateProfile).linkedinUrl || ""}
                    onChange={(e) => setProfileData({ ...profileData, linkedinUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl">Portfolio (optionnel)</Label>
                  <Input
                    id="portfolioUrl"
                    placeholder="https://..."
                    value={(profileData as CandidateProfile).portfolioUrl || ""}
                    onChange={(e) => setProfileData({ ...profileData, portfolioUrl: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio (optionnel)</Label>
                  <Textarea
                    id="bio"
                    placeholder="Parlez-nous de vous..."
                    value={(profileData as CandidateProfile).bio || ""}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {isCompany && (
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'entreprise</CardTitle>
                <CardDescription>
                  Modifiez les informations de votre entreprise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input
                    id="companyName"
                    value={(profileData as CompanyProfile).companyName}
                    onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry">Secteur</Label>
                    <Input
                      id="industry"
                      value={(profileData as CompanyProfile).industry}
                      onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companySize">Taille</Label>
                    <Input
                      id="companySize"
                      value={(profileData as CompanyProfile).companySize}
                      onChange={(e) => setProfileData({ ...profileData, companySize: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Localisation</Label>
                  <Input
                    id="location"
                    value={(profileData as CompanyProfile).location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    placeholder="https://..."
                    value={(profileData as CompanyProfile).website}
                    onChange={(e) => setProfileData({ ...profileData, website: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Décrivez votre entreprise..."
                    value={(profileData as CompanyProfile).description}
                    onChange={(e) => setProfileData({ ...profileData, description: e.target.value })}
                    rows={4}
                  />
                </div>

                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sauvegarde...
                    </>
                  ) : (
                    "Sauvegarder"
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          {subscription ? (
            <>
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                        subscription.plan.includes("ENTERPRISE")
                          ? "from-purple-600 to-pink-600"
                          : subscription.plan.includes("BUSINESS") || subscription.plan.includes("PREMIUM")
                          ? "from-blue-600 to-cyan-600"
                          : "from-gray-600 to-gray-800"
                      } flex items-center justify-center`}>
                        {subscription.plan.includes("ENTERPRISE") ? (
                          <Crown className="w-6 h-6 text-white" />
                        ) : subscription.plan.includes("BUSINESS") || subscription.plan.includes("PREMIUM") ? (
                          <Zap className="w-6 h-6 text-white" />
                        ) : (
                          <Sparkles className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle>{subscription.planName}</CardTitle>
                        <CardDescription>
                          {subscription.price === 0 ? "Gratuit" : `${subscription.price}€/mois`}
                          {subscription.discountPercent > 0 && (
                            <span className="ml-2 text-green-600">
                              -{subscription.discountPercent}%
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant={subscription.status === "ACTIVE" ? "default" : "secondary"} className="capitalize">
                      {subscription.status.toLowerCase()}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features */}
                  <div>
                    <p className="text-sm font-medium mb-2">Fonctionnalités</p>
                    <ul className="space-y-2">
                      {subscription.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Usage Stats (Only for companies) */}
                  {isCompany && (
                    <div className="space-y-4 pt-4 border-t">
                      <p className="text-sm font-medium">Utilisation</p>

                      {/* Jobs */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Offres actives</span>
                          <span className="font-medium">
                            {subscription.currentJobs} / {subscription.maxJobs === 999999 ? "∞" : subscription.maxJobs}
                          </span>
                        </div>
                        {subscription.maxJobs !== 999999 && (
                          <Progress value={(subscription.currentJobs / subscription.maxJobs) * 100} className="h-2" />
                        )}
                      </div>

                      {/* AI Analyses */}
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Analyses IA ce mois</span>
                          <span className="font-medium">
                            {subscription.currentAIUses} / {subscription.maxAIAnalysesMonth === 999999 ? "∞" : subscription.maxAIAnalysesMonth}
                          </span>
                        </div>
                        {subscription.maxAIAnalysesMonth !== 999999 && (
                          <Progress value={(subscription.currentAIUses / subscription.maxAIAnalysesMonth) * 100} className="h-2" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Promo Code Used */}
                  {subscription.promoCodeUsed && (
                    <div className="pt-4 border-t">
                      <p className="text-sm text-muted-foreground">
                        Code promo actif : <span className="font-medium">{subscription.promoCodeUsed}</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Upgrade Options */}
              {!subscription.plan.includes("ENTERPRISE") && (
                <Card>
                  <CardHeader>
                    <CardTitle>Passer à un plan supérieur</CardTitle>
                    <CardDescription>
                      Débloquez plus de fonctionnalités et augmentez vos limites
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription.plan === "COMPANY_FREE" && (
                      <>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => window.location.href = "/pricing"}
                        >
                          <Zap className="w-4 h-4 mr-2" />
                          Passer à Business (39€/mois)
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => window.location.href = "/pricing"}
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Passer à Enterprise (199€/mois)
                        </Button>
                      </>
                    )}

                    {subscription.plan === "COMPANY_BUSINESS" && (
                      <Button
                        className="w-full bg-purple-600 hover:bg-purple-700"
                        onClick={() => window.location.href = "/pricing"}
                      >
                        <Crown className="w-4 h-4 mr-2" />
                        Passer à Enterprise (199€/mois)
                      </Button>
                    )}

                    {subscription.plan === "CANDIDATE_FREE" && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        onClick={() => window.location.href = "/pricing"}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Passer à Premium (10$/mois)
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Promo Code */}
              <Card>
                <CardHeader>
                  <CardTitle>Code promo</CardTitle>
                  <CardDescription>
                    Entrez un code promo pour bénéficier d'une réduction
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      placeholder="LAUNCH2024"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      disabled={applyingPromo}
                      className="uppercase"
                    />
                    <Button
                      onClick={applyPromo}
                      disabled={applyingPromo || !promoCode.trim()}
                    >
                      {applyingPromo ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Appliquer"
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Billing Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Informations de facturation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Période actuelle</span>
                    <span className="font-medium">
                      Jusqu'au {new Date(subscription.currentPeriodEnd).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mode de paiement</span>
                    <span className="font-medium">
                      {subscription.price === 0 ? "Aucun" : "À configurer"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </TabsContent>

        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations du compte</CardTitle>
              <CardDescription>
                Vos informations de connexion
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user?.email} disabled />
              </div>
              <div className="space-y-2">
                <Label>Type de compte</Label>
                <Input value={isCandidate ? "Candidat" : "Entreprise"} disabled />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
