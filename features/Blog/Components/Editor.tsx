'use client';
import React, { useCallback, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { common, createLowlight } from 'lowlight'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import dart from 'highlight.js/lib/languages/dart';
import json from 'highlight.js/lib/languages/json';
import { uploadImage } from '@/features/Blog/Controllers/blogActions';

const lowlight = createLowlight();

lowlight.register('javascript', javascript);
lowlight.register('typescript', typescript);
lowlight.register('dart', dart);
lowlight.register('json', json);

export default function Editor({ initial, onChange }: { initial?: any, onChange?: (doc: any) => void }) {
  const [uploading, setUploading] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showYoutubeDialog, setShowYoutubeDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-foreground underline underline-offset-4 hover:no-underline',
        },
      }),
      Youtube.configure({
        width: 640,
        height: 480,
        HTMLAttributes: {
          class: 'rounded-xl overflow-hidden',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
    ],
    editorProps: {
      attributes: {
        class: "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4"
      }
    },
    content: initial || { type: 'doc', content: [{ type: 'paragraph' }] },
    onUpdate({ editor }) {
      onChange?.(editor.getJSON());
    }
  });

  const addImage = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData();
      form.append('file', file);
      const res = await uploadImage(form);
      if ('url' in res && res.url) {
        editor?.chain().focus().setImage({ src: res.url }).run();
      } else {
        alert((res as any).error || 'Upload failed');
      }
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const addLink = useCallback(() => {
    const url = linkUrl.trim();
    if (url) {
      editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  }, [editor, linkUrl]);

  const addYoutube = useCallback(() => {
    const url = youtubeUrl.trim();
    if (url) {
      editor?.commands.setYoutubeVideo({ src: url });
      setYoutubeUrl('');
      setShowYoutubeDialog(false);
    }
  }, [editor, youtubeUrl]);

  const toggleFormat = useCallback((format: string) => {
    if (!editor) return;

    switch (format) {
      case 'bold':
        editor.chain().focus().toggleBold().run();
        break;
      case 'italic':
        editor.chain().focus().toggleItalic().run();
        break;
      case 'underline':
        editor.chain().focus().toggleUnderline().run();
        break;
      case 'code':
        editor.chain().focus().toggleCodeBlock().run();
        break;
      case 'align-left':
        editor.chain().focus().setTextAlign('left').run();
        break;
      case 'align-center':
        editor.chain().focus().setTextAlign('center').run();
        break;
      case 'align-right':
        editor.chain().focus().setTextAlign('right').run();
        break;
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rounded-2xl border overflow-hidden">
      <div className="bg-muted/50 border-b px-4 py-3">
        <div className="flex flex-wrap gap-2 text-sm">
          {/* Text formatting */}
          <div className="flex gap-1">
            <button
              onClick={() => toggleFormat('bold')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive('bold') ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              Bold
            </button>
            <button
              onClick={() => toggleFormat('italic')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive('italic') ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              Italic
            </button>
            <button
              onClick={() => toggleFormat('underline')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive('underline') ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              Underline
            </button>
          </div>

          <div className="border-l mx-2"></div>

          {/* Alignment */}
          <div className="flex gap-1">
            <button
              onClick={() => toggleFormat('align-left')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive({ textAlign: 'left' }) ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              ←
            </button>
            <button
              onClick={() => toggleFormat('align-center')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive({ textAlign: 'center' }) ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              ↔
            </button>
            <button
              onClick={() => toggleFormat('align-right')}
              className={`rounded border px-3 py-1 transition-colors ${editor.isActive({ textAlign: 'right' }) ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
            >
              →
            </button>
          </div>

          <div className="border-l mx-2"></div>

          {/* Code block */}
          <button
            onClick={() => toggleFormat('code')}
            className={`rounded border px-3 py-1 transition-colors ${editor.isActive('codeBlock') ? 'bg-foreground text-background' : 'hover:bg-white/5'}`}
          >
            Code
          </button>

          <div className="border-l mx-2"></div>

          {/* Media */}
          <div className="flex gap-1">
            <label className="rounded border px-3 py-1 cursor-pointer hover:bg-white/5 transition-colors">
              {uploading ? 'Uploading…' : '📷 Image'}
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const f = e.target.files?.[0]; if (f) addImage(f);
              }} />
            </label>

            <button
              onClick={() => setShowLinkDialog(true)}
              className="rounded border px-3 py-1 hover:bg-white/5 transition-colors"
            >
              🔗 Link
            </button>

            <button
              onClick={() => setShowYoutubeDialog(true)}
              className="rounded border px-3 py-1 hover:bg-white/5 transition-colors"
            >
              📹 Video
            </button>
          </div>
        </div>

        {/* Link Dialog */}
        {showLinkDialog && (
          <div className="mt-3 p-3 border rounded-xl bg-background">
            <div className="flex gap-2">
              <input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Enter link URL (https://...)"
                className="flex-1 rounded border px-3 py-1 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                onKeyDown={(e) => e.key === 'Enter' && addLink()}
                autoFocus
              />
              <button
                onClick={addLink}
                className="rounded border px-3 py-1 text-sm hover:bg-white/5 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowLinkDialog(false); setLinkUrl(''); }}
                className="rounded border px-3 py-1 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* YouTube Dialog */}
        {showYoutubeDialog && (
          <div className="mt-3 p-3 border rounded-xl bg-background">
            <div className="flex gap-2">
              <input
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                placeholder="Enter YouTube URL (https://www.youtube.com/watch?v=...)"
                className="flex-1 rounded border px-3 py-1 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                onKeyDown={(e) => e.key === 'Enter' && addYoutube()}
                autoFocus
              />
              <button
                onClick={addYoutube}
                className="rounded border px-3 py-1 text-sm hover:bg-white/5 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowYoutubeDialog(false); setYoutubeUrl(''); }}
                className="rounded border px-3 py-1 text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Supports YouTube, Vimeo, and other video URLs</p>
          </div>
        )}
      </div>

      <EditorContent editor={editor} />
    </div>
  );
}
