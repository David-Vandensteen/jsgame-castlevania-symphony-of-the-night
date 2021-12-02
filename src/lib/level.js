class Level {
  add() {
    this.floor = this.k.add([
      this.k.rect(this.k.width(), 24),
      this.k.area(),
      this.k.pos(0, 187),
      this.k.solid(),
      this.k.opacity(0),
    ]);

    this.background = this.k.add([
      this.k.sprite('background'),
      this.k.pos(0, 0), {
        config: this.config.background,
      },
    ]);
    return this;
  }

  load() {
    this.k.loadSprite('background', this.config.background.asset);
    this.k.loadSound('music', this.config.music.asset);
    return this;
  }

  play() {
    this.k.play('music', {
      loop: this.config.music.loop,
    });
  }

  register({ kaboom, config }) {
    this.k = kaboom;
    this.config = config;
    return this;
  }
}

export default new Level();
