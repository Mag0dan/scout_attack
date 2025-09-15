// Use custom proxy route in development to handle SSL issues
// Use full URL in production
export const API_BASE = process.env.NODE_ENV === 'development'
  ? "/api/proxy"
  : "https://83.220.170.171/api";
export const VULN_LEVELS = ["Critical", "Medium", "Low"] as const;
