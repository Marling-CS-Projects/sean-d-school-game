import GameObject from "./GameObject";
import { Platform } from "./Platform";
import Matter, { Body } from "matter-js";
import { Application } from "pixi.js";

const gameSpeed = 100; // Bigger = the platforms end up moving faster slower. Increasing = flattening the curve
export let elapsedSeconds = 0

interface PlatformPrefab {
  x: number;
  y: number;
  width: number;
}

export class GameMap {
  app: Application;
  engine: Matter.Engine;
  platforms: Platform[];
  gameStartTime: number;

  constructor(engine: Matter.Engine, app: Application) {
    this.engine = engine;
    this.app = app;
    this.gameStartTime = Date.now(); // set the current time of when the map was created

    this.platforms = [];
    // Turn these into platforms
    for (let i = 0; i < 3; i++) { //for testing - an array of 250 platforms, each moving on the x axis
      this.platforms.push(new Platform(engine, app, i * 1000, app.view.height / 2 + 150));
    }
  }

  updatePlatforms(delta: number) {
    const elapsedMs = Date.now() - this.gameStartTime
    elapsedSeconds = elapsedMs / 1000;
    const pixelsToMove = ((Math.pow(elapsedSeconds, 2) / gameSpeed) + 1) * delta; //increases the pixels to move on a logarithmic scale 

    this.platforms.forEach(platform => { //for each platform in the array, translate by the movement speed.
      Body.translate(platform.matterData, { x: -pixelsToMove, y: 0 });
    });

    // get rid of any platforms that have passed zero
    this.platforms = this.platforms.filter(p => {
      if (p.matterData.position.x < 0) {
        // remove it
        this.app.stage.removeChild(p.pixiData);
        Matter.World.remove(this.engine.world, p.matterData);
        return false;
      } else {
        return true; // keep iutß
      }
    });

    // Make new platforms as required
    // Get the last platform
    const lastPlatform = this.platforms[this.platforms.length - 1];

    // If the last platform is in sight
    if (!lastPlatform || lastPlatform.matterData.position.x < this.app.view.width) {
      // Generate a new one
      console.log('New platform?')
      this.platforms.push(new Platform(this.engine, this.app, lastPlatform.matterData.position.x + 100, this.app.view.height / 2 + 150));
    }
  }
}