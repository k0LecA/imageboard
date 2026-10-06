import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'

function PostList({
  threadId,
  slug,
}: {
  threadId: number;
  slug: string;
}) {
  const [items, setItems] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);
  useEffect(() => {
    fetch(`http://localhost:8080/${slug}/${threadId}`)
              .then((res) => res.json())
              .then((json) => {
                  setItems(json);
                  setDataIsLoaded(true);
              });
  }, []);
  if (!dataIsLoaded) {
          return (
              <div>
                  <h1>Please wait some time....</h1>
              </div>
          );
  }
  return (
    <div className="container">
      {items.map((item) => (
        <div key={item.id}>
          <div>
              <strong>{item.message}</strong>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PostList;
