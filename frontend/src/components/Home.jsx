import React from "react";

import Logout from "./Logout.jsx";
import FileUploader from "./FileUploader.jsx";

function Home() {
  return (
    <div>
      <h1>Hello</h1>
      <FileUploader/>
      <Logout/>
    </div>
  );
}

export default Home;
