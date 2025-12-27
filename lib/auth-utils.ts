import bcrypt from "bcryptjs"
import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production-min-32-chars"
)

export interface SessionUser {
  id: string
  email: string
  name: string | null
  userType: string
  role: string
  onboardingCompleted: boolean
}

// Hash un mot de passe
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Vérifie un mot de passe
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Crée un JWT token
export async function createToken(user: SessionUser): Promise<string> {
  const token = await new SignJWT({ user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d") // 7 jours
    .sign(JWT_SECRET)

  return token
}

// Vérifie et decode un JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.user as SessionUser
  } catch (error) {
    return null
  }
}

// Récupère l'utilisateur depuis les cookies
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get("session")?.value

  if (!token) {
    return null
  }

  return verifyToken(token)
}

// Crée une session (set cookie)
export async function createSession(user: SessionUser) {
  const token = await createToken(user)
  const cookieStore = await cookies()

  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
    path: "/",
  })
}

// Supprime la session (delete cookie)
export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete("session")
}
