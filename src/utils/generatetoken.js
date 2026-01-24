
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });
const isProd = process.env.NODE_ENV === "production";

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;   // 256-bit key
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;
const ISSUER = process.env.JWT_ISSUER;
const ACCESS_TTL = process.env.ACCESS_TTL
const REFRESH_TTL = process.env.REFRESH_TTL
const WORKSPACE_TTL = process.env.WORKSPACE_TTL
const WORKSPACE_SECRET = process.env.WORKSPACE_SECRET
const PROJECT_SECRET = process.env.PROJECT_SECRET
const PROJECT_TTL = process.env.PROJECT_TTL
const TEAM_SECRET = process.env.TEAM_SECRET
const TEAM_TTL = process.env.TEAM_TTL
const  SUPPORT_SECRET = process.env.SUPPORT_SECRET
const SUPPORT_TTL = process.env.SUPPORT_TTL
const SUPPORT_ORG_SECRET = process.env.SUPPORT_ORG_SECRET
const SUPPORT_ORG_TTL = process.env.SUPPORT_ORG_TTL

const BASE_OPTS = { algorithm: 'HS256' };


/* -------------------------------------------------
   Helpers
------------------------------------------------- */
const sign = (payload, secret, ttl, opts = {}) =>
  jwt.sign(
    { ...payload, iat: Math.floor(Date.now() / 1000), iss: ISSUER, ...opts },
    secret,
    { ...BASE_OPTS, expiresIn: ttl }
  );

/* -------------------------------------------------
   Access token (org-scoped)
------------------------------------------------- */
export const generateOrgAccessToken = (payload, ua, ip) =>
  sign(
    {
      ...payload,
      aud: payload.orgId,
      nbf: Math.floor(Date.now() / 1000),
      fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    },
    ACCESS_SECRET,
    ACCESS_TTL
  );

/* -------------------------------------------------
   Refresh token (global)
------------------------------------------------- */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id,
    uuid: user.uuid,
    email: user.email,
    role: user.Globalrole,
    userType: user.userType,
  };
  return sign(payload, REFRESH_SECRET, REFRESH_TTL);
};

/* -------------------------------------------------
   Cookie setters
------------------------------------------------- */
// ------------------ Cookie Setters ------------------

export const setTokenCookies = (res, accessToken, refreshToken) => {
  const baseOpts = {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
  };
  // org token
  res.cookie('_fxl_1A2B3C', accessToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 2, // 2 hours
  });
  // user token 
  res.cookie('_fxl_9X8Y7Z', refreshToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};
