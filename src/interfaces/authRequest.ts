export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
  };
}
