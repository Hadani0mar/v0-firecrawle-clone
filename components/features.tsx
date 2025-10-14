import { Zap, Brain, Database, Clock } from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "ذكاء اصطناعي متقدم",
    description: "معالجة ذكية للبيانات باستخدام نماذج AI حديثة",
  },
  {
    icon: Database,
    title: "بيانات منظمة",
    description: "احصل على نتائج منسقة بصيغة Markdown جاهزة للاستخدام",
  },
  {
    icon: Zap,
    title: "سريع وفعال",
    description: "معالجة فورية مع تتبع مباشر لتقدم العمليات",
  },
  {
    icon: Clock,
    title: "متعدد المصادر",
    description: "زحف المواقع، Google، Wikipedia، Reddit، وخرائط Google",
  },
]

export function Features() {
  return (
    <section className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
        <div className="text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            منصة متكاملة لاستخراج البيانات
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            أدوات قوية مدعومة بالذكاء الاصطناعي لجميع احتياجاتك
          </p>
        </div>

        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <div key={feature.title} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
