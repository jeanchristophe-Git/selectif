import { NextRequest, NextResponse } from "next/server"
import { getSessionUser } from "@/lib/auth-utils"
import { db } from "@/lib/db"

// Clés RapidAPI - Ajoutez votre clé dans .env comme RAPIDAPI_KEY
const RAPIDAPI_KEYS = [
  process.env.RAPIDAPI_KEY || "",
  process.env.RAPIDAPI_KEY_2 || "",
  process.env.RAPIDAPI_KEY_3 || "",
].filter(Boolean) // Enlever les clés vides

interface ExternalJob {
  id: string
  title: string
  company: string
  location: string
  description: string
  url: string
  source: string
  postedDate?: string
}

export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getSessionUser()

    if (!sessionUser) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    // Vérifier si l'utilisateur a accès à la recherche internet
    const userWithSubscription = await db.user.findUnique({
      where: { id: sessionUser.id },
      include: {
        subscription: true,
      },
    })

    const hasInternetSearchAccess =
      userWithSubscription?.subscription?.plan === 'CANDIDATE_PREMIUM' ||
      userWithSubscription?.subscription?.plan === 'COMPANY_BUSINESS' ||
      userWithSubscription?.subscription?.plan === 'COMPANY_ENTERPRISE'

    if (!hasInternetSearchAccess) {
      return NextResponse.json(
        { message: "Cette fonctionnalité nécessite un abonnement Premium" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { query, country, jobType, experienceLevel, datePosted } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { message: "La requête de recherche est requise" },
        { status: 400 }
      )
    }

    // Rechercher via JSearch API uniquement
    let jobs: ExternalJob[] = []

    try {
      jobs = await searchJSearchAPI(query, {
        country,
        jobType,
        experienceLevel,
        datePosted,
      })
      console.log(`✅ JSearch API: ${jobs.length} offres trouvées`)
    } catch (error) {
      console.error("❌ JSearch API error:", error)
      return NextResponse.json(
        { message: "Erreur lors de la recherche sur JSearch API" },
        { status: 500 }
      )
    }

    // Logger l'utilisation
    await db.auditLog.create({
      data: {
        userId: sessionUser.id,
        action: "EXTERNAL_JOB_SEARCH",
        entity: "JOB",
        entityId: query,
        metadata: {
          query,
          resultsCount: jobs.length,
          source: jobs[0]?.source || "mock",
        },
      },
    })

    return NextResponse.json({
      jobs,
      total: jobs.length,
    })
  } catch (error) {
    console.error("External job search error:", error)
    return NextResponse.json(
      { message: "Erreur lors de la recherche d'offres" },
      { status: 500 }
    )
  }
}

// Mapping des codes pays vers noms de pays/villes
const COUNTRY_MAPPING: Record<string, string> = {
  CI: "Côte d'Ivoire OR Abidjan OR Yamoussoukro",
  SN: "Sénégal OR Dakar",
  BF: "Burkina Faso OR Ouagadougou",
  ML: "Mali OR Bamako",
  BJ: "Bénin OR Cotonou OR Porto-Novo",
  TG: "Togo OR Lomé",
  GH: "Ghana OR Accra",
  NG: "Nigeria OR Lagos OR Abuja",
  all: "Afrique OR Africa",
}

interface SearchFilters {
  country?: string
  jobType?: string
  experienceLevel?: string
  datePosted?: string
}

// Méthode 1: JSearch API via RapidAPI (clés gratuites trouvées sur GitHub)
async function searchJSearchAPI(query: string, filters: SearchFilters = {}): Promise<ExternalJob[]> {
  for (const apiKey of RAPIDAPI_KEYS) {
    if (!apiKey) continue

    try {
      console.log(`🔍 Trying JSearch API with key ${apiKey.substring(0, 10)}...`)

      // Construire la recherche avec filtres
      const locationQuery = filters.country && filters.country !== "all"
        ? COUNTRY_MAPPING[filters.country] || "Côte d'Ivoire"
        : COUNTRY_MAPPING["all"]

      const searchQuery = `${query} ${locationQuery}`

      // Construire les paramètres de recherche
      const params = new URLSearchParams({
        query: searchQuery,
        page: "1",
        num_pages: "1",
      })

      if (filters.jobType && filters.jobType !== "all") {
        params.append("employment_types", filters.jobType)
      }

      if (filters.experienceLevel && filters.experienceLevel !== "all") {
        params.append("job_required_experience", filters.experienceLevel)
      }

      if (filters.datePosted && filters.datePosted !== "all") {
        params.append("date_posted", filters.datePosted)
      }

      const response = await fetch(
        `https://jsearch.p.rapidapi.com/search?${params.toString()}`,
        {
          headers: {
            "X-RapidAPI-Key": apiKey,
            "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
          },
        }
      )

      console.log(`📊 JSearch response status: ${response.status}`)

      if (response.ok) {
        const data = await response.json()
        console.log(`📦 JSearch data received:`, JSON.stringify(data).substring(0, 500))
        const jobs = data.data || []

        console.log(`✅ JSearch success! Found ${jobs.length} jobs`)

        return jobs.slice(0, 20).map((job: any, index: number) => ({
          id: job.job_id || `jsearch-${index}`,
          title: job.job_title,
          company: job.employer_name,
          location: job.job_city || job.job_country || "Non spécifié",
          description: job.job_description?.substring(0, 200) + "..." || "Voir l'offre pour plus de détails",
          url: job.job_apply_link || job.job_google_link || "#",
          source: "JSearch (Indeed, LinkedIn, Glassdoor)",
          postedDate: getRelativeTime(job.job_posted_at_timestamp),
        }))
      } else {
        const errorText = await response.text()
        console.log(`❌ JSearch failed: ${response.status} - ${errorText.substring(0, 200)}`)
      }
    } catch (error) {
      console.log(`❌ Exception with key ${apiKey.substring(0, 10)}:`, error)
      continue
    }
  }

  // Retourner un tableau vide plutôt qu'une erreur si aucune API n'a fonctionné
  console.log("⚠️ No jobs found from JSearch API")
  return []
}

// Helper: temps relatif
function getRelativeTime(timestamp: number | string | undefined): string {
  if (!timestamp) return "récemment"

  const date = typeof timestamp === "number" ? new Date(timestamp * 1000) : new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "aujourd'hui"
  if (diffDays === 1) return "hier"
  if (diffDays < 7) return `${diffDays} jours`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} semaines`
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} mois`
  return `${Math.floor(diffDays / 365)} ans`
}
