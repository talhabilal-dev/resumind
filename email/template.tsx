import React from "react";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || process.env.DOMAIN || "https://resumind.talhabilal.dev";

export default function EmailTemplate({
  emailType,
  Subject,
  token,
}: {
  emailType: string;
  Subject: string;
  token: string;
}) {
  const actionUrl =
    emailType === "VERIFY"
      ? `${baseUrl}/user/verify-token?token=${token}&type=email`
      : `${baseUrl}/user/reset-password/verify?token=${token}&type=reset-password`;

  const heading =
    emailType === "VERIFY"
      ? "Verify your email address"
      : "Reset your password";

  const body =
    emailType === "VERIFY"
      ? "Thanks for creating your Resumind account. To finish setting it up, please confirm your email address by clicking the button below. The link expires in 10 minutes."
      : "We received a request to reset your password. Click the button below to choose a new one. The link expires in 10 minutes. If you didn't request this, you can safely ignore this email.";

  const buttonLabel = emailType === "VERIFY" ? "Verify Email" : "Reset Password";

  return (
    <div style={{ margin: "0", padding: "0", backgroundColor: "#0a0a0a" }}>
      <table
        role="presentation"
        width="100%"
        cellPadding="0"
        cellSpacing="0"
        style={{ backgroundColor: "#0a0a0a", padding: "24px 0" }}
      >
        <tbody>
          <tr>
            <td align="center">
              <table
                role="presentation"
                width="560"
                cellPadding="0"
                cellSpacing="0"
                style={{
                  maxWidth: "560px",
                  width: "100%",
                  backgroundColor: "#141414",
                  borderRadius: "16px",
                  border: "1px solid rgba(244, 63, 94, 0.25)",
                  boxShadow: "0 12px 40px rgba(0, 0, 0, 0.55)",
                  overflow: "hidden",
                }}
              >
                <tbody>
                  <tr>
                    <td
                      style={{
                        background: "linear-gradient(90deg, #e11d48, #ec4899, #e11d48)",
                        height: "6px",
                      }}
                    />
                  </tr>

                  <tr>
                    <td style={{ padding: "36px 40px 12px" }}>
                      <table role="presentation" cellPadding="0" cellSpacing="0">
                        <tbody>
                          <tr>
                            <td
                              style={{
                                backgroundColor: "rgba(244, 63, 94, 0.15)",
                                borderRadius: "10px",
                                padding: "10px 14px",
                              }}
                            >
                              <span style={{ color: "#e11d48", fontSize: "18px", lineHeight: 1 }}>
                                ✦
                              </span>
                              <span
                                style={{
                                  color: "#fda4af",
                                  fontSize: "16px",
                                  fontWeight: 700,
                                  letterSpacing: "0.02em",
                                  marginLeft: "8px",
                                }}
                              >
                                Resumind
                              </span>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: "24px 40px 8px" }}>
                      <h1
                        style={{
                          margin: "0",
                          color: "#f5f5f5",
                          fontSize: "26px",
                          fontWeight: 800,
                          lineHeight: 1.2,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {heading}
                      </h1>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: "12px 40px 8px" }}>
                      <p
                        style={{
                          margin: "0",
                          color: "rgba(245, 245, 245, 0.72)",
                          fontSize: "15px",
                          lineHeight: 1.7,
                        }}
                      >
                        {body}
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style={{ padding: "28px 40px 8px" }}>
                      <a
                        href={actionUrl}
                        style={{
                          display: "inline-block",
                          padding: "14px 34px",
                          background: "linear-gradient(90deg, #e11d48, #ec4899)",
                          color: "#ffffff",
                          textDecoration: "none",
                          fontSize: "15px",
                          fontWeight: 700,
                          borderRadius: "10px",
                          boxShadow: "0 6px 20px rgba(225, 29, 72, 0.45)",
                        }}
                      >
                        {buttonLabel}
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style={{ padding: "18px 40px 4px" }}>
                      <p style={{ margin: "0", color: "rgba(245, 245, 245, 0.5)", fontSize: "13px" }}>
                        If the button doesn&apos;t work, copy and paste this link:
                      </p>
                    </td>
                  </tr>

                  <tr>
                    <td align="center" style={{ padding: "8px 40px 4px" }}>
                      <a
                        href={actionUrl}
                        style={{
                          color: "#fda4af",
                          fontSize: "12px",
                          wordBreak: "break-all",
                          textDecoration: "underline",
                        }}
                      >
                        {actionUrl}
                      </a>
                    </td>
                  </tr>

                  <tr>
                    <td style={{ padding: "28px 40px 12px" }}>
                      <table
                        role="presentation"
                        width="100%"
                        cellPadding="0"
                        cellSpacing="0"
                        style={{ borderTop: "1px solid rgba(245, 245, 245, 0.1)" }}
                      >
                        <tbody>
                          <tr>
                            <td style={{ paddingTop: "18px" }}>
                              <p
                                style={{
                                  margin: "0",
                                  color: "rgba(245, 245, 245, 0.45)",
                                  fontSize: "12px",
                                  lineHeight: 1.6,
                                  textAlign: "center",
                                }}
                              >
                                You&apos;re receiving this email because you created an account with
                                Resumind.
                                <br />
                                Questions? Reply to this email — we&apos;re here to help.
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
