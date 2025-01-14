const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.send('Error logging out');
        }
        res.redirect('/'); // ログイン画面やホーム画面にリダイレクト
    });
});

module.exports = router;
