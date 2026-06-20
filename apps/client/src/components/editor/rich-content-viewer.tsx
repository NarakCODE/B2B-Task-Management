type RichContentViewerProps = {
  content: string
  className?: string
}

export default function RichContentViewer({ content, className }: RichContentViewerProps) {
  if (!content) {
    return (
      <p className="text-muted-foreground text-sm italic">No description</p>
    )
  }

  return (
    <div
      className={`prose-custom ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}
