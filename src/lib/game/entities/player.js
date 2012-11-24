ig.module(
    'game.entities.player'
)
    .requires(
    'impact.entity'
)
    .defines(function () {

    	PlayerState = {
            START: 'START',
            ENTERING: 'ENTERING',
            ENTERED: 'ENTERED',
    		PLAYING: 'PLAYING',
    		EXITIXING: 'EXITIXING'
    	};

        EntityPlayer = ig.Entity.extend({

            // The players (collision) size is a bit smaller than the animation
            // frames, so we have to move the collision box a bit (offset)
            size:{x:123, y:174},
            offset:{x:0, y:0},

            maxVel:{x:200, y:200},
            friction:{x:600, y:0},

            type:ig.Entity.TYPE.A, // Player friendly group
            checkAgainst:ig.Entity.TYPE.NONE,
            collides:ig.Entity.COLLIDES.PASSIVE,

            state: PlayerState.START,
            entrance: undefined,
            exitixi: undefined,

            originalAnimSheetWidth: 123,
            animSheet:new ig.AnimationSheet('media/player_entering.png', 123, 174),
            otherImage:new ig.Image( 'media/player.png' ),

            originalPos: undefined,

            accelGround:400,
            accelLadder:200,
            flip:false,

            init:function (x, y, settings) {
                this.parent(x, y, settings);
                this.dest = {x:x, y:y};
                this.animSheet.width = this.originalAnimSheetWidth;
                this.originalPos = this.pos;
                this.animSheet.width = 0;
                this.flip = true;

                // Add the animations
                this.addAnim('pause', 2, [0]);
                this.addAnim('idle', .3, [0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);
                this.addAnim('run', 0.1, [0, 1]);

                this.currentAnim.flip.x = this.flip;
            },

            collideWith:function (other, axis) {
                this.dest = this.pos; // Stop moving
                this.parent(other, axis);
            },

            update:function () {
                if (this.state == PlayerState.START && this.noEntrance)
                {
                    this.state = PlayerState.PLAYING;
                    this.animSheet.width = this.originalAnimSheetWidth;
                    this.animSheet.image = this.otherImage;
                    this.currentAnim.flip.x = false;
                    this.flip = false;
                    ig.game.state = GameState.ENTERED;
                }
                else if (this.state == PlayerState.START && this.entrance) {
                    this.pos.x = this.entrance.pos.x + this.entrance.size.x - 90;
                    this.state = PlayerState.ENTERING;
                }
                else if (this.state == PlayerState.ENTERING) {
                    this.animSheet.width = Math.min(this.size.x, (this.entrance.pos.x + this.entrance.size.x - this.pos.x - 90)*20.0);
                    
                    if (this.pos.x >= 30) {
                        this.vel.x = -this.maxVel.x / 10;
                    }
                    else {
                        this.state = PlayerState.ENTERED;
                        this.animSheet.image = this.otherImage;
                        this.flip = false;
                        this.currentAnim.flip.x = this.flip;
                        this.vel.x = this.maxVel.x;
                        this.entrance.closeDoor();
                        this.animSheet.width = this.originalAnimSheetWidth;
                    }
                }
                else if (this.state == PlayerState.ENTERED && this.entrance.isClosed()) {
                    this.entrance.kill();
                    this.dest = {x:this.pos.x, y:this.pos.y};
                    this.state = PlayerState.PLAYING;
                    ig.game.state = GameState.ENTERED;
                }
            	else if (this.state == PlayerState.PLAYING)
            	{
	                // move left or right
	                var accel = this.standing ? this.accelGround : this.accelLadder;
	                if (ig.input.pressed('click')) {
	                    this.startTime = new Date();
	                }
	                if (ig.input.released('click') && new Date() - this.startTime < 300) {
	                    this.dest = {
	                        x:ig.game.screen.x + ig.input.mouse.x - this.size.x / 2,
	                        y:ig.game.screen.y + ig.input.mouse.y
	                    };
	                }

                    // Calculate distance to target destination
	                var dist = (this.vel.x * this.vel.x) / (2 * this.friction.x);
	                var real_dist = Math.abs(this.pos.x - this.dest.x);
	                if (real_dist <= dist) {
	                    this.accel.x = 0;
                    // Ga naar links.
	                } else if (this.pos.x > this.dest.x && real_dist > 1) {
	                    this.flip = true;
	                    this.accel.x = -accel;
                    // Ga naar rechts.
	                } else if (this.pos.x < this.dest.x && real_dist > 1) {
	                    this.flip = false;
	                    this.accel.x = accel;
	                }

                    // Update animation
	                if (this.vel.x == 0 && this.accel.x == 0) {
	                    this.currentAnim = this.anims.idle;
	                    this.dest = this.pos;
	                } else {
	                    this.currentAnim = this.anims.run;
	                }

	                this.currentAnim.flip.x = this.flip;
	            }

                if (this.state == PlayerState.EXITIXING) {
                    var width = Math.min(this.size.x, this.exitixi.pos.x + this.exitixi.size.x - this.pos.x);

                    // this.currentAnim = null;
                    // this.animSheet.image.draw(
                    //     this.pos.x,
                    //     this.pos.y,
                    //     0, 0,
                    //     this.animSheet.width, this.animSheet.height
                    // );

                    this.animSheet.width = width;
                    this.currentAnim = this.anims.pause;

                    if (width <= 0) {
                        this.exitixi.closeDoor();
                    }

                    if (width <= -150) {
                        ig.game.loadNextLevel();
                    }
                }

                // move!
                this.parent();
            }
        });
    });
