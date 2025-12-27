"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Briefcase, MapPin, DollarSign, Loader2, Calendar, Building2 } from "lucide-react"
import { FormattedText } from "@/components/formatted-text"
import { toast } from "sonner"
import { ApplyPageSkeleton } from "@/components/ui/skeletons"
import { useMinimumLoading } from "@/lib/use-minimum-loading"

interface JobOffer {
  id: string
  title: string
  description: string
  requirements: string
  location: string | null
  jobType: string
  salaryRange: string | null
  company: {
    companyName: string
    logo: string | null
  }
}

const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Temps plein",
  PART_TIME: "Temps partiel",
  CONTRACT: "Contrat",
  INTERNSHIP: "Stage",
  FREELANCE: "Freelance",
}

export default function ApplyPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState<JobOffer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const showLoading = useMinimumLoading(isLoading, 800)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [motivationLetter, setMotivationLetter] = useState("")
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [consentGiven, setConsentGiven] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [params.publicId])

  const fetchJob = async () => {
    try {
      const response = await fetch(`/api/jobs/public/${params.publicId}`)
      if (!response.ok) throw new Error("Offre non trouvée")
      const data = await response.json()
      setJob(data.job)
    } catch (error) {
      console.error("Job fetch error:", error)
      toast.error("Impossible de charger l'offre")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!cvFile) {
      toast.error("Veuillez joindre votre CV")
      return
    }

    if (!consentGiven) {
      toast.error("Veuillez accepter le traitement de vos données personnelles")
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("firstName", firstName)
      formData.append("lastName", lastName)
      formData.append("email", email)
      formData.append("phone", phone)
      formData.append("linkedinUrl", linkedinUrl)
      formData.append("motivationLetter", motivationLetter)
      formData.append("consentGiven", "true")
      formData.append("cv", cvFile)

      const response = await fetch(`/api/jobs/public/${params.publicId}/apply`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erreur lors de la candidature")
      }

      toast.success("Candidature envoyée avec succès !")

      // Reset form
      setFirstName("")
      setLastName("")
      setEmail("")
      setPhone("")
      setLinkedinUrl("")
      setMotivationLetter("")
      setCvFile(null)

      // Redirect or show success message
      setTimeout(() => {
        router.push("/")
      }, 2000)
    } catch (error) {
      console.error("Application error:", error)
      toast.error(error instanceof Error ? error.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (showLoading) {
    return <ApplyPageSkeleton />
  }

  if (!job) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Offre non trouvée</CardTitle>
            <CardDescription>
              Cette offre d'emploi n'existe pas ou n'est plus disponible.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="border-b bg-background">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center font-bold text-white text-sm">
                S
              </div>
              <span className="text-xl font-bold">Selectif</span>
            </div>
            <div className="text-sm text-muted-foreground">Powered by AI</div>
          </div>
        </div>
      </nav>

      <div className="container max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            {job.company.logo && (
              <img
                src={job.company.logo}
                alt={job.company.companyName}
                className="w-16 h-16 rounded-lg object-cover border"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">{job.title}</h1>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{job.company.companyName}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="flex items-center gap-1 bg-background">
              <Briefcase className="h-3 w-3" />
              {JOB_TYPE_LABELS[job.jobType]}
            </Badge>
            {job.location && (
              <Badge variant="outline" className="flex items-center gap-1 bg-background">
                <MapPin className="h-3 w-3" />
                {job.location}
              </Badge>
            )}
            {job.salaryRange && (
              <Badge variant="outline" className="flex items-center gap-1 bg-background">
                <DollarSign className="h-3 w-3" />
                {job.salaryRange}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Details */}
          <div className="space-y-6 order-2 lg:order-1">
            <Card>
              <CardHeader>
                <CardTitle>Description du poste</CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedText text={job.description} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Exigences et compétences</CardTitle>
              </CardHeader>
              <CardContent>
                <FormattedText text={job.requirements} />
              </CardContent>
            </Card>

            {/* Marketing CTA */}
            <Card className="bg-gradient-to-br from-primary/5 to-purple-600/5 border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Propulsé par Selectif</h3>
                    <p className="text-sm text-muted-foreground">
                      Cette entreprise utilise Selectif pour recruter les meilleurs talents grâce à l'IA.
                      Votre CV sera analysé automatiquement pour matcher avec les exigences du poste.
                    </p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground">
                    ✨ Analyse IA instantanée • 🎯 Matching intelligent • ⚡ Processus accéléré
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Application Form */}
          <div className="order-1 lg:order-2">
            <div className="sticky top-4">
              <Card className="border-2">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">Postuler à cette offre</CardTitle>
                  <CardDescription>
                    Remplissez le formulaire pour envoyer votre candidature
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-2">
                  <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">LinkedIn (optionnel)</Label>
                    <Input
                      id="linkedinUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cv">CV (PDF) *</Label>
                    <Input
                      id="cv"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Format PDF uniquement, max 5MB
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="motivationLetter">
                      Lettre de motivation (optionnel)
                    </Label>
                    <Textarea
                      id="motivationLetter"
                      rows={4}
                      placeholder="Expliquez pourquoi vous souhaitez rejoindre notre équipe..."
                      value={motivationLetter}
                      onChange={(e) => setMotivationLetter(e.target.value)}
                    />
                  </div>

                  <div className="flex items-start space-x-2 rounded-lg border p-4 bg-muted/50">
                    <Checkbox
                      id="consent"
                      checked={consentGiven}
                      onCheckedChange={(checked) => setConsentGiven(checked as boolean)}
                      required
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="consent"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Consentement RGPD *
                      </label>
                      <p className="text-xs text-muted-foreground">
                        J'accepte que mes données personnelles soient traitées dans le cadre de cette candidature.
                        Mes données seront conservées pendant 6 mois conformément au RGPD.
                      </p>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer ma candidature"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
