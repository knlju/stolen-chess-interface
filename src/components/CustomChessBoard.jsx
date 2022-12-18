import {useEffect, useState} from 'react'
import Chess from 'chess.js'
import {Chessboard} from 'react-chessboard'
import {useSocket} from "../contexts/SocketProvider"
import "./CustomChessBoard.scss"
import GameEndModal from "./GameEndModal"
import {playCheckAudio} from '../helpers'

export default function CustomChessBoard({pieces, playersTurn, game, setGame, safeGameMutate}) {
  const [playerColor,] = useState(pieces)
  // const [isMyTurn, setIsMyTurn] = useState(playersTurn)
  const [gameEnded, setGameEnded] = useState(false)
  const [showGameEndedModal, setShowGameEndedModal] = useState(false)
  const [optionSquares, setOptionSquares] = useState({})
  const [cbWidth, setCbWidth] = useState(Math.min(500, window.outerWidth * .95))
  const {socket} = useSocket()

  useEffect(() => {
    const resizeListener = () => {
      setCbWidth(Math.min(500, window.outerWidth * .95))
    }
    window.addEventListener("resize", resizeListener)
    return () => window.removeEventListener("resize", resizeListener)
  }, [])

  useEffect(() => {
    if (!socket) return
    socket.on("move-valid", ({valid, chess}) => {
      if (!valid) {
        setGame(new Chess(chess))
      }
      if (game.in_check()) {
        playCheckAudio()
      }
    })
    socket.on("move-made", (move) => {
      setGame(g => {
        const gameCopy = {...g}
        gameCopy.move(move)

        if (gameCopy.in_check()) {
          playCheckAudio()
        }
        return gameCopy
      })
    })
    socket.on("game-over", (msg) => {
      setGameEnded(msg)
      setShowGameEndedModal(true)
    })

    return () => {
      socket.off("make-move")
      socket.off("is-valid")
      socket.off("game-started")
      socket.off("game-over")
    }
  }, [socket])

  useEffect(() => {
    document.title = ((game.turn() === "b") === playersTurn) ? "🔥 C H E S S 🔥" : "YOUR MOVE!"
    return () => document.title = "🔥 C H E S S 🔥"
  }, [game])

  function onDrop(sourceSquare, targetSquare) {
    let move = null
    if (game.turn() !== playerColor[0].toLowerCase()) return
    safeGameMutate((game) => {
      move = game.move({
        from: sourceSquare,
        to: targetSquare,
        // TODO: add promotion
        promotion: 'q'
      })
    })
    if (move === null) return false
    socket.emit("make-move", {
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q' // TODO: add promotion
    })
    return true
  }

  function getMoveOptions(square) {
    const moves = game.moves({
      square,
      verbose: true
    })
    if (moves.length === 0) {
      return
    }

    const newSquares = {}
    moves.map((move) => {
      newSquares[move.to] = {
        background:
          game.get(move.to) &&
          game.get(move.to).color !== game.get(square).color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%"
      }
      return move
    })
    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)"
    }
    setOptionSquares(newSquares)
  }

  function onPieceDragBegin(piece, square) {
    getMoveOptions(square)
  }

  function onPieceDragEnd() {
    setOptionSquares({})
  }

  return (
    <>
      <div className="CustomChessBoard">
        <Chessboard
          position={game?.fen()}
          areArrowsAllowed={true}
          arePiecesDraggable={!gameEnded}
          arePremovesAllowed={true}
          animationDuration={100}
          boardOrientation={playerColor}
          boardWidth={cbWidth}
          clearPremovesOnRightClick={true}
          onPieceDrop={onDrop}
          showBoardNotation={true}
          customSquareStyles={optionSquares}
          onPieceDragBegin={onPieceDragBegin}
          onPieceDragEnd={onPieceDragEnd}
        />
      </div>
      <div>
        <button onClick={() => {
          socket.emit('resign')
        }}>Resign
        </button>
        <button onClick={() => {
          socket.emit('offer-draw')
        }}>Draw
        </button>
      </div>

      {showGameEndedModal &&
        <GameEndModal
          // winner={gameEnded.winner}
          // loser={gameEnded.loser}
          // reason={gameEnded.reason}
          {...gameEnded}
          closeModal={() => setShowGameEndedModal(false)}/>
      }
    </>
  )
}
