import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { createClient } from "@/lib/supabase/server";
import { ADMIN_EMAIL } from "@/lib/supabase/admin-access";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, update } = body;

    if (typeof email !== "string" || typeof password !== "string" || !email.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || password.length < 8) {
      return NextResponse.json(
        { error: "Enter a valid email and a password of at least 8 characters" },
        { status: 400 }
      );
    }
    if (normalizedEmail !== ADMIN_EMAIL) {
      return NextResponse.json(
        { error: `Only ${ADMIN_EMAIL} can be provisioned as an administrator` },
        { status: 400 }
      );
    }

    const sessionClient = await createClient()
    const { data: { user }, error: authError } = await sessionClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication is required" }, { status: 401 })
    }

    if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
      const { data: profile, error: profileError } = await sessionClient
        .from('admin_profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error("Admin authorization lookup failed:", profileError)
        return NextResponse.json({ error: "Unable to verify admin access" }, { status: 500 })
      }

      if (!profile) {
        return NextResponse.json({ error: "Admin access is required" }, { status: 403 })
      }
    }

    const supabase = await createAdminClient()

    if (update) {
      const { data: users, error: listError } = await supabase.auth.admin.listUsers()
      if (listError) {
        console.error("Error listing users:", listError);
        return NextResponse.json(
          { error: "Failed to find user" },
          { status: 500 }
        );
      }

      const existingUser = users.users.find(u => u.email?.toLowerCase() === normalizedEmail)

      if (!existingUser) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
        password,
        user_metadata: {
          name: typeof name === 'string' && name.trim()
            ? name.trim()
            : existingUser.user_metadata?.name || "Admin",
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

      const { error: profileUpsertError } = await supabase
        .from('admin_profiles')
        .upsert({
          user_id: data.user.id,
          email: data.user.email?.toLowerCase() || normalizedEmail,
          full_name: typeof name === 'string' && name.trim()
            ? name.trim()
            : existingUser.user_metadata?.name || "Admin",
        }, { onConflict: 'user_id' })

      if (profileUpsertError) {
        console.error("Admin profile update failed:", profileUpsertError)
        return NextResponse.json(
          { error: "Admin account updated but profile could not be saved" },
          { status: 500 }
        )
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

    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: typeof name === 'string' && name.trim() ? name.trim() : "Admin",
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

    const { error: profileError } = await supabase
      .from('admin_profiles')
      .insert({
        user_id: data.user.id,
        email: normalizedEmail,
        full_name: typeof name === 'string' && name.trim() ? name.trim() : "Admin",
      })

    if (profileError) {
      console.error("Admin profile creation failed:", profileError)
      const { error: cleanupError } = await supabase.auth.admin.deleteUser(data.user.id)
      if (cleanupError) console.error("Failed to roll back new admin account:", cleanupError)
      return NextResponse.json(
        { error: "Admin account could not be saved to the admin table" },
        { status: 500 }
      )
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
