import { SignupForm } from "@/components/auth/signup-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "הרשמה",
  description: "צור חשבון חדש כדי לשמור ולנהל את המתכונים שלך",
}

export default function SignupPage() {
  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-8">
      <SignupForm />
    </div>
  )
}
