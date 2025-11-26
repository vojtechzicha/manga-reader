interface ImageViewerProps {
  images: string[]
  altText?: string
}

export function ImageViewer({ images, altText = 'Manga page' }: ImageViewerProps) {
  if (images.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        No images available for this chapter
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {images.map((imgSrc, index) => (
        <img
          key={index}
          src={imgSrc}
          alt={`${altText} ${index + 1}`}
          className="max-w-full"
          loading={index > 2 ? 'lazy' : 'eager'}
        />
      ))}
    </div>
  )
}
