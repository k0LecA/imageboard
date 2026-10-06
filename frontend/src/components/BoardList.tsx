import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom'

function BoardList () {
  const [items, setItems] = useState([]);
  const [dataIsLoaded, setDataIsLoaded] = useState(false);
  useEffect(() => {
          fetch(`http://localhost:8080/`)
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
            <Link to={`/${item.slug}`}>
              <strong>{item.name}</strong>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BoardList;
