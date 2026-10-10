import { useState } from "react";

function CreateThread() {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

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
          onSubmit={(e) => {
            e.preventDefault();
            // TODO: Send thread to API
          }}
        >
          <div className="posting-header">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              maxLength={200}
              required
            />

            <button type="submit" className="posting-submit">
              Post
            </button>
          </div>

          <div className="posting-editor">
            <textarea
              placeholder="Message. Max length 15000"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              maxLength={15000}
              required
            />

            <div className="posting-counter">
              {message.length} / 15000
            </div>
          </div>

          <div className="posting-toolbar">
            <button type="button" title="Bold">B</button>
            <button type="button" title="Italic"><i>I</i></button>
            <button type="button" title="Quote">&gt;</button>
            <button type="button" title="Underline"><u>U</u></button>
            <button type="button" title="Spoiler">S</button>
          </div>

          <label className="posting-upload">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                console.log(e.target.files);
              }}
            />
            <span>+ Add files / Ctrl+V</span>
          </label>
        </form>
      )}
    </div>
  );
}

export default CreateThread;
