import nodemailer from 'nodemailer';

// Za produkciju možeš koristiti Gmail, SendGrid, Resend, itd.
// Ovde ću postaviti Gmail opciju

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD // App password, ne obična šifra
  }
});

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@principgym.com',
    to: email,
    subject: 'Potvrdite vašu email adresu - Princip Gym',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Dobrodošli u Princip Gym!</h2>
        <p>Hvala vam što ste se registrovali. Molimo vas da potvrdite vašu email adresu klikom na dugme ispod:</p>
        
        <div style="margin: 30px 0;">
          <a href="${verificationUrl}" 
             style="background-color: #4CAF50; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Potvrdi Email
          </a>
        </div>
        
        <p>Ili kopirajte ovaj link u vaš browser:</p>
        <p style="color: #666; word-break: break-all;">${verificationUrl}</p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Ako niste vi kreirali ovaj nalog, možete ignorisati ovaj email.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}

export async function sendMembershipExpirationEmail(email: string, name: string, daysLeft: number) {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'noreply@principgym.com',
    to: email,
    subject: `Članarina ističe za ${daysLeft} dana - Princip Gym`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Pozdrav ${name || 'člane'},</h2>
        <p>Želimo da vas obavestimo da vaša članarina ističe za <strong>${daysLeft} dana</strong>.</p>
        
        <p>Molimo vas da obnovite članarinu na vreme kako biste nastavili da koristite naše usluge bez prekida.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Opcije obnove:</strong></p>
          <ul>
            <li>Mesečna članarina: 3000 RSD</li>
            <li>3 meseca: 8000 RSD (ušteda 1000 RSD)</li>
            <li>6 meseci: 15000 RSD (ušteda 3000 RSD)</li>
            <li>Godišnja: 28000 RSD (ušteda 8000 RSD)</li>
          </ul>
        </div>
        
        <p>Vidimo se u teretani!</p>
        
        <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px;">
          Princip Gym - Vaš put ka zdravlju i fitnesu
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error };
  }
}