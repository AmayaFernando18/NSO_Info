import { useState, useEffect } from 'react'
import { FileText, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchPublicNews } from '../services/newsService'
import Card from '../components/Card'
import type { NewsDto } from '../types'
import { resolveMediaUrl } from '../utils/media'

const getCategoryBadgeColor = (category: string) => {
  const colors: Record<string, string> = {
    'Press Release': 'bg-blue-100 text-blue-800',
    'Market Update': 'bg-purple-100 text-purple-800',
    'Announcement': 'bg-indigo-100 text-indigo-800',
    'Achievement': 'bg-green-100 text-green-800',
    'News': 'bg-cyan-100 text-cyan-800',
    'Tender': 'bg-amber-100 text-amber-800',
    'Alert': 'bg-orange-100 text-orange-800',
    'Update': 'bg-pink-100 text-pink-800',
    'Other': 'bg-gray-100 text-gray-800',
  }
  return colors[category] || colors.Other
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsDto[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNews, setSelectedNews] = useState<NewsDto | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const newsData = await fetchPublicNews()
        // Sort by published date descending (latest first)
        const sortedNews = newsData.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        setNews(sortedNews)
      } catch (error) {
        console.error('Failed to load news:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Pagination
  const totalPages = Math.ceil(news.length / itemsPerPage)
  const paginatedNews = news.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary via-accent to-primary py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Latest News & Updates</h1>
              <p className="text-white/80 mt-1">
                Stay informed with the latest news, press releases, and announcements
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* News Count */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-secondary">
            All News ({news.length})
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading news...</p>
          </div>
        ) : news.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No news found.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* News Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {paginatedNews.map((item) => (
                <Card
                  key={item.id || item._id}
                  hover
                  className="flex flex-col overflow-hidden transition-all"
                >
                  {/* Image */}
                  {item.imageUrl && (
                    <div className="relative h-48 overflow-hidden bg-gray-200 rounded-lg mb-4">
                      <img
                        src={resolveMediaUrl(item.imageUrl)}
                        alt={item.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span
                          className={`px-3 py-1 text-xs font-medium rounded-full ${getCategoryBadgeColor(
                            item.category
                          )}`}
                        >
                          {item.category}
                        </span>
                      </div>
                    </div>
                  )}

                  {!item.imageUrl && (
                    <div className="mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full inline-block ${getCategoryBadgeColor(
                          item.category
                        )}`}
                      >
                        {item.category}
                      </span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-semibold text-secondary mb-2 line-clamp-2 hover:text-primary cursor-pointer transition-colors">
                      {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1">
                      {item.summary || item.excerpt || item.content.substring(0, 150)}...
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <span className="text-xs text-gray-500">
                        {new Date(item.publishedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => setSelectedNews(item)}
                        className="text-primary hover:text-accent font-medium text-sm transition-colors"
                      >
                        Read More →
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, idx, arr) => (
                      <div key={page} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-2 text-gray-400">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                            currentPage === page
                              ? 'bg-primary text-white'
                              : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      </div>
                    ))}
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* News Detail Modal */}
      {selectedNews && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedNews(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-accent px-6 py-4 rounded-t-2xl flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-white" />
                  <span className="font-semibold text-white">News Article</span>
                </div>
                <button
                  onClick={() => setSelectedNews(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* Hero Image */}
              {selectedNews.imageUrl && (
                <img
                  src={resolveMediaUrl(selectedNews.imageUrl)}
                  alt={selectedNews.title}
                  className="w-full h-64 object-cover rounded-xl mb-6"
                />
              )}

              {/* Category and Date */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryBadgeColor(
                    selectedNews.category
                  )}`}
                >
                  {selectedNews.category}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(selectedNews.publishedAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {selectedNews.author && (
                  <span className="text-sm text-gray-500">By {selectedNews.author}</span>
                )}
              </div>

              {/* Title */}
              <h2 className="text-2xl font-bold text-secondary mb-4 break-words">{selectedNews.title}</h2>

              {/* Summary */}
              {selectedNews.summary && (
                <p className="text-lg text-gray-600 mb-6 italic border-l-4 border-primary pl-4">
                  {selectedNews.summary}
                </p>
              )}

              {/* Content */}
              <div className="text-gray-700 leading-relaxed mb-6 break-words whitespace-pre-wrap">
                {selectedNews.content}
              </div>

              {/* Excerpt fallback */}
              {selectedNews.excerpt && !selectedNews.content && (
                <p className="text-gray-600 leading-relaxed mb-6 break-words">
                  {selectedNews.excerpt}
                </p>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 border-t border-border px-6 py-4 flex justify-end gap-3 rounded-b-2xl flex-shrink-0">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
