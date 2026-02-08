const express = require('express');
const cors = require('cors');
const app = express();

// 修正①：Renderのポート番号を使う（なければ3000）
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// データを保存する場所
let rooms = {};
let userLikes = {};

// 修正②：ブラウザでアクセスした時の確認用ページを追加
app.get('/', (req, res) => {
    res.send('Hello! Server is running correctly! 🚀 (サーバーは正常に動いています)');
});

// --- ❤️ いいね機能 ---
app.post('/likes/send', (req, res) => {
    const { toUserId } = req.body;
    if (!toUserId) return res.status(400).json({ success: false });
    if (!userLikes[toUserId]) userLikes[toUserId] = 0;
    userLikes[toUserId] += 1;
    console.log(`❤️ Like: ${toUserId} (${userLikes[toUserId]})`);
    res.json({ success: true, currentCount: userLikes[toUserId] });
});

app.post('/likes/collect', (req, res) => {
    const { myUserId } = req.body;
    if (!myUserId) return res.status(400).json({ success: false });
    const count = userLikes[myUserId] || 0;
    userLikes[myUserId] = 0;
    res.json({ success: true, count: count });
});

// --- 🌍 部屋機能 ---
app.post('/rooms', (req, res) => {
    const { id, name } = req.body;
    if (!rooms[id]) {
        rooms[id] = { id, name, members: [] };
        console.log(`🏰 New Room: ${name} (${id})`);
        res.json({ success: true, room: rooms[id] });
    } else {
        res.json({ success: false, message: 'ID already exists' });
    }
});

app.get('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    if (rooms[roomId]) res.json(rooms[roomId]);
    else res.status(404).json({ message: 'Room not found' });
});

app.post('/rooms/:roomId/join', (req, res) => {
    const { roomId } = req.params;
    const { id, name, time, animal, lastActivity, goals } = req.body;
    if (!rooms[roomId]) return res.status(404).json({ success: false });

    const memberIndex = rooms[roomId].members.findIndex(m => m.id === id);
    const memberData = { id, name, time, animal, lastActivity, goals, lastSeen: new Date() };

    if (memberIndex > -1) rooms[roomId].members[memberIndex] = memberData;
    else {
        rooms[roomId].members.push(memberData);
        console.log(`👋 Join: ${name} -> ${rooms[roomId].name}`);
    }
    res.json({ success: true, roomData: [rooms[roomId]] });
});

// 修正③：'0.0.0.0' を指定して、外部からのアクセスを確実に許可する
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});