import { Hero } from "@/components/hero"
import { Services } from "@/components/services"
import { Features } from "@/components/features"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Services />
      <Features />
    </main>
  )
}
