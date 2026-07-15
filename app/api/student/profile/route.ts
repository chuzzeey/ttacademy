import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Get student data from sessionStorage (sent via cookie or header)
    const studentData = request.headers.get('x-student-data');
    
    if (!studentData) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    try {
      const student = JSON.parse(studentData);
      return NextResponse.json(
        { data: student },
        { status: 200 }
      );
    } catch (err) {
      return NextResponse.json(
        { error: "Invalid session data" },
        { status: 401 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Profile fetch error:", message);
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}