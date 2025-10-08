export type PortInfo = {
  Port: string;
  Service: string;
  Version: string;
  Protocol: string;
  disabledFlag: boolean;
  EncTypes: Record<string, EncType>;
  Vulnerabilities: Record<string, Vulnerability>;
};

export type HostCompare = {
  IP: string;
  Hostname: string;
  ConType: string;
  Ports: Record<string, PortInfo>;
  Subdomains?: Subdomain[]; // добавляем необязательное поле
};
export type Subdomain = {
  Subdomain: string;
  ConnType: string;
};

export type CompareReportsResponse = {
  compare_reports: HostCompare[];
  last_report: Report;
  previous_reports: Report[];
};

export type Report = {
  id: number;
  created: string;
};

export type EncType = {
  Name: string;
  CritLevel: string;
  newFlag: boolean;
  oldFlag: boolean;
};

export type Vulnerability = {
  Name: string;
  CritLevel: string;
  newFlag: boolean;
  oldFlag: boolean;
  Description?: string;
  References: string[];
};

export interface VulnDetail {
  name: string;
  description: string;
  cvss_score: string;
  crit_level: string;
  cvss_vector: string;
  cvss_version: string;
}

export interface EncryptionDetail {
  name: string;
  description: string;
  severity: string;
  crit_level: string;
}
