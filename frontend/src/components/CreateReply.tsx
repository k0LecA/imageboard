import { useEffect, useRef, useState } from "react";
import { getBoardMeta } from "../services/BoardService";
import { createPost } from "../services/PostService";

function CreateReply({ slug, threadId, onCreated }: { slug: string; threadId: number; onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [boardId, setBoardId] = useState<number>();
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    getBoardMeta(slug).then((board) => setBoardId(board.id)).catch(() => setError("Could not load board information"));
  }, [slug]);

  const insertFormatting = (before: string, after = before) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = message.slice(start, end);
    const content = selected || "text";
    setMessage(`${message.slice(0, start)}${before}${content}${after}${message.slice(end)}`);
    requestAnimationFrame(() => {
      editor.focus();
      editor.setSelectionRange(start + before.length, start + before.length + content.length);
    });
  };

  const submitReply = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || boardId === undefined) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await createPost(slug, threadId, { boardId, message: message.trim() }, file);
      setMessage("");
      setFile(undefined);
      setIsOpen(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post reply");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createThread createReply">
      <button type="button" className="createThread-toggle" onClick={() => setIsOpen((open) => !open)}>
        {isOpen ? "Close reply form" : "Reply in thread"}
      </button>

      {isOpen && (
        <form className="posting-form" onSubmit={submitReply}>
          <div className="posting-editor">
            <textarea
              ref={editorRef}
              placeholder="Message. Max length 15000"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              maxLength={15000}
              required
              disabled={isSubmitting || boardId === undefined}
            />
            <div className="posting-counter">{message.length} / 15000</div>
          </div>

          <div className="posting-toolbar">
            <button type="button" title="Bold" onClick={() => insertFormatting("**")}>B</button>
            <button type="button" title="Italic" onClick={() => insertFormatting("*")}><i>I</i></button>
            <button type="button" title="Quote" onClick={() => insertFormatting("> ", "")}>&gt;</button>
            <button type="button" title="Underline" onClick={() => insertFormatting("__")}><u>U</u></button>
            <button type="button" title="Spoiler" onClick={() => insertFormatting("||")}>S</button>
          </div>

          <label className="posting-upload">
            <input
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp,image/avif"
              disabled={isSubmitting}
              onChange={(event) => setFile(event.target.files?.[0])}
            />
            <span>{file ? file.name : "+ Add image"}</span>
          </label>

          {error && <p role="alert">{error}</p>}
          <div className="reply-submit-row">
            <button type="submit" className="posting-submit" disabled={isSubmitting || boardId === undefined}>
              {isSubmitting ? "Posting…" : "Post reply"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default CreateReply;