export const setrefreshTokenCookies = (res, refreshToken) => {
  const baseOpts = {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
  };
  res.cookie('_fxl_9X8Y7Z', refreshToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
}
/* -------------------------------------------------
   Stand-alone access-token generator
------------------------------------------------- */
export const createAccessTokenOnly = (payload, ua, ip) =>
  sign(
    {
      ...payload,
      aud: payload.orgId,
      nbf: Math.floor(Date.now() / 1000),
      fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    },
    ACCESS_SECRET,
    ACCESS_TTL
  );
/**
* Sets ONLY the access-token cookie (no refresh).
* Useful for silent refresh or short-lived sessions.
*/
export const setAccessCookieOnly = (res, accessToken) => {
  res.cookie('_fxl_1A2B3C', accessToken, {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 1000 * 60 * 60 * 2, // 2 h
  });
};
export const generateWorkspaceToken = (payload) =>
  sign(
    {
      ...payload,               // { userId, orgId, workspaceId, role, etc. }
      nbf: Math.floor(Date.now() / 1000),
    },
    WORKSPACE_SECRET,
    WORKSPACE_TTL
  );

export const setWorkspaceCookie = (res, token) => {
  res.cookie('_fxl_WSP', token, {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day

  });
};

/* -------------------------------------------------
   Project token
------------------------------------------------- */
export const generateProjectToken = (payload) =>
  sign(
    {
      ...payload,               // { userId, orgId, workspaceId, projectId, role, etc. }
      nbf: Math.floor(Date.now() / 1000),
    },
    PROJECT_SECRET,
    PROJECT_TTL
  );

export const setProjectCookie = (res, token) => {
  res.cookie('_fxl_PRJ', token, {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
};
/* -------------------------------------------------
   Team token
------------------------------------------------- */
export const generateTeamToken = (payload) =>
  sign(
    {
      ...payload,               // { userId, orgId, teamId, role, etc. }
      nbf: Math.floor(Date.now() / 1000),
    },
    TEAM_SECRET,
    TEAM_TTL
  );

export const setTeamCookie = (res, token) => {
  res.cookie('_fxl_TEA', token, {
    httpOnly: isProd,
    secure: isProd,
    sameSite: isProd ? 'None' : 'Lax',
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });
};
/* -------------------------------------------------
   Verifiers
------------------------------------------------- */
export const verifyOrgToken = (token, ua, ip) => {
  const decoded = jwt.verify(token, ACCESS_SECRET, { issuer: ISSUER });
  const fp = crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16);
  if (decoded.fingerprint !== fp) return res.status(401).json('Fingerprint mismatch');
  return decoded;
};

export const verifyRefreshToken = (token) =>
  jwt.verify(token, REFRESH_SECRET, { issuer: ISSUER });
export const verifyWorkspaceToken = (token) =>
  jwt.verify(token, WORKSPACE_SECRET, { issuer: ISSUER });
export const verifyProjectToken = (token) =>
  jwt.verify(token, PROJECT_SECRET, { issuer: ISSUER });
export const verifyTeamToken = (token) =>
  jwt.verify(token, TEAM_SECRET, { issuer: ISSUER });
export const verifySupportAgentToken = (token) =>
  jwt.verify(token, SUPPORT_SECRET, { issuer: ISSUER });
export const verifySupportOrgToken = (token) =>
  jwt.verify(token, SUPPORT_ORG_SECRET, { issuer: ISSUER });

export const generateSuperAdminToken = (user, ua, ip) => {
  const payload = {
    userId: user._id,
    uuid: user.uuid,
    email: user.email,
    role: 'SuperAdmin',
    fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    scope: 'platform',
  };
  return sign(payload, SUPPORT_SECRET, SUPER_ADMIN_TTL, { aud: 'platform' });

};
export const generateSupportAgentToken = (agent, ua, ip) => {
  const payload = {
    userId: agent._id,
    uuid: agent.uuid,
    email: agent.email,
    role: 'SupportAgent',
    fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    scope: 'support',
  };
  return sign(payload, SUPPORT_SECRET, SUPPORT_TTL, { aud: 'support' });
};

export const generateSupportOrgToken = ( supportAgentId, orgId, ua, ip) => {
  const payload = {
   orgId: orgId,
    actingAs: 'OrgUser',
    impersonatedBy: supportAgentId, // link to original support agent
    fingerprint: crypto.createHash('sha256').update(ua + ip).digest('hex').slice(0, 16),
    scope: 'org-support',
  };
  return sign(payload, SUPPORT_ORG_SECRET, SUPPORT_ORG_TTL, { aud: orgId });
};

// Super Admin Cookie (1 hour)
export const setSuperAdminTokenCookie = (res, token) => {
  res.cookie('super_admin_token', token, secureCookieOptions(60 * 60 * 1000));
};

// Support Agent Cookie (1 hour)
export const setSupportAgentTokenCookie = (res, token) => {
  res.cookie('support_token', token,);
};

// Support Org Impersonation Cookie (1 hour, short-lived)
export const setSupportOrgTokenCookie = (res, token) => {
  res.cookie('support_org_token', token);
};

// utils/setHrmTokenCookies.js
export const generateHrmTokens = (user, profile) => {
const accessToken = jwt.sign(
{
sub: profile._id,
userId: user._id,
employeeCode: profile.employeeCode,
orgId: profile.organizationId,
role: profile.role,
scope: "HRM"
},
process.env.HRM_JWT_SECRET,
{ expiresIn: "2h" }
);


const refreshToken = jwt.sign(
{
userId: user._id,
orgId: profile.organizationId,
tokenType: "HRM_REFRESH"
},
process.env.HRM_REFRESH_SECRET,
{ expiresIn: "7d" }
);


return { accessToken, refreshToken };
};

export const setHrmTokenCookies = (res, accessToken, refreshToken) => {
  const baseOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "None" : "Lax",
    path: "/"
  };

  // HRM Access Token (short-lived)
  res.cookie("__hrm_at", accessToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 2 // 2 hours
  });

  // HRM Refresh Token (long-lived)
  res.cookie("__hrm_rt", refreshToken, {
    ...baseOpts,
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
  });
};