export type ClassroomReaction = {
  emoji: string
  count: number
  reacted: boolean
}

export function toggleClassroomReaction(
  reactions: ClassroomReaction[],
  emoji: string,
): ClassroomReaction[] {
  const currentReaction = reactions.find((reaction) => reaction.reacted)
  const selectedReaction = reactions.find((reaction) => reaction.emoji === emoji)

  if (currentReaction?.emoji === emoji) {
    return reactions
      .map((reaction) => reaction.emoji === emoji
        ? { ...reaction, count: reaction.count - 1, reacted: false }
        : reaction)
      .filter((reaction) => reaction.count > 0)
  }

  const next = reactions
    .map((reaction) => reaction.emoji === currentReaction?.emoji
      ? { ...reaction, count: reaction.count - 1, reacted: false }
      : reaction)
    .filter((reaction) => reaction.count > 0)
  const nextSelected = next.find((reaction) => reaction.emoji === emoji)
  if (nextSelected) {
    return next.map((reaction) => reaction.emoji === emoji
      ? { ...reaction, count: reaction.count + 1, reacted: true }
      : reaction)
  }

  return [...next, { emoji, count: (selectedReaction?.count ?? 0) + 1, reacted: true }]
}
