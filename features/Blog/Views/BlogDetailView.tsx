'use client';
import { useEffect, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from '@tiptap/extension-link';
import Youtube from '@tiptap/extension-youtube';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { lowlight } from 'lowlight/lib/core';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import dart from 'highlight.js/lib/languages/dart';
import json from 'highlight.js/lib/languages/json';

lowlight.registerLanguage('javascript', javascript);
lowlight.registerLanguage('typescript', typescript);
lowlight.registerLanguage('dart', dart);
lowlight.registerLanguage('json', json);

export default function BlogDetailView({ content }:{ content: any }){
  const [ready, setReady] = useState(false);
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ codeBlock: false }), 
      CodeBlockLowlight.configure({ lowlight }), 
      Image.configure({ inline: true }),
      Link.configure({
        openOnClick: true,
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
    content
  });
  useEffect(()=>{ setReady(true); },[]);
  
  if(!editor || !ready) {
    return <div className="animate-pulse space-y-4">
      <div className="h-4 bg-muted-foreground/20 rounded w-3/4"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-1/2"></div>
      <div className="h-4 bg-muted-foreground/20 rounded w-5/6"></div>
    </div>;
  }
  
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none prose-headings:font-semibold prose-a:text-foreground prose-a:underline prose-a:underline-offset-4 prose-strong:text-foreground prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:border prose-blockquote:border-l-foreground/20 prose-blockquote:text-muted-foreground prose-img:rounded-xl">
      <EditorContent editor={editor} />
    </div>
  );
}
