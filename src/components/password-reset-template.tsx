interface PasswordResetTemplateProps {
  name: string;
  actionUrl: string;
}

export default function PasswordResetTemplate({
  name,
  actionUrl,
}: PasswordResetTemplateProps) {
  return (
    <div
      style={{
        fontFamily: "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        lineHeight: '1.6',
        color: '#1a1a1a',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header with brand gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)',
          padding: '32px 24px',
          textAlign: 'center',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <h1
          style={{
            color: '#ffffff',
            fontSize: '22px',
            fontWeight: '700',
            margin: '0 0 4px 0',
            letterSpacing: '-0.5px',
          }}
        >
          MP Police Zen
        </h1>
        <p
          style={{
            color: '#00F0FF',
            fontSize: '12px',
            fontWeight: '600',
            margin: '0',
            letterSpacing: '2px',
            textTransform: 'uppercase',
          }}
        >
          Password Reset Request
        </p>
      </div>

      {/* Main content */}
      <div style={{ padding: '32px 24px', border: '1px solid #e5e7eb', borderTop: 'none' }}>
        <p style={{ fontSize: '16px', marginBottom: '8px', fontWeight: '600' }}>Hi {name},</p>

        <p style={{ fontSize: '15px', marginBottom: '16px', color: '#374151' }}>
          We received a request to reset your password for your MP Police Zen account.
        </p>

        <p style={{ fontSize: '15px', marginBottom: '24px', color: '#374151' }}>
          Click the button below to set a new password. This link will expire in 24 hours for security reasons.
        </p>

        {/* CTA Button */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <a
            href={actionUrl}
            style={{
              display: 'inline-block',
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #0a0a0a, #1a1a2e)',
              color: '#00F0FF',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '15px',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            Reset My Password →
          </a>
        </div>

        {/* Warning box */}
        <div
          style={{
            background: '#f8fafc',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            borderLeft: '4px solid #00F0FF',
          }}
        >
          <p style={{ fontSize: '14px', color: '#475569', margin: '0' }}>
            If you didn&apos;t request this, you can safely ignore this email. Your password will remain unchanged.
          </p>
        </div>

        {/* Security warning */}
        <div
          style={{
            background: '#fef3c7',
            borderRadius: '6px',
            padding: '10px 14px',
            marginBottom: '20px',
          }}
        >
          <p style={{ fontSize: '13px', color: '#92400e', margin: '0', fontWeight: '500' }}>
            ⏰ For security, this link is only valid for <strong>24 hours</strong>.
          </p>
        </div>

        <p style={{ fontSize: '13px', color: '#9ca3af' }}>
          If you have any issues, please contact our support team.
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          background: '#f9fafb',
          padding: '20px 24px',
          textAlign: 'center',
          borderRadius: '0 0 12px 12px',
          border: '1px solid #e5e7eb',
          borderTop: 'none',
        }}
      >
        <p style={{ fontSize: '12px', color: '#6b7280', margin: '0 0 4px 0', fontWeight: '600' }}>
          Mindful MP Police — Smart Test Series
        </p>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: '0' }}>
          Secure • Trusted • Built for MP Police Aspirants
        </p>
      </div>
    </div>
  );
}
