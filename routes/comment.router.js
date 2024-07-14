import { addComment, 
    getAllComments, 
    getCommentByScheduledId, 
    getCommentsByService, 
    getCommentsRating,
    updateComment,
    deleteComment,
} from "../arquitecture/Controllers/comment.controller.js";
import { requireRefreshToken,  requireToken} from '../helpers/middlewares/JWT.config.js';
import express from 'express';
const router = express.Router();

router.post('/add', [], addComment)
router.get('/getCommentByScheduledId/:id', [], getCommentByScheduledId)
router.get('/get', [], getAllComments)
router.get('/rating', [], getCommentsRating)
router.get('/get/:idService', [], getCommentsByService)
router.put('/update/:id', requireToken, updateComment)
router.delete('/delete/:id', requireToken, deleteComment)

export default router