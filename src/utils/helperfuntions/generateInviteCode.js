import {v4 as uuidv4} from "uuid";
import crypto from "crypto";
export const generateInviteCode=()=>{
return uuidv4().replace(/-/g, "").substring(0, 8);
}

export const generateTaskCode=()=>{
return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`;
}
export const generateEmployeeId = () => {
  const short = crypto.randomBytes(3).toString("hex").toUpperCase(); // 6-char hex
  return `EMP_${short}`; // like EMP_1F2A9C
};
 export function generateShortPassword() {
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*";

  const allChars = lower + upper + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category if possible
  password += lower[Math.floor(Math.random() * lower.length)];
  password += upper[Math.floor(Math.random() * upper.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  // Fill remaining 2 characters randomly
  for (let i = password.length; i < 6; i++) {
    const idx = crypto.randomInt(0, allChars.length);
    password += allChars[idx];
  }

  // Shuffle to avoid predictable order
  password = password.split("").sort(() => 0.5 - Math.random()).join("");

  return password;
}