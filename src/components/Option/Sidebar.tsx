import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  PageAssitDatabase,
  formatToChatHistory,
  formatToMessage,
  deleteByHistoryId,
  updateHistory
} from "~libs/db"
import { Empty, Skeleton } from "antd"
import { useMessageOption } from "~hooks/useMessageOption"
import { useState } from "react"
import { PencilIcon, Trash2 } from "lucide-react"

type Props = {}

export const Sidebar = ({}: Props) => {
  const { setMessages, setHistory, setHistoryId, historyId, clearChat } =
    useMessageOption()
  const [processingId, setProcessingId] = useState<string>("")
  const client = useQueryClient()

  const { data: chatHistories, status } = useQuery({
    queryKey: ["fetchChatHistory"],
    queryFn: async () => {
      const db = new PageAssitDatabase()
      const history = await db.getChatHistories()
      return history
    }
  })

  const { isPending: isDeleting, mutate: deleteHistory } = useMutation({
    mutationKey: ["deleteHistory"],
    mutationFn: deleteByHistoryId,
    onSuccess: (history_id) => {
      client.invalidateQueries({
        queryKey: ["fetchChatHistory"]
      })
      setProcessingId("")
      if (historyId === history_id) {
        clearChat()
      }
    }
  })

  const { isPending: isEditing, mutate: editHistory } = useMutation({
    mutationKey: ["editHistory"],
    mutationFn: async (data: { id: string; title: string }) => {
      return await updateHistory(data.id, data.title)
    },
    onSuccess: () => {
      client.invalidateQueries({
        queryKey: ["fetchChatHistory"]
      })
      setProcessingId("")
    }
  })

  return (
    <div className="overflow-y-auto z-99">
      {status === "success" && chatHistories.length === 0 && (
        <div className="flex justify-center items-center mt-20 overflow-hidden">
          <Empty description="No history yet" />
        </div>
      )}
      {status === "pending" && (
        <div className="flex justify-center items-center mt-5">
          <Skeleton active paragraph={{ rows: 8 }} />
        </div>
      )}
      {status === "error" && (
        <div className="flex justify-center items-center">
          <span className="text-red-500">Error loading history</span>
        </div>
      )}
      {status === "success" && chatHistories.length > 0 && (
        <div className="flex flex-col gap-2">
          {chatHistories.map((chat, index) => (
            <div
              key={index}
              className="flex py-2 px-2 items-start gap-3 relative rounded-md truncate hover:pr-4 group transition-opacity duration-300 ease-in-out   bg-gray-100 dark:bg-[#232222] dark:text-gray-100 text-gray-800 border hover:bg-gray-200 dark:hover:bg-[#2d2d2d] dark:border-gray-800">
              <button
                className="flex-1 overflow-hidden break-all text-start truncate w-full"
                onClick={async () => {
                  const db = new PageAssitDatabase()
                  const history = await db.getChatHistory(chat.id)
                  setHistoryId(chat.id)
                  setHistory(formatToChatHistory(history))
                  setMessages(formatToMessage(history))
                }}>
                <span className="flex-grow truncate">{chat.title}</span>
              </button>
              <div className="flex flex-row gap-3">
                <button
                  onClick={() => {
                    const newTitle = prompt("Enter new title", chat.title)

                    if (newTitle) {
                      editHistory({ id: chat.id, title: newTitle })
                    }

                    setProcessingId(chat.id)
                  }}
                  className="text-gray-500 dark:text-gray-400 opacity-80">
                  <PencilIcon className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    if (
                      !confirm("Are you sure you want to delete this history?")
                    )
                      return
                    deleteHistory(chat.id)
                    setProcessingId(chat.id)
                  }}
                  className="text-red-500 dark:text-red-400 opacity-80">
                  <Trash2 className=" w-4 h-4 " />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
