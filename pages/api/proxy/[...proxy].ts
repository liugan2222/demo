import type { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosRequestConfig, Method } from 'axios'

// 
const getBaseUrl = (path: string) => {
  // if (path.startsWith('files/')) {
    // return 'http://47.88.28.103:8080/api'

  //  totest
  // if (path.startsWith('importLocations')) {
  //   return 'http://127.0.0.1:8090/api' // 

  // }
  if (path)
  return 'http://47.88.28.103:1023/api' //
}


// TODO: Implement token management
// const getToken = () => {
//   // Implement token retrieval/generation logic
//   return 'your-token-here'
// }

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

  const API_BASE_URL = getBaseUrl(path)

  try {
    // const token = getToken()
    console.log(API_BASE_URL)
    console.log(path)
    
    const config: AxiosRequestConfig = {
      method: method as Method,
      url: `${API_BASE_URL}/${path}`,
      headers: {
        // 'Content-Type': 'application/json',
        // 'accept': 'application/json',
        // ...req.headers,
         // 选择性透传头，避免覆盖关键头
        ...(req.headers['content-type'] && { 
          'Content-Type': req.headers['content-type'] 
        }),
        'X-TenantID': 'X',
        // ...(req.headers['content-type']?.startsWith('multipart/form-data')
        //   ? { 'Content-Type': req.headers['content-type'] } // 保留完整Content-Type
        //   : { 'Content-Type': req.headers['content-type'] || 'application/json' }
        // ),
        // ...({ 'Content-Type': req.headers['content-type'] || 'application/json' }),
        // 'Authorization': `Bearer ${token}`,
      },
      params: { ...query, proxy: undefined },
      data: body,
      maxBodyLength: Infinity, // 确保大文件上传不受限制
      maxContentLength: Infinity, // 确保大文件上传不受限制
    }

    const response = await axios(config)

    console.log(config.headers)


    // TODO: Implement more sophisticated error handling
    if (!isAuthorized(response.data)) {
      return res.status(403).json({ message: 'Unauthorized' })
    }

    res.status(response.status).json(response.data)
  } catch (error: any) {
    // console.error('API request error:', error.response?.data || error.message)
    // const jsonString = JSON.stringify(error);
    res.status(error.response?.status || 500).json({ message: error.message || 'Internal server error' })
  }
}