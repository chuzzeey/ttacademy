import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server-admin"
import { COURSE_CATALOG } from "@/lib/course-catalog"

export const runtime = "nodejs"

const maxFileSize = 15 * 1024 * 1024
const allowedTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
])

export async function POST(request: NextRequest) {
  let supabase: Awaited<ReturnType<typeof createAdminClient>> | undefined
  let uploadedPath: string | undefined
  try {
    const formData = await request.formData()
    const course = formData.get("course")
    const studentCode = formData.get("studentCode")
    const proof = formData.get("proof")
    if (
      typeof course !== "string" ||
      !COURSE_CATALOG.some(({ title }) => title.toLowerCase() === course) ||
      typeof studentCode !== "string" ||
      studentCode.trim().length < 4 ||
      studentCode.trim().length > 40 ||
      !(proof instanceof File)
    ) {
      return NextResponse.json({ error: "Choose your course, enter your student ID, and select a receipt image." }, { status: 400 })
    }
    const extension = allowedTypes.get(proof.type)
    if (!extension) {
      return NextResponse.json({ error: "Upload a JPG, PNG, WebP, AVIF, or GIF image." }, { status: 415 })
    }
    if (!proof.size || proof.size > maxFileSize) {
      return NextResponse.json({ error: "The image must be smaller than 15 MB." }, { status: 413 })
    }

    supabase = await createAdminClient()
    const { data: student, error: studentError } = await supabase
      .from("students")
      .select("id,student_code,name,email,course,payment_status")
      .eq("student_code", studentCode.trim().toUpperCase())
      .maybeSingle()
    if (studentError) {
      console.error("Payment proof student lookup failed:", studentError)
      return NextResponse.json({ error: "Unable to verify your student ID right now." }, { status: 500 })
    }
    if (!student) {
      return NextResponse.json({ error: "We couldn't find this student ID. Check it and try again." }, { status: 404 })
    }
    if (student.payment_status?.trim().toLowerCase() === "fully paid") {
      return NextResponse.json({ error: "Our records already show this course as fully paid. Contact the Academy if you need help." }, { status: 409 })
    }
    if ((student.course || "").trim().toLowerCase() !== course) {
      const actualCourse = COURSE_CATALOG.find(({ title }) => title.toLowerCase() === student.course?.trim().toLowerCase())?.title
      return NextResponse.json({ error: actualCourse
        ? `This student ID belongs to ${actualCourse}, not ${course}.`
        : "This student ID isn't registered for the selected course." }, { status: 409 })
    }

    const { data: existingProof, error: existingError } = await supabase
      .from("payment_proofs")
      .select("id")
      .eq("student_id", student.id)
      .in("status", ["pending", "processing"])
      .maybeSingle()
    if (existingError) {
      console.error("Payment proof duplicate check failed:", existingError)
      return NextResponse.json({ error: "Unable to check for an existing submission." }, { status: 500 })
    }
    if (existingProof) {
      return NextResponse.json({ error: "A payment proof for this student is already awaiting review." }, { status: 409 })
    }

    uploadedPath = `${student.id}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage
      .from("payment-proofs")
      .upload(uploadedPath, proof, { contentType: proof.type, upsert: false })
    if (uploadError) {
      console.error("Payment proof image upload failed:", uploadError)
      return NextResponse.json({ error: "Unable to upload this image. Please try again." }, { status: 500 })
    }

    const { error: insertError } = await supabase.from("payment_proofs").insert({
      student_id: student.id,
      student_code: student.student_code,
      student_name: student.name || "Learner",
      student_email: student.email,
      course: student.course,
      storage_path: uploadedPath,
      mime_type: proof.type,
      file_size: proof.size,
    })
    if (insertError) {
      console.error("Payment proof record insert failed:", insertError)
      const { error: cleanupError } = await supabase.storage.from("payment-proofs").remove([uploadedPath])
      if (cleanupError) console.error("Unrecorded payment proof image cleanup failed:", cleanupError)
      return NextResponse.json({ error: insertError.code === "23505"
        ? "A payment proof for this student is already awaiting review."
        : "Unable to save your payment proof. Please try again." }, { status: insertError.code === "23505" ? 409 : 500 })
    }

    return NextResponse.json({ submitted: true }, { status: 201 })
  } catch (error) {
    console.error("Payment proof submission request failed:", error)
    if (supabase && uploadedPath) {
      const { error: cleanupError } = await supabase.storage.from("payment-proofs").remove([uploadedPath])
      if (cleanupError) console.error("Payment proof image cleanup failed:", cleanupError)
    }
    return NextResponse.json({ error: "Unable to submit your payment proof. Please try again." }, { status: 500 })
  }
}
