import { useQuery } from "@tanstack/react-query"
import { RotateCcw } from "lucide-react"
import { useEffect, useState } from "react"
import {
  getOllamaURL,
  isOllamaRunning,
  setOllamaURL as saveOllamaURL
} from "~services/ollama"

export const PlaygroundEmpty = () => {
  const [ollamaURL, setOllamaURL] = useState<string>("")
  const {
    data: ollamaInfo,
    status: ollamaStatus,
    refetch,
    isRefetching
  } = useQuery({
    queryKey: ["ollamaStatus"],
    queryFn: async () => {
      const ollamaURL = await getOllamaURL()
      const isOk = await isOllamaRunning()

      return {
        isOk,
        ollamaURL
      }
    }
  })

  useEffect(() => {
    if (ollamaInfo?.ollamaURL) {
      setOllamaURL(ollamaInfo.ollamaURL)
    }
  }, [ollamaInfo])

  return (
    <div className="mx-auto sm:max-w-xl px-4 mt-10">
      <div className="rounded-lg justify-center items-center flex flex-col border p-8 bg-white dark:bg-[#262626] shadow-sm dark:border-gray-600">
        {(ollamaStatus === "pending" || isRefetching) && (
          <div className="inline-flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
            <p className="dark:text-gray-400 text-gray-900">
              Searching for Your Ollama 🦙
            </p>
          </div>
        )}
        {!isRefetching && ollamaStatus === "success" ? (
          ollamaInfo.isOk ? (
            <div className="inline-flex  items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <p className="dark:text-gray-400 text-gray-900">
                Ollama is running 🦙
              </p>
            </div>
          ) : (
            <div className="flex flex-col space-y-2 justify-center items-center">
              <div className="inline-flex  space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <p className="dark:text-gray-400 text-gray-900">
                  Unable to connect to Ollama 🦙
                </p>
              </div>

              <input
                className="bg-gray-100 dark:bg-[#262626] dark:text-gray-100 rounded-md px-4 py-2 mt-2 w-full"
                type="url"
                value={ollamaURL}
                onChange={(e) => setOllamaURL(e.target.value)}
              />

              <button
                onClick={() => {
                  saveOllamaURL(ollamaURL)
                  refetch()
                }}
                className="inline-flex mt-4 items-center rounded-md border border-transparent bg-black px-2 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-white dark:text-gray-800 dark:hover:bg-gray-100 dark:focus:ring-gray-500 dark:focus:ring-offset-gray-100 disabled:opacity-50 ">
                <RotateCcw className="h-4 w-4 mr-3" />
                Retry
              </button>
            </div>
          )
        ) : null}
      </div>
    </div>
  )
}
