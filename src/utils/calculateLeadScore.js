function calculateLeadScore(lead) {
  let score = 0;

  // +20 if estimated worth is over 1L
  if (lead.estimatedWorth > 100000) score += 20;

  // +10 if contacted
  if (lead.status === "Contacted") score += 10;

  // +15 if source is referral
  if (lead.source === "Referral") score += 15;

  // +10 if priority is High or Critical
  if (["High", "Critical"].includes(lead.priority)) score += 10;

  // +10 if follow-up date is in next 3 days
  if (lead.followUpDate) {
    const diff = (new Date(lead.followUpDate) - new Date()) / (1000 * 60 * 60 * 24);
    if (diff <= 3 && diff >= 0) score += 10;
  }

  // Cap the score to 100
  return Math.min(score, 100);
}
