import {v4 as uuidv4} from "uuid";
import crypto from "crypto";
export const generateInviteCode=()=>{
return uuidv4().replace(/-/g, "").substring(0, 8);
}

export const generateTaskCode=()=>{
return `task-${uuidv4().replace(/-/g, "").substring(0, 3)}`;
}
export const generateEmployeeCode = () => {
  return `EMP-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
};

export const generateTempPassword = () => {
  return crypto.randomBytes(4).toString("hex");
};
