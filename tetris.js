// テトリスゲーム - JavaScriptとHTML5 Canvas実装

// キャンバスの設定
const canvas = document.getElementById('tetris');
const ctx = canvas.getContext('2d');
const nextPieceCanvas = document.getElementById('nextPiece');
const nextPieceCtx = nextPieceCanvas.getContext('2d');
const holdPieceCanvas = document.getElementById('holdPiece');
const holdPieceCtx = holdPieceCanvas.getContext('2d');

// ゲームオーバー画面とポーズ画面の要素
const gameOverScreen = document.getElementById('game-over');
const finalScoreElement = document.getElementById('final-score');
const retryButton = document.getElementById('retry-btn');
const pauseScreen = document.getElementById('game-pause');
const resumeButton = document.getElementById('resume-btn');

// ゲームの設定
const ROWS = 20;      // 盤面の行数
const COLS = 10;      // 盤面の列数
const BLOCK_SIZE = 30; // 1ブロックのサイズ（ピクセル）
const EMPTY = 'black'; // 空のセルの色

// スコア表示要素
const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');

// ゲームの状態
let score = 0;
let level = 1;
let lines = 0;
let gameOver = false;
let gamePaused = false;
let dropStart = 0;
let gameSpeed = 1000; // 初期の落下速度（ミリ秒）
let canHold = true; // ホールド機能を使用可能かどうか
let holdPiece = null; // ホールドしているピース
let animationId = null; // アニメーションフレームのID

// 盤面の初期化（2次元配列）
let board = [];
for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
        board[r][c] = EMPTY;
    }
}

// 盤面を描画する関数
function drawBoard() {
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            drawBlock(c, r, board[r][c]);
        }
    }
}

// ブロックを描画する関数
function drawBlock(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
    ctx.strokeStyle = '#555';
    ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// ゲーム初期化関数
function init() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 盤面を描画
    drawBoard();
    
    // スコア表示を更新
    updateScore();
}

// スコア表示を更新する関数
function updateScore() {
    scoreElement.textContent = score;
    levelElement.textContent = level;
    linesElement.textContent = lines;
}

// ゲーム開始時に初期化を実行
window.onload = function() {
    init();
    // キーボードイベントリスナーを追加
    document.addEventListener('keydown', control);
    // リトライボタンにイベントリスナーを追加
    retryButton.addEventListener('click', resetGame);
    // レジュームボタンにイベントリスナーを追加
    resumeButton.addEventListener('click', togglePause);
};

// キーボード操作の制御
function control(event) {
    // ゲームオーバー時は操作を受け付けない
    if (gameOver) return;
    
    // デフォルトのスクロール動作を防止
    if ([27, 32, 37, 38, 39, 40, 67, 80].includes(event.keyCode)) {
        event.preventDefault();
    }
    
    // ポーズ機能（ESCキーまたはPキー）
    if (event.keyCode === 27 || event.keyCode === 80) {
        togglePause();
        return;
    }
    
    // ポーズ中は他の操作を受け付けない
    if (gamePaused) return;
    
    // 矢印キーとスペースキーの操作
    if (event.keyCode === 37) {
        // 左矢印キー
        currentPiece.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode === 38) {
        // 上矢印キー
        currentPiece.rotate();
        dropStart = Date.now();
    } else if (event.keyCode === 39) {
        // 右矢印キー
        currentPiece.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode === 40) {
        // 下矢印キー
        currentPiece.moveDown();
    } else if (event.keyCode === 32) {
        // スペースキー
        currentPiece.hardDrop();
    } else if (event.keyCode === 67) {
        // Cキー - ホールド機能
        holdPieceFunction();
    }
}

// テトリミノを自動で落下させる関数
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    
    if (delta > gameSpeed) {
        currentPiece.moveDown();
        dropStart = Date.now();
    }
    
    if (!gameOver && !gamePaused) {
        animationId = requestAnimationFrame(drop);
    }
}

// テトリミノの色
const COLORS = [
    null,
    '#FF0D72', // I
    '#0DC2FF', // J
    '#0DFF72', // L
    '#F538FF', // O
    '#FF8E0D', // S
    '#FFE138', // T
    '#3877FF'  // Z
];

