"use client"

function announcementKey(course: string, userId: string) {
  return `ttacademy-classroom-${course}-${userId}-announcement`
}

async function sendAnnouncement(course: string, content: string) {
  const response = await fetch("/api/messages/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ course, content }),
    keepalive: true,
  })
  if (!response.ok) {
    throw new Error(`Classroom announcement failed: ${await response.text()}`)
  }
}

export async function announceClassroomJoin(course: string, userId: string, name: string) {
  const key = announcementKey(course, userId)
  if (window.sessionStorage.getItem(key) === "active") return

  window.sessionStorage.setItem(key, "active")
  try {
    await sendAnnouncement(course, `${name} joined the class.`)
  } catch (error) {
    window.sessionStorage.removeItem(key)
    throw error
  }
}

export async function announceClassroomLeave(course: string, userId: string, name: string) {
  const key = announcementKey(course, userId)
  if (window.sessionStorage.getItem(key) !== "active") return

  await sendAnnouncement(course, `${name} left the class.`)
  window.sessionStorage.removeItem(key)
}
