const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetUrl) => {
  const { data, error } = await resend.emails.send({
    from: "SpendWise <no-reply@spendwiseapp.site>",
    to: [email],
    subject: "Reset your SpendWise password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2>Reset your SpendWise password</h2>

        <p>We received a request to reset your SpendWise account password.</p>

        <p>
          <a
            href="${resetUrl}"
            style="display: inline-block; padding: 12px 20px; background: #6C4CF1; color: #ffffff; text-decoration: none; border-radius: 6px;"
          >
            Reset Password
          </a>
        </p>

        <p>This link expires in 30 minutes and can only be used once.</p>

        <p>If you didn't request a password reset, you can safely ignore this email.</p>

        <p>— SpendWise Team</p>
      </div>
    `,
  });

  if (error) {
    console.error("Password reset email failed:", error.message);
    throw new Error("Failed to send password reset email");
  }

  return data;
};

module.exports = {
  sendPasswordResetEmail,
};
