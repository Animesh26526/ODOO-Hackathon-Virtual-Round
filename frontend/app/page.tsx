import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to dashboard on load
  redirect("/dashboard")
}
