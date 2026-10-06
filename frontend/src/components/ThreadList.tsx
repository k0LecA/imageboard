import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'

function ThreadList ({ slug }: { slug: string }) {
  const [items, setItems] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);
  useEffect(() => {
    fetch(`http://localhost:8080/${slug}`)
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
            <Link to={`/${slug}/${item.id}`}>
              <strong>{item.subject}</strong>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ThreadList;
