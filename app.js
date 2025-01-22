const express = require('express');
const session = require('express-session');
const logoutRoute = require('./logout');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const app = express();

// ミドルウェア
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname)));
app.use('/views', express.static(path.join(__dirname, 'views')));

// データベース接続
const db = new sqlite3.Database('./db/database.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// セッション設定
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
}));
// ログアウトルートの登録
app.use('/logout', logoutRoute);



// ルーティング
app.get('/', (req, res) => res.render('login')); // ログイン画面
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) return res.send('Error occurred');
        if (user && bcrypt.compareSync(password, user.password)) {
            req.session.username = username; // ここでセッションに保存
            res.redirect('/calendar');
        } else {
            res.send('Invalid username or password');
        }
    });
});
app.get('/get-username', (req, res) => {
    if (req.session.username) {
    res.json({ username: req.session.username });
    } else {
    res.status(401).send('未ログイン');
    }
});

app.get('/register', (req, res) => res.render('register')); // 登録画面
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // ユーザー名が既に存在するかを確認
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.send('Error occurred');
        }

        if (row) {
            // ユーザーが既に存在する場合
            return res.send('User already exists');
        } else {
            // ユーザー名が未登録の場合、新規登録を行う
            const hashedPassword = bcrypt.hashSync(password, 10);
            db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], (err) => {
                if (err) {
                    console.error(err.message);
                    return res.send('Error occurred while saving the user');
                }
                res.redirect('/');
            });
        }
    });
});


app.get('/calendar', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'calendar.html'));
});

app.get('/calendar', (req, res) => {
    if (req.session.username) {
        res.render('calendar', { username: req.session.username }); // セッションからユーザー名を渡す
    } else {
        res.redirect('/'); // ログインしていない場合はログイン画面へリダイレクト
    }
});

// サーバー起動
app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});