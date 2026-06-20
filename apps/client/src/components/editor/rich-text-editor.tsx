import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import { useEffect, useCallback } from "react"
import EditorToolbar from "./editor-toolbar"

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  disabled?: boolean
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write something...",
  minHeight = 120,
  disabled = false,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    editable: !disabled,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html === "<p></p>" ? "" : html)
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[80px] px-3 py-2 text-sm",
      },
    },
  })

  useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getHTML()
      const normalizedCurrent = currentContent === "<p></p>" ? "" : currentContent
      if (normalizedCurrent !== (value || "")) {
        editor.commands.setContent(value || "", { emitUpdate: false })
      }
    }
  }, [editor, value])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    editor?.chain().focus().run()
  }, [editor])

  if (!editor) {
    return (
      <div
        className="border border-input rounded-md bg-background"
        style={{ minHeight }}
      />
    )
  }

  return (
    <div
      className="border border-input rounded-md bg-background focus-within:border-ring focus-within:ring-1 focus-within:ring-ring transition-colors"
      style={{ minHeight }}
    >
      <EditorToolbar editor={editor} />
      <div onMouseDown={handleMouseDown}>
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
