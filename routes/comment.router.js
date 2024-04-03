import { addComment, getAllComments, getCommentByScheduledId } from "../arquitecture/Controllers/comment.controller.js";
import express from 'express';
const router = express.Router();

router.post('/add', [], addComment)
router.get('/getCommentByScheduledId/:id', [], getCommentByScheduledId)
router.get('/get', [], getAllComments)

export default router