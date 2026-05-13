import { useEffect, useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Download, FileText, Loader2 } from 'lucide-react'
import Breadcrumb from '../components/Breadcrumb'
import Card from '../components/Card'
import { fetchPublicDownloads } from '../services/downloadsService'
import type { DownloadItemDto } from '../types'
import { resolveMediaUrl } from '../utils/media'

const DEFAULT_DOWNLOAD_LANGUAGE = 'Document'

const isDefaultDocumentLanguage = (language?: string) =>
  String(language || '').trim().toLowerCase() === DEFAULT_DOWNLOAD_LANGUAGE.toLowerCase() ||
  String(language || '').trim().toLowerCase() === 'default document'

const getDisplayLanguage = (language?: string) => {
  if (isDefaultDocumentLanguage(language)) {
    return DEFAULT_DOWNLOAD_LANGUAGE
  }

  return String(language || '').trim() || DEFAULT_DOWNLOAD_LANGUAGE
}

type CategoryGroup = {
  category: string
  titles: Array<{
    title: string
    items: DownloadItemDto[]
  }>
}

const getDownloadId = (item: DownloadItemDto) => item.id || item._id || ''

const groupDownloads = (items: DownloadItemDto[]): CategoryGroup[] => {
  const categoryMap = new Map<string, Map<string, DownloadItemDto[]>>()

  items.forEach((item) => {
    const category = item.category?.trim() || 'Uncategorized'
    const title = item.title?.trim() || 'Untitled'
    const titleMap = categoryMap.get(category) || new Map<string, DownloadItemDto[]>()
    const list = titleMap.get(title) || []
    list.push(item)
    titleMap.set(title, list)
    categoryMap.set(category, titleMap)
  })

  return Array.from(categoryMap.entries())
    .map(([category, titleMap]) => ({
      category,
      titles: Array.from(titleMap.entries()).map(([title, titleItems]) => ({
          title,
          items: [...titleItems].sort((a, b) => String(a.language || '').localeCompare(String(b.language || ''))),
      })),
    }))
}

export default function DownloadCentrePage() {
  const [downloads, setDownloads] = useState<DownloadItemDto[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedCategory, setExpandedCategory] = useState('')

  useEffect(() => {
    const loadDownloads = async () => {
      try {
        setLoading(true)
        const data = await fetchPublicDownloads()
        setDownloads(data)
      } catch (error) {
        console.error('Failed to load downloads:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDownloads()
  }, [])

  const orderedDownloads = useMemo(
    () => [...downloads].sort((a, b) => Number(a.displayOrder || 0) - Number(b.displayOrder || 0)),
    [downloads]
  )

  const categoryGroups = useMemo(() => groupDownloads(orderedDownloads), [orderedDownloads])

  return (
    <div className="min-h-screen bg-base">
      <div className="relative overflow-hidden bg-gradient-to-br from-secondary via-primary to-secondary text-white">
        <div className="absolute inset-0 bg-[url('/images/nso-logo.jpeg')] bg-cover bg-center opacity-5" />
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/90 via-primary/80 to-secondary/90" />
        <div className="relative mx-auto flex min-h-[260px] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:px-8">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-white/90 backdrop-blur-sm">
            <Download className="h-4 w-4" />
            Download Centre
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight md:text-5xl">Application forms and PDF resources by category</h1>
          <p className="mt-4 max-w-2xl text-sm text-white/80 md:text-base">
            Browse downloadable forms and documents grouped the same way they are maintained in the admin dashboard.
          </p>
          <Breadcrumb items={[{ label: 'Downloads' }]} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : categoryGroups.length === 0 ? (
          <Card className="border-dashed border-border bg-white text-center">
            <div className="py-16">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="text-lg font-bold text-secondary">No downloads available yet</h2>
              <p className="mt-2 text-sm text-gray-500">Documents added in the admin panel will appear here automatically.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {categoryGroups.map((group) => {
              const isOpen = expandedCategory === group.category

              return (
                <Card key={group.category} className={`overflow-hidden border-border/70 transition-shadow ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}>
                  <button
                    type="button"
                    onClick={() => setExpandedCategory((prev) => (prev === group.category ? '' : group.category))}
                    className="flex w-full items-center justify-between gap-4 border-b border-border/70 bg-gradient-to-r from-primary/5 to-accent/5 px-5 py-4 text-left"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">Category</p>
                      <h2 className="mt-1 text-xl font-extrabold text-secondary">{group.category}</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                        {group.titles.length} title{group.titles.length === 1 ? '' : 's'}
                      </span>
                      {isOpen ? <ChevronDown className="h-5 w-5 text-primary" /> : <ChevronRight className="h-5 w-5 text-primary" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="divide-y divide-border/70 bg-white">
                      {group.titles.map((titleGroup) => (
                        <div key={`${group.category}-${titleGroup.title}`} className="px-5 py-4 sm:px-6">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="min-w-0">
                              <h3 className="text-base font-bold text-secondary">{titleGroup.title}</h3>
                              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-400">
                                {titleGroup.items.length} {titleGroup.items.every((item) => isDefaultDocumentLanguage(item.language)) ? 'document' : 'language'}{titleGroup.items.length === 1 ? '' : 's'} available
                              </p>
                            </div>

                            <div className="flex flex-nowrap gap-2 overflow-x-auto">
                              {titleGroup.items.map((item) => {
                                const id = getDownloadId(item)
                                return (
                                  <a
                                    key={id || `${titleGroup.title}-${item.language}`}
                                    href={resolveMediaUrl(item.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary transition hover:border-primary/25 hover:bg-primary/10"
                                  >
                                    <Download className="h-4 w-4" />
                                    {getDisplayLanguage(item.language)}
                                  </a>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}