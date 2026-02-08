const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// データを保存する場所（サーバーが動いている間だけ有効）
let rooms = {};     // 部屋データ
let userLikes = {}; // いいねデータ { "userId": 5, "userId2": 10 }

// --- ❤️ いいね機能 ---

// 1. いいねを送る (相手のIDを指定して +1 する)
app.post('/likes/send', (req, res) => {
    const { toUserId } = req.body;

    if (!toUserId) {
        return res.status(400).json({ success: false, message: "IDが必要です" });
    }

    if (!userLikes[toUserId]) {
        userLikes[toUserId] = 0;
    }

    userLikes[toUserId] += 1;

    console.log(`❤️ いいね受信: User ${toUserId} (合計: ${userLikes[toUserId]})`);
    res.json({ success: true, currentCount: userLikes[toUserId] });
});

// 2. 自分のいいねを受け取る (受け取ったら 0 にリセットする)
app.post('/likes/collect', (req, res) => {
    const { myUserId } = req.body;

    if (!myUserId) {
        return res.status(400).json({ success: false });
    }

    const count = userLikes[myUserId] || 0;

    // 受け取ったのでリセット
    userLikes[myUserId] = 0;

    if (count > 0) {
        console.log(`🎁 いいね回収: User ${myUserId} が ${count}個 回収しました`);
    }

    res.json({ success: true, count: count });
});


// --- 🌍 部屋（国）機能 ---

// 3. 新しい国を作る
app.post('/rooms', (req, res) => {
    const { id, name } = req.body;
    if (!rooms[id]) {
        rooms[id] = {
            id,
            name,
            members: [] // { id, name, time, animal, lastActivity, goals }
        };
        console.log(`🏰 建国: ${name} (ID: ${id})`);
        res.json({ success: true, room: rooms[id] });
    } else {
        res.json({ success: false, message: 'ID already exists' });
    }
});

// 4. 国の情報を取得
app.get('/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms[roomId];
    if (room) {
        res.json(room);
    } else {
        res.status(404).json({ message: 'Room not found' });
    }
});

// 5. 国に参加 / データを更新 (定期的に呼ばれる)
app.post('/rooms/:roomId/join', (req, res) => {
    const { roomId } = req.params;
    // goals も受け取るように更新
    const { id, name, time, animal, lastActivity, goals } = req.body;

    if (!rooms[roomId]) {
        return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // 既存メンバーを探す
    const memberIndex = rooms[roomId].members.findIndex(m => m.id === id);

    const memberData = {
        id,
        name,
        time,
        animal,
        lastActivity,
        goals, // 目標リストも保存
        lastSeen: new Date() // 最終アクセス日時（将来的に掃除機能をつける時用）
    };

    if (memberIndex > -1) {
        // 情報を更新
        rooms[roomId].members[memberIndex] = memberData;
    } else {
        // 新規参加
        rooms[roomId].members.push(memberData);
        console.log(`👋 参加: ${name} が ${rooms[roomId].name} に来ました`);
    }

    res.json({ success: true, roomData: [rooms[roomId]] });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});