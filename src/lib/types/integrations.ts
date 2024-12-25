import { ParsedEmail } from "./email";

export interface Integration {
  id: number;
  name: string;
  profile: Record<string, string | number | boolean>;
  accessToken: string;
  refreshToken: string;
  provider: string;
  userId: string;
  email: string;
  mails: ParsedEmail[];
}
