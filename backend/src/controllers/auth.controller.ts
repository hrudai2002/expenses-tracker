import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { validateLoginPayload, validateSignupPayload } from '../validators/auth.validator.js';

class AuthController {
  constructor(private readonly authService: AuthService) {}

  signup = async (request: Request, response: Response) => {
    const payload = validateSignupPayload(request.body);
    const result = await this.authService.signup(payload);
    response.status(HTTP_STATUS.CREATED).json(result);
  };

  login = async (request: Request, response: Response) => {
    const payload = validateLoginPayload(request.body);
    const result = await this.authService.login(payload);
    response.status(HTTP_STATUS.OK).json(result);
  };

  me = async (request: Request, response: Response) => {
    const result = await this.authService.getCurrentUser(request.user!.id);
    response.status(HTTP_STATUS.OK).json(result);
  };
}

export { AuthController };

