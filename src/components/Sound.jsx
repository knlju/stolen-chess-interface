import React, {useEffect, useRef, useState} from 'react'
import {BsFillVolumeUpFill} from 'react-icons/bs'
import {useSocket} from '../contexts/SocketProvider'

// TODO: nauci kako se koristi jsdoc sa reactom (da li se uopste koristi)
/**
 * @props {string} source - name of the source file in public/audio/
 * @props {string} text - button text
 * @props {string} event - socket event name
 * @props {boolean} hidden - flag for display
 */
const Sound = ({source, text, event, hidden = false}) => {

  const {socket} = useSocket()

  const [isPlaying, setIsPlaying] = useState(false)

  const audioRef = useRef(null)

  useEffect(() => {
    socket.on(event, () => {
      setIsPlaying(true)
      audioRef.current.play()
    })

    return () => {
      socket.off(event)
    }
  }, [])

  useEffect(() => {
    const audio = audioRef.current

    const endedListener = () => setIsPlaying(false)

    audio.addEventListener("ended", endedListener)

    return () => audio.removeEventListener("ended", endedListener)
  }, [audioRef])

  return (
    <>
      {!hidden &&
        (<button onClick={() => socket.emit(event)}>
          <span style={{visibility: isPlaying ? "visible" : "hidden"}}>
              <BsFillVolumeUpFill/>
          </span>
          {text}
        </button>)
      }
      <audio ref={audioRef} style={{display: "none"}}>
        <source src={`./audio/${source}`} type="audio/mp3"/>
        Your browser does not support the audio element.
      </audio>
    </>
  )
}

export default Sound