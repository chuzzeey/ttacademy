"use client"

import { useCallback, useEffect, useRef, useState, type RefObject } from "react"

type ScrollableMessage = { id: string }

export function useClassroomChatScroll<T extends ScrollableMessage>(
  messages: T[],
  containerRef: RefObject<HTMLElement | null>,
  isReady: boolean,
  isMine: (message: T) => boolean,
) {
  const [newMessageCount, setNewMessageCount] = useState(0)
  const initializedRef = useRef(false)
  const knownIdsRef = useRef(new Set<string>())
  const unreadCountRef = useRef(0)
  const isMineRef = useRef(isMine)
  isMineRef.current = isMine

  const scrollToLatest = useCallback((behavior: ScrollBehavior = "smooth") => {
    const container = containerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior })
    unreadCountRef.current = 0
    setNewMessageCount(0)
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!isReady || !container) return

    const currentIds = new Set(messages.map((message) => message.id))
    if (!initializedRef.current) {
      knownIdsRef.current = currentIds
      initializedRef.current = true
      scrollToLatest("instant")
      return
    }

    const addedMessages = messages.filter((message) => !knownIdsRef.current.has(message.id))
    knownIdsRef.current = currentIds
    if (addedMessages.length === 0) return

    const hasOwnMessage = addedMessages.some((message) => isMineRef.current(message))
    const isNearLatest = container.scrollHeight - container.scrollTop - container.clientHeight < 96
    if (hasOwnMessage || isNearLatest) {
      scrollToLatest()
      return
    }

    const incomingCount = addedMessages.filter((message) => !isMineRef.current(message)).length
    if (incomingCount > 0) {
      unreadCountRef.current += incomingCount
      setNewMessageCount(unreadCountRef.current)
    }
  }, [containerRef, isReady, messages, scrollToLatest])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      if (container.scrollHeight - container.scrollTop - container.clientHeight < 48) {
        unreadCountRef.current = 0
        setNewMessageCount(0)
      }
    }
    container.addEventListener("scroll", handleScroll, { passive: true })
    return () => container.removeEventListener("scroll", handleScroll)
  }, [containerRef])

  return { newMessageCount, scrollToLatest }
}
