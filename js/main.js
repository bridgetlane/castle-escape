window.onload = function() {    
    "use strict";
    var game = new Phaser.Game( 800, 600, Phaser.AUTO, 'game', { preload: preload, create: create, update: update } );
    
    // map
    var map;
    var tileset;
    
    // layers
    var platforms;
    var drown;
    
    // player
    var player;
    var facing = "still";
    
    // controls
    var cursors;
    
    // groups/objects
    var breakbox;
    var kittybox;
    var badbox;
    var explosion;
    var k_found = 0;
    var portal;
    var exit;
    var exit_text;
    
    // audio
    var bgmusic;
    var bomb_sound;
    var break_sound;
    var success_sound;
    
    function preload() {
        // Load images for map
        game.load.image('tiles_img', 'assets/img/tiles_spritesheet.png');
        game.load.tilemap('map_json', 'assets/map/map.json', null, Phaser.Tilemap.TILED_JSON);
        game.load.image('castle_bg', 'assets/img/background.png');
        
        // Load images for sprite
        game.load.image('dude', 'assets/img/p2_stand.png');
        
        // Load images for boxes
        game.load.image('breakbox', 'assets/img/boxAlt.png');
        game.load.image('kitties', 'assets/img/boxCoin.png');
        game.load.image('explode', 'assets/img/boxExplosive.png');
        game.load.image('particle', 'assets/img/bombFlash.png');
        game.load.image('found', 'assets/img/kittiesfound.png');
        
        // Load portal, exit door
        game.load.image('portal_img', 'assets/img/portal.png');
        game.load.image('exit_img', 'assets/img/closeddoor.png');
        
        // Load audio
        game.load.audio('background', ['assets/audio/background.mp3'], ['assets/audio/background.ogg']);
        game.load.audio('bomb', ['assets/audio/bomb.mp3', 'assets/audio/bomb.ogg']);
        game.load.audio('break', ['assets/audio/crateBreak.mp3', 'assets/audio/crateBreak.ogg']);
        game.load.audio('success', ['assets/audio/success.mp3', 'assets/audio/success.ogg']);
    }
    
   function audioStartUp() {
        // Load background music
        bgmusic = game.add.audio('background', 1, true);
        bgmusic.play('', 0, 1, true);
        
        // Load audio for use later
        bomb_sound = game.add.audio('bomb');
        break_sound = game.add.audio('break');
        success_sound = game.add.audio('success');
    }
    
    function create() {
        // Start up the audio
        audioStartUp();
    
        // Enable physics, gravity
        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.physics.arcade.gravity.y = 300;
        
        // Add background and welcome message
        game.add.tileSprite(0, 0, 2100, 2100, 'castle_bg');
        
        // Add the tilemap
        map = game.add.tilemap('map_json');
        map.addTilesetImage('tiles_spritesheet', 'tiles_img');
        
        // Add the layers
        platforms = map.createLayer("Solid platforms");
        platforms.resizeWorld();
        drown = map.createLayer("Lava and Water");
        drown.resizeWorld();
        
        // Set collisions for each layer
        map.setCollisionByExclusion([]);
        map.setCollisionByExclusion([139, 103], true, drown, true);
      
        // Set the boxes, portal, and exit
        setBoxes();
        setPortal();
        setExit();
        
        // Add the sprite
        player = game.add.sprite(50, 1990, 'dude');
        player.anchor.set(0.5);
        game.physics.enable(player, Phaser.Physics.ARCADE);
        player.body.collideWorldBounds = true;       
        game.camera.follow(player);
        
        // Create the controls
        cursors = game.input.keyboard.createCursorKeys();
    }
    
    function die() {
        // Audio for explosion-like sound
        bomb_sound.play();
        
        // Kill the player
        player.kill();
        
        // Destroy the interactive boxes and text, then reset them
        breakbox.destroy(true);
        kittybox.destroy(true);
        k_found = 0;
        badbox.destroy(true);
        setBoxes();
        exit_text.text = "";
        
        // Place the player back at start
        player.x = 50;
        player.y = 1990;
        
        // Bring the player back to life
        player.alive = true;
        player.exists = true;
        player.visible = true;
    }
    
    function explode(player, box) {
        // Audio for the crate break
        break_sound.play();
    
        // Create and unleash the bomb flash
        explosion = game.add.emitter(box.x, box.y);
        explosion.makeParticles('particle', 1, 1, false, false);
        explosion.explode(500, 1);
        
        // Destroy the box
        box.destroy();
    }
    
    function kittyfound(player, box) {
        // Success-sounding audio for finding the kittens
        success_sound.play();
        
        // Mark kittens as found
        k_found = 1;
        exit_text.text = "\nYou found the kitties,\nget out of here!";
        
        // Destroy the box and flash text letting player know
        box.destroy();
        function flash_text() {
            var show = game.add.emitter(box.x, box.y);
            show.makeParticles('found', 1, 1, false, false);
            show.explode(500, 1);
        }
        flash_text();
    }
    
    function setPortal() {
        portal = game.add.sprite(210, 1120, 'portal_img');
        game.physics.enable(portal, Phaser.Physics.ARCADE);
        portal.body.immovable = true;
        portal.body.moves = false;
        
        exit_text = game.add.text(1610, 0, '');
        exit_text.font = 'Lucida Console';
    }
    
    function hitPortal() {
        // find the player's destiny
        var destiny = game.rnd.integerInRange(0, 2);
        
        // release player over box
        if (destiny === 0) { player.x = 2090; player.y = 1400; }
        // release player over water
        else if (destiny === 1) { player.x = 1470; player.y = 840; }
        // release player over stairs
        else { player.x = 1680; player.y = 210; }
    }
    
    function setExit() {
        exit = game.add.sprite(2030, 0, 'exit_img');
        game.physics.enable(exit, Phaser.Physics.ARCADE);
        exit.body.immovable = true;
        exit.body.moves = false;
    }
    
    function hitExit() {
        if (k_found === 0) {
            exit_text.text = "\nYou can't leave!\nKitties have not\nbeen retrieved!";
        }
        else {
            exit_text.text = "\nYOU SAVED THE BOX \nOF KITTIES, YOU WIN!";
        }
    }
    
    function setBoxes() {
        // create the breakable boxes
        breakbox = game.add.group();
        breakbox.enableBody = true;
        var box;
        
        kittybox = game.add.group();
        kittybox.enableBody = true;
        badbox = game.add.group();
        badbox.enableBody = true;
        
        // bottom row: 0
        box = breakbox.create(2030, 2030, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1960, 2030, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1890, 2030, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1820, 2030, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1680, 2030, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
       
        // row 1
        box = badbox.create(2030, 1960, 'explode'); // this should be the danger box!
        box.body.immovable = true;
        box.body.moves = false;
        box = kittybox.create(1820, 1960, 'kitties'); // this should be the kitty box!
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1750, 1960, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // row 2
        box = breakbox.create(2030, 1890, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1960, 1890, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1820, 1890, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1750, 1890, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // row 3
        box = breakbox.create(2030, 1820, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1960, 1820, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1750, 1820, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1680, 1820, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // row 4
        box = breakbox.create(2030, 1750, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1820, 1750, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1750, 1750, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1680, 1750, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // row 5
        box = breakbox.create(2030, 1680, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1890, 1680, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1820, 1680, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1680, 1680, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // row 6
        box = breakbox.create(2030, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1960, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1890, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1820, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1750, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1680, 1610, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        
        // set the breakboxes for the platform
        box = breakbox.create(1610, 700, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1610, 630, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1400, 700, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1400, 630, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1330, 700, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
        box = breakbox.create(1330, 630, 'breakbox');
        box.body.immovable = true;
        box.body.moves = false;
    }
    
    function update() {
        // make sure the player collides with the platforms
        game.physics.arcade.collide(player, platforms);
        
        // make player die when they fall into lava/water
        game.physics.arcade.collide(player, drown, die, null, this); 
        
        // when a player hits a breakable box, it should explode
        game.physics.arcade.overlap(player, breakbox, explode, null, this);

        // when a player hits the box with the kitties, respond appropriately
        game.physics.arcade.overlap(player, kittybox, kittyfound, null, this);
        
        // when a player hits the bad box, they die
        game.physics.arcade.overlap(player, badbox, die, null, this);
        
        // when a player walks into a portal, transport them
        game.physics.arcade.overlap(player, portal, hitPortal, null, this);
        
        // when the player finds the exit, handle it
        game.physics.arcade.overlap(player, exit, hitExit, null, this);
    
    
        if (cursors.right.isDown && cursors.up.isDown && player.body.onFloor()) {
            player.body.velocity.y = -450;
        }
        if (cursors.left.isDown && cursors.up.isDown && player.body.onFloor()) {
            player.body.velocity.y = -450;
        }
        if (cursors.right.isDown) {
            player.body.velocity.x = 450;
        }
        else if (cursors.left.isDown) {
            player.body.velocity.x = -450;
        }
        else if (cursors.up.isDown && player.body.onFloor()) {
            player.body.velocity.y = -450;
        }
        else {
            player.body.velocity.x = 0;
        }
    }
};
