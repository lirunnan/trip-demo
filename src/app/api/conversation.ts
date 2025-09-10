
import { fetchApi } from "./fetch"

// 开发环境使用代理路径，生产环境使用完整URL
const BASE_URL = process.env.NODE_ENV === 'development' 
    ? '/api/proxy'  // 开发环境使用代理
    : 'http://101.32.77.73:8085/api';  // 生产环境直接访问

export const generateConversationId = (): string => {
    return crypto.randomUUID()
}

interface ConversationResponse {
    code: number,
    data: any,
    msg: string,
    timestamp: number
}

export const postConversations = (conversationId: string, query: string) => {
    return fetchApi<ConversationResponse>(
        `${BASE_URL}/conversations`, 
        'POST',
        {
            conversationId,
            query
        }
    )
}

export const getConversations = () => {
    return fetchApi<ConversationResponse>(
        `${BASE_URL}/conversations`, 
        'GET'
    )
}

export const getConverstionsById = (id: string) => {
    return fetchApi<ConversationResponse>(
        `${BASE_URL}/conversations/${id}`, 
        'GET'
    )
}