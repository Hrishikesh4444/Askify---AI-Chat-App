import { createContext,useState } from "react";
import {v1 as uuid1} from "uuid";
export const StoreContext=createContext(null);
const StoreContextProvider=(props)=>{

    const [prompt,setPrompt]=useState("");
    const [reply,setReply]=useState(null);
    const [currThreadId,setCurrThreadId]=useState(uuid1());
    const [prevChats,setPrevChats]=useState([]);
    const [newChat,setNewChat]=useState(true);
    const [allThreads,setAllThreads]=useState([]);
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    const url="http://localhost:8080/api";
    
    const contextValue={
        prompt,
        setPrompt,
        reply,
        setReply,
        currThreadId,
        setCurrThreadId,
        url,
        newChat,
        setNewChat,
        prevChats,
        setPrevChats ,
        setAllThreads,
        allThreads ,
        token,
        setToken,
        
    }

    return (
        <StoreContext.Provider value={contextValue}>
            {props.children}
        </StoreContext.Provider>
    )
}

export default StoreContextProvider;