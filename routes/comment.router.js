import { addComment, getCommentByScheduledId } from "../arquitecture/Controllers/comment.controller.js";
import express from 'express';
const router = express.Router();

router.post('/add', [], addComment)
router.get('/getCommentByScheduledId/:id', [], getCommentByScheduledId)

export default router