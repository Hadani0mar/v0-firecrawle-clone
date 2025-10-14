import { Globe, Search, MessageSquare, MapPin } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm text-muted-foreground">
            <Globe className="h-4 w-4" />
            <span>مدعوم بالذكاء الاصطناعي</span>
          </div>

          <h1 className="text-balance text-5xl font-bold tracking-tight text-foreground sm:text-7xl">
            استخراج البيانات <span className="text-accent">بذكاء اصطناعي</span>
          </h1>

          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl">
            زحف المواقع، البحث الذكي، استكشاف Reddit، وزحف خرائط Google - كل ذلك بواجهة واحدة مدعومة بالذكاء الاصطناعي
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Globe className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">زحف المواقع</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <Search className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">البحث الذكي</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <MessageSquare className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">بحث Reddit</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
              <MapPin className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">خرائط Google</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
