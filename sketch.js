let appState = "cover"; 
let coverImg;
const START_TEXT_X = 515;
const START_TEXT_Y = 415;
const START_TEXT_W = 60;
const START_TEXT_H = 30;
let toolIcon = [];
const TOOLBAR_GUTTER = 0;
const TOOLBAR_TOP = 40;
const TOOLBAR_SPACING = 72;
const TOOL_ICON_SIZE = 150;
const TOOL_POP_OFFSET = 48;
let drawingLayer;
let brushSize = 10;
// brush opacity in percentage (%) 
// 0 = transparent, 255 = complete solid
let brushOpacity = 255;
const COLOURS = Object.freeze({
    BLACK: "#000000",
    WHITE: "#FFFFFF",
    RED: "#FF0000",
    GREEN: "#00FF00",
    BLUE: "#0000FF",
    YELLOW: "#FFFF00",
    CYAN: "#00FFFF",
    MAGENTA: "#FF00FF",
    GRAY: "#808080",
    ORANGE: "#FFA500",
});
let brushColour;
let brushImg;
let currentColourName = "BLACK";
let setSymmetry = "off"
const BRUSH_TYPES = Object.freeze({
    PEN: "pen",
    PENCIL: "pencil",
    SCRIBBLE: "scribble",
    CALLI: "calligraphy",
    IMAGE: "image",
    ERASER: "eraser",
});
let brushtype = BRUSH_TYPES.PEN;
const PAPER_TYPES = Object.freeze({
    PLAIN: "plain",
    LINED: "lined",
    GRIDDED: "gridded",
})
let paperType = PAPER_TYPES.PLAIN;
const BG_COLOUR = 220;
const FIRST_LINE_Y = 15;
const LINE_SPACING = 15;
const MAX_ALPHA = 255;
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

async function setup() {
    brushImg = await loadImage('assets/image1.png');
    coverImg = await loadImage('assets/doodlepad1.png')
    const penIcon = await loadImage('assets/pen.png');
    const pencilIcon = await loadImage('assets/pencil.png');
    const scribbleIcon = await loadImage('assets/scribble.png');
    const calliIcon = await loadImage('assets/calligraphy.png');
    toolIcons = [
      { type: BRUSH_TYPES.PEN, img: penIcon, x: TOOLBAR_GUTTER, y: 0},
      { type: BRUSH_TYPES.PENCIL, img: pencilIcon, x: TOOLBAR_GUTTER, y: 0},
      { type: BRUSH_TYPES.SCRIBBLE, img: scribbleIcon, x: TOOLBAR_GUTTER, y: 0},
      { type: BRUSH_TYPES.CALLI, img: calliIcon, x: TOOLBAR_GUTTER, y: 0},
    ]
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    drawingLayer = createGraphics(CANVAS_WIDTH, CANVAS_HEIGHT);
    drawingLayer.clear();
    // background(BG_COLOUR);
    brushColour = color(COLOURS.BLACK);
}

