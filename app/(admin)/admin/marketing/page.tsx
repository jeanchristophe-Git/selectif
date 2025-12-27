"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mail, Send, Trash2, Plus, Tag, ToggleLeft, ToggleRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Campaign {
  id: string
  title: string
  subject: string
  body: string
  recipients: string
  status: string
  totalSent: number
  totalOpened: number
  createdAt: string
}

interface PromoCode {
  id: string
  code: string
  type: string
  value: number
  applicableTo: string
  maxUses: number | null
  currentUses: number
  expiresAt: string | null
  active: boolean
  description: string | null
  createdAt: string
}

export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([])
  const [loading, setLoading] = useState(false)
  const [isCreateCampaignOpen, setIsCreateCampaignOpen] = useState(false)
  const [isCreatePromoOpen, setIsCreatePromoOpen] = useState(false)

  const [campaignFormData, setCampaignFormData] = useState({
    title: "",
    subject: "",
    bodyContent: "",
    recipients: "ALL",
  })

  const [promoFormData, setPromoFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    applicableTo: "ALL",
    maxUses: "",
    expiresAt: "",
    description: "",
  })

  useEffect(() => {
    fetchCampaigns()
    fetchPromoCodes()
  }, [])

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/admin/campaigns")
      if (response.ok) {
        const data = await response.json()
        setCampaigns(data.campaigns)
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error)
    }
  }

  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/admin/promo-codes")
      if (response.ok) {
        const data = await response.json()
        setPromoCodes(data.promoCodes)
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error)
    }
  }

  const handleCreateCampaign = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          ...campaignFormData,
        }),
      })

      if (response.ok) {
        setIsCreateCampaignOpen(false)
        setCampaignFormData({ title: "", subject: "", bodyContent: "", recipients: "ALL" })
        fetchCampaigns()
      }
    } catch (error) {
      console.error("Error creating campaign:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCampaignAction = async (action: string, campaignId: string) => {
    try {
      const response = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, campaignId }),
      })

      if (response.ok) {
        fetchCampaigns()
      }
    } catch (error) {
      console.error("Error performing action:", error)
    }
  }

  const handleCreatePromo = async () => {
    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", ...promoFormData }),
      })

      if (response.ok) {
        setIsCreatePromoOpen(false)
        setPromoFormData({
          code: "",
          type: "PERCENTAGE",
          value: "",
          applicableTo: "ALL",
          maxUses: "",
          expiresAt: "",
          description: "",
        })
        fetchPromoCodes()
      }
    } catch (error) {
      console.error("Error creating promo code:", error)
    }
  }

  const handlePromoAction = async (action: string, promoCodeId: string) => {
    try {
      const response = await fetch("/api/admin/promo-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, promoCodeId }),
      })

      if (response.ok) {
        fetchPromoCodes()
      }
    } catch (error) {
      console.error("Error performing action:", error)
    }
  }

  const activeCampaigns = campaigns.filter(c => c.status !== "SENT").length
  const activePromos = promoCodes.filter(p => p.active).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Marketing</h1>
        <p className="text-muted-foreground mt-1">Gérez vos campagnes email et codes promo</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total campagnes</p>
                <p className="text-2xl font-bold text-foreground mt-2">{campaigns.length}</p>
              </div>
              <div className="bg-primary/10 p-3 rounded-lg">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Emails envoyés</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {campaigns.reduce((sum, c) => sum + c.totalSent, 0)}
                </p>
              </div>
              <div className="bg-secondary/10 p-3 rounded-lg">
                <Send className="h-6 w-6 text-secondary-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Codes promo actifs</p>
                <p className="text-2xl font-bold text-foreground mt-2">{activePromos}</p>
              </div>
              <div className="bg-accent/10 p-3 rounded-lg">
                <Tag className="h-6 w-6 text-accent-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Utilisation promos</p>
                <p className="text-2xl font-bold text-foreground mt-2">
                  {promoCodes.reduce((sum, p) => sum + p.currentUses, 0)}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-lg">
                <Tag className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="campaigns">Campagnes Email</TabsTrigger>
          <TabsTrigger value="promos">Codes Promo</TabsTrigger>
        </TabsList>

        {/* Campagnes Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Campagnes Email</CardTitle>
              <Dialog open={isCreateCampaignOpen} onOpenChange={setIsCreateCampaignOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle campagne
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Créer une campagne email</DialogTitle>
                    <DialogDescription>
                      Composez votre campagne email marketing
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Titre de la campagne</Label>
                      <Input
                        id="title"
                        value={campaignFormData.title}
                        onChange={(e) => setCampaignFormData({ ...campaignFormData, title: e.target.value })}
                        placeholder="Ex: Newsletter mensuelle"
                      />
                    </div>
                    <div>
                      <Label htmlFor="subject">Sujet de l'email</Label>
                      <Input
                        id="subject"
                        value={campaignFormData.subject}
                        onChange={(e) => setCampaignFormData({ ...campaignFormData, subject: e.target.value })}
                        placeholder="Ex: Découvrez nos nouveautés"
                      />
                    </div>
                    <div>
                      <Label htmlFor="recipients">Destinataires</Label>
                      <Select value={campaignFormData.recipients} onValueChange={(val) => setCampaignFormData({ ...campaignFormData, recipients: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Tous les utilisateurs</SelectItem>
                          <SelectItem value="ALL_COMPANIES">Toutes les entreprises</SelectItem>
                          <SelectItem value="ALL_CANDIDATES">Tous les candidats</SelectItem>
                          <SelectItem value="FREE_COMPANIES">Entreprises FREE</SelectItem>
                          <SelectItem value="PAID_COMPANIES">Entreprises payantes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="body">Contenu de l'email</Label>
                      <Textarea
                        id="body"
                        value={campaignFormData.bodyContent}
                        onChange={(e) => setCampaignFormData({ ...campaignFormData, bodyContent: e.target.value })}
                        placeholder="Écrivez votre message..."
                        rows={10}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateCampaignOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreateCampaign} disabled={loading}>
                      Créer la campagne
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucune campagne</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez votre première campagne email
                  </p>
                  <Button onClick={() => setIsCreateCampaignOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer une campagne
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign) => (
                    <div
                      key={campaign.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{campaign.title}</h3>
                          <Badge variant={campaign.status === "SENT" ? "secondary" : "default"}>
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{campaign.subject}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Destinataires: {campaign.recipients}</span>
                          <span>Envoyés: {campaign.totalSent}</span>
                          <span>Ouverts: {campaign.totalOpened}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === "DRAFT" && (
                          <Button
                            size="sm"
                            onClick={() => handleCampaignAction("send", campaign.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            Envoyer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Supprimer cette campagne ?")) {
                              handleCampaignAction("delete", campaign.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Codes Promo Tab */}
        <TabsContent value="promos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Codes Promo</CardTitle>
              <Dialog open={isCreatePromoOpen} onOpenChange={setIsCreatePromoOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau code
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Créer un code promo</DialogTitle>
                    <DialogDescription>
                      Créez un nouveau code promotionnel
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="code">Code</Label>
                      <Input
                        id="code"
                        value={promoFormData.code}
                        onChange={(e) => setPromoFormData({ ...promoFormData, code: e.target.value.toUpperCase() })}
                        placeholder="PROMO2025"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={promoFormData.type} onValueChange={(val) => setPromoFormData({ ...promoFormData, type: val })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PERCENTAGE">Pourcentage</SelectItem>
                            <SelectItem value="FIXED_AMOUNT">Montant fixe</SelectItem>
                            <SelectItem value="FREE_MONTHS">Mois gratuits</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="value">Valeur</Label>
                        <Input
                          id="value"
                          type="number"
                          value={promoFormData.value}
                          onChange={(e) => setPromoFormData({ ...promoFormData, value: e.target.value })}
                          placeholder="50"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="applicableTo">Applicable à</Label>
                      <Select value={promoFormData.applicableTo} onValueChange={(val) => setPromoFormData({ ...promoFormData, applicableTo: val })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALL">Tous</SelectItem>
                          <SelectItem value="COMPANY">Entreprises</SelectItem>
                          <SelectItem value="CANDIDATE">Candidats</SelectItem>
                          <SelectItem value="BUSINESS_ONLY">Business uniquement</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="maxUses">Utilisations max</Label>
                        <Input
                          id="maxUses"
                          type="number"
                          value={promoFormData.maxUses}
                          onChange={(e) => setPromoFormData({ ...promoFormData, maxUses: e.target.value })}
                          placeholder="Illimité"
                        />
                      </div>
                      <div>
                        <Label htmlFor="expiresAt">Expire le</Label>
                        <Input
                          id="expiresAt"
                          type="date"
                          value={promoFormData.expiresAt}
                          onChange={(e) => setPromoFormData({ ...promoFormData, expiresAt: e.target.value })}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={promoFormData.description}
                        onChange={(e) => setPromoFormData({ ...promoFormData, description: e.target.value })}
                        placeholder="Promo de lancement"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePromoOpen(false)}>
                      Annuler
                    </Button>
                    <Button onClick={handleCreatePromo}>Créer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {promoCodes.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Aucun code promo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Créez votre premier code promotionnel
                  </p>
                  <Button onClick={() => setIsCreatePromoOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Créer un code
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {promoCodes.map((promo) => (
                    <div
                      key={promo.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground font-mono">{promo.code}</h3>
                          <Badge variant={promo.active ? "default" : "secondary"}>
                            {promo.active ? "Actif" : "Inactif"}
                          </Badge>
                          <Badge variant="outline">
                            {promo.type === "PERCENTAGE" ? `${promo.value}%` :
                             promo.type === "FIXED_AMOUNT" ? `${promo.value}€` :
                             `${promo.value} mois`}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{promo.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                          <span>Utilisations: {promo.currentUses}/{promo.maxUses || "∞"}</span>
                          <span>Expire: {promo.expiresAt ? new Date(promo.expiresAt).toLocaleDateString("fr-FR") : "Jamais"}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePromoAction("toggle", promo.id)}
                        >
                          {promo.active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (confirm("Supprimer ce code promo ?")) {
                              handlePromoAction("delete", promo.id)
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
