import {
  type ChatHistory as ChatHistoryType,
  type Message as MessageType
} from "~store/option"

type HistoryInfo = {
  id: string
  title: string
  createdAt: number
}

type WebSearch = {
  search_engine: string
  search_url: string
  search_query: string
  search_results: {
    title: string
    link: string
  }[]
}

type Message = {
  id: string
  history_id: string
  name: string
  role: string
  content: string
  images?: string[]
  sources?: string[]
  search?: WebSearch
  createdAt: number
}


type Prompt = {
  id: string
  title: string
  content: string
  is_system: boolean
  createdBy?: string
  createdAt: number
}

type MessageHistory = Message[]

type ChatHistory = HistoryInfo[]

type Prompts = Prompt[]

export class PageAssitDatabase {
  db: chrome.storage.StorageArea

  constructor() {
    this.db = chrome.storage.local
  }

  async getChatHistory(id: string): Promise<MessageHistory> {
    return new Promise((resolve, reject) => {
      this.db.get(id, (result) => {
        resolve(result[id] || [])
      })
    })
  }

  async getChatHistories(): Promise<ChatHistory> {
    return new Promise((resolve, reject) => {
      this.db.get("chatHistories", (result) => {
        resolve(result.chatHistories || [])
      })
    })
  }

  async addChatHistory(history: HistoryInfo) {
    const chatHistories = await this.getChatHistories()
    const newChatHistories = [history, ...chatHistories]
    this.db.set({ chatHistories: newChatHistories })
  }

  async addMessage(message: Message) {
    const history_id = message.history_id
    const chatHistory = await this.getChatHistory(history_id)
    const newChatHistory = [message, ...chatHistory]
    this.db.set({ [history_id]: newChatHistory })
  }

  async removeChatHistory(id: string) {
    const chatHistories = await this.getChatHistories()
    const newChatHistories = chatHistories.filter(
      (history) => history.id !== id
    )
    this.db.set({ chatHistories: newChatHistories })
  }

  async removeMessage(history_id: string, message_id: string) {
    const chatHistory = await this.getChatHistory(history_id)
    const newChatHistory = chatHistory.filter(
      (message) => message.id !== message_id
    )
    this.db.set({ [history_id]: newChatHistory })
  }

  async clear() {
    this.db.clear()
  }

  async deleteChatHistory() {
    const chatHistories = await this.getChatHistories()
    for (const history of chatHistories) {
      this.db.remove(history.id)
    }
    this.db.remove("chatHistories")
  }

  async deleteMessage(history_id: string) {
    await this.db.remove(history_id)
  }


  async getAllPrompts(): Promise<Prompts> {
    return new Promise((resolve, reject) => {
      this.db.get("prompts", (result) => {
        resolve(result.prompts || [])
      })
    })
  }

  async addPrompt(prompt: Prompt) {
    const prompts = await this.getAllPrompts()
    const newPrompts = [prompt, ...prompts]
    this.db.set({ prompts: newPrompts })
  }

  async deletePrompt(id: string) {
    const prompts = await this.getAllPrompts()
    const newPrompts = prompts.filter((prompt) => prompt.id !== id)
    this.db.set({ prompts: newPrompts })
  }

  async updatePrompt(id: string, title: string, content: string, is_system: boolean) {
    const prompts = await this.getAllPrompts()
    const newPrompts = prompts.map((prompt) => {
      if (prompt.id === id) {
        prompt.title = title
        prompt.content = content
        prompt.is_system = is_system
      }
      return prompt
    })
    this.db.set({ prompts: newPrompts })
  }

  async getPromptById(id: string) {
    const prompts = await this.getAllPrompts()
    return prompts.find((prompt) => prompt.id === id)
  }

}


const generateID = () => {
  return "pa_xxxx-xxxx-xxx-xxxx".replace(/[x]/g, () => {
    const r = Math.floor(Math.random() * 16)
    return r.toString(16)
  })
}

export const saveHistory = async (title: string) => {
  const id = generateID()
  const createdAt = Date.now()
  const history = { id, title, createdAt }
  const db = new PageAssitDatabase()
  await db.addChatHistory(history)
  return history
}

export const saveMessage = async (
  history_id: string,
  name: string,
  role: string,
  content: string,
  images: string[],
  source?: any[]
) => {
  const id = generateID()
  const createdAt = Date.now()
  const message = { id, history_id, name, role, content, images, createdAt, sources: source }
  const db = new PageAssitDatabase()
  await db.addMessage(message)
  return message
}

export const formatToChatHistory = (
  messages: MessageHistory
): ChatHistoryType => {
  messages.sort((a, b) => a.createdAt - b.createdAt)
  return messages.map((message) => {
    return {
      content: message.content,
      role: message.role as "user" | "assistant" | "system",
      images: message.images
    }
  })
}

export const formatToMessage = (messages: MessageHistory): MessageType[] => {
  messages.sort((a, b) => a.createdAt - b.createdAt)
  return messages.map((message) => {
    return {
      isBot: message.role === "assistant",
      message: message.content,
      name: message.name,
      sources: message?.sources || [],
      images: message.images || []
    }
  })
}

export const deleteByHistoryId = async (history_id: string) => {
  const db = new PageAssitDatabase()
  await db.deleteMessage(history_id)
  await db.removeChatHistory(history_id)
  return history_id
}

export const updateHistory = async (id: string, title: string) => {
  const db = new PageAssitDatabase()
  const chatHistories = await db.getChatHistories()
  const newChatHistories = chatHistories.map((history) => {
    if (history.id === id) {
      history.title = title
    }
    return history
  })
  db.db.set({ chatHistories: newChatHistories })
}

export const removeMessageUsingHistoryId = async (history_id: string) => {
  // remove the last message
  const db = new PageAssitDatabase()
  const chatHistory = await db.getChatHistory(history_id)
  const newChatHistory = chatHistory.slice(0, -1)
  await db.db.set({ [history_id]: newChatHistory })
}


export const getAllPrompts = async () => {
  const db = new PageAssitDatabase()
  return await db.getAllPrompts()
}


export const savePrompt = async ({ content, title, is_system = false }: { title: string, content: string, is_system: boolean }) => {
  const db = new PageAssitDatabase()
  const id = generateID()
  const createdAt = Date.now()
  const prompt = { id, title, content, is_system, createdAt }
  await db.addPrompt(prompt)
  return prompt
}


export const deletePromptById = async (id: string) => {
  const db = new PageAssitDatabase()
  await db.deletePrompt(id)
  return id
}


export const updatePrompt = async ({ content, id, title, is_system }: { id: string, title: string, content: string, is_system: boolean }) => {
  const db = new PageAssitDatabase()
  await db.updatePrompt(id, title, content, is_system)
  return id
}


export const getPromptById = async (id: string) => {
  if (!id || id.trim() === "") return null
  const db = new PageAssitDatabase()
  return await db.getPromptById(id)
}