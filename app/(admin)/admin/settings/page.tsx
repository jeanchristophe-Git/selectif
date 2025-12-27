"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Settings, Shield, Bell, Database, Key, DollarSign, Edit, Check, AlertTriangle, Plus, X, Tag, Percent } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PricingPlan {
  id: string
  name: string
  displayName: string
  type: "COMPANY" | "CANDIDATE"
  price: number
  billingPeriod: "MONTHLY" | "YEARLY"
  features: {
    maxJobs?: number
    maxAppsPerJob?: number
    maxAIAnalysesMonth?: number
    prioritySupport?: boolean
    advancedAnalytics?: boolean
    customBranding?: boolean
    [key: string]: any
  }
}

interface SystemSettings {
  maintenanceMode: boolean
  registrationsOpen: boolean
  emailNotifications: boolean
  systemAlerts: boolean
}

interface PricingPromotion {
  id: string
  plan: string
  discountPercent: number
  label: string | null
  active: boolean
  validFrom: string | null
  validUntil: string | null
  createdAt: string
}

export default function SettingsPage() {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([])
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<PricingPlan | null>(null)

  // Promotions
  const [promotions, setPromotions] = useState<PricingPromotion[]>([])
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false)
  const [newPromo, setNewPromo] = useState({
    plan: "",
    discountPercent: 0,
    label: "",
    validFrom: "",
    validUntil: ""
  })

  const [settings, setSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    registrationsOpen: true,
    emailNotifications: true,
    systemAlerts: true,
  })

  const [maintenanceDialog, setMaintenanceDialog] = useState(false)
  const [maintenanceMessage, setMaintenanceMessage] = useState("")
  const [maintenanceSchedule, setMaintenanceSchedule] = useState("")
  const [loading, setLoading] = useState(true)

  // Pour ajouter des fonctionnalités personnalisées
  const [newFeatureKey, setNewFeatureKey] = useState("")
  const [newFeatureValue, setNewFeatureValue] = useState("")

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPricingPlans = async () => {
    try {
      const response = await fetch("/api/admin/pricing")
      if (response.ok) {
        const data = await response.json()
        setPricingPlans(data.plans)
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error)
    }
  }

  const fetchPromotions = async () => {
    try {
      const response = await fetch("/api/admin/pricing-promotions")
      if (response.ok) {
        const data = await response.json()
        setPromotions(data.promotions)
      }
    } catch (error) {
      console.error("Error fetching promotions:", error)
    }
  }

  const handleCreatePromo = async () => {
    if (!newPromo.plan || newPromo.discountPercent <= 0) {
      toast.error("Veuillez remplir tous les champs requis")
      return
    }

    try {
      const response = await fetch("/api/admin/pricing-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...newPromo,
          discountPercent: parseInt(newPromo.discountPercent.toString())
        }),
      })

      if (response.ok) {
        toast.success("Promotion créée avec succès")
        setIsPromoDialogOpen(false)
        setNewPromo({ plan: "", discountPercent: 0, label: "", validFrom: "", validUntil: "" })
        fetchPromotions()
      }
    } catch (error) {
      toast.error("Erreur lors de la création")
    }
  }

  const handleTogglePromo = async (promoId: string) => {
    try {
      const response = await fetch("/api/admin/pricing-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", promotionId: promoId }),
      })

      if (response.ok) {
        toast.success("Promotion mise à jour")
        fetchPromotions()
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleDeletePromo = async (promoId: string) => {
    try {
      const response = await fetch("/api/admin/pricing-promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", promotionId: promoId }),
      })

      if (response.ok) {
        toast.success("Promotion supprimée")
        fetchPromotions()
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression")
    }
  }

  const getPlanDisplayName = (plan: string) => {
    const names: Record<string, string> = {
      COMPANY_FREE: "Gratuit Entreprise",
      COMPANY_BUSINESS: "Business",
      COMPANY_ENTERPRISE: "Enterprise",
      CANDIDATE_FREE: "Gratuit Candidat",
      CANDIDATE_PREMIUM: "Premium"
    }
    return names[plan] || plan
  }

  useEffect(() => {
    fetchPricingPlans()
    fetchSettings()
    fetchPromotions()
  }, [])

  const handleEditPlan = (plan: PricingPlan) => {
    setEditingPlan(plan)
    setIsEditOpen(true)
  }

  const handleSavePlan = async () => {
    if (!editingPlan) return

    try {
      const response = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          planId: editingPlan.id,
          price: editingPlan.price,
          features: editingPlan.features,
        }),
      })

      if (response.ok) {
        toast.success("Plan mis à jour avec succès")
        setIsEditOpen(false)
        setEditingPlan(null)
        fetchPricingPlans()
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleToggleSetting = async (key: keyof SystemSettings) => {
    if (key === "maintenanceMode" && !settings.maintenanceMode) {
      setMaintenanceDialog(true)
      return
    }

    try {
      const newValue = !settings[key]
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update",
          key,
          value: newValue,
        }),
      })

      if (response.ok) {
        setSettings({ ...settings, [key]: newValue })
        toast.success("Paramètre mis à jour")
      }
    } catch (error) {
      toast.error("Erreur lors de la mise à jour")
    }
  }

  const handleActivateMaintenance = async () => {
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "maintenance",
          enabled: true,
          message: maintenanceMessage,
          schedule: maintenanceSchedule,
        }),
      })

      if (response.ok) {
        setSettings({ ...settings, maintenanceMode: true })
        setMaintenanceDialog(false)
        setMaintenanceMessage("")
        setMaintenanceSchedule("")
        toast.success("Mode maintenance activé")
      }
    } catch (error) {
      toast.error("Erreur lors de l'activation")
    }
  }

  const addCustomFeature = () => {
    if (!editingPlan || !newFeatureKey) return

    setEditingPlan({
      ...editingPlan,
      features: {
        ...editingPlan.features,
        [newFeatureKey]: newFeatureValue || true,
      },
    })

    setNewFeatureKey("")
    setNewFeatureValue("")
  }

  const removeCustomFeature = (key: string) => {
    if (!editingPlan) return

    const newFeatures = { ...editingPlan.features }
    delete newFeatures[key]

    setEditingPlan({
      ...editingPlan,
      features: newFeatures,
    })
  }

  // Fonctionnalités standards connues
  const standardFeatures = [
    'maxJobs',
    'maxAppsPerJob',
    'maxAIAnalysesMonth',
    'prioritySupport',
    'advancedAnalytics',
    'customBranding'
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Configurez votre plateforme Selectif</p>
      </div>

      {/* Pricing Plans - Horizontal Cards Layout */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <DollarSign className="h-6 w-6" />
            Plans & Tarification
          </h2>
          <p className="text-muted-foreground mt-1">
            Gérez les prix et les fonctionnalités de chaque plan d'abonnement
          </p>
        </div>

        {pricingPlans.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {pricingPlans.map((plan) => (
              <Card key={plan.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{plan.displayName}</CardTitle>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {plan.type === "COMPANY" ? "Entreprise" : "Candidat"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {plan.billingPeriod === "MONTHLY" ? "Mensuel" : "Annuel"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {plan.price === 0 ? (
                        <Badge className="text-base px-3 py-1">Gratuit</Badge>
                      ) : (
                        <div>
                          <div className="text-3xl font-bold text-foreground">{plan.price}€</div>
                          <div className="text-xs text-muted-foreground">
                            /{plan.billingPeriod === "MONTHLY" ? "mois" : "an"}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Features List */}
                  <div className="space-y-2.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Fonctionnalités incluses
                    </p>
                    <div className="space-y-2">
                      {plan.features.maxJobs !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            {plan.features.maxJobs === -1
                              ? "Offres illimitées"
                              : `${plan.features.maxJobs} offre${plan.features.maxJobs > 1 ? 's' : ''}`}
                          </span>
                        </div>
                      )}
                      {plan.features.maxAppsPerJob !== undefined && plan.type === "COMPANY" && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            {plan.features.maxAppsPerJob === -1
                              ? "Candidatures illimitées/offre"
                              : `${plan.features.maxAppsPerJob} candidature${plan.features.maxAppsPerJob > 1 ? 's' : ''}/offre`}
                          </span>
                        </div>
                      )}
                      {plan.features.maxAIAnalysesMonth !== undefined && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>
                            {plan.features.maxAIAnalysesMonth === -1
                              ? "Analyses IA illimitées"
                              : `${plan.features.maxAIAnalysesMonth} analyse${plan.features.maxAIAnalysesMonth > 1 ? 's' : ''} IA/mois`}
                          </span>
                        </div>
                      )}
                      {plan.features.prioritySupport && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>Support prioritaire</span>
                        </div>
                      )}
                      {plan.features.advancedAnalytics && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>Analytics avancés</span>
                        </div>
                      )}
                      {plan.features.customBranding && (
                        <div className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-600 shrink-0" />
                          <span>Branding personnalisé</span>
                        </div>
                      )}
                      {/* Afficher toutes les autres fonctionnalités personnalisées */}
                      {Object.keys(plan.features).filter(key => !standardFeatures.includes(key)).map((key) => (
                        <div key={key} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-blue-600 shrink-0" />
                          <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => handleEditPlan(plan)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier le plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Plan Dialog - Largeur maximale augmentée */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Modifier le plan: {editingPlan?.displayName}</DialogTitle>
            <DialogDescription>
              Modifiez les prix et les fonctionnalités de ce plan
            </DialogDescription>
          </DialogHeader>
          {editingPlan && (
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-6">
                {/* Prix et période */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="price">Prix (€)</Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={editingPlan.price}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) || 0 })
                      }
                      placeholder="0"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Période: {editingPlan.billingPeriod === "MONTHLY" ? "Mensuel" : "Annuel"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Type de plan</Label>
                    <div className="h-10 flex items-center">
                      <Badge variant="outline">
                        {editingPlan.type === "COMPANY" ? "Entreprise" : "Candidat"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-4">Fonctionnalités principales</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Fonctionnalités numériques */}
                    {editingPlan.type === "COMPANY" && (
                      <div>
                        <Label htmlFor="maxJobs" className="text-sm">Offres maximum</Label>
                        <Input
                          id="maxJobs"
                          type="number"
                          value={editingPlan.features.maxJobs || 0}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              features: {
                                ...editingPlan.features,
                                maxJobs: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="-1 pour illimité"
                        />
                      </div>
                    )}

                    {editingPlan.type === "COMPANY" && (
                      <div>
                        <Label htmlFor="maxAppsPerJob" className="text-sm">Candidatures/offre</Label>
                        <Input
                          id="maxAppsPerJob"
                          type="number"
                          value={editingPlan.features.maxAppsPerJob || 0}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              features: {
                                ...editingPlan.features,
                                maxAppsPerJob: parseInt(e.target.value) || 0,
                              },
                            })
                          }
                          placeholder="-1 pour illimité"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="maxAI" className="text-sm">Analyses IA/mois</Label>
                      <Input
                        id="maxAI"
                        type="number"
                        value={editingPlan.features.maxAIAnalysesMonth || 0}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            features: {
                              ...editingPlan.features,
                              maxAIAnalysesMonth: parseInt(e.target.value) || 0,
                            },
                          })
                        }
                        placeholder="-1 pour illimité"
                      />
                    </div>
                  </div>

                  {/* Fonctionnalités booléennes */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        id="prioritySupport"
                        checked={editingPlan.features.prioritySupport || false}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            features: {
                              ...editingPlan.features,
                              prioritySupport: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="prioritySupport" className="cursor-pointer text-sm">
                        Support prioritaire
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                      <input
                        type="checkbox"
                        id="advancedAnalytics"
                        checked={editingPlan.features.advancedAnalytics || false}
                        onChange={(e) =>
                          setEditingPlan({
                            ...editingPlan,
                            features: {
                              ...editingPlan.features,
                              advancedAnalytics: e.target.checked,
                            },
                          })
                        }
                        className="h-4 w-4"
                      />
                      <Label htmlFor="advancedAnalytics" className="cursor-pointer text-sm">
                        Analytics avancés
                      </Label>
                    </div>

                    {editingPlan.type === "COMPANY" && (
                      <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
                        <input
                          type="checkbox"
                          id="customBranding"
                          checked={editingPlan.features.customBranding || false}
                          onChange={(e) =>
                            setEditingPlan({
                              ...editingPlan,
                              features: {
                                ...editingPlan.features,
                                customBranding: e.target.checked,
                              },
                            })
                          }
                          className="h-4 w-4"
                        />
                        <Label htmlFor="customBranding" className="cursor-pointer text-sm">
                          Branding personnalisé
                        </Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Fonctionnalités personnalisées */}
                <div className="border-t pt-4">
                  <h4 className="text-sm font-semibold mb-3">Fonctionnalités personnalisées</h4>

                  {/* Liste des fonctionnalités personnalisées existantes */}
                  <div className="space-y-2 mb-4">
                    {Object.keys(editingPlan.features)
                      .filter(key => !standardFeatures.includes(key))
                      .map((key) => (
                        <div key={key} className="flex items-center justify-between p-2 bg-accent/20 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </span>
                            <Badge variant="secondary" className="text-xs">
                              {typeof editingPlan.features[key] === 'boolean'
                                ? (editingPlan.features[key] ? 'Activé' : 'Désactivé')
                                : editingPlan.features[key]}
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeCustomFeature(key)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ))}
                  </div>

                  {/* Ajouter une nouvelle fonctionnalité */}
                  <div className="bg-accent/10 p-4 rounded-lg border border-dashed">
                    <Label className="text-xs text-muted-foreground mb-3 block">
                      Ajouter une nouvelle fonctionnalité
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        placeholder="Nom (ex: videoInterview)"
                        value={newFeatureKey}
                        onChange={(e) => setNewFeatureKey(e.target.value)}
                        className="col-span-1"
                      />
                      <Input
                        placeholder="Valeur (optionnel)"
                        value={newFeatureValue}
                        onChange={(e) => setNewFeatureValue(e.target.value)}
                        className="col-span-1"
                      />
                      <Button
                        onClick={addCustomFeature}
                        disabled={!newFeatureKey}
                        size="sm"
                        className="col-span-1"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Ajouter
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Si vous ne spécifiez pas de valeur, la fonctionnalité sera activée par défaut (booléen)
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSavePlan}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Maintenance Mode Dialog */}
      <Dialog open={maintenanceDialog} onOpenChange={setMaintenanceDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Activer le mode maintenance
            </DialogTitle>
            <DialogDescription>
              Les utilisateurs seront notifiés par email et ne pourront plus accéder à la plateforme
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="maintenance-message">Message de maintenance</Label>
              <Textarea
                id="maintenance-message"
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Ex: Maintenance programmée pour amélioration des performances"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="maintenance-schedule">Durée estimée (optionnel)</Label>
              <Input
                id="maintenance-schedule"
                value={maintenanceSchedule}
                onChange={(e) => setMaintenanceSchedule(e.target.value)}
                placeholder="Ex: 2 heures"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMaintenanceDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleActivateMaintenance} className="bg-yellow-600 hover:bg-yellow-700">
              Activer la maintenance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Promotions sur les plans */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Percent className="h-6 w-6" />
              Promotions sur les Plans
            </h2>
            <p className="text-muted-foreground mt-1">
              Créez des réductions affichées directement sur la landing page avec prix barré
            </p>
          </div>
          <Button onClick={() => setIsPromoDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle promotion
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {promotions.map((promo) => (
            <Card key={promo.id} className={`relative ${!promo.active ? 'opacity-60' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {getPlanDisplayName(promo.plan)}
                    </Badge>
                    <CardTitle className="text-lg">-{promo.discountPercent}%</CardTitle>
                    {promo.label && (
                      <p className="text-sm text-muted-foreground mt-1">{promo.label}</p>
                    )}
                  </div>
                  <Switch
                    checked={promo.active}
                    onCheckedChange={() => handleTogglePromo(promo.id)}
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {promo.validFrom && (
                  <div className="text-xs text-muted-foreground">
                    Début: {new Date(promo.validFrom).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {promo.validUntil && (
                  <div className="text-xs text-muted-foreground">
                    Fin: {new Date(promo.validUntil).toLocaleDateString('fr-FR')}
                  </div>
                )}
                {!promo.validFrom && !promo.validUntil && (
                  <div className="text-xs text-muted-foreground">Permanente</div>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-destructive hover:text-destructive"
                  onClick={() => handleDeletePromo(promo.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Supprimer
                </Button>
              </CardContent>
            </Card>
          ))}

          {promotions.length === 0 && (
            <Card className="col-span-full">
              <CardContent className="text-center py-12">
                <Percent className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucune promotion</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Créez votre première promotion pour afficher des prix réduits sur la landing page
                </p>
                <Button onClick={() => setIsPromoDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une promotion
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Nouvelle Promotion */}
      <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle promotion sur un plan</DialogTitle>
            <DialogDescription>
              La promotion sera affichée sur la landing page avec le prix barré
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="promo-plan">Plan concerné *</Label>
              <select
                id="promo-plan"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newPromo.plan}
                onChange={(e) => setNewPromo({ ...newPromo, plan: e.target.value })}
              >
                <option value="">Sélectionner un plan</option>
                <option value="COMPANY_BUSINESS">Business (79€)</option>
                <option value="COMPANY_ENTERPRISE">Enterprise (299€)</option>
                <option value="CANDIDATE_PREMIUM">Premium (19€)</option>
              </select>
            </div>

            <div>
              <Label htmlFor="promo-discount">Réduction (%) *</Label>
              <Input
                id="promo-discount"
                type="number"
                min="1"
                max="100"
                value={newPromo.discountPercent || ''}
                onChange={(e) => setNewPromo({ ...newPromo, discountPercent: parseInt(e.target.value) || 0 })}
                placeholder="20"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Ex: 20 pour -20%
              </p>
            </div>

            <div>
              <Label htmlFor="promo-label">Label (optionnel)</Label>
              <Input
                id="promo-label"
                value={newPromo.label}
                onChange={(e) => setNewPromo({ ...newPromo, label: e.target.value })}
                placeholder="Offre de lancement"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Affiché comme badge sur la landing page
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="promo-from">Date début (optionnel)</Label>
                <Input
                  id="promo-from"
                  type="date"
                  value={newPromo.validFrom}
                  onChange={(e) => setNewPromo({ ...newPromo, validFrom: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="promo-until">Date fin (optionnel)</Label>
                <Input
                  id="promo-until"
                  type="date"
                  value={newPromo.validUntil}
                  onChange={(e) => setNewPromo({ ...newPromo, validUntil: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-accent/20 p-3 rounded-lg border">
              <p className="text-sm font-medium mb-1">Aperçu</p>
              {newPromo.plan && newPromo.discountPercent > 0 ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">
                    {Math.round((
                      newPromo.plan === 'COMPANY_BUSINESS' ? 79 :
                      newPromo.plan === 'COMPANY_ENTERPRISE' ? 299 :
                      19
                    ) * (1 - newPromo.discountPercent / 100))}€
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {newPromo.plan === 'COMPANY_BUSINESS' ? '79€' :
                     newPromo.plan === 'COMPANY_ENTERPRISE' ? '299€' :
                     '19€'}
                  </span>
                  <Badge variant="secondary">-{newPromo.discountPercent}%</Badge>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Remplissez le formulaire pour voir l'aperçu</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPromoDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePromo} disabled={!newPromo.plan || newPromo.discountPercent <= 0}>
              Créer la promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* System Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Général
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Mode maintenance</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.maintenanceMode ? "Site en maintenance" : "Site opérationnel"}
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={() => handleToggleSetting("maintenanceMode")}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Inscriptions</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.registrationsOpen ? "Ouvertes" : "Fermées"}
                  </p>
                </div>
                <Switch
                  checked={settings.registrationsOpen}
                  onCheckedChange={() => handleToggleSetting("registrationsOpen")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Notifications par email</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.emailNotifications ? "Activées" : "Désactivées"}
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={() => handleToggleSetting("emailNotifications")}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">Alertes système</p>
                  <p className="text-xs text-muted-foreground">
                    {settings.systemAlerts ? "Activées" : "Désactivées"}
                  </p>
                </div>
                <Switch
                  checked={settings.systemAlerts}
                  onCheckedChange={() => handleToggleSetting("systemAlerts")}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Authentification à deux facteurs</p>
                  <p className="text-xs text-muted-foreground">Non configuré</p>
                </div>
                <Shield className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Sessions actives</p>
                  <p className="text-xs text-muted-foreground">1 session active</p>
                </div>
                <Key className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Connexion</p>
                  <p className="text-xs text-muted-foreground">Connecté</p>
                </div>
                <div className="h-2 w-2 bg-green-500 rounded-full" />
              </div>

              <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-border">
                <div>
                  <p className="text-sm font-medium text-foreground">Sauvegarde automatique</p>
                  <p className="text-xs text-muted-foreground">Non configuré</p>
                </div>
                <div className="h-2 w-2 bg-muted rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
