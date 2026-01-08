'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    height?: string
}

const MenuBar = ({ editor }: any) => {
    if (!editor) {
        return null
    }

    return (
        <div className="border-b border-neutral-200 bg-neutral-50 p-2 flex flex-wrap gap-1">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('bold')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Bold
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('italic')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Italic
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('strike')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Strike
            </button>
            <div className="w-px h-6 bg-neutral-300 mx-1" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 1 })
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                H1
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 2 })
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                H2
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('heading', { level: 3 })
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                H3
            </button>
            <div className="w-px h-6 bg-neutral-300 mx-1" />
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('bulletList')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Bullet List
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('orderedList')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Numbered List
            </button>
            <div className="w-px h-6 bg-neutral-300 mx-1" />
            <button
                type="button"
                onClick={() => {
                    const url = window.prompt('Enter URL:')
                    if (url) {
                        editor.chain().focus().setLink({ href: url }).run()
                    }
                }}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${editor.isActive('link')
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                    }`}
            >
                Link
            </button>
            {editor.isActive('link') && (
                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetLink().run()}
                    className="px-3 py-1.5 rounded text-sm font-medium bg-white text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                    Remove Link
                </button>
            )}
        </div>
    )
}

export default function RichTextEditor({ value, onChange, placeholder, height = '200px' }: RichTextEditorProps) {
    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-indigo-600 underline',
                },
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm max-w-none focus:outline-none p-4',
            },
        },
    })

    // Update editor content when value changes externally
    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    if (!editor) {
        return (
            <div className="border border-neutral-200 rounded-lg p-4 text-neutral-400">
                Loading editor...
            </div>
        )
    }

    return (
        <div className="rich-text-editor border border-neutral-200 rounded-lg overflow-hidden">
            <MenuBar editor={editor} />
            <div style={{ minHeight: height }} className="bg-white">
                <EditorContent editor={editor} placeholder={placeholder} />
            </div>
            <style jsx global>{`
                .ProseMirror {
                    min-height: ${height};
                }
                .ProseMirror p.is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: #9ca3af;
                    pointer-events: none;
                    height: 0;
                }
                .ProseMirror:focus {
                    outline: none;
                }
                .ProseMirror h1 {
                    font-size: 2em;
                    font-weight: bold;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                .ProseMirror h2 {
                    font-size: 1.5em;
                    font-weight: bold;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                .ProseMirror h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin-top: 0.5em;
                    margin-bottom: 0.5em;
                }
                .ProseMirror ul,
                .ProseMirror ol {
                    padding-left: 1.5em;
                    margin: 0.5em 0;
                }
                .ProseMirror ul {
                    list-style-type: disc;
                }
                .ProseMirror ol {
                    list-style-type: decimal;
                }
                .ProseMirror li {
                    margin: 0.25em 0;
                }
                .ProseMirror a {
                    color: #4f46e5;
                    text-decoration: underline;
                    cursor: pointer;
                }
                .ProseMirror strong {
                    font-weight: bold;
                }
                .ProseMirror em {
                    font-style: italic;
                }
                .ProseMirror s {
                    text-decoration: line-through;
                }
            `}</style>
        </div>
    )
}
