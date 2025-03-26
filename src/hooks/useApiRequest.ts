'use client'
import axios, { AxiosInstance, AxiosRequestConfig, Method } from 'axios'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from './use-toast'

type RequestOptions = {
  url: string
  method?: Method
  data?: any
  params?: any
  requiresAuth?: boolean
  customHeaders?: Record<string, string>
  baseURL?: string
  successMessage?: string
  errorMessage?: string
  showToast?: boolean
}

type RequestResponse<T = any> = {
  success: boolean
  message: string
  data?: T
  statusCode?: number
}

type UseApiRequestReturn<T> = {
  loading: boolean
  error: string | null
  data: T | null
  statusCode: number | null
  apiRequest: (options: RequestOptions) => Promise<RequestResponse<T>>
  reset: () => void
}

export const useApiRequest = <T = any>(): UseApiRequestReturn<T> => {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<T | null>(null)
  const [statusCode, setStatusCode] = useState<number | null>(null)

  const apiClientRef = useRef<AxiosInstance | null>(null)
  const isRefreshingRef = useRef<boolean>(false)
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null)
  const requestQueueRef = useRef<Array<() => void>>([])

  useEffect(() => {
    const apiClient = axios.create({
      baseURL: process.env.NEXT_PUBLIC_BASE_URL,
    })

    apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 403 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const newToken = await refreshAccessToken()

            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              return apiClient(originalRequest)
            } else {
              localStorage?.removeItem('mbxchange')
              router.push('/login')
              return Promise.reject(new Error('Session expired. Please login again.'))
            }
          } catch (refreshError) {
            localStorage?.removeItem('mbxchange')
            router.push('/login')
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )

    apiClientRef.current = apiClient

    return () => {
      apiClientRef.current = null
    }
  }, [router])

  const refreshAccessToken = async (): Promise<string | null> => {
    if (isRefreshingRef.current) return refreshPromiseRef.current

    isRefreshingRef.current = true
    refreshPromiseRef.current = new Promise<string | null>(async (resolve) => {
      try {
        const storedData = typeof window !== 'undefined' ? localStorage.getItem('mbxchange') : null

        if (!storedData) {
          resolve(null)
          return
        }

        const userData = JSON.parse(storedData)
        const refreshToken = userData?.refreshToken
        if (!refreshToken) {
          resolve(null)
          return
        }

        const response = await axios({
          method: 'POST',
          url: '/refresh',
          baseURL: process.env.NEXT_PUBLIC_BASE_URL,
          data: { refreshToken },
        })

        if (response.data.success && response.data.data?.accessToken) {
          const newAccessToken = response.data.data.accessToken
          const updatedUserData = {
            refreshToken,
            accessToken: newAccessToken,
          }

          localStorage.setItem('mbxchange', JSON.stringify(updatedUserData))
          requestQueueRef.current.forEach((callback) => callback())
          requestQueueRef.current = []

          resolve(newAccessToken)
        } else resolve(null)
      } catch (error) {
        console.error('Token refresh failed:', error)
        resolve(null)
      } finally {
        isRefreshingRef.current = false
      }
    })
    return refreshPromiseRef.current
  }

  const reset = useCallback(() => {
    setLoading(false)
    setError(null)
    setData(null)
    setStatusCode(null)
  }, [])

  const apiRequest = useCallback(
    async (options: RequestOptions): Promise<RequestResponse<T>> => {
      const {
        url,
        method = 'GET',
        data = null,
        params = null,
        requiresAuth = !url.includes('admin-auth'),
        customHeaders = {},
        baseURL = process.env.NEXT_PUBLIC_BASE_URL,
        errorMessage,
        showToast,
        successMessage,
      } = options

      setLoading(true)
      setError(null)

      try {
        let headers: Record<string, string> = { ...customHeaders }

        if (requiresAuth) {
          const storedData = typeof window !== 'undefined' ? localStorage.getItem('mbxchange') : null
          const accessToken = storedData ? JSON.parse(storedData)?.accessToken : null

          if (!accessToken) {
            const response = {
              success: false,
              message: 'Invalid or missing access token',
              statusCode: 401,
            }
            setError(response.message)
            setStatusCode(response.statusCode)
            setLoading(false)
            return response
          }
          headers.Authorization = `Bearer ${accessToken}`
        }

        const config: AxiosRequestConfig = {
          method,
          url,
          baseURL,
          headers,
          ...(params && { params }),
          ...(data && { data }),
          withCredentials: true,
        }

        const axiosInstance = apiClientRef.current || axios
        const response = await axiosInstance(config)

        if (response?.data.success) {
          const result = {
            success: true,
            message: response.data.message || successMessage || 'Request successful',
            data: response.data.data,
            statusCode: response.status,
          }
          showToast &&
            !url.includes('login') &&
            toast({
              description: result.message,
              variant: 'success',
            })
          setData(result.data)
          setStatusCode(result.statusCode)
          setLoading(false)
          return result
        } else {
          const result = {
            success: false,
            message: response.data.message || errorMessage || 'Request failed',
            statusCode: response.status,
          }
          showToast &&
            toast({
              description: result.message,
              variant: 'destructive',
            })
          setError(result.message)
          setStatusCode(result.statusCode)
          setLoading(false)
          return result
        }
      } catch (error: any) {
        console.error('API request error:', error.message)

        const statusCode = error.response?.status
        const errMessage = error.response?.data?.message || error.message || errorMessage || 'Request failed'

        if (statusCode === 403) {
          localStorage?.removeItem('mbxchange')
          router.push('/login')
        }

        const result = {
          success: false,
          message: errMessage,
          statusCode,
        }
        showToast &&
          toast({
            description: errMessage,
            variant: 'destructive',
          })
        setError(errMessage)
        setStatusCode(statusCode || null)
        setLoading(false)
        return result
      }
    },
    [router]
  )

  return { loading, error, data, statusCode, apiRequest, reset }
}
