import { Router } from "express";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import deliveryRoutes from "./delivery.routes";
import pricingRoutes from "./pricing.routes";
import adminRoutes from "./admin.routes";
import couponRoutes from "./coupon.routes";
import driverRoutes from "./driver.routes";
import paymentRoutes from "./payment.routes";
import smsRoutes from "./sms.routes";
import trackingRoutes from "./tracking.routes";
import testRoutes from "./test.routes";
import { AppConfigService } from "../services/appConfig.service";
import { EarlyAccessRequest } from "../models/EarlyAccessRequest";
import { ApiError } from "../utils/ApiError";
import { EmailService } from "../services/email.service";
import { ENV } from "../config/env";
import { logger } from "../utils/logger";

const router = Router();

router.get("/", (_req, res) => res.json({status:200, ok: true }));

// Public endpoint to check app status
router.get("/status", async (_req, res, next) => {
  try {
    const isActive = await AppConfigService.isAppActive();
    res.json({
      success: true,
      data: {
        appActive: isActive,
        message: isActive ? 'Service is available' : 'Service is currently unavailable'
      }
    });
  } catch (error) {Contact Us
    next(error);
  }
});

// Public endpoint to handle contact form submissions
router.post("/contact", async (req, res, next) => {
  try {
    const { name, email, mobile, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      throw new ApiError(400, "Name, email, and message are required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ApiError(400, "Invalid email address");
    }

    // Send email notification to admin
    const adminEmail = ENV.ADMIN_NOTIFICATION_EMAIL || ENV.SMTP_FROM_EMAIL;

    if (adminEmail) {
      try {
        const submittedAt = new Date().toLocaleString('en-US', {
          timeZone: 'America/Toronto',
          dateStyle: 'full',
          timeStyle: 'long'
        });

        await EmailService.sendEmail({
          to: adminEmail,
          subject: `New Contact Form Message from ${name}`,
          text: `NEW CONTACT FORM SUBMISSION
============================

You have received a new message from your website contact form.

FROM:
${name}

EMAIL ADDRESS:
${email}

MOBILE NUMBER:
${mobile || 'Not provided'}

MESSAGE:
--------
${message}
--------

SUBMITTED AT:
${submittedAt}

---
Reply directly to ${email} to respond to this inquiry.`,
          html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Contact Form Submission</title>
            </head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">📧 New Contact Form Submission</h1>
              </div>

              <div style="background: #ffffff; border: 1px solid #e0e0e0; border-top: none; padding: 30px; border-radius: 0 0 10px 10px;">
                <p style="margin-top: 0; font-size: 14px; color: #666;">
                  You have received a new message from your website contact form.
                </p>

                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                  <div style="font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">From</div>
                  <div style="color: #333; font-size: 15px;"><strong>${name}</strong></div>
                </div>

                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                  <div style="font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Email Address</div>
                  <div style="color: #333; font-size: 15px;">
                    <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                  </div>
                </div>

                <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #f0f0f0;">
                  <div style="font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Mobile Number</div>
                  <div style="color: #333; font-size: 15px;">${mobile || 'Not provided'}</div>
                </div>

                <div style="margin-bottom: 20px;">
                  <div style="font-weight: 600; color: #667eea; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Message</div>
                  <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px; margin-top: 10px; white-space: pre-wrap; color: #333; font-size: 15px;">${message}</div>
                </div>

                <div style="text-align: center;">
                  <a href="mailto:${email}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600;">Reply to ${name}</a>
                </div>
              </div>

              <div style="margin-top: 30px; text-align: center; color: #666; font-size: 12px;">
                <p>This email was automatically generated from your Jaddpi contact form.</p>
                <p>Submitted at ${submittedAt}</p>
              </div>
            </body>
            </html>
          `
        });

        logger.info({ name, email }, 'Contact form email sent successfully');
      } catch (emailError) {
        // Log error but don't fail the request
        logger.error({ error: emailError, email }, 'Failed to send contact form email');
        // Still return success to user since we received their message
      }
    }

    res.status(200).json({
      success: true,
      message: "Thank you for contacting us! We'll get back to you shortly."
    });
  } catch (error) {
    next(error);
  }
});

// Public endpoint to submit early access request
router.post("/early-access", async (req, res, next) => {
  try {
    const { pickupAddress, dropoffAddress, contactName, contactPhone, contactEmail, estimatedFare, notes } = req.body;

    // Validate required fields
    if (!pickupAddress || !dropoffAddress || !contactName || !contactPhone) {
      throw new ApiError(400, "Pickup address, dropoff address, contact name, and phone are required");
    }

    // Validate phone format (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(contactPhone)) {
      throw new ApiError(400, "Invalid phone number format");
    }

    const request = await EarlyAccessRequest.create({
      pickupAddress,
      dropoffAddress,
      contactName,
      contactPhone,
      contactEmail,
      estimatedFare: estimatedFare ? {
        distance: estimatedFare?.distance,
        total: estimatedFare?.total,
        currency: estimatedFare?.currency || "CAD"
      } : undefined,
      notes,
      status: "pending",
      source: "web-app"
    });

    // Send email notification to admin if configured
    if (ENV.ADMIN_NOTIFICATION_EMAIL) {
      try {
        const fareInfo = estimatedFare
          ? `\n  Distance: ${estimatedFare.distance?.toFixed(2)} km\n  Estimated Fare: ${estimatedFare.currency || 'CAD'} $${estimatedFare.total?.toFixed(2)}`
          : '';

        await EmailService.sendEmail({
          to: ENV.ADMIN_NOTIFICATION_EMAIL,
          subject: `New Early Access Request - ${contactName}`,
          text: `New early access request received:

Name: ${contactName}
Phone: ${contactPhone}
Email: ${contactEmail || 'Not provided'}

Pickup: ${pickupAddress}
Dropoff: ${dropoffAddress}${fareInfo}

Notes: ${notes || 'None'}

Request ID: ${request._id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563eb;">New Early Access Request</h2>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Contact Information</h3>
                <p><strong>Name:</strong> ${contactName}</p>
                <p><strong>Phone:</strong> ${contactPhone}</p>
                <p><strong>Email:</strong> ${contactEmail || 'Not provided'}</p>
              </div>

              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin-top: 0;">Route Details</h3>
                <p><strong>Pickup:</strong> ${pickupAddress}</p>
                <p><strong>Dropoff:</strong> ${dropoffAddress}</p>
                ${estimatedFare ? `
                  <p><strong>Distance:</strong> ${estimatedFare.distance?.toFixed(2)} km</p>
                  <p><strong>Estimated Fare:</strong> ${estimatedFare.currency || 'CAD'} $${estimatedFare.total?.toFixed(2)}</p>
                ` : ''}
              </div>

              ${notes ? `
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="margin-top: 0;">Additional Notes</h3>
                  <p>${notes}</p>
                </div>
              ` : ''}

              <p style="color: #6b7280; font-size: 12px;">Request ID: ${request._id}</p>
            </div>
          `
        });
      } catch (emailError) {
        // Log error but don't fail the request
        logger.error({ error: emailError }, 'Failed to send admin notification email');
      }
    }

    res.status(201).json({
      success: true,
      data: { requestId: request._id },
      message: "Thank you! We'll contact you as soon as service is available in your area."
    });
  } catch (error) {
    next(error);
  }
});

// Auth routes
router.use("/auth", authRoutes);

// User routes
router.use("/users", userRoutes);

// Delivery routes
router.use("/delivery", deliveryRoutes);

// Pricing routes
router.use("/pricing", pricingRoutes);

// Admin routes
router.use("/admin", adminRoutes);

// Coupon routes
router.use("/coupons", couponRoutes);

// Driver routes
router.use("/driver", driverRoutes);

// Payment routes
router.use("/payment", paymentRoutes);

// SMS routes (admin)
router.use("/sms", smsRoutes);

// Tracking routes (public - no auth required)
router.use("/track", trackingRoutes);

// Test routes (TEMPORARY - for development only)
router.use("/test", testRoutes);

export default router;
