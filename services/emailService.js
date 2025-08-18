const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail", // force Gmail
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be an App Password
      },
    });

    console.log("Loaded EMAIL_USER:", process.env.EMAIL_USER);
    console.log(
      "Loaded EMAIL_PASS:",
      process.env.EMAIL_PASS ? "✅ set" : "❌ missing"
    );

    // Verify SMTP connection at startup
    this.transporter.verify((error, success) => {
      if (error) {
        console.error("SMTP connection failed:", error);
      } else {
        console.log("SMTP server is ready to take messages");
      }
    });
  }

  async sendContactNotification(contactData) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `${process.env.EMAIL_SUBJECT_PREFIX || "-"}${
        contactData.subject
      }`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${contactData.name}</p>
        <p><strong>Email:</strong> ${contactData.email}</p>
        <p><strong>Subject:</strong> ${contactData.subject}</p>
        <p><strong>Message:</strong></p>
        <p>${contactData.message.replace(/\n/g, "<br>")}</p>
        <hr>
        <p><small>Received at: ${new Date().toLocaleString()}</small></p>
      `,
      text: `
        New Contact Form Submission

        Name: ${contactData.name}
        Email: ${contactData.email}
        Subject: ${contactData.subject}

        Message:
        ${contactData.message}

        Received at: ${new Date().toLocaleString()}
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Email sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Email sending failed:", error);
      return { success: false, error: error.message };
    }
  }

  async sendAutoReply(contactData) {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: contactData.email,
      subject: "Thank you for contacting me!",
      html: `
        <h2>Hello ${contactData.name},</h2>
        <p>Thank you for reaching out through my portfolio website. I've received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong> ${contactData.subject}</p>
        <p>Best regards,<br>Emmanuel</p>
      `,
      text: `
        Hello ${contactData.name},

        Thank you for reaching out through my portfolio website. I've received your message and will get back to you as soon as possible.

        Your message: ${contactData.subject}

        Best regards,
        Emmanuel
      `,
    };

    try {
      const result = await this.transporter.sendMail(mailOptions);
      console.log("Auto-reply sent successfully:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("Auto-reply sending failed:", error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
