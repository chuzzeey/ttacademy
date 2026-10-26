"use client"

import { type ChangeEvent, type FormEvent, useEffect, useRef, useState } from "react"
import { PageHeader } from "../components/dashboard/page-header"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog"
import { useAdminProfile } from "@/lib/hooks/use-admin-profile"
import { Check, Copy, Eye, EyeOff, ImagePlus, KeyRound, LoaderCircle, Mail, ShieldCheck, UserRound } from "lucide-react"

export default function ProfilePage() {
  const { user, name: currentName, email, avatarUrl, isLoading, error: profileError, supabase } = useAdminProfile()
  const [name, setName] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSavingName, setIsSavingName] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordVerificationFailed, setPasswordVerificationFailed] = useState(false)
  const [passwordChanged, setPasswordChanged] = useState(false)
  const passwordSoundContext = useRef<AudioContext | null>(null)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const saveName = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!user) return
    const nextName = name.trim()
    if (!nextName) {
      setError("Enter a display name.")
      return
    }
    setIsSavingName(true)
    setMessage("")
    setError("")
    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { ...user.user_metadata, name: nextName },
      })
      if (updateError) throw updateError
      setName(nextName)
      setMessage("Profile name updated.")
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update the profile name.")
    } finally {
      setIsSavingName(false)
    }
  }

  const uploadPhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file || !user) return
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Choose an image that is 5 MB or smaller.")
      return
    }

    setIsUploadingPhoto(true)
    setError("")
    setMessage("")
    try {
      const formData = new FormData()
      formData.set("photo", file)
      const response = await fetch("/api/admin/profile-photo", { method: "POST", body: formData })
      const result: { avatarUrl?: string; error?: string } = await response.json()
      if (!response.ok || !result.avatarUrl) {
        throw new Error(result.error || "Unable to upload profile photo.")
      }
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        setMessage("Photo saved. Refresh the page to update it in the admin header.")
      } else {
        setMessage("Profile photo updated.")
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the profile photo.")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const verifyCurrentPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    if (!email || !currentPassword) {
      setError("Enter your current password.")
      return
    }

    setIsVerifyingPassword(true)
    try {
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      })
      if (verifyError) {
        const isCredentialError = /invalid login credentials|invalid credentials|wrong password/i.test(verifyError.message)
        if (isCredentialError) {
          setPasswordVerificationFailed(true)
          return
        }
        throw verifyError
      }
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordModalOpen(true)
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Unable to verify the current password.")
    } finally {
      setIsVerifyingPassword(false)
    }
  }

  const updatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setMessage("")
    if (newPassword.length < 8) {
      setError("Choose a password with at least 8 characters.")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("The new passwords do not match.")
      return
    }

    setIsSavingPassword(true)
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })
      if (updateError) throw updateError
      setPasswordChanged(true)
      try {
        const AudioContextConstructor = window.AudioContext
        if (AudioContextConstructor) {
          const context = passwordSoundContext.current ?? new AudioContextConstructor()
          passwordSoundContext.current = context
          if (context.state === "suspended") await context.resume()
          const oscillator = context.createOscillator()
          const gain = context.createGain()
          oscillator.type = "sine"
          oscillator.frequency.setValueAtTime(660, context.currentTime)
          oscillator.frequency.setValueAtTime(880, context.currentTime + 0.12)
          gain.gain.setValueAtTime(0.0001, context.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.35)
          oscillator.connect(gain)
          gain.connect(context.destination)
          oscillator.start()
          oscillator.stop(context.currentTime + 0.36)
        }
      } catch (soundError) {
        console.warn("Password-change confirmation sound could not play:", soundError)
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to change the password.")
    } finally {
      setIsSavingPassword(false)
    }

  }

  useEffect(() => {
    if (!passwordChanged) return
    const timeout = window.setTimeout(() => {
      setPasswordModalOpen(false)
      setPasswordChanged(false)
      setNewPassword("")
      setConfirmPassword("")
      setMessage("Password changed successfully.")
    }, 1800)
    return () => window.clearTimeout(timeout)
  }, [passwordChanged])

  useEffect(() => {
    setName(currentName)
  }, [currentName])

  const closePasswordModal = (open: boolean) => {
    if (isSavingPassword || passwordChanged) return
    setPasswordModalOpen(open)
    if (!open) {
      setNewPassword("")
      setConfirmPassword("")
      setError("")
    }
  }

  const copyEmail = async () => {
    if (!email) return
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setError("Unable to copy the email address. Check browser clipboard permissions.")
    }
  }

  return (
    <>
    <main className="space-y-6">
      <PageHeader title="Profile" description="Manage the administrator account used for this workspace." />

      {(profileError || error || message) && (
        <p role={profileError || error ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm ${
          profileError || error ? "border-rose-200 bg-rose-50 text-rose-800" : "border-emerald-200 bg-emerald-50 text-emerald-800"
        }`}>
          {error || profileError || message}
        </p>
      )}

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-2xl bg-muted/50" role="status" aria-label="Loading administrator profile" />
      ) : user ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.4fr)]">
          <Card className="dashboard-card h-fit">
            <CardContent className="flex flex-col items-center p-6 text-center">
              <Avatar className="h-24 w-24 ring-4 ring-emerald-50">
                <AvatarImage src={avatarUrl || undefined} alt={`${currentName} profile photo`} className="object-cover" />
                <AvatarFallback className="bg-emerald-50 text-xl font-semibold text-emerald-800">
                  {currentName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-medium transition hover:bg-muted">
                <ImagePlus className="h-4 w-4" />
                {isUploadingPhoto ? "Uploading photo…" : avatarUrl ? "Change photo" : "Add profile photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="sr-only"
                  disabled={isUploadingPhoto}
                  onChange={(event) => void uploadPhoto(event)}
                />
              </label>
              <p className="mt-1 text-[11px] text-muted-foreground">JPG, PNG, or WebP · max 5 MB · saved securely to Supabase</p>
              <h2 className="mt-3 text-lg font-semibold tracking-tight">{currentName}</h2>
              <p className="mt-1 max-w-full truncate text-sm text-muted-foreground">{email}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                <ShieldCheck className="h-3.5 w-3.5" /> Administrator account
              </span>
              <div className="mt-6 flex w-full items-center gap-3 border-t border-border/60 pt-5 text-left">
                <Mail className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm">{email}</span>
                <Button type="button" variant="ghost" size="icon" aria-label="Copy administrator email" onClick={() => void copyEmail()}>
                  {copied ? <Check className="h-4 w-4 text-emerald-700" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <Card className="dashboard-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><UserRound className="h-4 w-4 text-emerald-700" /> Profile information</CardTitle>
                <CardDescription>Your name and photo stay in sync across the admin header and sidebar.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={saveName} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Account email</Label>
                    <Input id="admin-email" value={email} readOnly aria-readonly="true" />
                    <p className="text-xs text-muted-foreground">Contact your Supabase administrator to change the sign-in email.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-name">Display name</Label>
                    <Input
                      id="admin-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      maxLength={80}
                      placeholder="Enter your display name"
                      autoComplete="name"
                      required
                    />
                    <p className="text-xs text-muted-foreground">This name is editable and appears in the admin profile and header. Only the account email is read-only.</p>
                  </div>
                  <Button type="submit" disabled={isSavingName || !name.trim() || name.trim() === currentName}>
                    {isSavingName ? "Saving…" : "Save profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="dashboard-card scroll-mt-24" id="security">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base"><KeyRound className="h-4 w-4 text-emerald-700" /> Change password</CardTitle>
                <CardDescription>Use a unique password with at least 8 characters.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={verifyCurrentPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={currentPassword}
                        onChange={(event) => {
                          setCurrentPassword(event.target.value)
                          setError("")
                        }}
                        placeholder="Enter your current password"
                        className="pr-11"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((visible) => !visible)}
                        aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                        aria-pressed={showCurrentPassword}
                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {showCurrentPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button type="submit" disabled={isVerifyingPassword || !currentPassword}>
                    {isVerifyingPassword && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                    {isVerifyingPassword ? "Verifying…" : "Continue"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </main>
    <Dialog open={passwordModalOpen} onOpenChange={closePasswordModal}>
      <DialogContent
        className="max-h-[90dvh] overflow-y-auto sm:max-w-md"
        showCloseButton={!isSavingPassword && !passwordChanged}
        onEscapeKeyDown={(event) => {
          if (isSavingPassword || passwordChanged) event.preventDefault()
        }}
        onPointerDownOutside={(event) => {
          if (isSavingPassword || passwordChanged) event.preventDefault()
        }}
      >
        {passwordChanged ? (
          <div className="flex flex-col items-center py-6 text-center" role="status" aria-live="polite">
            <span className="flex h-16 w-16 animate-in zoom-in-50 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              <Check className="h-9 w-9" strokeWidth={3} />
            </span>
            <DialogTitle className="mt-5 text-xl">Password changed</DialogTitle>
            <DialogDescription className="mt-2">Your account password was updated successfully.</DialogDescription>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Choose a new password</DialogTitle>
              <DialogDescription>
                Use at least 8 characters. A longer mix of words, numbers, and symbols is safer.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={updatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showNewPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    minLength={8}
                    placeholder="e.g. River!Maple7-Cloud"
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((visible) => !visible)}
                    aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                    aria-pressed={showNewPassword}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showNewPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    placeholder="Enter the new password again"
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((visible) => !visible)}
                    aria-label={showConfirmPassword ? "Hide confirmed password" : "Show confirmed password"}
                    aria-pressed={showConfirmPassword}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showConfirmPassword ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
              <Button type="submit" disabled={isSavingPassword || !newPassword || !confirmPassword} className="w-full">
                {isSavingPassword && <LoaderCircle aria-hidden="true" className="mr-2 h-4 w-4 animate-spin" />}
                {isSavingPassword ? "Changing password…" : "Change password"}
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
    <Dialog open={passwordVerificationFailed} onOpenChange={setPasswordVerificationFailed}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-rose-700">Current password is incorrect</DialogTitle>
          <DialogDescription>
            Check your current password and try again. Your password has not been changed.
          </DialogDescription>
        </DialogHeader>
        <Button
          type="button"
          onClick={() => {
            setPasswordVerificationFailed(false)
            setCurrentPassword("")
          }}
          className="w-full"
        >
          Try again
        </Button>
      </DialogContent>
    </Dialog>
    </>
  )
}
