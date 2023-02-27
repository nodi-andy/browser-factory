import { Settings } from '../../common.js'
import { Player } from '../player/player.js'
import * as NC from 'nodicanvas'

export class Car extends Player {

  static name = 'car'
  static type = 'entity'
  static rotatable = false
  static size = [3, 3]
  static playerCanWalkOn = false
  static cost = [{ id: "InserterSmart", n: 100 },  { id: "Belt3", n: 100 },  { id: "AssemblingMachine3", n: 100 }]
  static imgName = 'car'

  constructor (pos, data) {
    super(pos, data)
    data.pos = pos
    this.dir = 0
    this.speed = 0
  }

  setup (map, inv) {
    super.setup(map, inv)
    this.name = "Car"
    for (let i = 0; i < Car.size[0]; i++) {
      for (let j = 0; j < Car.size[1]; j++) {
        game.entityLayer.setInv(this.pos.x + i, this.pos.y + j, this.id)
      }
    }
    this.relPos = new NC.Vec2(0, 0)
    this.mapPos = {x: this.pos.x * Settings.tileSize + this.relPos.x, y: this.pos.y * Settings.tileSize + this.relPos.y}
  }

  update (map, ent) {
    this.relPos.x = this.relPos.x + this.speed * Math.cos(ent.dir)
    //ent.pos.x = ent.nextPos.x

    this.relPos.y = this.relPos.y + this.speed * Math.sin(ent.dir)
    //ent.pos.y = ent.nextPos.y
    this.mapPos = {x: this.pos.x * Settings.tileSize + this.relPos.x, y: this.pos.y * Settings.tileSize + this.relPos.y}

    if (this.speed !== 0) {
      if (Math.abs(this.relPos.x) > Settings.tileSize || Math.abs(this.relPos.y) > Settings.tileSize){
        this.newPos = {x: Math.round(this.mapPos.x / Settings.tileSize), y: Math.round(this.mapPos.y / Settings.tileSize)}
        for (let i = 0; i < Car.size[0]; i++) {
          for (let j = 0; j < Car.size[1]; j++) {
            game.entityLayer.setInv(this.pos.x + i, this.pos.y + j, null)
          }
        }
        for (let i = 0; i < Car.size[0]; i++) {
          for (let j = 0; j < Car.size[1]; j++) {
            game.entityLayer.setInv(this.newPos.x + i, this.newPos.y + j, this.id)
          }
        }
        this.pos = {x: this.newPos.x, y: this.newPos.y}
        this.relPos = {x: this.mapPos.x - this.pos.x * Settings.tileSize, y: this.mapPos.y - this.pos.y * Settings.tileSize}
      }
    }

  }

  onKeyDown (e) {
    if (e.code === 'KeyW') this.speed = 10
    if (e.code === 'KeyS') this.speed = -10
    if (e.code === 'KeyD') this.dir += (Math.PI / 8)
    if (e.code === 'KeyA') this.dir -= (Math.PI / 8)
    this.dir += (2 * Math.PI)
    this.dir %= (2 * Math.PI)

    this.dir = Math.round(this.dir / (Math.PI / 8)) * (Math.PI / 8)
    this.drawDir = (((Math.round(this.dir / (Math.PI / 8))) + 4) % 16)

    
    console.log(this.dir + '  ' + this.drawDir)
  }

  onKeyUp (e) {
    if (e.code === 'KeyW') this.speed = 0
    if (e.code === 'KeyS') this.speed = 0
  }

  draw (ctx, ent) {
    if (this.relPos) {
      ctx.translate(this.relPos.x, this.relPos.y)
    }
    if (isNaN(this.dir)) {
      this.dir = 0
      this.drawDir = 4
    }

    ctx.drawImage(Car.img_anim, this.drawDir * 260, 0, 260, 260, -100, -80, 260, 260)
  }
}

Car.img_anim = new Image(2340, 260)
Car.img_anim.src = './' + Car.type + '/car/car_anim.png'
