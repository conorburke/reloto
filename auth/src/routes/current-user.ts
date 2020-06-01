import express from 'express';

// import { currentUser } from '../middlewares/current-user';
import { currentUser } from '@reloto/common';

const router = express.Router();

router.get('/api/users/currentuser', currentUser, (req, res) => {
    
    // don't need any below now thanks to currentUser middleware
    
    // if (!req.session || !req.session.jwt) {
    // if (!req.session?.jwt) {
    //     return res.send({ currentUser: null });
    // }

    // try {
    //     const payload = jwt.verify(req.session.jwt, process.env.JWT_KEY!);
    //     res.send({ currentUser: payload });
    // } catch (err) {
    //     return res.send({ currentUser: null });
    // }

    res.send({ currentUser: req.currentUser || null });
    
});

export { router as currentUserRouter };