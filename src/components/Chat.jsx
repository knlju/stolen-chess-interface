import React, {useEffect, useRef, useState} from 'react';
import {useSocket} from "../contexts/SocketProvider";
import "./Chat.scss"
import {FiSend} from "react-icons/all";

import {playNewMessageSound} from '../helpers';
import {MSG_TYPES, SENDERS} from "../helpers/constants";

const Chat = ({messages, setMessages}) => {


  const [messageInput, setMessageInput] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const {socket} = useSocket()
  const bottomOfChatRef = useRef()

  useEffect(() => {
    // console.log("chat init");
    setMessages([{type: "msg", msg: "The game has started! Type /help", timestamp: 0}])

    // TODO: refactor
    /* Adding audio to an audio message to be added to the chat */
    socket.on('receiveAudio', async (arrayBuffer) => {
      var blob = new Blob([arrayBuffer], {'type': 'audio/ogg; codecs=opus'});
      /* var audio = document.createElement("audio")
      audio.src = window.URL.createObjectURL(blob)
      audio.play() */
      addMessage({
        type: MSG_TYPES.VOICE,
        src: window.URL.createObjectURL(blob),
        from: SENDERS.THEM,
        timestamp: new Date().getTime()
      })
      playNewMessageSound()
    })
    const focusListener = () => {
      document.title = "🔥 C H E S S 🔥"
      setUnreadCount(0)
    }
    window.addEventListener("focus", focusListener)

    return () => {
      window.removeEventListener("focus", focusListener)
      socket.off('receiveAudio')
    }
  }, [])

  useEffect(() => {
    // console.log("socket useeffect in chat");
    // console.log(socket);
    if (!socket) return
    socket.on("message-received", ({msg, timestamp}) => {
      // console.log("message-received")
      addMessage({
        type: MSG_TYPES.MSG,
        msg: `them: ${msg}`,
        from: SENDERS.THEM,
        timestamp
      })
      playNewMessageSound()
    })
    return () => {
      socket.off('message-received')
    }
  }, [socket])

  useEffect(() => {
    const bocParent = bottomOfChatRef.current.parentNode
    bocParent.scrollTop = bottomOfChatRef.current.offsetTop
    if (!document.hasFocus()) {
      setUnreadCount(prevUnreadCount => prevUnreadCount + 1)
    }
  }, [messages])

  useEffect(() => {
    if (unreadCount <= 0) return
    document.title = `📧(${unreadCount}) N E W  M E S S A G E 📧`
  }, [unreadCount])

  function sendMessage() {
    let sender = SENDERS.ME
    let messageToSend = messageInput.trim()
    let messageToShow = `me: ${messageToSend}`
    if (messageToSend === "") return
    if (messageToSend === "/help") {
      addMessage({
        type: MSG_TYPES.MSG,
        // It's a feature. A hidden feature.
        msg: `/help for help and /soundboard to activate the soundboard. /backdoor [password] 🍪`,
        from: SENDERS.SYSTEM,
        timestamp: new Date().getTime()
      })
      setMessageInput("")
      return
    }
    if (messageToSend === "/soundboard") {
      messageToShow = "soundboard toggled"
      sender = SENDERS.SYSTEM
    }
    addMessage({type: MSG_TYPES.MSG, msg: messageToShow, from: sender, timestamp: new Date().getTime()})
    socket.emit("message-sent", messageToSend)
    setMessageInput("")
  }

  function handleChatFormSubmit(e) {
    e.preventDefault()
    sendMessage()
  }

  function addMessage({type, msg, from, timestamp, src}) {
    setMessages(oldMsgs => [...oldMsgs, {type, msg, class: from, timestamp, src}])
  }

  // console.log("rerender chat");

  return (
    <div className="messages-wrapper">
      <div className="messages-container">
        {
          messages.map(msg => msg.type === "msg" ?
            (<div className={msg.class + ' message'} key={msg.timestamp}>{msg.msg}</div>)
            :
            <audio
              className={msg.class + ' message'}
              key={msg.timestamp}
              src={msg.src}
              controls
              style={{width: '100%'}}
            />
          )

        }
        <div ref={bottomOfChatRef}/>
      </div>
      <div className="form-container">
        <form className="chat-form" onSubmit={handleChatFormSubmit}>
          <input type="text" placeholder="Enter your message here" value={messageInput}
                 onChange={e => setMessageInput(e.target.value)}/>
          <button><FiSend/></button>
        </form>
      </div>
    </div>
  );
};

export default Chat;