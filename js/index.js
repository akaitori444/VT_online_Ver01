/**
 * Author: Michael Hadley, mikewesthad.com
 * Asset Credits:
 *  - Tuxemon, https://github.com/Tuxemon/Tuxemon
 */
//-----------------------------------------------------------------------------------//
//config
//-----------------------------------------------------------------------------------//
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  parent: "game-container",
  pixelArt: true,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let cursors;
let player;
let showDebug = false;

//-----------------------------------------------------------------------------------//
//preload
//-----------------------------------------------------------------------------------//
function preload() {
  this.load.image("tiles", "../assets/tilesets/tuxmon-sample-32px-extruded.png");
  this.load.tilemapTiledJSON("map", "../assets/tilemaps/tuxemon-town.json");

  // アトラスは、複数の画像を 1 つのテクスチャにまとめる方法です。 私はそれを使ってすべてをロードしています
  // プレーヤーのアニメーション (左に歩く、右に歩くなど) を 1 つの画像にまとめます。 詳細については、次を参照してください。
  //  https://labs.phaser.io/view.html?src=src/animation/texture%20atlas%20animation.js
  this.load.atlas("atlas", "../assets/atlas/atlas.png", "../assets/atlas/atlas.json");
  // アトラスを使用しない場合は、スプライト シートを使用して同じことを行うことができます。以下を参照してください。
  //  https://labs.phaser.io/view.html?src=src/animation/single%20sprite%20sheet.js
  //this.load.spritesheet('witch', 'assets/witch.png',{ frameWidth: 32, frameHeight: 32 });
}
//-----------------------------------------------------------------------------------//
//create
//-----------------------------------------------------------------------------------//
function create() {
  const map = this.make.tilemap({ key: "map" });

  // パラメータは、Tiled でタイルセットに付けた名前で、次にタイルセット イメージのキーです
  // Phaser のキャッシュ (つまり、プリロードで使用した名前)
  const tileset = map.addTilesetImage("tuxmon-sample-32px-extruded", "tiles");

  // パラメータ: Tiled、tileset、x、y のレイヤー名 (またはインデックス)
  const belowLayer = map.createLayer("Below Player", tileset, 0, 0);
  const worldLayer = map.createLayer("World", tileset, 0, 0);
  const aboveLayer = map.createLayer("Above Player", tileset, 0, 0);

  worldLayer.setCollisionByProperty({ collides: true });

  // デフォルトでは、作成した順序ですべてが画面上で深度ソートされます。 ここで、私たちは
  // "Above Player" レイヤーをプレーヤーの上に置きたいので、明示的に深さを与えます。
  // 深度の高いオブジェクトは、深度の低いオブジェクトの上に置かれます。
  aboveLayer.setDepth(10);

  // Tiled のオブジェクト レイヤーでは、スポーン ポイントやカスタムなどの追加情報をマップに埋め込むことができます
  // 衝突形状。 tmx ファイルには、"Spawn Point" という名前のポイントを持つオブジェクト レイヤーがあります。
  const spawnPoint = map.findObject("Objects", (obj) => obj.name === "Spawn Point");

  // 物理システムを介して物理を有効にしたスプライトを作成します。 スプライトに使用される画像は
  // 少し空白なので、setSize と setOffset を使用してプレーヤーの体のサイズを制御します。
  player = this.physics.add
    .sprite(spawnPoint.x, spawnPoint.y, "atlas", "misa-front")
    .setSize(30, 40)
    .setOffset(0, 24);

/*  pl2 = this.add.sprite(400,300,'witch');
  this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers('witch', { start: 0, end: 2 }),
      frameRate: 5,
      repeat: -1
  });
  player.anims.play('down',true);*/

  //プレイヤーとworldLayerの接触判定。
  this.physics.add.collider(player, worldLayer);

  // テクスチャ アトラスからプレイヤーの歩行アニメーションを作成します。 これらはグローバルに保存されます
  // アニメーション マネージャー。すべてのスプライトがアクセスできるようにします。
  const anims = this.anims;
  anims.create({
    key: "misa-left-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-left-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-right-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-right-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-front-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-front-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });
  anims.create({
    key: "misa-back-walk",
    frames: anims.generateFrameNames("atlas", {
      prefix: "misa-back-walk.",
      start: 0,
      end: 3,
      zeroPad: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

/*  anims.create({
    key: 'down',
    frames: this.anims.generateFrameNumbers('witch',    { start: 0, end: 2 
    }),
    frameRate: 5,
    repeat: -1
  }),*/




  const camera = this.cameras.main;
  camera.startFollow(player);
  camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);

  cursors = this.input.keyboard.createCursorKeys();

  // 画面上の「固定」位置を持つヘルプ テキスト
  this.add
    .text(16, 16, `矢印キーで移動\n街を探索してみましょう\n街を探索してみましょう\n左にコメントが打ち込めます\n現在のコメント数:${this.documents}`, {
      font: "18px monospace",
      fill: "#000000",
      padding: { x: 20, y: 10 },
      backgroundColor: "#ffffff",
    })
    .setScrollFactor(0)
    .setDepth(30);
  //------------------------------------------------------------------------------------------------------//
  // グラフィックをデバッグする
  this.input.keyboard.once("keydown-D", (event) => {
    // 物理デバッグをオンにして、プレイヤーのヒットボックスを表示します
    this.physics.world.createDebugGraphic();

    // プレイヤーの上、ヘルプ テキストの下に worldLayer 衝突グラフィックを作成します
    const graphics = this.add.graphics().setAlpha(0.75).setDepth(20);
    /*worldLayer.renderDebug(graphics, {
      tileColor: null, // 衝突しないタイルの色
      collidingTileColor: new Phaser.Display.Color(243, 134, 48, 255), // 衝突するタイルの色
      faceColor: new Phaser.Display.Color(40, 39, 37, 255), // 衝突する面のエッジの色
    });*/
  //------------------------------------------------------------------------------------------------------//
});
}

function update(time, delta) {
  const speed = 300;
  const prevVelocity = player.body.velocity.clone();

  // 最後のフレームから前の動きを停止します
  player.body.setVelocity(0);

  // 水平移動
  if (cursors.left.isDown) {
    player.body.setVelocityX(-speed);
  } else if (cursors.right.isDown) {
    player.body.setVelocityX(speed);
  }

  // 垂直移動
  if (cursors.up.isDown) {
    player.body.setVelocityY(-speed);
  } else if (cursors.down.isDown) {
    player.body.setVelocityY(speed);
  }

  // 速度を正規化およびスケーリングして、プレイヤーが対角線に沿って速く移動できないようにします
  player.body.velocity.normalize().scale(speed);

  // アニメーションを最後に更新し、左右のアニメーションを上下のアニメーションより優先します
  if (cursors.left.isDown) {
    player.anims.play("misa-left-walk", true);
  } else if (cursors.right.isDown) {
    player.anims.play("misa-right-walk", true);
  } else if (cursors.up.isDown) {
    player.anims.play("misa-back-walk", true);
  } else if (cursors.down.isDown) {
    player.anims.play("misa-front-walk", true);
  } else {
    player.anims.stop();

  // 移動中の場合は、使用するフレームを選択してアイドル状態にします
    if (prevVelocity.x < 0) player.setTexture("atlas", "misa-left");
    else if (prevVelocity.x > 0) player.setTexture("atlas", "misa-right");
    else if (prevVelocity.y < 0) player.setTexture("atlas", "misa-back");
    else if (prevVelocity.y > 0) player.setTexture("atlas", "misa-front");
  }
}
