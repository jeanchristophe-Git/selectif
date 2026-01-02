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
import { Loader2, Check, Sparkles, Zap, Crown, Heart, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SettingsPageSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"
import { DonorBadge } from "@/components/ui/donor-badge"
import { DonorBadgeType } from "@/lib/donations"

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
  const [donations, setDonations] = useState<any[]>([])
  const [donationStats, setDonationStats] = useState<{ totalDonated: number } | null>(null)
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
      fetchDonations()
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

  const fetchDonations = async () => {
    try {
      const res = await fetch("/api/donations/history")
      if (res.ok) {
        const data = await res.json()
        setDonations(data.donations || [])
        setDonationStats({ totalDonated: data.totalDonated || 0 })
      }
    } catch (error) {
      console.error("Failed to fetch donations:", error)
    }
  }

  const applyPromo = async () => {
    toast.error("Les codes promo ne sont plus disponibles. Selectif est désormais gratuit pour tous !")
    return

    /* Code promo désactivé
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
          <TabsTrigger value="donations">Mes Donations</TabsTrigger>
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

        <TabsContent value="donations" className="space-y-4">
          {/* Donor Status */}
          <Card className="border-pink-200 bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/10 dark:to-background">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-600 to-red-600 flex items-center justify-center">
                    <Heart className="w-6 h-6 text-white fill-white" />
                  </div>
                  <div>
                    <CardTitle>Selectif est 100% gratuit</CardTitle>
                    <CardDescription>
                      Toutes les fonctionnalités sont accessibles à tous, sans limite
                    </CardDescription>
                  </div>
                </div>
                {user?.subscription?.donorBadge && (
                  <DonorBadge badge={user.subscription.donorBadge as DonorBadgeType} />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features - All Free */}
              {subscription && (
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    Fonctionnalités incluses gratuitement:
                  </p>
                  <ul className="space-y-2">
                    {subscription.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Total Donated */}
              {donationStats && donationStats.totalDonated > 0 && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total de vos dons</span>
                    <span className="text-lg font-bold text-pink-600">
                      {donationStats.totalDonated.toLocaleString("fr-FR")} FCFA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Merci pour votre soutien ! 💖
                  </p>
                </div>
              )}

              {/* CTA Donation */}
              <div className="pt-4">
                <Button
                  className="w-full bg-pink-600 hover:bg-pink-700"
                  onClick={() => window.location.href = "/donate"}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {donationStats && donationStats.totalDonated > 0 ? "Faire un nouveau don" : "Soutenir Selectif"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Donation History */}
          {donations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Historique des donations</CardTitle>
                <CardDescription>
                  Vos contributions à Selectif
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {donations.map((donation: any) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between pb-3 border-b last:border-0 last:pb-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm">
                            {new Date(donation.createdAt).toLocaleDateString("fr-FR")}
                          </p>
                          <Badge
                            variant={donation.status === "COMPLETED" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {donation.status === "COMPLETED" ? "Complété" : donation.status === "PENDING" ? "En attente" : "Échoué"}
                          </Badge>
                        </div>
                        {donation.message && (
                          <p className="text-xs text-muted-foreground italic">"{donation.message}"</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-pink-600">
                          {donation.amount.toLocaleString("fr-FR")} FCFA
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Why Donate */}
          {donations.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pourquoi soutenir Selectif ?</CardTitle>
                <CardDescription>
                  Votre générosité nous permet de:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900/20 p-2">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Maintenir l'application gratuite</p>
                    <p className="text-xs text-muted-foreground">
                      Tous les utilisateurs ont accès à toutes les fonctionnalités, sans exception
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-2">
                    <Zap className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Couvrir les coûts serveurs</p>
                    <p className="text-xs text-muted-foreground">
                      Hébergement, base de données, APIs IA (~50 000 FCFA/mois)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-purple-100 dark:bg-purple-900/20 p-2">
                    <Crown className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Ajouter de nouvelles fonctionnalités</p>
                    <p className="text-xs text-muted-foreground">
                      Améliorer continuellement l'expérience pour tous
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
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
