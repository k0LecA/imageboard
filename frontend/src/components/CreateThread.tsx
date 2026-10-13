import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createThread } from "../services/CreateThreadService";

function CreateThread({ slug, boardId, onCreated }: { slug: string; boardId: number; onCreated: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const navigate = useNavigate();

  const insertFormatting = (before: string, after = before) => {
    const editor = editorRef.current;
    if (!editor) return;
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selected = message.slice(start, end);
    const insertion = `${before}${selected || "text"}${after}`;
    const updated = `${message.slice(0, start)}${insertion}${message.slice(end)}`;
    setMessage(updated);
    requestAnimationFrame(() => {
      editor.focus();
      const selectionStart = start + before.length;
      editor.setSelectionRange(selectionStart, selectionStart + (selected || "text").length);
    });
  };

  const submitThread = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;
    setError(null);
    setIsSubmitting(true);
    try {
      const threadId = await createThread(slug, { board_id: boardId, subject: subject.trim(), message: message.trim() }, files);
      setSubject("");
      setMessage("");
      setFiles([]);
      setIsOpen(false);
      onCreated();
      navigate(`/${slug}/${threadId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create thread");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="createThread">
      <button
        type="button"
        className="createThread-toggle"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? "Close posting form" : "Create Thread"}
      </button>

      {isOpen && (
        <form
          className="posting-form"
          onSubmit={submitThread}
        >
          <div className="posting-header">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
              disabled={isSubmitting}
            />

            <button type="submit" className="posting-submit" disabled={isSubmitting}>
              {isSubmitting ? "Posting…" : "Post"}
            </button>
          </div>

          <div className="posting-editor">
            <textarea
              placeholder="Message. Max length 15000"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={15000}
              required
              disabled={isSubmitting}
              ref={editorRef}
            />

            <div className="posting-counter">
              {message.length} / 15000
            </div>
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
              multiple
              disabled={isSubmitting}
              onChange={(event) => setFiles(Array.from(event.target.files ?? []))}
            />
            <span>+ Add images (up to 4)</span>
          </label>
          {files.length > 0 && (
            <ul className="posting-file-list">
              {files.map((file) => <li key={`${file.name}-${file.size}`}>{file.name}</li>)}
            </ul>
          )}

          {error && <p role="alert">{error}</p>}
        </form>
      )}
    </div>
  );
}

export default CreateThread;
