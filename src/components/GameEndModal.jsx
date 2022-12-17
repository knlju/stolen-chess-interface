import React, {useEffect} from 'react';
import Modal from "./Modal";
import {IoCloseCircleSharp} from "react-icons/all";
import "./JoinARoomModal.scss"

function GameEndModal({closeModal, winner, loser, reason}) {

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => document.body.style.overflow = "auto"
  }, [])

  let gameEndedText,
    gif = {src: "https://media.tenor.com/TLOwnu_HBFIAAAAC/randy-orton-rko.gif", alt: "AND HIS NAME IS ...."}
  switch (reason) {
    case "stalemate":
      gameEndedText = "Stalemate"
      gif = {
        src: "https://media.tenor.com/UbJFeMf3MA8AAAAC/mexican-stalemate-the-office.gif",
        alt: "Mexican stalemate"
      }
      break;
    case "threefold-repetition":
      gameEndedText = "Threefold repetition"
      gif = {
        src: "https://media.tenor.com/UbJFeMf3MA8AAAAC/mexican-stalemate-the-office.gif",
        alt: "Mexican stalemate"
      }
      break;
    //    TODO: implement on front
    case "draw":
      gameEndedText = "Draw"
      gif = {
        src: "https://media.tenor.com/UbJFeMf3MA8AAAAC/mexican-stalemate-the-office.gif",
        alt: "Mexican stalemate"
      }
      break;
    case "other":
      gameEndedText = `${loser} got checkmated. ${winner} won!`
      break;
    case "resignation":
      gameEndedText = `${loser} resigns. ${winner} won!`
      break;
    case "player-disconnected":
      gameEndedText = `Opponent ran away. The coward!`
      gif = {
        src: "https://media.tenor.com/jdFD8PpUK64AAAAC/skeletor-running-away.gif",
        alt: "Skeleton runs away, the coward..."
      }
      break;
    default:
      gameEndedText = "why not"
  }
  return (
    <Modal closeModal={closeModal}>
      <div className="game-id-form">
        <div className="modal-close-x" onClick={closeModal}>
          <IoCloseCircleSharp/>
        </div>
        <div>
          <div>Game ended! Result:</div>
          <div><b>{gameEndedText}</b></div>
          <img src={gif.src} alt={gif.alt} />
        </div>
      </div>
    </Modal>
  );
}

export default GameEndModal