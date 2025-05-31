

export function generateWelcomeEmail() {
  return `
 <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Welcome to FixlCRM</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%);
      font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #fff;
      min-height: 100vh;
      padding: 20px;
      position: relative;
      overflow-x: hidden;
      animation: backgroundPulse 8s ease-in-out infinite;
    }
    
    @keyframes backgroundPulse {
      0%, 100% { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%); }
      50% { background: linear-gradient(135deg, #0a0a0a 0%, #1d1d1d 50%, #0a0a0a 100%); }
    }
    
    .snowfall {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }
    
    .snowball {
      position: absolute;
      background: radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0);
      border-radius: 50%;
      opacity: 0.8;
      animation: snowfall linear infinite;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }
    
    @keyframes snowfall {
      0% {
        transform: translateY(-100px) translateX(0px) rotate(0deg);
        opacity: 1;
      }
      100% {
        transform: translateY(100vh) translateX(-50px) rotate(360deg);
        opacity: 0.3;
      }
    }
    
    .snowball:nth-child(1) {
      left: 5%;
      width: 8px;
      height: 8px;
      animation-duration: 8s;
      animation-delay: 0s;
    }
    
    .snowball:nth-child(2) {
      left: 15%;
      width: 12px;
      height: 12px;
      animation-duration: 10s;
      animation-delay: 1s;
    }
    
    .snowball:nth-child(3) {
      left: 25%;
      width: 6px;
      height: 6px;
      animation-duration: 12s;
      animation-delay: 2s;
    }
    
    .snowball:nth-child(4) {
      left: 35%;
      width: 10px;
      height: 10px;
      animation-duration: 9s;
      animation-delay: 3s;
    }
    
    .snowball:nth-child(5) {
      left: 45%;
      width: 14px;
      height: 14px;
      animation-duration: 11s;
      animation-delay: 0.5s;
    }
    
    .snowball:nth-child(6) {
      left: 55%;
      width: 7px;
      height: 7px;
      animation-duration: 13s;
      animation-delay: 1.5s;
    }
    
    .snowball:nth-child(7) {
      left: 65%;
      width: 11px;
      height: 11px;
      animation-duration: 7s;
      animation-delay: 2.5s;
    }
    
    .snowball:nth-child(8) {
      left: 75%;
      width: 9px;
      height: 9px;
      animation-duration: 14s;
      animation-delay: 3.5s;
    }
    
    .snowball:nth-child(9) {
      left: 85%;
      width: 13px;
      height: 13px;
      animation-duration: 6s;
      animation-delay: 4s;
    }
    
    .snowball:nth-child(10) {
      left: 95%;
      width: 5px;
      height: 5px;
      animation-duration: 15s;
      animation-delay: 4.5s;
    }
    
    .container {
      width: 90%;
      max-width: 650px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      position: relative;
      z-index: 2;
      animation: containerGlow 6s ease-in-out infinite;
    }
    
    @keyframes containerGlow {
      0%, 100% { 
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 0 rgba(255, 255, 255, 0); 
      }
      50% { 
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3), 0 0 30px rgba(255, 255, 255, 0.2); 
      }
    }
    
    .header {
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      color: white;
      text-align: center;
      padding: 40px 30px;
      position: relative;
      overflow: hidden;
    }
    
    .header::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 20px,
        rgba(255,255,255,0.1) 20px,
        rgba(255,255,255,0.1) 40px
      );
      animation: headerShine 20s linear infinite;
    }
    
    @keyframes headerShine {
      0% { transform: translateX(-100px) translateY(-100px); }
      100% { transform: translateX(100px) translateY(100px); }
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
      animation: titleFloat 4s ease-in-out infinite;
      text-shadow: 0 0 20px rgba(255,255,255,0.3);
    }
    
    @keyframes titleFloat {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-5px); }
    }
    
    .logo {
      width: 120px;
      position: relative;
      z-index: 2;
      animation: logoSpin 8s linear infinite;
      filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
    }
    
    @keyframes logoSpin {
      0% { transform: rotate(0deg) scale(1); }
      25% { transform: rotate(90deg) scale(1.1); }
      50% { transform: rotate(180deg) scale(1); }
      75% { transform: rotate(270deg) scale(1.1); }
      100% { transform: rotate(360deg) scale(1); }
    }
    
    .content {
      padding: 40px 30px;
      color: #333;
      position: relative;
    }
    
    .content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, #4a90e2, #357abd, #4a90e2);
      animation: progressFlow 3s ease-in-out infinite;
    }
    
    @keyframes progressFlow {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0%); }
      100% { transform: translateX(100%); }
    }
    
    .content h1 {
      font-size: 32px;
      margin-bottom: 20px;
      color: #2c3e50;
      animation: slideInLeft 1s ease-out;
    }
    
    @keyframes slideInLeft {
      0% { transform: translateX(-50px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    .content p {
      font-size: 18px;
      line-height: 1.6;
      margin-bottom: 25px;
      animation: slideInRight 1s ease-out 0.3s both;
    }
    
    @keyframes slideInRight {
      0% { transform: translateX(50px); opacity: 0; }
      100% { transform: translateX(0); opacity: 1; }
    }
    
    .steps {
      background: linear-gradient(135deg, #e8f4fd 0%, #d1e8f7 100%);
      padding: 25px;
      border-radius: 15px;
      margin-bottom: 25px;
      position: relative;
      animation: stepsGlow 5s ease-in-out infinite;
      border: 2px solid transparent;
    }
    
    @keyframes stepsGlow {
      0%, 100% { 
        border-color: transparent;
        box-shadow: 0 0 0 rgba(74, 144, 226, 0);
      }
      50% { 
        border-color: rgba(74, 144, 226, 0.3);
        box-shadow: 0 0 20px rgba(74, 144, 226, 0.2);
      }
    }
    
    .steps h2 {
      color: #2c3e50;
      margin-bottom: 15px;
      animation: slideInUp 1s ease-out 0.6s both;
    }
    
    @keyframes slideInUp {
      0% { transform: translateY(30px); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
    
    .steps ol {
      margin-left: 20px;
      animation: slideInUp 1s ease-out 0.9s both;
    }
    
    .steps li {
      margin-bottom: 10px;
      font-size: 16px;
      animation: itemBounce 2s ease-in-out infinite;
    }
    
    .steps li:nth-child(1) { animation-delay: 0s; }
    .steps li:nth-child(2) { animation-delay: 0.3s; }
    .steps li:nth-child(3) { animation-delay: 0.6s; }
    
    @keyframes itemBounce {
      0%, 80%, 100% { transform: translateY(0); }
      40% { transform: translateY(-3px); }
    }
    
    .button-container {
      text-align: center;
      margin: 30px 0;
      animation: slideInUp 1s ease-out 1.2s both;
    }
    
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #4a90e2 0%, #357abd 100%);
      color: #fff;
      padding: 18px 35px;
      border-radius: 50px;
      text-decoration: none;
      font-weight: 600;
      font-size: 16px;
      transition: all 0.3s ease;
      box-shadow: 0 10px 25px rgba(74, 144, 226, 0.3);
      position: relative;
      overflow: hidden;
    }
    
    .button::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s ease;
    }
    
    .button:hover::before {
      left: 100%;
    }
    
    .button:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 15px 35px rgba(74, 144, 226, 0.4);
    }
    
    .footer {
      background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
      color: white;
      text-align: center;
      padding: 30px;
      position: relative;
    }
    
    .footer::before {
      content: '❄️';
      position: absolute;
      left: 30px;
      top: 50%;
      transform: translateY(-50%);
      animation: footerIcon 6s ease-in-out infinite;
      font-size: 20px;
    }
    
    .footer::after {
      content: '❄️';
      position: absolute;
      right: 30px;
      top: 50%;
      transform: translateY(-50%);
      animation: footerIcon 6s ease-in-out infinite reverse;
      font-size: 20px;
    }
    
    @keyframes footerIcon {
      0%, 100% { transform: translateY(-50%) rotate(0deg) scale(1); }
      50% { transform: translateY(-50%) rotate(180deg) scale(1.2); }
    }
    
    .footer a {
      color: #fff;
      text-decoration: underline;
      transition: all 0.3s ease;
    }
    
    .footer a:hover {
      color: #4a90e2;
      text-shadow: 0 0 5px rgba(74, 144, 226, 0.5);
    }
    
    @media (max-width: 600px) {
      .container {
        width: 95%;
        border-radius: 15px;
      }
      
      .header, .content, .footer {
        padding: 25px 20px;
      }
      
      .content h1 {
        font-size: 24px;
      }
      
      .content p {
        font-size: 16px;
      }
      
      .button {
        padding: 15px 30px;
        font-size: 14px;
      }
    }
  </style>
</head>
<body>
  <div class="snowfall">
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
    <div class="snowball"></div>
  </div>
  
  <div class="container">
    <div class="header">
      
      <h1>Welcome to FixlCRM</h1>
    </div>
    <div class="content">
      <h1>Welcome to FixlCRM</h1>
      <p>We're thrilled to have you on board! You're now part of a growing community focused on smarter customer relationships and streamlined business management.</p>
      <div class="steps">
        <h2>Here's how to get started:</h2>
        <ol>
          <li>👉 Log into your dashboard</li>
          <li>⚙️ Set up your organization and add team members</li>
          <li>📋 Start managing leads and customers</li>
        </ol>
      </div>
      <p>Let us help you build meaningful relationships and grow faster. Our support team is just one click away!</p>
      <div class="button-container">
        <a href="https://yourcrm.com/login" class="button">Go to Dashboard</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} FixlCRM. All rights reserved. |
      <a href="https://yourcrm.com/support">Get Help</a>
    </div>
  </div>
</body>
</html>
  `;
}