// テトリミノの形状定義（各テトリミノは4つの回転状態を持つ）
const PIECES = [
    // 空のピース（インデックス0）
    [
        [0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0]
    ],
    
    // I-ピース（インデックス1）
    [
        [0, 0, 0, 0,
         1, 1, 1, 1,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 0, 1, 0,
         0, 0, 1, 0,
         0, 0, 1, 0,
         0, 0, 1, 0],
         
        [0, 0, 0, 0,
         0, 0, 0, 0,
         1, 1, 1, 1,
         0, 0, 0, 0],
         
        [0, 1, 0, 0,
         0, 1, 0, 0,
         0, 1, 0, 0,
         0, 1, 0, 0]
    ],
     
    // J-ピース（インデックス2）
    [
        [2, 0, 0, 0,
         2, 2, 2, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 2, 2, 0,
         0, 2, 0, 0,
         0, 2, 0, 0,
         0, 0, 0, 0],
         
        [0, 0, 0, 0,
         2, 2, 2, 0,
         0, 0, 2, 0,
         0, 0, 0, 0],
         
        [0, 2, 0, 0,
         0, 2, 0, 0,
         2, 2, 0, 0,
         0, 0, 0, 0]
    ],
     
    // L-ピース（インデックス3）
    [
        [0, 0, 3, 0,
         3, 3, 3, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 3, 0, 0,
         0, 3, 0, 0,
         0, 3, 3, 0,
         0, 0, 0, 0],
         
        [0, 0, 0, 0,
         3, 3, 3, 0,
         3, 0, 0, 0,
         0, 0, 0, 0],
         
        [3, 3, 0, 0,
         0, 3, 0, 0,
         0, 3, 0, 0,
         0, 0, 0, 0]
    ],
     
    // O-ピース（インデックス4）
    [
        [0, 4, 4, 0,
         0, 4, 4, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 4, 4, 0,
         0, 4, 4, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 4, 4, 0,
         0, 4, 4, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 4, 4, 0,
         0, 4, 4, 0,
         0, 0, 0, 0,
         0, 0, 0, 0]
    ],
     
    // S-ピース（インデックス5）
    [
        [0, 5, 5, 0,
         5, 5, 0, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 5, 0, 0,
         0, 5, 5, 0,
         0, 0, 5, 0,
         0, 0, 0, 0],
         
        [0, 0, 0, 0,
         0, 5, 5, 0,
         5, 5, 0, 0,
         0, 0, 0, 0],
         
        [5, 0, 0, 0,
         5, 5, 0, 0,
         0, 5, 0, 0,
         0, 0, 0, 0]
    ],
     
    // T-ピース（インデックス6）
    [
        [0, 6, 0, 0,
         6, 6, 6, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 6, 0, 0,
         0, 6, 6, 0,
         0, 6, 0, 0,
         0, 0, 0, 0],
         
        [0, 0, 0, 0,
         6, 6, 6, 0,
         0, 6, 0, 0,
         0, 0, 0, 0],
         
        [0, 6, 0, 0,
         6, 6, 0, 0,
         0, 6, 0, 0,
         0, 0, 0, 0]
    ],
     
    // Z-ピース（インデックス7）
    [
        [7, 7, 0, 0,
         0, 7, 7, 0,
         0, 0, 0, 0,
         0, 0, 0, 0],
         
        [0, 0, 7, 0,
         0, 7, 7, 0,
         0, 7, 0, 0,
         0, 0, 0, 0],
         
        [0, 0, 0, 0,
         7, 7, 0, 0,
         0, 7, 7, 0,
         0, 0, 0, 0],
         
        [0, 7, 0, 0,
         7, 7, 0, 0,
         7, 0, 0, 0,
         0, 0, 0, 0]
    ]
];

// 現在のピースと次のピース
let currentPiece = null;
let nextPiece = null;

// ピースクラス
class Piece {
    constructor(tetromino, color) {
        this.tetromino = tetromino;
        this.color = color;
        
        this.tetrominoN = 0; // 回転の状態（0～3）
        this.activeTetromino = this.tetromino[this.tetrominoN];
        
        // 開始位置
        this.x = 3;
        this.y = -2;
    }
    
