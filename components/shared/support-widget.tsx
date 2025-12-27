"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Bug, HelpCircle, Lightbulb, Mail, Send, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<"categories" | "form">("categories")
  const [category, setCategory] = useState<string>("")
  const [subject, setSubject] = useState("")
  const [description, setDescription] = useState("")

  const categories = [
    {
      value: "BUG",
      label: "Signaler un bug",
      icon: Bug,
      description: "Quelque chose ne fonctionne pas comme prévu",
      emoji: "🐛",
    },
    {
      value: "HELP",
      label: "Demander de l'aide",
      icon: HelpCircle,
      description: "J'ai besoin d'assistance",
      emoji: "❓",
    },
    {
      value: "FEATURE",
      label: "Suggérer une fonctionnalité",
      icon: Lightbulb,
      description: "J'ai une idée pour améliorer Selectif",
      emoji: "💡",
    },
    {
      value: "CONTACT",
      label: "Contacter le support",
      icon: Mail,
      description: "Une question générale",
      emoji: "📧",
    },
  ]

  const handleCategorySelect = (cat: string) => {
    setCategory(cat)
    setStep("form")
  }

  const handleBack = () => {
    setStep("categories")
    setCategory("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !subject || !description) {
      toast.error("Veuillez remplir tous les champs")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          subject,
          description,
          userAgent: navigator.userAgent,
          currentUrl: window.location.href,
        }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'envoi")
      }

      toast.success("Message envoyé ! Nous vous répondrons bientôt 🎉")
      setIsOpen(false)
      setStep("categories")
      setCategory("")
      setSubject("")
      setDescription("")
    } catch (error) {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedCategory = categories.find((c) => c.value === category)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Widget Card */}
      {isOpen && (
        <div className="w-[380px] animate-in slide-in-from-bottom-3 duration-300">
          <div className="relative rounded-2xl bg-gradient-to-b from-[#1f1f1f] to-[#141414] p-6 shadow-[0_20px_40px_rgba(0,0,0,0.45)] text-white">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <div className="relative h-6 w-6">
                  <Image
                    src="/logo.svg"
                    alt="Selectif"
                    fill
                    className="object-contain invert"
                  />
                </div>
                <span>Support Selectif</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-200 transition text-lg"
              >
                ✕
              </button>
            </div>

            {step === "categories" ? (
              <>
                {/* Main text */}
                <h2 className="text-lg font-semibold leading-snug mb-1">
                  Comment pouvons-nous vous aider ?
                </h2>
                <p className="text-sm text-gray-400 mb-5">
                  Sélectionnez une catégorie pour commencer
                </p>

                {/* Categories */}
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    return (
                      <button
                        key={cat.value}
                        onClick={() => handleCategorySelect(cat.value)}
                        className="rounded-xl bg-[#2a2a2a] px-4 py-3 text-left text-sm hover:bg-[#333] transition flex items-center gap-3"
                      >
                        <span className="text-lg">{cat.emoji}</span>
                        <div className="flex-1">
                          <div className="font-medium">{cat.label}</div>
                          <div className="text-xs text-gray-400">{cat.description}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </>
            ) : (
              <>
                {/* Form Header */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={handleBack}
                    className="text-gray-400 hover:text-gray-200 transition text-sm"
                  >
                    ← Retour
                  </button>
                  <span className="text-lg">{selectedCategory?.emoji}</span>
                  <span className="text-sm font-medium">{selectedCategory?.label}</span>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Sujet</label>
                    <Input
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Résumé de votre demande"
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:bg-[#333] focus:border-gray-500 h-10"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-2 block">Description</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Décrivez votre problème en détail..."
                      rows={4}
                      required
                      className="bg-[#2a2a2a] border-[#3a3a3a] text-white placeholder:text-gray-500 focus:bg-[#333] focus:border-gray-500 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="rounded-xl bg-primary px-4 py-3 text-sm font-medium hover:bg-primary/90 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        Envoyer le message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating white orb */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-14 w-14 rounded-full bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300",
          "hover:shadow-[0_8px_40px_rgba(0,0,0,0.16)] hover:scale-110",
          isOpen && "scale-95"
        )}
        aria-label={isOpen ? "Fermer le support" : "Ouvrir le support"}
      >
        <div className="relative h-full w-full flex items-center justify-center">
          {isOpen ? (
            <span className="text-gray-700 text-xl font-light">✕</span>
          ) : (
            <div className="relative h-7 w-7">
              <Image
                src="/logo.svg"
                alt="Support"
                fill
                className="object-contain"
              />
            </div>
          )}
        </div>
      </button>
    </div>
  )
}
