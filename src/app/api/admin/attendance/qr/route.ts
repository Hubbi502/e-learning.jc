import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

// POST: Generate QR code image for a meeting
export async function POST(request: NextRequest) {
  try {
    const { payload } = await request.json();

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Payload is required" },
        { status: 400 }
      );
    }

    // Generate QR code as data URL (base64 image)
    const qrCodeDataURL = await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H", // High error correction
    });

    return NextResponse.json({
      success: true,
      qrCodeImage: qrCodeDataURL,
      payload: payload,
    });
  } catch (error) {
    console.error("Generate QR code error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

// GET: Generate QR code for a specific meeting ID from query params
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const payload = searchParams.get("payload");

    if (!payload) {
      return NextResponse.json(
        { success: false, message: "Payload query parameter is required" },
        { status: 400 }
      );
    }

    // Generate QR code as data URL (base64 image)
    const qrCodeDataURL = await QRCode.toDataURL(payload, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      errorCorrectionLevel: "H",
    });

    return NextResponse.json({
      success: true,
      qrCodeImage: qrCodeDataURL,
      payload: payload,
    });
  } catch (error) {
    console.error("Generate QR code error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}
