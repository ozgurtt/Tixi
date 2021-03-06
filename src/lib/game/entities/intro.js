ig.module(
  'game.entities.intro'
)
.requires(
  'impact.entity'
)
.defines(function(){
  
EntityIntro = ig.Entity.extend({
  size: {x: 409, y: 200},
  
  type: ig.Entity.TYPE.B, // Evil enemy group
  checkAgainst: ig.Entity.TYPE.A, // Check against friendly
  collides: ig.Entity.COLLIDES.FIXED,
  
  animSheet: new ig.AnimationSheet( 'media/intro.png', 409, 200 ),
  
  init: function( x, y, settings ) {
    this.parent( x, y, settings );
    this.gravityFactor = 0;
    this.addAnim( 'idle', 1, [0] );
  }
});

});
