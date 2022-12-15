import Sound from "./Sound"

const SoundBoard = () => (
    <div>
        <Sound event="dame-dameyu" source="dame-dameyu-short.mp3" text="dame-dameyu" />
        {/* TODO: when family unfriendly is enabled, kanye too sus for todays climate */}
        <Sound event="kanye" source="wise words from kanye.mp3" text="wise words from kanye" hidden />
        <Sound event="uskliknimo" source="uskliknimo.mp3" text="uskliknimo" />
        <Sound event="game-over" source="JOHN CENA.mp3" text="cena" hidden />
    </div>
)

export default SoundBoard