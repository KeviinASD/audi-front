import './rich-text.css'
import { useEditor, EditorContent, Editor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
/* import {  } from '@tiptap/extension-text-style' */
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
import { Button } from './button'
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect } from 'react'
import { Separator } from './separator'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
  placeholder?: string
}

function MenuBar({ editor }: { editor: Editor }) {
  const editorState = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold') ?? false,
      canBold: ctx.editor.can().chain().focus().toggleBold().run() ?? false,
      isItalic: ctx.editor.isActive('italic') ?? false,
      canItalic: ctx.editor.can().chain().toggleItalic().run() ?? false,
      isHeading1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
      isHeading2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
      isHeading3: ctx.editor.isActive('heading', { level: 3 }) ?? false,


      isBulletList: ctx.editor.isActive('bulletList') ?? false,
      isOrderedList: ctx.editor.isActive('orderedList') ?? false,
    })
  })

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 ">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }}
        className={editorState.isHeading1 ? 'bg-gray-100' : ''}
        title="H1"
      >
        H1
      </Button>

      <div className="w-px bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBold().run()
        }}
        disabled={!editorState.canBold}
        className={editorState.isBold ? 'bg-gray-100' : ''}
        title="Bold"
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleItalic().run()
        }}
        disabled={!editorState.canItalic}
        className={editorState.isItalic ? 'bg-gray-100' : ''}
        title="Italic"
      >
        <Italic className="w-4 h-4" />
      </Button>

      <div className="w-px bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBulletList().run()
        }}
        className={editorState.isBulletList ? 'bg-gray-100' : ''}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleOrderedList().run()
        }}
        className={editorState.isOrderedList ? 'bg-gray-100' : ''}
        title="Ordered List"
      >
        <ListOrdered className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().toggleBlockquote().run()
        }}
        className={editor.isActive('blockquote') ? 'bg-gray-300' : ''}
        title="Blockquote"
      >
        <Quote className="w-4 h-4" />
      </Button>

      <div className="w-px bg-gray-300 mx-1" />

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().undo().run()
        }}
        disabled={!editor.can().chain().focus().undo().run()}
        title="Undo"
      >
        <Undo className="w-4 h-4" />
      </Button>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onMouseDown={(e) => {
          e.preventDefault()
          editor.chain().focus().redo().run()
        }}
        disabled={!editor.can().chain().focus().redo().run()}
        title="Redo"
      >
        <Redo className="w-4 h-4" />
      </Button>
    </div>
  )
}

const RichTextEditor = ({
  content,
  onChange,
  className,
  placeholder = "Write something..."
}: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [StarterKit, /* TextStyleKit */],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4',
      },
    },
  })

  // Actualizar el contenido del editor cuando cambie externamente
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
      {/* Toolbar */}
      <MenuBar editor={editor} />

      {/* Editor */}
      <EditorContent editor={editor} className="bg-white" />
    </div>
  )
}

export function ShowRichTextContent({ content }: { content: string }) {
  return (
    <div
      className="prose prose-sm max-w-none tiptap"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
}

export default RichTextEditor