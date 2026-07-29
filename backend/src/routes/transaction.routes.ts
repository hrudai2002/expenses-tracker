import { Router } from 'express';
import { TransactionController } from '../controllers/transaction.controller.js';
import { asyncHandler } from '../utils/async-handler.js';

function buildTransactionRoutes(transactionController: TransactionController): Router {
  const router = Router();

  router.post('/', asyncHandler(transactionController.create));
  router.get('/', asyncHandler(transactionController.list));
  router.get('/:transactionId', asyncHandler(transactionController.getById));
  router.put('/:transactionId', asyncHandler(transactionController.update));
  router.delete('/:transactionId', asyncHandler(transactionController.delete));

  return router;
}

export { buildTransactionRoutes };

