import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { StoreContext } from "../context/StoreContext";
import {v1 as uuidv1} from "uuid";

function Sidebar({showSidebar, setShowSidebar}) {
    const {allThreads, setAllThreads, currThreadId, setNewChat, setPrompt, setReply, setCurrThreadId, setPrevChats,url,token,prompt} = useContext(StoreContext);
  
    const getAllThreads = async () => {
        try {
            const headers = token ? { "Authorization": `Bearer ${token}` } : {};
            const response = await fetch(url+"/thread",{headers});
            const res = await response.json();
            const filteredData = res.map(thread => ({threadId: thread.threadId, title: thread.title}));
            //console.log(filteredData);
            setAllThreads(filteredData);
        } catch(err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, [token])


    const createNewChat = () => {
        setCurrThreadId(uuidv1());
        setNewChat(true);
        setPrompt("");
        setReply(null);
        setShowSidebar(false);
        setPrevChats([]);
        
    }

    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await fetch(url+`/thread/${newThreadId}`);
            const res = await response.json();
            console.log(res);
            setPrevChats(res);
            setNewChat(false);
            setReply(null);
            setShowSidebar(false);
        } catch(err) {
            console.log(err);
        }
    }   

    const deleteThread = async (threadId) => {
        try {
            const response = await fetch(url+`/thread/${threadId}`, {method: "DELETE"});
            const res = await response.json();
            //console.log(res);

            //updated threads re-render
            setAllThreads(prev => prev.filter(thread => thread.threadId !== threadId));

            if(threadId === currThreadId) {
                createNewChat();
            }

        } catch(err) {
            console.log(err);
        }
    }

    return (
        <section className={`sidebar ${showSidebar ? "open" : ""}`}>
            <button onClick={createNewChat}>
                <img src="public/logo.png" alt="gpt logo" className="logo"></img>
                <span><i className="fa-solid fa-pen-to-square"></i></span>
            </button>


            <ul className="history">
                {
                    allThreads?.map((thread, idx) => (
                        <li key={idx} 
                            onClick={(e) => changeThread(thread.threadId)}
                            className={thread.threadId === currThreadId ? "highlighted": " "}
                        >
                            {thread.title}
                            <i className="fa-solid fa-trash"
                                onClick={(e) => {
                                    e.stopPropagation(); //stop event bubbling
                                    deleteThread(thread.threadId);
                                }}
                            ></i>
                        </li>
                    ))
                }
            </ul>
 
            {/* <div className="sign">
                <p>By ApnaCollege &hearts;</p>
            </div> */}
        </section>
    )
}

export default Sidebar;