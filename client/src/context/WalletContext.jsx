import { createContext, useContext, useState, useCallback } from 'react'
import { connectWallet } from '../services/blockchain'

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const [wallet, setWallet] = useState(null)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')

  const connect = useCallback(async () => {
    setConnecting(true)
    setError('')
    try {
      const result = await connectWallet()
      setWallet(result)
      return result
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    setWallet(null)
  }, [])

  return (
    <WalletContext.Provider value={{ wallet, connecting, error, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  )
}

export const useWallet = () => useContext(WalletContext)