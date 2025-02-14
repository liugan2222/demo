import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosRequestConfig, Method } from 'axios'

const API_BASE_URL = 'http://47.88.28.103:1023/api'

// TODO: Implement token management
const getToken = () => {
  // Implement token retrieval/generation logic
  return 'your-token-here'
}

// TODO: Implement response authorization check
const isAuthorized = (response: any) => {
  // Implement authorization check logic
  if (response) console.log(response)
  return true
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method, query, body } = req
  const { proxy } = query

  if (!proxy || !Array.isArray(proxy)) {
    return res.status(400).json({ message: 'Invalid API route' })
  }

  const path = proxy.join('/')

  try {
    const token = getToken()
    console.log(token)
    
    const config: AxiosRequestConfig = {
      method: method as Method,
      url: `${API_BASE_URL}/${path}`,
      headers: {
        // 'Content-Type': 'application/json',
        'accept': 'application/json',
        'X-TenantID': 'X',
        // 'Authorization': `Bearer ${token}`,
        // TODO: Add any other necessary headers
      },
      params: { ...query, proxy: undefined },
      data: body,
    }

    const response = await axios(config)

    // TODO: Implement more sophisticated error handling
    if (!isAuthorized(response.data)) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.status(response.status).json(response.data)
  } catch (error: any) {
    console.error('API request error:', error.response?.data || error.message)
    res.status(error.response?.status || 500).json({ message: error.response?.data?.message || 'Internal server error' })
  }
}