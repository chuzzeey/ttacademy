import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, update } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const supabase = await createAdminClient();

    // If update flag is set, update existing user
    if (update) {
      // First, find the user by email
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      
      if (listError) {
        console.error("Error listing users:", listError);
        return NextResponse.json(
          { error: "Failed to find user" },
          { status: 500 }
        );
      }

      const existingUser = users?.users?.find(u => u.email === email.trim().toLowerCase())

      if (!existingUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Update the user's password
      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password: password,
        user_metadata: {
          name: name || existingUser.user_metadata?.name || "Admin",
          role: "admin"
        }
      })

      if (error) {
        console.error("Error updating admin user:", error);
        return NextResponse.json(
          { error: error.message || "Failed to update admin user" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        {
          message: "Admin user updated successfully",
          user: {
            id: data.user.id,
            email: data.user.email,
            role: data.user.user_metadata?.role
          }
        },
        { status: 200 }
      );
    }

    // Create the admin user in Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password,
      email_confirm: true,
      user_metadata: {
        name: name || "Admin",
        role: "admin"
      }
    });

    if (error) {
      console.error("Error creating admin user:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create admin user" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Admin user created successfully",
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.user_metadata?.role
        }
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Create admin error:", message);
    return NextResponse.json(
      { error: "An error occurred while creating admin user" },
      { status: 500 }
    );
  }
}
