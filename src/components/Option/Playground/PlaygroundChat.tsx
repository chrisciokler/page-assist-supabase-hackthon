import React from "react"
import { useMessageOption } from "~hooks/useMessageOption"
import { PlaygroundEmpty } from "./PlaygroundEmpty"
import { PlaygroundMessage } from "~components/Common/Playground/Message"

export const PlaygroundChat = () => {
  const { messages, streaming, regenerateLastMessage, isSearchingInternet } = useMessageOption()
  const divRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (divRef.current) {
      divRef.current.scrollIntoView({ behavior: "smooth" })
    }
  })
  return (
    <div className="grow flex flex-col md:translate-x-0 transition-transform duration-300 ease-in-out">
      {messages.length === 0 && (
        <div className="mt-32">
          <PlaygroundEmpty />
        </div>
      )}
      {/* {messages.length > 0 && <div className="w-full h-16 flex-shrink-0"></div>} */}
      {messages.map((message, index) => (
        <PlaygroundMessage
          key={index}
          isBot={message.isBot}
          message={message.message}
          name={message.name}
          images={message.images || []}
          currentMessageIndex={index}
          totalMessages={messages.length}
          onRengerate={regenerateLastMessage}
          isProcessing={streaming}
          isSearchingInternet={isSearchingInternet}
          sources={message.sources}
        />
      ))}
      {messages.length > 0 && (
        <div className="w-full h-32 md:h-48 flex-shrink-0"></div>
      )}
      <div ref={divRef} />
    </div>
  )
}
