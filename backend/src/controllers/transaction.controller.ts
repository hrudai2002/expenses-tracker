import type { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service.js';
import { HTTP_STATUS } from '../utils/http-status.js';
import { getRequiredRouteParam } from '../utils/request-params.js';
import { validateTransactionPayload, validateTransactionQuery } from '../validators/transaction.validator.js';

class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  create = async (request: Request, response: Response) => {
    const payload = validateTransactionPayload(request.body);
    const result = await this.transactionService.createTransaction(request.user!.id, payload);
    response.status(HTTP_STATUS.CREATED).json(result);
  };

  list = async (request: Request, response: Response) => {
    const query = validateTransactionQuery(request.query as Record<string, unknown>);
    const result = await this.transactionService.getTransactions(request.user!.id, query);
    response.status(HTTP_STATUS.OK).json(result);
  };

  getById = async (request: Request, response: Response) => {
    const transactionId = getRequiredRouteParam(request.params.transactionId, 'transactionId');
    const result = await this.transactionService.getTransactionById(request.user!.id, transactionId);
    response.status(HTTP_STATUS.OK).json(result);
  };

  update = async (request: Request, response: Response) => {
    const payload = validateTransactionPayload(request.body);
    const transactionId = getRequiredRouteParam(request.params.transactionId, 'transactionId');
    const result = await this.transactionService.updateTransaction(
      request.user!.id,
      transactionId,
      payload
    );
    response.status(HTTP_STATUS.OK).json(result);
  };

  delete = async (request: Request, response: Response) => {
    const transactionId = getRequiredRouteParam(request.params.transactionId, 'transactionId');
    await this.transactionService.deleteTransaction(request.user!.id, transactionId);
    response.status(HTTP_STATUS.NO_CONTENT).send();
  };
}

export { TransactionController };
