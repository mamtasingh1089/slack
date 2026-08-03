import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from '@tiptap/starter-kit'

const RichTextEditor = ({onChange}) => {
    const editor=useEditor({
        extenions:[StarterKit],
        content:'',
        onUpdate({editor}){
            onChange(editor.getHTML());
        }
    });

    if (!editor) return null;

   return (
    <div className="border rounded-md p-2">
      <div className="flex gap-3 mb-2">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleCode().run()}>Code</button>
      </div>

      <EditorContent editor={editor} className="min-h-[80px] outline-none" />
    </div>
  );
};

export default RichTextEditor
