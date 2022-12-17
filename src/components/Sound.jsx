import React, {useEffect, useRef, useState} from 'react'
import {BsFillVolumeUpFill} from 'react-icons/bs'
import {useSocket} from '../contexts/SocketProvider'

// TODO: nauci kako se koristi jsdoc sa reactom (da li se uopste koristi)
/**
 * returns soundboard sound or elevator music
 */
const Sound = (props) => {
  const {hidden = false, isElevatorMusic = false} = props
  if (isElevatorMusic) return <ElevatorMusicSound {...props} hidden={hidden}/>
  else return <SoundboardSound {...props} hidden={hidden}/>
}

const SoundboardSound = ({source, text, event, hidden = false}) => {

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

const ElevatorMusicSound = ({source}) => {

  const audioRef = useRef(null)

  useEffect(() => {
    // user has to interact with the page first for audio to autoplay
    audioRef.current.play()
    audioRef.current.loop = true
  }, [])

  return (
    <>
      <audio ref={audioRef} style={{display: "none"}}>
        <source src={`./audio/${source}`} type="audio/mp3"/>
        Your browser does not support the audio element.
      </audio>
    </>
  )
}

export default Sound