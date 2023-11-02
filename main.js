import { Bodies, Body, Events, Engine, Render, Runner, World} from "matter-js";
import {FRUITS_BASE} from "./fruits"
const engine = Engine.create();
//setup game base
const render = Render.create(
  {engine, 
    element: document.body, 
    options: 
    {
      wireframes: false,
      background: "#F7F4C8",
      width: 620,
      height: 850,
    }
  }
);

// TO RUN THE GAME, npm run dev
const world = engine.world;

const leftWall = Bodies.rectangle(15, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const rightWall = Bodies.rectangle(605, 395, 30, 790, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const ground = Bodies.rectangle(310, 820, 620, 60, {
  isStatic: true,
  render: { fillStyle: "#E6B143" }
});

const limit_line = Bodies.rectangle(310, 150, 620, 2,
  {
    name: "limit",
    isStatic: true,
    isSensor: true,
    render: { fillStyle: "#E6B143" }
  });

World.add(world, [leftWall, rightWall, ground, limit_line]);

Render.run(render);
Runner.run(engine);

let currentBody = null;
let currentFruit = null;
let disableAction = false;
let interval = null;
let num_watermelon = 0;

function addFruit()
{
  const index = Math.floor(Math.random() * 5);
  const fruit = FRUITS_BASE[index];

  const body = Bodies.circle(300, 50, fruit.radius, {
    index: index,
    isSleeping: true,
    render: {
      sprite: { texture: `${fruit.name}.png`}
    },
    restitution: 0.2
  });

  currentBody = body;
  currentFruit = fruit;
  
  World.add(world, body);
}

window.onkeydown = (event) => {
  if(disableAction)
  {
    return;
  }

  switch(event.code)
  {
    case "KeyA":
      if (interval)
        return;
      interval = setInterval(() =>{
        if(currentBody.position.x - currentFruit.radius > 30)
          Body.setPosition(currentBody, {
            x: currentBody.position.x - 10,
            y: currentBody.position.y
          });
      }, 50);
      break;
    case "KeyD":
      if (interval)
        return;
      interval = setInterval(() =>{
        if(currentBody.position.x + currentFruit.radius < 590)
          Body.setPosition(currentBody, {
            x: currentBody.position.x + 10,
            y: currentBody.position.y
          });
      }, 50);
      break;
    case "KeyS":
      currentBody.isSleeping = false;
      disableAction = true;

      setTimeout(() => {
        addFruit();
        disableAction = false;
      }, 1000);
      break;
  }
}

window.onkeyup = (event) => {
  switch(event.code) {
    case "KeyA":
    case "KeyD":
      clearInterval(interval);
      interval = null;
  }
}

Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    if(collision.bodyA.index === collision.bodyB.index){
      const index = collision.bodyA.index;

      if(index === FRUITS_BASE.length - 1)
      {
        return;
      }
      World.remove(world, [collision.bodyA, collision.bodyB]);

      const newFruit = FRUITS_BASE[index + 1];

      const newBody = Bodies.circle(
        collision.collision.supports[0].x,
        collision.collision.supports[0].y,
        newFruit.radius,
        {
          render: {
            sprite: { texture: `${newFruit.name}.png`}
          },
          index: index + 1
        }
      );
      World.add(world, newBody);

      if(newFruit === FRUITS_BASE[10])
        num_watermelon++;

      if(num_watermelon === 2)
        alert("Win the game!");

    }

    if (!disableAction && (collision.bodyA.name === "limit" || collision.bodyB.name === "limit"))
      alert("Game Over!");
  });
});


addFruit();