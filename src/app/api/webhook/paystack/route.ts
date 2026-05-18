import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { adminDb } from "@/lib/firebaseAdmin";

const secret = process.env.PAYSTACK_SECRET_KEY;
if (!secret) {
  throw new Error("CRITICAL: Missing PAYSTACK_SECRET_KEY environment variable");
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!secret || !signature) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hash = crypto.createHmac("sha512", secret).update(rawBody).digest("hex");
    if (signature.length !== hash.length || !crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature))) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody);
    if (event.event !== "charge.success") {
      return NextResponse.json({ success: true });
    }

    const { reference, metadata, amount } = event.data;
    
    // 1. Idempotency Check
    const paymentDoc = await adminDb.collection("payments").doc(reference).get();
    if (paymentDoc.exists) {
      return NextResponse.json({ success: true, message: "Already processed" });
    }

    // 2. Process based on metadata type
    if (!metadata || !metadata.uid) {
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const uid = metadata.uid;
    const type = metadata.type || 'upgrade'; // Default to upgrade for backward compatibility

    const NGN_AMOUNT = amount / 100;

    // SECURITY PATCH: Prevent micro-payment spoofing by enforcing a strict platform minimum boundary
    if (NGN_AMOUNT < 500) {
      console.error(`SECURITY THREAT: Suspiciously low micro-payment of NGN ${NGN_AMOUNT} for type ${type} by user ${uid}`);
      return NextResponse.json({ error: "Payment amount fails security thresholds." }, { status: 403 });
    }

    console.log(`Processing Paystack payment ${reference} of type ${type} for user ${uid}`);

    // Log the payment
    await adminDb.collection("payments").doc(reference).set({
      uid,
      amount: amount / 100,
      type,
      metadata,
      timestamp: new Date().toISOString(),
      status: 'success',
      processed: true
    });

    if (type === 'upgrade' || type === 'expert_upgrade') {
      const tier = metadata.tier;
      if (!tier) return NextResponse.json({ error: "Missing tier" }, { status: 400 });

      // SECURITY PATCH: Enforce approximate Tier pricing (Update these to perfectly match your frontend pricing strategy)
      if (tier === 'vip1' && NGN_AMOUNT < 3000) return NextResponse.json({ error: "Insufficient funds for VIP1" }, { status: 403 });
      if (tier === 'vip2' && NGN_AMOUNT < 8000) return NextResponse.json({ error: "Insufficient funds for VIP2" }, { status: 403 });

      // Calculate 30-day expiry for subscriptions
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + 30);

      const upgradeData: any = {
        tier: tier,
        subscriptionExpiry: expiryDate.toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Provision Features (Mirroring the logic from the upgrade route)
      if (tier === 'vip1') {
        upgradeData.vaultEnabled = true;
        upgradeData.aiChatUnlimited = true;
        upgradeData.prioritySearch = true;
      } else if (tier === 'vip2') {
        upgradeData.vaultEnabled = true;
        upgradeData.aiChatUnlimited = true;
        upgradeData.prioritySearch = true;
        upgradeData.familySlots = 4;
        upgradeData.videoConsultationsEnabled = true;
        upgradeData.expertQAUnlimited = true;
      }

      await adminDb.collection("users").doc(uid).update(upgradeData);
      console.log(`Successfully upgraded ${uid} to ${tier}`);
    } 
    else if (type === 'appointment') {
      // Create the appointment record from the webhook to ensure security
      const { expertId, date, time, expertName } = metadata;
      
      await adminDb.collection("appointments").add({
        userId: uid,
        expertId,
        expertName: expertName || "Specialist",
        date,
        time,
        status: 'pending',
        paid: true,
        fee: amount / 100,
        paymentReference: reference,
        createdAt: new Date().toISOString(),
      });
      console.log(`Created appointment for user ${uid} with expert ${expertId}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