// export const generateWelcomeEmail = () => {
//   return `
//   <!DOCTYPE html>
//   <html lang="en">
//   <head>
//     <meta charset="UTF-8">
//     <title>Welcome to FixlCRM</title>
//     <style>
//       body {
//         background: linear-gradient(135deg, #fddb92, #d1fdff);
//         font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//         color: #333;
//         margin: 0;
//         padding: 0;
//       }
//       .container {
//         width: 90%;
//         max-width: 600px;
//         margin: 40px auto;
//         background: #fff;
//         border-radius: 15px;
//         overflow: hidden;
//         box-shadow: 0 15px 30px rgba(0,0,0,0.2);
//       }
//       .header, .footer {
//         background: #f98f7c;
//         color: white;
//         text-align: center;
//         padding: 30px;
//       }
//       .content {
//         padding: 30px;
//       }
//       .steps {
//         background-color: #ffe3e3;
//         padding: 15px;
//         border-radius: 10px;
//         margin-bottom: 20px;
//       }
//       .button {
//         display: inline-block;
//         background: #f98f7c;
//         color: #fff;
//         padding: 12px 25px;
//         border-radius: 30px;
//         text-decoration: none;
//         font-weight: bold;
//       }
//     </style>
//   </head>
//   <body>
//     <div class="container">
//       <div class="header">
//         <img src="https://yourdomain.com/logo.png" alt="FixlCRM Logo" style="width: 120px;" />
//       </div>
//       <div class="content">
//         <h1>Welcome to FixlCRM</h1>
//         <p>We're thrilled to have you on board! You're now part of a growing community focused on smarter customer relationships and streamlined business management.</p>
//         <div class="steps">
//           <h2>Here's how to get started:</h2>
//           <ol>
//             <li>👉 Log into your dashboard</li>
//             <li>⚙️ Set up your organization and add team members</li>
//             <li>📋 Start managing leads and customers</li>
//           </ol>
//         </div>
//         <p>Let us help you build meaningful relationships and grow faster. Our support team is just one click away!</p>
//         <div style="text-align: center;">
//           <a href="https://yourcrm.com/login" class="button">Go to Dashboard</a>
//         </div>
//       </div>
//       <div class="footer">
//         &copy; 2025 FixlCRM. All rights reserved. |
//         <a href="https://yourcrm.com/support" style="color: #fff; text-decoration: underline;">Get Help</a>
//       </div>
//     </div>
//   </body>
//   </html>
//   `;
// };

