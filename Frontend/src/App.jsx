import { useContext, useState } from "react";

import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import Authentication from "./components/Authentication";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import { StoreContext } from "./context/StoreContext";

function App() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const {token} =useContext(StoreContext);
  
  const onClickChatWindow=()=>{
      if(showSidebar==true){
        setShowSidebar(false);
      }
  }

  return (

    
    <>
      {showLogin && <Authentication setShowLogin={setShowLogin} />}

      <div className="app">
        {
          token && <Sidebar 
          showSidebar={showSidebar}
          setShowSidebar={setShowSidebar}/>
        }
        <div className="forSidebarHide" onClick={onClickChatWindow}>
          <ChatWindow setShowLogin={setShowLogin} setShowSidebar={setShowSidebar} />
        </div>
        
      </div>
    </>
  );
}

export default App;
