import { NextRequest, NextResponse } from "next/server";
import { AuthService } from "@/service/auth";

export async function POST(request: NextRequest) {
  try {
    // Clear auth cookie
    const result = await AuthService.logout();

    const response = NextResponse.json({
      success: true,
      message: result.message
    });

    // Clear auth cookies in response
    response.cookies.set({
      name: 'auth_token',
      value: '',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0 // Expire immediately
    });

    return response;

  } catch (error) {
    console.error("Logout API error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "Internal server error" 
      },
      { status: 500 }
    );
  }
}
