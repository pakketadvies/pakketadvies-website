'use client'

import { MarketingContent } from '@/app/admin/marketing/page'
import { MarketingSquarePreview } from './MarketingSquarePreview'
import { MarketingStoryPreview } from './MarketingStoryPreview'
import { SquaresFour, Rectangle, Download } from '@phosphor-icons/react'
import { useDownloadImage } from './useDownloadImage'

interface MarketingPreviewsProps {
  content: MarketingContent
}

export function MarketingPreviews({ content }: MarketingPreviewsProps) {
  // Download hooks for both formats
  const squareDownload = useDownloadImage({
    width: 1080,
    height: 1080,
    filename: `pakketadvies-post-${Date.now()}.png`,
  })

  const storyDownload = useDownloadImage({
    width: 1080,
    height: 1920,
    filename: `pakketadvies-story-${Date.now()}.png`,
  })

  return (
    <div className="space-y-6">
      {/* Square Preview (1:1) for Posts */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-teal-50 flex items-center justify-center">
              <SquaresFour size={20} className="text-brand-teal-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy-500">Vierkant (1:1) - Voor Posts</h3>
              <p className="text-sm text-gray-500">Perfect voor Facebook & Instagram posts</p>
            </div>
          </div>
          <button
            onClick={squareDownload.downloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-brand-teal-500 text-white rounded-lg font-medium hover:bg-brand-teal-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={18} weight="bold" />
            Download (1080×1080)
          </button>
        </div>
        <div className="flex justify-center">
          <MarketingSquarePreview content={content} previewRef={squareDownload.elementRef} />
        </div>
      </div>

      {/* Story Preview (9:16) */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-purple-50 flex items-center justify-center">
              <Rectangle size={20} className="text-brand-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-navy-500">Langwerpig (9:16) - Voor Stories</h3>
              <p className="text-sm text-gray-500">1080 x 1920px - Perfect voor Instagram & Facebook Stories</p>
            </div>
          </div>
          <button
            onClick={storyDownload.downloadImage}
            className="flex items-center gap-2 px-4 py-2 bg-brand-purple-500 text-white rounded-lg font-medium hover:bg-brand-purple-600 transition-colors shadow-md hover:shadow-lg"
          >
            <Download size={18} weight="bold" />
            Download (1080×1920)
          </button>
        </div>
        <div className="flex justify-center">
          <MarketingStoryPreview content={content} previewRef={storyDownload.elementRef} />
        </div>
      </div>
    </div>
  )
}

