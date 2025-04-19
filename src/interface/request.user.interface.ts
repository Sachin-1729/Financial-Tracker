import { Request } from 'express';
import { User } from '../user/entities/user.entity'; // Import your User entity

// Define an interface for the request that includes the user
export interface RequestWithUser extends Request {
  user: User;
}