export const generateForgotPasswordEmail = async (
  resetLink,
  supportLink,
  crmName,
  resetoken
) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Reset Your Password</title>
  <style>
    body {
      background: linear-gradient(135deg, #f9f7d9, #fbc2eb);
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      width: 90%;
      max-width: 600px;
      margin: 40px auto;
      background: #fff;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 15px 30px rgba(0,0,0,0.2);
      animation: fadeIn 2s ease-in-out;
    }
    .header {
      background: #ea9085;
      padding: 30px;
      text-align: center;
    }
    .header img {
      width: 120px;
      animation: zoomIn 2s ease-in-out;
    }
    .content {
      padding: 30px;
    }
    .content h1 {
      font-size: 26px;
      margin-bottom: 15px;
    }
    .content p {
      line-height: 1.6;
      font-size: 16px;
      margin-bottom: 20px;
    }
    .reset-box {
      background-color: #fff0f0;
      padding: 15px;
      border-radius: 10px;
      text-align: center;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background: #ea9085;
      color: #fff;
      padding: 12px 25px;
      border-radius: 30px;
      text-decoration: none;
      font-weight: bold;
      animation: pulse 2s infinite;
    }
    .footer {
      background: #ea9085;
      color: white;
      text-align: center;
      padding: 15px;
      font-size: 14px;
      border-radius: 0 0 15px 15px;
    }
    @keyframes fadeIn {
      from {opacity: 0;}
      to {opacity: 1;}
    }
    @keyframes zoomIn {
      from {transform: scale(0);}
      to {transform: scale(1);}
    }
    @keyframes pulse {
      0% {box-shadow: 0 0 0 0 rgba(234,144,133, 0.7);}
      70% {box-shadow: 0 0 0 10px rgba(234,144,133, 0);}
      100% {box-shadow: 0 0 0 0 rgba(234,144,133, 0);}
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
     <h2 >Fixl CRM</h2>
    </div>
    <div class="content">
      <h1>Reset Your Password</h1>
      <p>We received a request to reset your password for your ${crmName} account. Don’t worry, it happens to the best of us!</p>
      <div class="reset-box">
        <a href="${resetLink}" class="button">Reset Password</a>
      </div>
      <P> for testing just click on reset password link or  send request at http:localhost:5000/api/auth/reset-password/${resetoken}</P>
      <p>If you didn’t request this, you can safely ignore this email. Your password will not be changed unless you follow the link above.</p>
      <p>Need more help? Reach out to our support team anytime.</p>
    </div>
    <div class="footer">
      &copy; 2025 ${crmName}. All rights reserved. |
      <a href="${supportLink}" style="color: #fff; text-decoration: underline;">Contact Support</a>
    </div>
  </div>
</body>
</html>
`;
};

export const resetPasswordTemplate = (username, resetUrl) => {
 return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Reset Your Password</title>
    <style>
      @keyframes fadeIn {
        0% { opacity: 0; transform: translateY(-10px); }
        100% { opacity: 1; transform: translateY(0); }
      }

      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f1f3f4;
        margin: 0;
        padding: 0;
        color: #202124;
      }

      .email-container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(60, 64, 67, 0.15);
        overflow: hidden;
        animation: fadeIn 0.6s ease-in-out;
      }

      .email-header {
        background-color: #1a73e8; /* Google Blue */
        color: #ffffff;
        text-align: center;
        padding: 32px 24px;
      }

      .email-header h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
      }

      .email-content {
        padding: 32px 28px;
        color: #3c4043;
        font-size: 16px;
        line-height: 1.6;
      }

      .email-content p {
        margin-bottom: 18px;
      }

      .cta-button {
        display: inline-block;
        background-color: #1a73e8; /* Google Blue */
        color: #ffffff;
        text-decoration: none;
        padding: 14px 28px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .cta-button:hover {
        background-color: #174ea6;
        transform: translateY(-2px);
      }

      .footer {
        text-align: center;
        font-size: 13px;
        color: #5f6368;
        padding: 24px;
        background-color: #f8f9fa;
      }

      @media (max-width: 600px) {
        .email-content {
          padding: 24px 16px;
        }

        .cta-button {
          padding: 12px 20px;
        }
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="email-header">
        <h1>Cubicle Web</h1>
      </div>

      <div class="email-content">
        <p>Hi <strong>${username}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to continue:</p>
        <p style="text-align: center;">
          <a href="${resetUrl}" class="cta-button">Reset Password</a>
        </p>
        <p>This link will expire after it is used once.</p>
        <p>If you didn’t request this, you can safely ignore this email.</p>
        <p>Cheers,<br>The Expense Tracker Team</p>
      </div>

      <div class="footer">
        <p>Need help? Contact our support team anytime.</p>
        <p>&copy; ${new Date().getFullYear()} Cubicle. All rights reserved.</p>
      </div>
    </div>
  </body>
  </html>
`;

};


export const InviteEmailTemplate = (ORG_NAME, role, email, INVITE_LINK) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>You're Invited!</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          padding: 20px;
          animation: bodyGlow 8s ease-in-out infinite alternate;
        }
        
        @keyframes bodyGlow {
          0% { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
          50% { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
          100% { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        }
        
        .container {
          max-width: 650px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
          backdrop-filter: blur(10px);
          animation: containerFloat 6s ease-in-out infinite;
          position: relative;
        }
        
        @keyframes containerFloat {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(0.5deg); }
        }
        
        .magic-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24, #ff6b6b);
          background-size: 400% 400%;
          animation: gradientShift 4s ease infinite;
          z-index: -1;
          border-radius: 20px;
        }
        
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 50px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          );
          animation: headerPattern 20s linear infinite;
        }
        
        @keyframes headerPattern {
          0% { transform: translateX(-100px) translateY(-100px); }
          100% { transform: translateX(100px) translateY(100px); }
        }
        
        .header h1 {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 10px;
          position: relative;
          z-index: 2;
          animation: titleGlow 3s ease-in-out infinite alternate;
          text-shadow: 0 0 20px rgba(255,255,255,0.5);
        }
        
        @keyframes titleGlow {
          0% { text-shadow: 0 0 20px rgba(255,255,255,0.5), 0 0 40px rgba(255,255,255,0.3); }
          100% { text-shadow: 0 0 30px rgba(255,255,255,0.8), 0 0 60px rgba(255,255,255,0.5); }
        }
        
        .emoji-rain {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }
        
        .emoji {
          position: absolute;
          font-size: 20px;
          animation: emojiRain 8s linear infinite;
          opacity: 0.8;
        }
        
        @keyframes emojiRain {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(200px) rotate(360deg);
            opacity: 0;
          }
        }
        
        .content {
          padding: 40px 30px;
          font-size: 18px;
          line-height: 1.7;
          position: relative;
        }
        
        .content::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4, #45b7d1, #f9ca24);
          animation: progressBar 3s ease-in-out infinite;
        }
        
        @keyframes progressBar {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(1); }
          100% { transform: scaleX(0); }
        }
        
        .greeting {
          font-size: 20px;
          margin-bottom: 25px;
          color: #2c3e50;
          animation: slideInLeft 1s ease-out;
        }
        
        @keyframes slideInLeft {
          0% { transform: translateX(-50px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .invitation-text {
          margin-bottom: 25px;
          color: #34495e;
          animation: slideInRight 1s ease-out 0.3s both;
        }
        
        @keyframes slideInRight {
          0% { transform: translateX(50px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .button-container {
          text-align: center;
          margin: 40px 0;
          animation: slideInUp 1s ease-out 0.6s both;
        }
        
        @keyframes slideInUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          text-decoration: none;
          padding: 18px 40px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 18px;
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.3);
          position: relative;
          overflow: hidden;
        }
        
        .button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s ease;
        }
        
        .button:hover::before {
          left: 100%;
        }
        
        .button:hover {
          transform: translateY(-3px) scale(1.05);
          box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
        
        .sparkles {
          position: absolute;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }
        
        .sparkle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: #ffd700;
          border-radius: 50%;
          animation: sparkleAnimation 2s linear infinite;
        }
        
        @keyframes sparkleAnimation {
          0% {
            transform: scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
          100% {
            transform: scale(0) rotate(360deg);
            opacity: 0;
          }
        }
        
        .url {
          word-break: break-word;
          font-size: 14px;
          color: #7f8c8d;
          background: rgba(127, 140, 141, 0.1);
          padding: 15px;
          border-radius: 10px;
          margin: 20px 0;
          animation: pulse 2s ease-in-out infinite;
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        .footer {
          font-size: 14px;
          text-align: center;
          color: #95a5a6;
          padding: 30px;
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          position: relative;
        }
        
        .footer::before {
          content: '✨';
          position: absolute;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          animation: rotate 4s linear infinite;
        }
        
        .footer::after {
          content: '✨';
          position: absolute;
          right: 20px;
          top: 50%;
          transform: translateY(-50%);
          animation: rotate 4s linear infinite reverse;
        }
        
        @keyframes rotate {
          0% { transform: translateY(-50%) rotate(0deg); }
          100% { transform: translateY(-50%) rotate(360deg); }
        }
        
        .icon {
          display: inline-block;
          margin: 0 5px;
          animation: bounce 2s ease-in-out infinite;
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @media (max-width: 600px) {
          .container {
            margin: 10px;
            border-radius: 15px;
          }
          
          .header h1 {
            font-size: 24px;
          }
          
          .content {
            padding: 30px 20px;
            font-size: 16px;
          }
          
          .button {
            padding: 15px 30px;
            font-size: 16px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="magic-border"></div>
        <div class="header">
          <div class="emoji-rain">
            <div class="emoji" style="left: 10%; animation-delay: 0s;">🎉</div>
            <div class="emoji" style="left: 20%; animation-delay: 1s;">🚀</div>
            <div class="emoji" style="left: 30%; animation-delay: 2s;">⭐</div>
            <div class="emoji" style="left: 40%; animation-delay: 3s;">🎊</div>
            <div class="emoji" style="left: 50%; animation-delay: 4s;">💫</div>
            <div class="emoji" style="left: 60%; animation-delay: 5s;">🌟</div>
            <div class="emoji" style="left: 70%; animation-delay: 6s;">🎈</div>
            <div class="emoji" style="left: 80%; animation-delay: 7s;">🎁</div>
            <div class="emoji" style="left: 90%; animation-delay: 1.5s;">✨</div>
          </div>
          <h1>You've Been Invited to ${ORG_NAME}!</h1>
          <div class="sparkles">
            <div class="sparkle" style="top: 20%; left: 15%; animation-delay: 0s;"></div>
            <div class="sparkle" style="top: 30%; left: 85%; animation-delay: 0.5s;"></div>
            <div class="sparkle" style="top: 60%; left: 25%; animation-delay: 1s;"></div>
            <div class="sparkle" style="top: 70%; left: 75%; animation-delay: 1.5s;"></div>
          </div>
        </div>
        <div class="content">
          <p class="greeting">Hi <strong>${email}</strong>, <span class="icon">👋</span></p>
          <p class="invitation-text">
            You've been invited to join <strong>${ORG_NAME}</strong> as a <strong>${role}</strong>. 
            <span class="icon">🎯</span>
          </p>
          <p class="invitation-text">
            We're excited to have you join our amazing team! Click the magical button below to accept your invitation and start your journey with us:
            <span class="icon">🚀</span>
          </p>
          <div class="button-container">
            <a href="${INVITE_LINK}" class="button">
              Accept Invitation <span class="icon">✨</span>
            </a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p class="url">
            <a href="${INVITE_LINK}" target="_blank">
              ${INVITE_LINK}
            </a>
          </p>
          <p style="animation: slideInUp 1s ease-out 0.9s both;">
            If you did not expect this invitation, you can safely ignore this email. 
            <span class="icon">🛡️</span>
          </p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${ORG_NAME}. All rights reserved. <span class="icon">💼</span></p>
        </div>
      </div>
    </body>
  </html>
  `;
};

