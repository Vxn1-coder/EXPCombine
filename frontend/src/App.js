import React, { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("http://localhost:5000")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return <h1>Full Stack App Running 🚀</h1>;
}

export default App;