    // ピースを左に移動
    moveLeft() {
        if (!this.collision(-1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x--;
            this.draw();
        }
    }
    
    // ピースを右に移動
    moveRight() {
        if (!this.collision(1, 0, this.activeTetromino)) {
            this.unDraw();
            this.x++;
            this.draw();
        }
    }
    
    // ピースを回転
    rotate() {
        // 次の回転状態を計算
        let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
        let kick = 0;
        
        // 回転後に壁にぶつかる場合は位置を調整（壁蹴り）
        if (this.collision(0, 0, nextPattern)) {
            if (this.x > COLS / 2) {
                // 右壁にぶつかる場合は左に移動
                kick = -1;
            } else {
                // 左壁にぶつかる場合は右に移動
                kick = 1;
            }
        }
        
        // 壁蹴りを考慮して回転が可能か確認
        if (!this.collision(kick, 0, nextPattern)) {
            this.unDraw();
            this.x += kick;
            this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
            this.activeTetromino = this.tetromino[this.tetrominoN];
            this.draw();
        }
    }
    
    // ピースを即時落下
    hardDrop() {
        while (!this.collision(0, 1, this.activeTetromino)) {
            this.unDraw();
            this.y++;
        }
        this.draw();
        this.lock();
        getNextPiece();
    }
    
    // 衝突判定
    collision(x, y, piece) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                // ピースの範囲外の場合はスキップ
                if (!piece[r * 4 + c]) {
                    continue;
                }
                
                // 移動後の位置を計算
                let newX = this.x + c + x;
                let newY = this.y + r + y;
                
                // 壁との衝突判定
                if (newX < 0 || newX >= COLS || newY >= ROWS) {
                    return true;
                }
                
                // 上部の境界を無視（テトリミノが盤面の上に出ている場合）
                if (newY < 0) {
                    continue;
                }
                
                // 他のブロックとの衝突判定
                if (board[newY][newX] !== EMPTY) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // ピースを下に移動
    moveDown() {
        if (!this.collision(0, 1, this.activeTetromino)) {
            this.unDraw();
            this.y++;
            this.draw();
            return true;
        } else {
            // 衝突した場合は盤面に固定
            this.lock();
            // 新しいピースを取得
            getNextPiece();
            return false;
        }
    }
    
    // ピースを盤面に固定
    lock() {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                // ピースの範囲外の場合はスキップ
                if (!this.activeTetromino[r * 4 + c]) {
                    continue;
                }
                
                // ゲームオーバー判定（ピースが盤面の上部に達した場合）
                if (this.y + r < 0) {
                    gameOver = true;
                    showGameOver();
                    break;
                }
                
                // 盤面にピースを固定
                board[this.y + r][this.x + c] = this.color;
            }
        }
        
        // 揃ったラインを消去してスコアを計算
        let linesCleared = 0;
        for (let r = 0; r < ROWS; r++) {
            let isLineComplete = true;
            
            // 行が全て埋まっているかチェック
            for (let c = 0; c < COLS; c++) {
                if (board[r][c] === EMPTY) {
                    isLineComplete = false;
                    break;
                }
            }
            
            // 揃った行を消去
            if (isLineComplete) {
                // 消去した行数をカウント
                linesCleared++;
                
                // 上の行を下に落とす
                for (let y = r; y > 0; y--) {
                    for (let c = 0; c < COLS; c++) {
                        board[y][c] = board[y-1][c];
                    }
                }
                
                // 最上部の行を空にする
                for (let c = 0; c < COLS; c++) {
                    board[0][c] = EMPTY;
                }
            }
        }
        
