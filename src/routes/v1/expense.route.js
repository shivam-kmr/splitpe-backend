const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const expenseValidation = require('../../validations/expense.validation');
const expenseController = require('../../controllers/expense.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageExpenses'), validate(expenseValidation.createExpense), expenseController.createExpense)
  .get(auth('getExpenses'), validate(expenseValidation.getExpenses), expenseController.getExpenses);

router
  .route('/:expenseId')
  .get(auth('getExpenses'), validate(expenseValidation.getExpense), expenseController.getExpense)
  .patch(auth('manageExpenses'), validate(expenseValidation.updateExpense), expenseController.updateExpense)
  .delete(auth('manageExpenses'), validate(expenseValidation.deleteExpense), expenseController.deleteExpense);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Expenses
 *   description: Expense management and retrieval
 */

/**
 * @swagger
 * /expenses:
 *   post:
 *     summary: Create an expense
 *     description: Only authenticated users can create expenses.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - date
 *               - payer
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               payer:
 *                 type: string
 *               groupId:
 *                 type: string
 *             example:
 *               amount: 100
 *               description: Dinner
 *               date: 2022-05-15
 *               payer: user123
 *               groupId: group456
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Expense'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all expenses
 *     description: Only authenticated users can retrieve their expenses.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: amount
 *         schema:
 *           type: number
 *         description: Expense amount
 *       - in: query
 *         name: description
 *         schema:
 *           type: string
 *         description: Expense description
 *       - in: query
 *         name: payer
 *         schema:
 *           type: string
 *         description: Payer ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field:asc/desc (e.g., date:asc)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 10
 *         description: Maximum number of results per page
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 limit:
 *                   type: integer
 *                   example: 10
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 totalResults:
 *                   type: integer
 *                   example: 1
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /expenses/{expenseId}:
 *   get:
 *     summary: Get an expense
 *     description: Only authenticated users can fetch their expenses by ID.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Expense'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update an expense
 *     description: Only authenticated users can update their expenses.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               payer:
 *                 type: string
 *               groupId:
 *                 type: string
 *             example:
 *               amount: 120
 *               description: Dinner and drinks
 *               date: 2022-05-16
 *               payer: user123
 *               groupId: group456
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Expense'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete an expense
 *     description: Only authenticated users can delete their expenses.
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: expenseId
 *         required: true
 *         schema:
 *           type: string
 *         description: Expense ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
