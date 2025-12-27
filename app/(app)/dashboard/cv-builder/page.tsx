"use client"

import { useSessionZustand } from "@/lib/use-session-zustand"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  FileText,
  Download,
  Eye,
  Crown,
  Save,
  Sparkles,
  Wand2,
  Loader2,
  Upload,
  X,
  Target,
  Lightbulb,
  CheckCircle2
} from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

interface CVData {
  personalInfo: {
    fullName: string
    email: string
    phone: string
    location: string
    title: string
    summary: string
  }
  experience: Array<{
    id: string
    company: string
    position: string
    startDate: string
    endDate: string
    current: boolean
    description: string
  }>
  education: Array<{
    id: string
    school: string
    degree: string
    field: string
    startDate: string
    endDate: string
    current: boolean
  }>
  skills: Array<{
    id: string
    name: string
    level: string
  }>
  languages: Array<{
    id: string
    language: string
    level: string
  }>
}

export default function CVBuilderPage() {
  const { user, loading, isCandidate } = useSessionZustand()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loadingCV, setLoadingCV] = useState(true)

  // États pour l'assistant IA
  const [generatingAI, setGeneratingAI] = useState(false)
  const [mode, setMode] = useState<"generate" | "adapt">("adapt") // Mode par défaut = adapt
  const [jobOfferText, setJobOfferText] = useState("")
  const [uploadedPDF, setUploadedPDF] = useState<File | null>(null)
  const [extractedCVText, setExtractedCVText] = useState("")
  const [parsingPDF, setParsingPDF] = useState(false)
  const [aiInputs, setAiInputs] = useState({
    jobTitle: "",
    yearsExperience: "",
    skills: "",
    education: "",
    targetIndustry: ""
  })

  const [cvData, setCvData] = useState<CVData>({
    personalInfo: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      title: "",
      summary: ""
    },
    experience: [],
    education: [],
    skills: [],
    languages: []
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && !isCandidate) {
      router.push("/dashboard")
    }
  }, [user, loading, isCandidate, router])

  // Charger le CV existant
  useEffect(() => {
    const loadCV = async () => {
      if (!user || !isCandidate) return

      try {
        const response = await fetch("/api/cv")
        if (response.ok) {
          const data = await response.json()
          if (data.cv) {
            setCvData({
              personalInfo: {
                fullName: data.cv.fullName || "",
                email: data.cv.email || "",
                phone: data.cv.phone || "",
                location: data.cv.location || "",
                title: data.cv.title || "",
                summary: data.cv.summary || ""
              },
              experience: Array.isArray(data.cv.experience) ? data.cv.experience : [],
              education: Array.isArray(data.cv.education) ? data.cv.education : [],
              skills: Array.isArray(data.cv.skills) ? data.cv.skills : [],
              languages: Array.isArray(data.cv.languages) ? data.cv.languages : []
            })
          } else {
            setCvData(prev => ({
              ...prev,
              personalInfo: {
                ...prev.personalInfo,
                fullName: user.name || "",
                email: user.email || ""
              }
            }))
          }
        }
      } catch (error) {
        console.error("Error loading CV:", error)
        setCvData(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            fullName: user.name || "",
            email: user.email || ""
          }
        }))
      } finally {
        setLoadingCV(false)
      }
    }

    if (!loading && user && isCandidate) {
      loadCV()
    }
  }, [user, loading, isCandidate])

  const hasPremiumAccess = user?.subscription?.plan === "CANDIDATE_PREMIUM"

  if (loading || loadingCV) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!isCandidate) {
    return null
  }

  if (!hasPremiumAccess) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            CV Builder
          </h1>
          <p className="text-muted-foreground mt-1">Créez votre CV professionnel</p>
        </div>

        <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
              <Crown className="h-10 w-10 text-primary" />
            </div>

            <h2 className="text-2xl font-bold mb-3">Fonctionnalité Premium</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Le CV Builder IA est réservé aux membres Premium. Passez à Premium pour générer des CVs professionnels en quelques secondes.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/dashboard/settings">
                <Button size="lg" className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Passer à Premium
                </Button>
              </Link>
              <Link href="/dashboard/jobs-available">
                <Button size="lg" variant="outline">
                  Retour aux offres
                </Button>
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t">
              <p className="text-sm font-semibold mb-3">Avec Premium, vous débloquez :</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="secondary">CV généré par IA</Badge>
                <Badge variant="secondary">Optimisé ATS</Badge>
                <Badge variant="secondary">Export PDF</Badge>
                <Badge variant="secondary">CVs illimités</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cvData)
      })

      if (response.ok) {
        toast.success("CV sauvegardé avec succès")
      } else {
        toast.error("Erreur lors de la sauvegarde")
      }
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde")
    } finally {
      setSaving(false)
    }
  }

  const handleExportPDF = async () => {
    const cvPreview = document.getElementById("cv-preview")
    if (!cvPreview) {
      toast.error("Erreur lors de l'export")
      return
    }

    try {
      toast.loading("Génération du PDF en cours...")

      const canvas = await html2canvas(cvPreview, {
        scale: 2,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true
      })

      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      const pdf = new jsPDF("p", "mm", "a4")
      const imgData = canvas.toDataURL("image/png")

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)

      const fileName = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, "_") || "Document"}.pdf`
      pdf.save(fileName)

      toast.dismiss()
      toast.success("PDF généré avec succès")
    } catch (error) {
      console.error("PDF export error:", error)
      toast.dismiss()
      toast.error("Erreur lors de l'export PDF")
    }
  }

  const handleGenerateWithAI = async () => {
    if (!aiInputs.jobTitle) {
      toast.error("Veuillez renseigner au moins le titre du poste visé")
      return
    }

    setGeneratingAI(true)
    try {
      const response = await fetch("/api/cv/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiInputs)
      })

      if (response.ok) {
        const data = await response.json()

        setCvData({
          personalInfo: {
            fullName: user?.name || "",
            email: user?.email || "",
            phone: cvData.personalInfo.phone || "",
            location: cvData.personalInfo.location || "",
            title: data.cv.personalInfo.title || "",
            summary: data.cv.personalInfo.summary || ""
          },
          experience: data.cv.experience || [],
          education: data.cv.education || [],
          skills: data.cv.skills || [],
          languages: cvData.languages
        })

        toast.success("CV généré avec succès par l'IA! 🎉")
      } else {
        toast.error("Erreur lors de la génération")
      }
    } catch (error) {
      console.error("AI generation error:", error)
      toast.error("Erreur lors de la génération du CV")
    } finally {
      setGeneratingAI(false)
    }
  }

  const handlePDFUpload = async (file: File) => {
    setParsingPDF(true)
    setUploadedPDF(file)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cv/parse-pdf", {
        method: "POST",
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setExtractedCVText(data.cvText)
        toast.success(`CV extrait avec succès (${data.pages} page${data.pages > 1 ? 's' : ''})`)
      } else {
        const error = await response.json()
        toast.error(error.message || "Erreur lors de l'extraction du PDF")
        setUploadedPDF(null)
      }
    } catch (error) {
      console.error("PDF upload error:", error)
      toast.error("Erreur lors de l'upload du PDF")
      setUploadedPDF(null)
    } finally {
      setParsingPDF(false)
    }
  }

  const handleAdaptToJob = async () => {
    if (!jobOfferText.trim()) {
      toast.error("Veuillez coller le texte de l'offre d'emploi")
      return
    }

    if (!extractedCVText && !cvData.personalInfo.title) {
      toast.error("Veuillez d'abord uploader votre CV en PDF ou générer un CV")
      return
    }

    setGeneratingAI(true)
    try {
      const response = await fetch("/api/cv/adapt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobOffer: jobOfferText,
          cvText: extractedCVText || null,
          currentCV: extractedCVText ? null : cvData
        })
      })

      if (response.ok) {
        const data = await response.json()

        setCvData({
          personalInfo: {
            fullName: user?.name || "",
            email: user?.email || "",
            phone: cvData.personalInfo.phone || "",
            location: cvData.personalInfo.location || "",
            title: data.cv.personalInfo.title || cvData.personalInfo.title,
            summary: data.cv.personalInfo.summary || cvData.personalInfo.summary
          },
          experience: data.cv.experience || cvData.experience,
          education: data.cv.education || cvData.education,
          skills: data.cv.skills || cvData.skills,
          languages: cvData.languages
        })

        toast.success("CV adapté avec succès au poste! 🎯")
      } else {
        toast.error("Erreur lors de l'adaptation")
      }
    } catch (error) {
      console.error("Adapt CV error:", error)
      toast.error("Erreur lors de l'adaptation du CV")
    } finally {
      setGeneratingAI(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="h-8 w-8" />
            CV Builder IA
            <Badge className="ml-2 bg-primary">Premium</Badge>
            <Badge variant="secondary" className="ml-1 gap-1">
              <Wand2 className="h-3 w-3" />
              IA
            </Badge>
          </h1>
          <p className="text-muted-foreground mt-1">Générez votre CV professionnel en quelques secondes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={saving || !cvData.personalInfo.title} variant="outline">
            <Save className="h-4 w-4 mr-2" />
            {saving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
          <Button onClick={handleExportPDF} disabled={!cvData.personalInfo.title}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Wizard IA */}
      <Card className="border-2 border-primary/50 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-primary" />
            Assistant IA - Génération de CV
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Renseignez quelques informations et l'IA va générer un CV professionnel optimisé pour vous
          </p>

          {/* Mode Tabs */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={mode === "generate" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("generate")}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Générer un CV
            </Button>
            <Button
              variant={mode === "adapt" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode("adapt")}
              className="gap-2"
            >
              <Target className="h-4 w-4" />
              Adapter à une offre
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {mode === "generate" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ai-job-title">Titre du poste visé *</Label>
                  <Input
                    id="ai-job-title"
                    value={aiInputs.jobTitle}
                    onChange={(e) => setAiInputs({...aiInputs, jobTitle: e.target.value})}
                    placeholder="Ex: Développeur Full Stack, Chef de projet..."
                  />
                </div>

                <div>
                  <Label htmlFor="ai-years">Années d'expérience</Label>
                  <Input
                    id="ai-years"
                    value={aiInputs.yearsExperience}
                    onChange={(e) => setAiInputs({...aiInputs, yearsExperience: e.target.value})}
                    placeholder="Ex: 3 ans, débutant..."
                  />
                </div>

                <div>
                  <Label htmlFor="ai-industry">Secteur cible</Label>
                  <Input
                    id="ai-industry"
                    value={aiInputs.targetIndustry}
                    onChange={(e) => setAiInputs({...aiInputs, targetIndustry: e.target.value})}
                    placeholder="Ex: Tech, Finance, Santé..."
                  />
                </div>

                <div>
                  <Label htmlFor="ai-education">Formation principale</Label>
                  <Input
                    id="ai-education"
                    value={aiInputs.education}
                    onChange={(e) => setAiInputs({...aiInputs, education: e.target.value})}
                    placeholder="Ex: Master Informatique, Bac+5..."
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="ai-skills">Compétences clés (séparées par des virgules)</Label>
                  <Textarea
                    id="ai-skills"
                    value={aiInputs.skills}
                    onChange={(e) => setAiInputs({...aiInputs, skills: e.target.value})}
                    placeholder="Ex: React, Node.js, Python, Leadership, Communication..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  onClick={handleGenerateWithAI}
                  disabled={generatingAI || !aiInputs.jobTitle}
                  className="gap-2"
                  size="lg"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Génération en cours...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Générer mon CV avec l'IA
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-4 w-4 text-blue-700 dark:text-blue-400" />
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-400">
                      Nouveau ! Upload + Adaptation IA
                    </p>
                  </div>
                  <ol className="text-sm text-muted-foreground space-y-1 ml-4 list-decimal">
                    <li>Uploadez votre CV existant en PDF (drag & drop)</li>
                    <li>Copiez le texte complet de l'offre d'emploi</li>
                    <li>L'IA adaptera automatiquement votre CV au poste</li>
                    <li>Téléchargez votre CV optimisé en PDF</li>
                  </ol>
                </div>

                {/* Zone de drag & drop pour le PDF */}
                <div>
                  <Label className="mb-2 block">1. Uploadez votre CV (PDF) *</Label>
                  {!uploadedPDF ? (
                    <div
                      className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer"
                      onDragOver={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.add("border-primary", "bg-primary/10")
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("border-primary", "bg-primary/10")
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        e.currentTarget.classList.remove("border-primary", "bg-primary/10")
                        const file = e.dataTransfer.files[0]
                        if (file && file.type === "application/pdf") {
                          handlePDFUpload(file)
                        } else {
                          toast.error("Veuillez uploader un fichier PDF")
                        }
                      }}
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = "application/pdf"
                        input.onchange = (e: any) => {
                          const file = e.target?.files?.[0]
                          if (file) handlePDFUpload(file)
                        }
                        input.click()
                      }}
                    >
                      {parsingPDF ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 className="h-12 w-12 text-primary animate-spin" />
                          <p className="text-sm text-muted-foreground">Extraction du texte en cours...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <Upload className="h-12 w-12 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Glissez-déposez votre CV ici</p>
                            <p className="text-sm text-muted-foreground mt-1">ou cliquez pour sélectionner un fichier</p>
                          </div>
                          <Badge variant="secondary" className="mt-2">PDF uniquement • Max 5MB</Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border border-primary/50 bg-primary/5 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-primary/20 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-sm">{uploadedPDF.name}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <span>{(uploadedPDF.size / 1024).toFixed(0)} KB</span>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-green-600" />
                              <span>Texte extrait</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setUploadedPDF(null)
                          setExtractedCVText("")
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>

                {/* Zone pour l'offre d'emploi */}
                <div>
                  <Label htmlFor="job-offer">2. Texte de l'offre d'emploi *</Label>
                  <Textarea
                    id="job-offer"
                    value={jobOfferText}
                    onChange={(e) => setJobOfferText(e.target.value)}
                    placeholder="Collez ici le texte complet de l'offre d'emploi (description du poste, compétences requises, responsabilités, etc.)"
                    rows={8}
                    className="font-mono text-xs"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    L'IA analysera l'offre et adaptera votre CV pour mettre en avant les compétences et expériences les plus pertinentes
                  </p>
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  onClick={handleAdaptToJob}
                  disabled={generatingAI || !jobOfferText.trim() || !uploadedPDF}
                  className="gap-2"
                  size="lg"
                >
                  {generatingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Adaptation en cours...
                    </>
                  ) : (
                    <>
                      <Target className="h-4 w-4" />
                      Adapter mon CV à cette offre
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview du CV généré */}
      {cvData.personalInfo.title && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu de votre CV
            </CardTitle>
            <p className="text-sm text-muted-foreground">Votre CV professionnel généré par l'IA</p>
          </CardHeader>
          <CardContent>
            <div id="cv-preview" className="bg-white text-black p-8 rounded-lg border-2 shadow-lg max-w-4xl mx-auto">
              <div className="space-y-4">
                {/* En-tête */}
                <div className="border-b-2 pb-4">
                  <h2 className="text-3xl font-bold">
                    {cvData.personalInfo.fullName || "Votre nom"}
                  </h2>
                  <p className="text-xl text-gray-600 mt-1">{cvData.personalInfo.title}</p>
                  <div className="text-sm text-gray-500 mt-3 space-y-1">
                    {cvData.personalInfo.email && <p>📧 {cvData.personalInfo.email}</p>}
                    {cvData.personalInfo.phone && <p>📱 {cvData.personalInfo.phone}</p>}
                    {cvData.personalInfo.location && <p>📍 {cvData.personalInfo.location}</p>}
                  </div>
                </div>

                {/* Résumé */}
                {cvData.personalInfo.summary && (
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-2 text-primary">Profil Professionnel</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">{cvData.personalInfo.summary}</p>
                  </div>
                )}

                {/* Expérience */}
                {cvData.experience.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-3 text-primary">Expérience Professionnelle</h3>
                    <div className="space-y-4">
                      {cvData.experience.map(exp => (
                        <div key={exp.id}>
                          <p className="font-bold text-base">{exp.position}</p>
                          <p className="text-gray-600 font-semibold">{exp.company}</p>
                          <p className="text-xs text-gray-500 mb-2">
                            {exp.startDate} - {exp.current ? "Présent" : exp.endDate}
                          </p>
                          {exp.description && (
                            <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                              {exp.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Formation */}
                {cvData.education.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-3 text-primary">Formation</h3>
                    <div className="space-y-3">
                      {cvData.education.map(edu => (
                        <div key={edu.id}>
                          <p className="font-bold">{edu.degree} - {edu.field}</p>
                          <p className="text-gray-600">{edu.school}</p>
                          <p className="text-xs text-gray-500">
                            {edu.startDate} - {edu.current ? "En cours" : edu.endDate}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Compétences */}
                {cvData.skills.length > 0 && (
                  <div>
                    <h3 className="font-bold text-lg uppercase mb-3 text-primary">Compétences</h3>
                    <div className="flex flex-wrap gap-2">
                      {cvData.skills.map(skill => (
                        <span key={skill.id} className="bg-primary/10 text-primary font-medium px-3 py-1 rounded-full text-sm">
                          {skill.name} • {skill.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
