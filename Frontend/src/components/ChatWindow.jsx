import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { StoreContext } from "../context/StoreContext.jsx";
import { useContext, useState, useEffect } from "react";
import { ScaleLoader } from "react-spinners";
import { useNavigate } from "react-router-dom";
function ChatWindow({ setShowLogin, setShowSidebar }) {
  const {
    prompt,
    setPrompt,
    reply,
    setReply,
    currThreadId,
    setPrevChats,
    setNewChat,
    url,
    token,
    setToken,
    setAllThreads,
  } = useContext(StoreContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getReply = async () => {
    setLoading(true);
    setNewChat(false);

    //console.log(" threadId ", currThreadId);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId,
      }),
    };

    try {
      const response = await fetch(url + "/chat", options);
      const res = await response.json();
      //console.log(res);
      setReply(res.reply);

      const titleFromServer = res.thread && res.thread.title;
      const title =
        titleFromServer || prompt?.trim().slice(0, 200) || "New Chat";

      setAllThreads((prev) => {
        const without = (prev || []).filter((t) => t.threadId !== currThreadId);
        return [{ threadId: currThreadId, title }, ...without];
      });
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  //Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats((prevChats) => [
        ...prevChats,
        {
          role: "user",
          content: prompt,
        },
        {
          role: "assistant",
          content: reply,
        },
      ]);
    }

    setPrompt("");
  }, [reply]);

  const profileClick = () => {
    setIsOpen(!isOpen);
  };

  const navigate = useNavigate();

  const logout = async () => {
    try {
      if (currThreadId && token) {
        const headers = { Authorization: `Bearer ${token}` };

        // check current thread
        const res = await fetch(url + `/thread/${currThreadId}`, { headers });

        if (res.ok) {
          const data = await res.json();

          // your API returns messages array
          if (Array.isArray(data) && data.length === 0) {
            // delete empty thread from DB
            await fetch(url + `/thread/${currThreadId}`, {
              method: "DELETE",
              headers,
            });

            // remove from sidebar state
            setAllThreads((prev) =>
              (prev || []).filter((t) => t.threadId !== currThreadId)
            );
          }
        }
      }
    } catch (err) {
      console.log("Logout cleanup failed:", err);
    }

    // clear auth + UI state
    localStorage.removeItem("token");
    setToken("");
    setNewChat(true);
    setReply(null);
    setPrevChats([]);
    setIsOpen(false);
    navigate("/");
  };

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div className="navLeft">
          {token && (
            <i
              className="fa-solid fa-bars menuIcon"
              onClick={() => setShowSidebar(true)}
            ></i>
          )}
          <span>Askify</span>
        </div>

        {!token ? (
          <div
            role="button"
            onClick={() => setShowLogin(true)}
            className="loginBtn"
          >
            Log in
          </div>
        ) : (
          <div className="userIconDiv" onClick={profileClick}>
            <span className="userIcon">
              <i className="fa-solid fa-user"></i>
            </span>
          </div>
        )}
      </div>
      {isOpen && (
        <div className="dropDown">
          {/* <div className="dropDownItem">
            <i class="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem">
            <i class="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div> */}
          <div className="dropDownItem" onClick={logout}>
            <i class="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}
      <Chat></Chat>

      <ScaleLoader color="#fff" loading={loading}></ScaleLoader>

      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => (e.key === "Enter" ? getReply() : "")}
          ></input>
          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">Askify can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}

export default ChatWindow;
