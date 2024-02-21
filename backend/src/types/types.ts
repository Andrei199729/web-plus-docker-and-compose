import { User } from '../users/entities/user.entities';

export interface IUser {
  id: number;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user: User;
}