function drawCover() {
  background(BG_COLOUR);
  
  image(coverImg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  push();
  textAlign(CENTER, CENTER);
  textSize(30);
  fill(242, 153, 101);
  text(
    "START",
    START_TEXT_X + START_TEXT_W / 2,
    START_TEXT_Y + START_TEXT_H / 2
  );
  pop();
}

function drawToolbar() {
  for (let i = 0; i < toolIcons.length; i++) {
    let tool = toolIcons[i];
    let baseX = TOOLBAR_GUTTER;
    let targetX =
      brushtype === tool.type
        ? baseX + TOOL_POP_OFFSET
        : baseX;

    tool.x = lerp(tool.x, targetX, 0.2);

    let drawY = TOOLBAR_TOP + i * TOOLBAR_SPACING;

    image(
      tool.img,
      tool.x,
      drawY,
      TOOL_ICON_SIZE,
      TOOL_ICON_SIZE
    );
  }
}

function draw() {
  if(appState === "cover") {
    drawCover();
    return;
  }
    drawPaper();
    image(drawingLayer, 0, 0);
    drawUI();
    drawToolbar();

    if (mouseIsPressed && (mouseX !== pmouseX || mouseY !== pmouseY)) {
        let iters = (setSymmetry === "on") ? 2 : 1;
        for (let i = 0; i < iters; i++) {
            push();

            if (i === 1) {
                // Flip the canvas across the center
                translate(width, 0);
                scale(-1, 1);
            }

            switch(brushtype) {
                // pen
                case "pen": penStroke(); break;
                // pencil
                case "pencil": pencilStroke(); break;
                // scribble
                case "scribble": scribbleStroke(); break;
                // calligraphy
                case "calligraphy": calligraphyStroke(); break;
                // image
                case "image": imageStroke(); break;
                // eraser
                case "eraser": eraserStroke(); break;
            }
            pop();
        }
    }
    pressedAndHold();
}

function penStroke() {
    drawingLayer.stroke(brushColour);
    drawingLayer.strokeWeight(brushSize);
    drawingLayer.line(pmouseX, pmouseY, mouseX, mouseY); 
}

function pencilStroke() {
    drawingLayer.stroke(red(brushColour), green(brushColour), blue(brushColour), 50); 
    drawingLayer.strokeWeight(1);

    // Draw a few random dots around the mouse position based on brushSize
    for (let i = 0; i < brushSize*5; i++) {
        let offsetX = random(-brushSize/2, brushSize/2);
        let offsetY = random(-brushSize/2, brushSize/2);
        drawingLayer.point(mouseX + offsetX, mouseY + offsetY);
    }
}

function scribbleStroke() {
    // Define how much the pen "shakes"
    let intensity = brushSize * 0.2; 

    // Add a random offset to the current mouse position
    let nudgeX = random(-intensity, intensity);
    let nudgeY = random(-intensity, intensity);

    drawingLayer.stroke(brushColour);
    drawingLayer.strokeWeight(brushSize);

    // Draw from the previous (nudged) position to the current (nudged) position
    drawingLayer.line(pmouseX + nudgeX, pmouseY + nudgeY, mouseX + nudgeX, mouseY + nudgeY);
}

function calligraphyStroke() {
    let d = dist(pmouseX, pmouseY, mouseX, mouseY);

    let dynamicWeight = map(d, 0, 50, brushSize * 1.5, 1);
    dynamicWeight = constrain(dynamicWeight, 1, brushSize * 2);

    drawingLayer.stroke(brushColour);
    drawingLayer.strokeWeight(dynamicWeight);
    drawingLayer.line(pmouseX, pmouseY, mouseX, mouseY);

}

function imageStroke() {
    drawingLayer.push();
    drawingLayer.imageMode(CENTER);
    drawingLayer.translate(mouseX, mouseY);

    // Randomly rotating the image
    drawingLayer.rotate(random(TWO_PI));
    drawingLayer.image(brushImg, 0, 0, brushSize * 2, brushSize * 2);
    drawingLayer.pop();
}

function eraserStroke() {
    drawingLayer.stroke(BG_COLOUR);
    drawingLayer.strokeWeight(brushSize);
    drawingLayer.line(pmouseX, pmouseY, mouseX, mouseY); 
}

function drawPaper() {
    background(BG_COLOUR);

    if (paperType === PAPER_TYPES.GRIDDED) {
        fill(0);
        noStroke();
        for (let i = 10; i < CANVAS_WIDTH; i+=10) {
            for (let j = 10; j < CANVAS_HEIGHT; j+=10) {
                rect(i, j, 1, 1);
            }
        }
    } else if (paperType === PAPER_TYPES.LINED) {
        stroke(150);
        strokeWeight(1);
        noFill();
        // Draw vertical lines
        for (let i = 10; i < CANVAS_WIDTH; i+=10) {
            line(i, 0, i, CANVAS_HEIGHT);
        }

        // Draw horizontal lines
        for (let j = 10; j < CANVAS_HEIGHT; j+=10) {
            line(0, j, CANVAS_WIDTH, j);
        }
    }
}

function drawUI() {
    push();
    // Refresh the UI Area
    let x = 10;
    let y = FIRST_LINE_Y;
    fill(BG_COLOUR - 10);
    noStroke();
    rect(0, 0, CANVAS_WIDTH, 25);
    rect(0, CANVAS_HEIGHT - 25, CANVAS_WIDTH, 25);
    // Add instructions and current state of tools
    fill(0);
    textSize(10);
    let opacityPercent = Math.ceil(brushOpacity/MAX_ALPHA * 100);
    text("[P] Pen [L] Pencil [B] Scribble [k] Calligraphy [I] Image " + 
        "[E] Eraser [C] Clear " + 
        "[0-9] Change Brush Colour " + 
        "[N] Plain Paper [G] Gridded Paper [H] Lined Paper", x, y);
    y += LINE_SPACING;
    text(`Brush Type: ${brushtype}   ` + 
        `Brush Colour: ${currentColourName}   ` + 
        `Stroke Weight [LEFT and RIGHT arrows]: ${brushSize}   ` + 
        `Stroke Opacity [DOWN and UP arrows]: ${opacityPercent}%   ` + 
        `Symmetry Mode [M]: ${setSymmetry}`, x, CANVAS_HEIGHT - 10);
    pop();
}

function keyPressed() {
    switch(key) {
        // pen
        case 'p': brushtype = BRUSH_TYPES.PEN; break;
        // pen
        case 'l': brushtype = BRUSH_TYPES.PENCIL; break;
        // scribble
        case 'b': brushtype = BRUSH_TYPES.SCRIBBLE; break;
        // calligraphy
        case 'k': brushtype = BRUSH_TYPES.CALLI; break;
        // image
        case 'i': brushtype = BRUSH_TYPES.IMAGE; break;
        // eraser
        case 'e': brushtype = BRUSH_TYPES.ERASER; break;

        // plain paper
        case 'n': paperType = PAPER_TYPES.PLAIN; break;
        // gridded paper
        case 'g': paperType = PAPER_TYPES.GRIDDED; break;
        // lined paper
        case 'h': paperType = PAPER_TYPES.LINED; break;

        // symmetry
        case 'm': setSymmetry = (setSymmetry === "off") ? "on" : "off"; break;
        // clear
        case 'c': drawingLayer.clear(); break;
        // save image
        case 's': saveImage(); break;
        // brush colour: black
        case '1': setBrushColour(COLOURS.BLACK); break;
        // brush colour: white
        case '2': setBrushColour(COLOURS.WHITE); break;
        // brush colour: red
        case '3': setBrushColour(COLOURS.RED); break;
        // brush colour: green
        case '4': setBrushColour(COLOURS.GREEN); break;
        // brush colour: blue
        case '5': setBrushColour(COLOURS.BLUE); break;
        // brush colour: yellow
        case '6': setBrushColour(COLOURS.YELLOW); break;
        // brush colour: cyan
        case '7': setBrushColour(COLOURS.CYAN); break;
        // brush colour: magenta
        case '8': setBrushColour(COLOURS.MAGENTA); break;
        // brush colour: gray
        case '9': setBrushColour(COLOURS.GRAY); break;
        // brush colour: orange
        case '0': setBrushColour(COLOURS.ORANGE); break;
    }
}

function setBrushColour(hexCode) {
    currentColourName = Object.keys(COLOURS).find(key => COLOURS[key] === hexCode);
    brushColour = color(hexCode);
    brushColour.setAlpha(brushOpacity);
}

function pressedAndHold() {
    if (frameCount % 5 === 0) {
        // decrease stroke weight
        if (keyIsDown(LEFT_ARROW) && brushSize > 1) {
            brushSize--;
        }
        // increase stroke weight
        if (keyIsDown(RIGHT_ARROW)) {
            brushSize++;
        }
        // decrease stroke opacity
        if (keyIsDown(DOWN_ARROW) && brushOpacity > 0) {
            brushOpacity -= MAX_ALPHA/100;
            brushColour.setAlpha(brushOpacity);
        }
        // increase stroke opacity
        if (keyIsDown(UP_ARROW) && brushOpacity < 255) {
            brushOpacity += MAX_ALPHA/100;
            brushColour.setAlpha(brushOpacity);
        }
    }
}

function saveImage() {
    let fileName = prompt("Input file name");

    if (fileName !== null) {
        save(`${fileName}.jpg`);
    }
}

function mousePressed() {
  if(appState === "cover") {
    if (
    mouseX > START_TEXT_X &&
    mouseX < START_TEXT_X + START_TEXT_W &&
    mouseY > START_TEXT_Y &&
    mouseY < START_TEXT_Y + START_TEXT_H
    ) {
      appState = "draw";
    }
  }
}