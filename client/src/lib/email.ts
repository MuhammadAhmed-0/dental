export async function sendEmail(to: string, subject: string, content: string) {
  // In a real app, this would use an email service
  // For now, we'll just log the email
  console.log(`Sending email to ${to}:`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${content}`);
  return true;
}
