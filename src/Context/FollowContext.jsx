import { createContext, useContext, useEffect, useState } from 'react'

const FollowContext = createContext(null)

const STORAGE_KEY = 'agbayemaara.followed-brands'

const readStoredBrands = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export const FollowProvider = ({ children }) => {
  const [followedBrands, setFollowedBrands] = useState(readStoredBrands)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(followedBrands))
    } catch {
      // localStorage unavailable (private mode / quota) — follow state just won't persist
    }
  }, [followedBrands])

  const followBrand = (slug) => {
    setFollowedBrands((prev) =>
      prev.includes(slug) ? prev : [...prev, slug]
    )
  }

  const unfollowBrand = (slug) => {
    setFollowedBrands((prev) => prev.filter((item) => item !== slug))
  }

  const toggleFollowBrand = (slug) => {
    setFollowedBrands((prev) =>
      prev.includes(slug)
        ? prev.filter((item) => item !== slug)
        : [...prev, slug]
    )
  }

  const isFollowing = (slug) => followedBrands.includes(slug)

  return (
    <FollowContext.Provider
      value={{
        followedBrands,
        followBrand,
        unfollowBrand,
        toggleFollowBrand,
        isFollowing,
      }}
    >
      {children}
    </FollowContext.Provider>
  )
}

export const useFollow = () => {
  const ctx = useContext(FollowContext)
  if (!ctx) throw new Error('useFollow must be used within FollowProvider')
  return ctx
}
