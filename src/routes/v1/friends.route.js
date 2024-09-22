const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const friendValidation = require('../../validations/friends.validation');
const friendController = require('../../controllers/friend.controller');

const router = express.Router();

router
  .route('/')
  .post(auth('manageFriends'), validate(friendValidation.addFriend), friendController.addFriend)
  .get(auth('getFriends'), validate(friendValidation.getFriends), friendController.getFriends);

router
  .route('/:friendId')
  .get(auth('getFriends'), validate(friendValidation.getFriend), friendController.getFriend)
  .patch(auth('manageFriends'), validate(friendValidation.updateFriend), friendController.updateFriend)
  .delete(auth('manageFriends'), validate(friendValidation.deleteFriend), friendController.deleteFriend);

module.exports = router;

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management and retrieval
 */

/**
 * @swagger
 * /friend:
 *   post:
 *     summary: Add a friend
 *     description: Only authenticated users can add friends.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - friendId
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *             example:
 *               userId: user123
 *               friendId: friend456
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Friend'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all friends
 *     description: Only authenticated users can retrieve their friends.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: User ID
 *       - in: query
 *         name: friendId
 *         schema:
 *           type: string
 *         description: Friend ID
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *         description: Sort by field:asc/desc (e.g., name:asc)
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
 *                     $ref: '#/components/schemas/Friend'
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
 * /friend/{friendId}:
 *   get:
 *     summary: Get a friend
 *     description: Only authenticated users can fetch their friends by ID.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend ID
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Friend'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a friend
 *     description: Only authenticated users can update their friends.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               friendId:
 *                 type: string
 *             example:
 *               userId: user123
 *               friendId: friend789
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Friend'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a friend
 *     description: Only authenticated users can delete their friends.
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: Friend ID
 *     responses:
 *       "204":
 *         description: No content
 *       "401":
 *         $ref: '#/components/responses/Unauthorized'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */
