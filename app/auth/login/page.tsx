import { LoginForm } from "@/components/auth/login-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "התחברות",
  description: "התחבר לחשבון שלך כדי לנהל את המתכונים",
}

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-8">
      <LoginForm />
    </div>
  )
}
