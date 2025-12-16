import React, { useContext, useEffect, useState } from "react";
import "./Authentication.css";
import { StoreContext } from "../context/StoreContext";
import axios from "axios";
const Authentication = ({ setShowLogin }) => {
  const {
    token,
    setToken,
    allThreads,
    setAllThreads,
    currThreadId,
    setCurrThreadId,
    url,
    setNewChat,
    setPrompt,
    setReply,
    setPrevChats,
  } = useContext(StoreContext);
  const [currState, setCurrState] = useState("Sign up");
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const onChangeHandler = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    setData((data) => ({ ...data, [name]: value }));
  };
  const onLogin = async (e) => {
    e.preventDefault();
    let newUrl = url;
    if (currState === "Log in") {
      newUrl += "/signin";
    } else {
      newUrl += "/signup";
    }

    try {
      const response = await axios.post(newUrl, data);
      if (response.data.success) {
        const tokenResp = response.data.token;
        setToken(tokenResp);
        localStorage.setItem("token",tokenResp);
        
        // If signup: server returns `thread` (initial thread)
        if (currState === "Sign up") {
          const thread = response.data.thread;
          if (thread) {
            setAllThreads([{ threadId: thread.threadId, title: thread.title }]);
            setCurrThreadId(thread.threadId);
            setPrevChats([]); // open fresh chat window
            setNewChat(true);
            setReply(null);
          }
        } else {
          // Log in: server returns threads (history) and newThread (the fresh chat)
          const threads = response.data.threads || [];
          const newThread = response.data.newThread;
          const mapped = threads.map((t) => ({ threadId: t.threadId, title: t.title }));
          if (newThread) {
            mapped.unshift({ threadId: newThread.threadId, title: newThread.title });
          }
          setAllThreads(mapped);
          if (newThread) setCurrThreadId(newThread.threadId);
          setPrevChats([]);
          setNewChat(true);
          setReply(null);
        }

        setShowLogin(false);
      } else {
        alert(response.data.message || "Login failed"); // Add this
      }
    } catch (error) {
      console.error("Login/Register Error:", error);
    }
  };
  useEffect(() => {
    scrollTo(0, 0);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // useEffect(()=>{
  //   console.log(data);
  // },[data]);
  return (
    <div className="login-popup">
      <form className="login-popup-container" onSubmit={onLogin}>
        <div className="login-popup-title">
          <h2>{currState}</h2>
          <button
            type="button"
            className="close-btn"
            onClick={() => setShowLogin(false)}
          >
            ✕
          </button>
        </div>
        <div className="login-popup-inputs">
          {currState === "Log in" ? (
            <></>
          ) : (
            <input
              type="text"
              name="name"
              onChange={onChangeHandler}
              value={data.name}
              placeholder="enter your name"
              required
            />
          )}

          <input
            type="email"
            name="email"
            onChange={onChangeHandler}
            value={data.email}
            placeholder="enter your email"
            required
          />
          <input
            type="password"
            name="password"
            onChange={onChangeHandler}
            value={data.password}
            placeholder="enter your password"
            required
          />
        </div>
        <button type="submit">
          {currState === "Sign up" ? "Create account" : "Log in"}
        </button>
        <div className="login-popup-condition">
          <input style={{ cursor: "pointer" }} type="checkbox" required />
          <p>By continuing, I agree to the terms of use & privacy policy.</p>
        </div>
        {currState === "Log in" ? (
          <p>
            Create a new account ?{" "}
            <span onClick={() => setCurrState("Sign up")}> Click here</span>
          </p>
        ) : (
          <p>
            Already have an account ?
            <span onClick={() => setCurrState("Log in")}> Login here</span>
          </p>
        )}
      </form>
    </div>
  );
};

export default Authentication;
