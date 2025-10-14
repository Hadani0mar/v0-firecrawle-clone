"use client"

import type React from "react"

import { useState } from "react"
import {
  type Link2,
  Globe,
  Search,
  ArrowRight,
  Loader2,
  MessageSquare,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Copy,
  Check,
  MapPin,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"
import { Gauge } from "@/components/ui/gauge"

type ServiceType = "crawl" | "search" | "reddit" | "maps" | "maps_advanced"

interface Service {
  id: ServiceType
  title: string
  description: string
  icon: typeof Link2
  jobTemplate?: string
  inputType: "url" | "text" | "custom"
  inputLabel: string
  inputPlaceholder: string
  tools: string[]
}

const services: Service[] = [
  {
    id: "crawl",
    title: "زحف الموقع",
    description: "استخرج المحتوى والبيانات من أي موقع إلكتروني بالكامل",
    icon: Globe,
    jobTemplate: "قم بزحف الموقع {url} واستخرج كل محتوياته بشكل منظم ومفصل",
    inputType: "url",
    inputLabel: "رابط الموقع",
    inputPlaceholder: "https://example.com",
    tools: ["أداة الزحف", "معالج المحتوى", "منظم البيانات"],
  },
  {
    id: "search",
    title: "البحث الذكي",
    description: "ابحث واعثر على معلومات محددة باستخدام محركات البحث المتعددة",
    icon: Search,
    jobTemplate: "ابحث عن '{query}' باستخدام أدوات البحث المتاحة وقدم نتائج شاملة ومفصلة",
    inputType: "text",
    inputLabel: "ما الذي تريد البحث عنه؟",
    inputPlaceholder: "أدخل استفسارك هنا...",
    tools: ["محرك البحث", "ويكيبيديا", "Reddit"],
  },
  {
    id: "reddit",
    title: "بحث Reddit",
    description: "ابحث في Reddit عن أفضل المنشورات والنقاشات المتعلقة باستفسارك",
    icon: MessageSquare,
    jobTemplate:
      "ابحث في Reddit عن '{query}'. قم بتحليل الطلب وحدد أنسب subreddit وأنسب كلمة مفتاحية للبحث. أعد المنشور صاحب أعلى الأصوات مع ملخص مختصر للردود.",
    inputType: "text",
    inputLabel: "ما الذي تريد البحث عنه في Reddit؟",
    inputPlaceholder: "مثال: أفضل نصائح البرمجة للمبتدئين",
    tools: ["محلل الطلب", "باحث Reddit", "مرتب النتائج"],
  },
  {
    id: "maps",
    title: "زحف خرائط Google",
    description: "استخرج بيانات الأماكن والمطاعم والشركات من خرائط Google",
    icon: MapPin,
    inputType: "custom",
    inputLabel: "إعدادات البحث",
    inputPlaceholder: "",
    tools: ["يتم الإرسال للـ API", "الـ AI يحلل البيانات", "الـ AI ينسق البيانات"],
  },
  {
    id: "maps_advanced",
    title: "الوضع المتقدم للخرائط",
    description: "أدخل طلبك بصيغة طبيعية وتمتع بتنسيق Markdown",
    icon: MapPin,
    inputType: "text",
    inputLabel: "وصف طلب الخرائط",
    inputPlaceholder: "مثال: نبي افضل صيدليات في سبها من حيث التقييم",
    tools: ["إرسال الرسالة", "تحليل الطلب", "تجهيز النتائج"],
  },
]

interface ToolExecution {
  name: string
  status: "pending" | "active" | "completed"
  data?: string
  progress?: number
  collapsed?: boolean
}

interface MapsFormData {
  locationQuery: string
  searchStringsArray: string
  maxCrawledPlacesPerSearch: number
  language: string
  scrapeReviewsPersonalData: boolean
  maxReviews: number
}

export function Services() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([])
  const [showToolDetails, setShowToolDetails] = useState(false)
  const [isResultCollapsed, setIsResultCollapsed] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [mapsFormData, setMapsFormData] = useState<MapsFormData>({
    locationQuery: "",
    searchStringsArray: "",
    maxCrawledPlacesPerSearch: 10,
    language: "ar",
    scrapeReviewsPersonalData: true,
    maxReviews: 5,
  })
  const [requestStartTime, setRequestStartTime] = useState<number | null>(null)
  const [requestDuration, setRequestDuration] = useState<string>("")

  const { toast } = useToast()

  const handleCopyResult = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result)
      setIsCopied(true)
      toast({
        title: "تم النسخ!",
        description: "تم نسخ المحتوى إلى الحافظة",
      })
      setTimeout(() => setIsCopied(false), 2000)
    } catch (error) {
      toast({
        title: "خطأ",
        description: "فشل نسخ المحتوى",
        variant: "destructive",
      })
    }
  }

  const handleMapsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!mapsFormData.locationQuery || !mapsFormData.searchStringsArray) {
      toast({
        title: "معلومات ناقصة",
        description: "الرجاء إدخال الموقع وكلمات البحث",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)
    setShowToolDetails(false)
    setIsResultCollapsed(false)
    setIsCopied(false)
    const startTime = Date.now()
    setRequestStartTime(startTime)

    try {
      const initialTools: ToolExecution[] = [
        {
          name: "يتم الإرسال للـ API",
          status: "active",
          data: `الموقع: ${mapsFormData.locationQuery} | البحث: ${mapsFormData.searchStringsArray}`,
          progress: 0,
          collapsed: false,
        },
        { name: "الـ AI يحلل البيانات", status: "pending", progress: 0, collapsed: false },
        { name: "الـ AI ينسق البيانات", status: "pending", progress: 0, collapsed: false },
      ]
      setToolExecutions(initialTools)

      console.log("[v0] Starting Google Maps crawl with data:", mapsFormData)

      const progressInterval1 = setInterval(() => {
        setToolExecutions((prev) =>
          prev.map((tool, idx) =>
            idx === 0 && tool.status === "active" && (tool.progress || 0) < 90
              ? { ...tool, progress: Math.min((tool.progress || 0) + 10, 90) }
              : tool,
          ),
        )
      }, 100)

      // Step 1: Start Apify crawl
      const apifyPayload = {
        includeWebResults: false,
        language: mapsFormData.language,
        locationQuery: mapsFormData.locationQuery,
        maxCrawledPlacesPerSearch: mapsFormData.maxCrawledPlacesPerSearch,
        maxImages: 0,
        maximumLeadsEnrichmentRecords: 0,
        scrapeContacts: false,
        scrapeDirectories: false,
        scrapeImageAuthors: false,
        scrapePlaceDetailPage: false,
        scrapeReviewsPersonalData: mapsFormData.scrapeReviewsPersonalData,
        scrapeTableReservationProvider: false,
        searchStringsArray: mapsFormData.searchStringsArray.split(",").map((s) => s.trim()),
        skipClosedPlaces: false,
        searchMatching: "all",
        placeMinimumStars: "",
        website: "allPlaces",
        maxQuestions: 0,
        maxReviews: mapsFormData.maxReviews,
        reviewsSort: "newest",
        reviewsFilterString: "",
        reviewsOrigin: "all",
        allPlacesNoSearchAction: "",
      }

      console.log("[v0] Sending payload to Apify:", apifyPayload)

      const startResponse = await fetch(
        "https://api.apify.com/v2/acts/compass~crawler-google-places/runs?token=apify_api_MBfZuv3sLBZBg9rXezkMbcDg8D16Dt1aQk9q",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apifyPayload),
        },
      )

      console.log("[v0] Start response status:", startResponse.status)

      if (!startResponse.ok) {
        const errorText = await startResponse.text()
        console.error("[v0] Failed to start crawl:", errorText)
        clearInterval(progressInterval1)
        throw new Error(`Failed to start crawl: ${startResponse.status}`)
      }

      const startData = await startResponse.json()
      console.log("[v0] Start response data:", startData)

      const runId = startData.data.id
      console.log("[v0] Run ID:", runId)

      clearInterval(progressInterval1)
      setToolExecutions((prev) =>
        prev.map((tool, idx) =>
          idx === 0
            ? {
                ...tool,
                status: "completed",
                progress: 100,
                collapsed: true,
                data: `الموقع: ${mapsFormData.locationQuery} | البحث: ${mapsFormData.searchStringsArray} | عدد النتائج: ${mapsFormData.maxCrawledPlacesPerSearch}`,
              }
            : idx === 1
              ? { ...tool, status: "active", progress: 0 }
              : tool,
        ),
      )

      const progressInterval2 = setInterval(() => {
        setToolExecutions((prev) =>
          prev.map((tool, idx) =>
            idx === 1 && tool.status === "active" && (tool.progress || 0) < 100
              ? { ...tool, progress: Math.min((tool.progress || 0) + 100 / 290, 100) }
              : tool,
          ),
        )
      }, 100)

      // Step 2: Wait 29 seconds
      console.log("[v0] Waiting 29 seconds for crawl to complete...")
      await new Promise((resolve) => setTimeout(resolve, 29000))

      clearInterval(progressInterval2)
      setToolExecutions((prev) =>
        prev.map((tool, idx) =>
          idx === 1
            ? { ...tool, status: "completed", progress: 100, collapsed: true }
            : idx === 2
              ? { ...tool, status: "active", progress: 0 }
              : tool,
        ),
      )

      const progressInterval3 = setInterval(() => {
        setToolExecutions((prev) =>
          prev.map((tool, idx) =>
            idx === 2 && tool.status === "active" && (tool.progress || 0) < 90
              ? { ...tool, progress: Math.min((tool.progress || 0) + 10, 90) }
              : tool,
          ),
        )
      }, 100)

      // Step 3: Get results
      const resultsUrl = `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=apify_api_MBfZuv3sLBZBg9rXezkMbcDg8D16Dt1aQk9q`
      console.log("[v0] Fetching results from:", resultsUrl)

      const resultsResponse = await fetch(resultsUrl)

      console.log("[v0] Results response status:", resultsResponse.status)

      if (!resultsResponse.ok) {
        const errorText = await resultsResponse.text()
        console.error("[v0] Failed to get results:", errorText)
        clearInterval(progressInterval3)
        throw new Error(`Failed to get results: ${resultsResponse.status}`)
      }

      const resultsData = await resultsResponse.json()
      console.log("[v0] Results data:", resultsData)
      console.log("[v0] Number of results:", resultsData.length)

      const endTime = Date.now()
      const durationMs = endTime - startTime
      const durationSeconds = (durationMs / 1000).toFixed(1)
      setRequestDuration(`${durationSeconds} ثانية`)

      // Format results as markdown
      let markdown = `# نتائج البحث في خرائط Google
`
      markdown += `**الموقع:** ${mapsFormData.locationQuery}
`
      markdown += `**البحث عن:** ${mapsFormData.searchStringsArray}
`
      markdown += `**عدد النتائج:** ${resultsData.length}
`
      markdown += `**مدة الطلب:** ${durationSeconds} ثانية
---
`

      resultsData.forEach((place: any, index: number) => {
        markdown += `## ${index + 1}. ${place.title || "بدون اسم"}
`
        if (place.address) markdown += `**العنوان:** ${place.address}
`
        if (place.rating) markdown += `**التقييم:** ${place.rating} ⭐ (${place.reviewsCount || 0} تقييم)
`
        if (place.phone) markdown += `**الهاتف:** ${place.phone}
`
        if (place.website) markdown += `**الموقع:** [${place.website}](${place.website})
`
        if (place.categoryName) markdown += `**الفئة:** ${place.categoryName}
`
        if (place.url) markdown += `**رابط الخريطة:** [عرض على الخريطة](${place.url})
`
        markdown += `---
`
      })

      setResult(markdown)

      clearInterval(progressInterval3)
      setToolExecutions((prev) =>
        prev.map((tool, idx) =>
          idx === 2
            ? {
                ...tool,
                status: "completed",
                progress: 100,
                collapsed: true,
                data: `تم معالجة ${resultsData.length} نتيجة | المدة: ${durationSeconds} ثانية`,
              }
            : { ...tool, status: "completed" },
        ),
      )

      toast({
        title: "نجح!",
        description: `تم العثور على ${resultsData.length} نتيجة في ${durationSeconds} ثانية`,
      })
    } catch (error) {
      console.error("[v0] Error processing Google Maps request:", error)
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "فشلت معالجة طلبك. الرجاء المحاولة مرة أخرى.",
        variant: "destructive",
      })
      setToolExecutions([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedService === "maps") {
      return handleMapsSubmit(e)
    }

    if (!selectedService || !inputValue) {
      toast({
        title: "معلومات ناقصة",
        description: "الرجاء اختيار خدمة وإدخال البيانات المطلوبة",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setResult(null)
    setShowToolDetails(false)
    setIsResultCollapsed(false)
    setIsCopied(false)

    try {
      const service = services.find((s) => s.id === selectedService)
      if (!service) return

      const initialTools: ToolExecution[] = service.tools.map((tool) => ({
        name: tool,
        status: "active",
        data: service.inputType === "url" ? inputValue : `استعلام: ${inputValue}`,
        progress: undefined,
        collapsed: undefined,
      }))
      setToolExecutions(initialTools)

      // Decide payload & webhook based on service
      let webhookUrl = "https://n8n.m0usa.ly/webhook/bb038626-0fa0-48cf-8568-c5345088472e"
      let payload: Record<string, unknown>

      if (selectedService === "maps_advanced") {
        // Advanced maps: conversational style, send user's message to provided webhook
        webhookUrl = "https://n8n.m0usa.ly:5678/webhook/14eeec20-52e2-4e3f-a8b7-7026697f0c17"
        payload = { message: inputValue }
      } else {
        const job = service.jobTemplate!.replace(service.inputType === "url" ? "{url}" : "{query}", inputValue)
        payload = { job }
      }

      console.log("[v0] Sending request to webhook:", webhookUrl)
      console.log("[v0] Payload:", payload)

      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        mode: "cors", // Explicitly set CORS mode
      }).catch((fetchError) => {
        console.error("[v0] Fetch error details:", fetchError)
        throw new Error(`فشل الاتصال بالخادم: ${fetchError.message}. تأكد من أن الويبهوك يعمل ويسمح بطلبات CORS`)
      })

      console.log("[v0] Response status:", response.status)
      console.log("[v0] Response headers:", Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error("[v0] Response error:", errorText)
        throw new Error(`خطأ من الخادم (${response.status}): ${errorText}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let streamedText = ""
      let buffer = ""

      if (reader) {
        console.log("[v0] Starting to read stream...")
        while (true) {
          const { done, value } = await reader.read()

          if (done) {
            console.log("[v0] Stream complete")
            break
          }

          const chunk = decoder.decode(value, { stream: true })
          buffer += chunk

          // FIXED: correct split for lines
          const lines = buffer.split("\n")
          buffer = lines.pop() || ""

          for (const line of lines) {
            if (line.trim()) {
              try {
                const jsonObj = JSON.parse(line)

                if (jsonObj.type === "item" && jsonObj.content) {
                  streamedText += jsonObj.content
                  setResult(streamedText)
                }
              } catch (e) {
                console.error("[v0] Failed to parse JSON line:", line, e)
              }
            }
          }
        }

        if (buffer.trim()) {
          try {
            const jsonObj = JSON.parse(buffer)
            if (jsonObj.type === "item" && jsonObj.content) {
              streamedText += jsonObj.content
              setResult(streamedText)
            }
          } catch (e) {
            console.error("[v0] Failed to parse final buffer:", buffer, e)
          }
        }
      }
      setToolExecutions((prev) => prev.map((tool) => ({ ...tool, status: "completed" })))
    } catch (error) {
      console.error("[v0] Error processing request:", error)
      toast({
        title: "خطأ في الاتصال",
        description:
          error instanceof Error ? error.message : "فشل الاتصال بالخادم. تأكد من أن الويبهوك يعمل بشكل صحيح.",
        variant: "destructive",
      })
      setToolExecutions([])
    } finally {
      setLoading(false)
    }
  }

  const currentService = selectedService ? services.find((s) => s.id === selectedService) : null

  const toggleToolCollapse = (index: number) => {
    setToolExecutions((prev) =>
      prev.map((tool, idx) => (idx === index ? { ...tool, collapsed: !tool.collapsed } : tool)),
    )
  }

  return (
    <section className="mx-auto max-w-7xl px-6 py-24 lg:px-8">
      <div className="text-center">
        <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">اختر خدمتك</h2>
        <p className="mt-4 text-pretty text-lg text-muted-foreground">حدد نوع استخراج البيانات الذي تحتاجه</p>
      </div>

      <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => {
          const Icon = service.icon
          const isSelected = selectedService === service.id

          return (
            <Card
              key={service.id}
              className={`group relative cursor-pointer overflow-hidden border-2 p-6 transition-all duration-300 hover:scale-[1.02] ${
                isSelected
                  ? "border-accent bg-accent/10 shadow-lg shadow-accent/20"
                  : "border-border hover:border-accent/50 hover:shadow-md"
              }`}
              onClick={() => {
                setSelectedService(service.id)
                setInputValue("")
                setResult(null)
                setToolExecutions([])
              }}
            >
              <div className="relative flex items-start gap-4">
                <div
                  className={`rounded-xl p-3 transition-all duration-300 ${
                    isSelected ? "bg-accent/20 shadow-md shadow-accent/20" : "bg-secondary group-hover:bg-accent/10"
                  }`}
                >
                  <Icon
                    className={`h-6 w-6 transition-colors duration-300 ${
                      isSelected ? "text-accent" : "text-foreground group-hover:text-accent"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.description}</p>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {selectedService && currentService && (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <Card className="border-border p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-6">
              {selectedService === "maps" ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="locationQuery" className="block text-sm font-medium text-foreground">
                      الموقع الجغرافي
                    </label>
                    <Input
                      id="locationQuery"
                      type="text"
                      placeholder="مثال: الرياض, السعودية"
                      value={mapsFormData.locationQuery}
                      onChange={(e) => setMapsFormData({ ...mapsFormData, locationQuery: e.target.value })}
                      className="mt-2 bg-secondary"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label htmlFor="searchStringsArray" className="block text-sm font-medium text-foreground">
                      كلمات البحث (افصل بفاصلة)
                    </label>
                    <Input
                      id="searchStringsArray"
                      type="text"
                      placeholder="مثال: مطعم, كافيه, مخبز"
                      value={mapsFormData.searchStringsArray}
                      onChange={(e) => setMapsFormData({ ...mapsFormData, searchStringsArray: e.target.value })}
                      className="mt-2 bg-secondary"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="maxCrawledPlacesPerSearch" className="block text-sm font-medium text-foreground">
                        عدد النتائج
                      </label>
                      <Input
                        id="maxCrawledPlacesPerSearch"
                        type="number"
                        min="1"
                        max="100"
                        value={mapsFormData.maxCrawledPlacesPerSearch}
                        onChange={(e) => {
                          const value = Number.parseInt(e.target.value)
                          setMapsFormData({
                            ...mapsFormData,
                            maxCrawledPlacesPerSearch: isNaN(value) ? 1 : value,
                          })
                        }}
                        className="mt-2 bg-secondary"
                        disabled={loading}
                      />
                    </div>

                    <div>
                      <label htmlFor="language" className="block text-sm font-medium text-foreground">
                        اللغة
                      </label>
                      <select
                        id="language"
                        value={mapsFormData.language}
                        onChange={(e) => setMapsFormData({ ...mapsFormData, language: e.target.value })}
                        className="mt-2 w-full rounded-md border border-input bg-secondary px-3 py-2 text-foreground"
                        disabled={loading}
                      >
                        <option value="ar">العربية</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="maxReviews" className="block text-sm font-medium text-foreground">
                      عدد التقييمات لكل مكان
                    </label>
                    <Input
                      id="maxReviews"
                      type="number"
                      min="0"
                      max="50"
                      value={mapsFormData.maxReviews}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value)
                        setMapsFormData({ ...mapsFormData, maxReviews: isNaN(value) ? 0 : value })
                      }}
                      className="mt-2 bg-secondary"
                      disabled={loading}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-accent text-accent-foreground transition-all duration-200 hover:bg-accent/90 hover:shadow-md"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        جاري الزحف... (قد يستغرق 30 ثانية)
                      </>
                    ) : (
                      <>
                        ابدأ الزحف
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  <label htmlFor="input" className="block text-sm font-medium text-foreground">
                    {currentService.inputLabel}
                  </label>
                  <div className="mt-2 flex gap-3">
                    <Input
                      id="input"
                      type={currentService.inputType === "url" ? "url" : "text"}
                      placeholder={currentService.inputPlaceholder}
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="flex-1 bg-secondary transition-all duration-200 focus:ring-2 focus:ring-accent"
                      required
                      disabled={loading}
                    />
                    <Button
                      type="submit"
                      disabled={loading}
                      className="bg-accent text-accent-foreground transition-all duration-200 hover:bg-accent/90 hover:shadow-md"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري المعالجة
                        </>
                      ) : (
                        <>
                          ابدأ
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {toolExecutions.length > 0 && (
                <div className="space-y-4 slide-up">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                    <label className="text-sm font-medium text-foreground">الأدوات المستخدمة</label>
                  </div>
                  <div className="space-y-3">
                    {toolExecutions.map((tool, index) => (
                      <div
                        key={index}
                        style={{ animationDelay: `${index * 100}ms` }}
                        className={`slide-up rounded-lg border transition-all duration-500 ${
                          tool.status === "active"
                            ? "shimmer pulse-glow border-accent/50 bg-gradient-to-r from-secondary via-accent/10 to-secondary shadow-lg"
                            : tool.status === "completed"
                              ? "border-green-500/50 bg-green-500/5 shadow-md"
                              : "border-border bg-secondary/30"
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          <div className="flex-shrink-0">
                            {tool.status === "active" && (
                              <div className="relative">
                                <Loader2 className="h-5 w-5 animate-spin text-accent" />
                                <div className="absolute inset-0 h-5 w-5 animate-ping rounded-full bg-accent/20" />
                              </div>
                            )}
                            {tool.status === "completed" && (
                              <div className="animate-in zoom-in duration-300">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              </div>
                            )}
                            {tool.status === "pending" && (
                              <div className="h-5 w-5 rounded-full border-2 border-border animate-pulse" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium transition-colors duration-300 ${
                                tool.status === "active"
                                  ? "text-accent"
                                  : tool.status === "completed"
                                    ? "text-green-500"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {tool.name}
                            </p>
                            {tool.data && !tool.collapsed && (
                              <p className="mt-1 text-sm text-muted-foreground truncate">{tool.data}</p>
                            )}
                          </div>

                          {(tool.status === "active" || tool.status === "completed") && selectedService === "maps" && (
                            <div className="flex-shrink-0">
                              <Gauge
                                value={tool.progress || 0}
                                size={50}
                                strokeWidth={6}
                                showValue={true}
                                primary={tool.status === "completed" ? "success" : "info"}
                                className={{
                                  textClassName: "text-xs",
                                }}
                              />
                            </div>
                          )}

                          {tool.status === "completed" && (
                            <button
                              type="button"
                              onClick={() => toggleToolCollapse(index)}
                              className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-secondary"
                            >
                              <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform duration-300 ${
                                  tool.collapsed ? "rotate-180" : ""
                                }`}
                              />
                            </button>
                          )}
                        </div>

                        {!tool.collapsed && tool.data && (
                          <div className="border-t border-border/50 px-4 pb-4 pt-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <p className="text-sm text-muted-foreground">{tool.data}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result && toolExecutions.every((t) => t.status === "completed") && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <button
                    type="button"
                    onClick={() => setShowToolDetails(!showToolDetails)}
                    className="flex w-full items-center justify-between rounded-lg border border-border bg-secondary p-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-secondary/70"
                  >
                    <span>تفاصيل الأدوات المستخدمة</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-300 ${showToolDetails ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showToolDetails && (
                    <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      {toolExecutions.map((tool, index) => (
                        <div key={index} className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <p className="font-medium text-foreground">{tool.name}</p>
                          </div>
                          {tool.data && (
                            <p className="mt-2 text-sm text-muted-foreground">
                              <span className="font-medium">البيانات المرسلة:</span> {tool.data}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-sm font-medium text-foreground">النتائج</label>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyResult}
                        className="h-8 gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {isCopied ? (
                          <>
                            <Check className="h-4 w-4 text-green-500" />
                            <span className="text-xs">تم النسخ</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            <span className="text-xs">نسخ</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsResultCollapsed(!isResultCollapsed)}
                        className="h-8 gap-2 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${isResultCollapsed ? "rotate-180" : ""}`}
                        />
                        <span className="text-xs">{isResultCollapsed ? "توسيع" : "طي"}</span>
                      </Button>
                    </div>
                  </div>

                  {!isResultCollapsed && (
                    <div className="overflow-auto rounded-lg border border-border bg-secondary/50 p-6 shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="markdown-content">
                        <ReactMarkdown
                          components={{
                            h1: ({ children }) => (
                              <h1 className="mb-4 text-2xl font-bold text-foreground">{children}</h1>
                            ),
                            h2: ({ children }) => (
                              <h2 className="mb-3 mt-6 text-xl font-bold text-foreground">{children}</h2>
                            ),
                            h3: ({ children }) => (
                              <h3 className="mb-2 mt-4 text-lg font-semibold text-foreground">{children}</h3>
                            ),
                            p: ({ children }) => <p className="mb-4 leading-relaxed text-foreground">{children}</p>,
                            ul: ({ children }) => (
                              <ul className="mb-4 mr-6 list-disc space-y-2 text-foreground">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="mb-4 mr-6 list-decimal space-y-2 text-foreground">{children}</ol>
                            ),
                            li: ({ children }) => <li className="leading-relaxed text-foreground">{children}</li>,
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                className="text-accent underline transition-colors hover:text-accent/80"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {children}
                              </a>
                            ),
                            code: ({ children, className }) => {
                              const isInline = !className
                              return isInline ? (
                                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-sm text-accent">
                                  {children}
                                </code>
                              ) : (
                                <code className="block overflow-x-auto rounded bg-background p-4 font-mono text-sm text-foreground">
                                  {children}
                                </code>
                              )
                            },
                            pre: ({ children }) => <pre className="mb-4 overflow-x-auto">{children}</pre>,
                            blockquote: ({ children }) => (
                              <blockquote className="mb-4 border-r-4 border-accent pr-4 italic text-muted-foreground">
                                {children}
                              </blockquote>
                            ),
                            strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                            em: ({ children }) => <em className="italic text-foreground">{children}</em>,
                          }}
                        >
                          {result}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </form>
          </Card>
        </div>
      )}
    </section>
  )
    }
