import React, {useEffect, useRef, useState} from 'react'
import {useSocket} from "../contexts/SocketProvider"
import "./Chat.scss"
import {FiSend} from "react-icons/all"

import {playNewMessageSound} from '../helpers'
import {MSG_TYPES, SENDERS} from "../helpers/constants"
import VoiceChat from "./VoiceChat"

const Chat = ({messages, setMessages}) => {


  const [messageInput, setMessageInput] = useState("")
  const [unreadCount, setUnreadCount] = useState(0)
  const [gotADrawOffer, setGotADrawOffer] = useState(false)
  const [gameEnded, setGameEnded] = useState(false)
  const {socket} = useSocket()
  const bottomOfChatRef = useRef()

  useEffect(() => {
    setMessages([{from: SENDERS.SYSTEM, type: "msg", msg: "The game has started! Type /help", timestamp: 0}])

    // TODO: refactor
    /* Adding audio to an audio message to be added to the chat */
    socket.on('receiveAudio', async (arrayBuffer) => {
      const blob = new Blob([arrayBuffer], {'type': 'audio/ogg codecs=opus'})
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

    socket.on('draw-declined', () => {
      addMessage({
        type: MSG_TYPES.MSG,
        msg: `Draw declined.`,
        from: SENDERS.SYSTEM,
        timestamp: new Date().getTime()
      })
    })

    socket.on('draw-offered', () => {
      addMessage({
        type: MSG_TYPES.MSG,
        msg: `Draw offered.`,
        from: SENDERS.SYSTEM,
        timestamp: new Date().getTime()
      })
      setGotADrawOffer(true)
    })

    socket.on("game-over", () => {
      addMessage({
        type: MSG_TYPES.MSG,
        msg: `Game over.`,
        from: SENDERS.SYSTEM,
        timestamp: new Date().getTime()
      })
      setGotADrawOffer(false)
      setGameEnded(true)
    })

    return () => {
      window.removeEventListener("focus", focusListener)
      socket.off('receiveAudio')
    }
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on("message-received", ({msg, timestamp}) => {
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

  function rematch() {
    socket.emit("rematch")
  }

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
        <div className="draw-options">
          {gotADrawOffer && (
            <>
              <button onClick={() => {
                socket.emit('accept-draw')
              }}>
                accept Draw
              </button>
              <button onClick={() => {
                socket.emit('decline-draw');
                setGotADrawOffer(false)
              }}>
                decline Draw
              </button>
            </>
          )}
          {/*TODO*/}
          {/*{gameEnded && (*/}
          {/*  <div>*/}
          {/*    <button onClick={rematch}>*/}
          {/*      Rematch*/}
          {/*    </button>*/}
          {/*  </div>*/}
          {/*)}*/}
        </div>
      </div>
      <div className="form-container">
        <form className="chat-form" onSubmit={handleChatFormSubmit}>
          <input type="text" placeholder="Enter your message here" value={messageInput}
                 onChange={e => setMessageInput(e.target.value)}/>
          <button><FiSend/></button>
          <VoiceChat setMessages={setMessages}/>
        </form>
      </div>
    </div>
  )
}

export default Chat