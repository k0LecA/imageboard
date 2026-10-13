import type { PostFile } from "../types/Post";

function PostImages({ files }: { files: PostFile[] }) {
  const images = files.filter((file) => file.mime_type.startsWith("image/"));

  if (images.length === 0) return null;

  return (
    <div className="post-images">
      {images.map((file) => (
        <a
          className="post-image-link"
          href={`http://localhost:8080/api/files/${file.id}`}
          target="_blank"
          rel="noreferrer"
          key={file.id}
        >
          <img
            className="post-image"
            src={`http://localhost:8080/api/files/${file.id}`}
            alt={file.original_name}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

export default PostImages;
