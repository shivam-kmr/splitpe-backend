const express = require('express');
const validate = require('../../middlewares/validate');
const friendValidation = require('../../validations/friends.validation');
const friendController = require('../../controllers/friend.controller');

const router = express.Router();

router.post('/', validate(friendValidation.createFriend), friendController.createFriend);
router.get('/', friendController.getAllFriends);
router.get('/:friendId', friendController.getFriendById);
router.put('/:friendId', validate(friendValidation.updateFriend), friendController.updateFriend);
router.delete('/:friendId', friendController.deleteFriend);

/**
 * @swagger
 * tags:
 *   name: Friends
 *   description: Friend management
 */

/**
 * @swagger
 * /friends/create:
 *   post:
 *     summary: Create a new friend
 *     tags: [Friends]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendInput'
 *     responses:
 *       "201":
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friend'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 */


/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Get all friends
 *     tags: [Friends]
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Friend'
 */

/**
 * @swagger
 * /friends/{friendId}:
 *   get:
 *     summary: Get a friend by ID
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friend
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friend'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /friends/{friendId}:
 *   put:
 *     summary: Update a friend
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friend
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FriendInput'
 *     responses:
 *       "200":
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Friend'
 *       "400":
 *         $ref: '#/components/responses/BadRequest'
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */



/**
 * @swagger
 * /friends/{friendId}:
 *   delete:
 *     summary: Delete a friend
 *     tags: [Friends]
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the friend
 *     responses:
 *       "204":
 *         description: No content
 *       "404":
 *         $ref: '#/components/responses/NotFound'
 */

module.exports = router;