        // スコアの計算
        if (linesCleared > 0) {
            // 消去した行数に応じてスコアを計算
            // 1行: 100点、 2行: 300点、 3行: 500点、 4行: 800点
            const points = [0, 100, 300, 500, 800];
            score += points[linesCleared] * level;
            
            // 消去した行数を加算
            lines += linesCleared;
            
            // 10行消去ごとにレベルアップ
            if (lines >= level * 10) {
                level++;
                // レベルが上がるごとにゲームスピードを速くする
                gameSpeed = Math.max(50, 1000 - (level - 1) * 100);
            }
            
            // スコア表示を更新
            updateScore();
            
            // 盤面を再描画
            drawBoard();
        }
    }
    
    // ピースの現在の形状を取得
    fill(color) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.activeTetromino[r * 4 + c]) {
                    drawBlock(this.x + c, this.y + r, color);
                }
            }
        }
    }
    
    // ピースを描画
    draw() {
        this.fill(this.color);
    }
    
    // ピースを消去（移動時に使用）
    unDraw() {
        this.fill(EMPTY);
    }
    
    // 次のピースをプレビューエリアに描画
    drawNext() {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.tetromino[0][r * 4 + c]) {
                    nextPieceCtx.fillStyle = this.color;
                    nextPieceCtx.fillRect(c * 20 + 10, r * 20 + 10, 20, 20);
                    nextPieceCtx.strokeStyle = '#555';
                    nextPieceCtx.strokeRect(c * 20 + 10, r * 20 + 10, 20, 20);
                }
            }
        }
    }
    
    // ホールドピースをホールドエリアに描画
    drawHold() {
        holdPieceCtx.clearRect(0, 0, holdPieceCanvas.width, holdPieceCanvas.height);
        
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.tetromino[0][r * 4 + c]) {
                    holdPieceCtx.fillStyle = this.color;
                    holdPieceCtx.fillRect(c * 20 + 10, r * 20 + 10, 20, 20);
                    holdPieceCtx.strokeStyle = '#555';
                    holdPieceCtx.strokeRect(c * 20 + 10, r * 20 + 10, 20, 20);
                }
            }
        }
    }
}

// ランダムなピースを生成する関数
function randomPiece() {
    const pieceType = Math.floor(Math.random() * 7) + 1; // 1～7のランダムな数値
    return new Piece(PIECES[pieceType], COLORS[pieceType]);
}

// 次のピースを生成する関数
function getNextPiece() {
    if (nextPiece === null) {
        nextPiece = randomPiece();
    }
    
    currentPiece = nextPiece;
    nextPiece = randomPiece();
    nextPiece.drawNext();
    
    // 新しいピースが生成されたらホールド機能を再度使用可能に
    canHold = true;
}

// ホールド機能の実装
function holdPieceFunction() {
    if (!canHold) return;
    
    // 現在のピースを一時的に保存
    currentPiece.unDraw();
    
    if (holdPiece === null) {
        // 初めてホールドする場合
        holdPiece = new Piece(currentPiece.tetromino, currentPiece.color);
        holdPiece.drawHold();
        getNextPiece(); // 次のピースを取得
    } else {
        // すでにホールドしているピースがある場合
        const tempPiece = holdPiece;
        holdPiece = new Piece(currentPiece.tetromino, currentPiece.color);
        holdPiece.drawHold();
        
        // ホールドしていたピースを現在のピースにする
        currentPiece = new Piece(tempPiece.tetromino, tempPiece.color);
        currentPiece.draw();
    }
    
    // 一度ホールドしたら、次にピースが固定されるまでホールドできない
    canHold = false;
}

// ゲームオーバー画面を表示
function showGameOver() {
    finalScoreElement.textContent = score;
    gameOverScreen.classList.add('active');
    
    // アニメーションをキャンセル
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

// ポーズ機能の切り替え
function togglePause() {
    if (gameOver) return; // ゲームオーバー時はポーズできない
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        // ゲームをポーズ
        pauseScreen.classList.add('active');
        
        // アニメーションをキャンセル
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    } else {
        // ゲームを再開
        pauseScreen.classList.remove('active');
        dropStart = Date.now(); // 落下タイマーをリセット
        animationId = requestAnimationFrame(drop);
    }
}

// ゲームをリセット
function resetGame() {
    // ゲームオーバー画面を非表示
    gameOverScreen.classList.remove('active');
    
    // 盤面をリセット
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            board[r][c] = EMPTY;
        }
    }
    
    // ゲーム状態をリセット
    score = 0;
    level = 1;
    lines = 0;
    gameOver = false;
    gamePaused = false;
    gameSpeed = 1000;
    canHold = true;
    holdPiece = null;
    
    // アニメーションをキャンセル
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    
    // ホールドエリアをクリア
    holdPieceCtx.clearRect(0, 0, holdPieceCanvas.width, holdPieceCanvas.height);
    
    // ゲームを初期化
    init();
}

// ゲーム初期化関数
function init() {
    // キャンバスをクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 盤面を描画
    drawBoard();
    
    // 最初のピースを生成
    getNextPiece();
    
    // スコア表示を更新
    updateScore();
    
    // ゲームループを開始
    if (!gameOver) {
        dropStart = Date.now();
        drop();
    }
}
