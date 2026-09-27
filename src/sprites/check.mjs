// node src/sprites/check.mjs
// The lasting rules for the sprite sheets, checked against the files in this folder. Plain Node,
// no dependencies; exits non-zero on failure; prints one line per check per sheet.
//
//   closure      every visible non-ink cell is enclosed (no fill touches the page), per outfit;
//                justin and desk only, the sheets drawn under the closed-outline rule
//   holes        no transparent speck (under 4 cells) is sealed inside a drawing (same sheets)
//   sealed       no non-ink cell is boxed in by ink on all four sides (same sheets)
//   frames       consecutive frames of an action differ (an animation moves)
//   feet         the bottom row of every frame is painted: the ground row is the last row
//   heads        Justin's head is the same head in every frame (idle 0 for the front, walk 0 for
//                the side), cell for cell, except the listed allow-list per frame
//   hands        skin blobs per frame: the face plus the expected number of hands
//   arm length   a raised arm, measured along its sleeve from the shoulder joint to the fingertip,
//                rounds to the hanging arm's length (idle: about 15) plus one at most and minus two
//                at least; an arm that reaches a target at a set distance (press, grab, pet,
//                pet-low) may round to plus two. A folded arm (cup at the chest) measures along
//                its folded sleeve, so no frame is exempt
//   fill-join    with the ink removed (a dark page), every raised sleeve is in the same connected
//                fill as the torso; hands behind a cuff line and the cup he holds may be separate
//   carry boxes  the boxes he carries are props.js shoeboxes cell for cell, at CARRY_BOXES_AT in
//                his canvas, in every frame (a design swaps them for the floor stack there)
//   desk         the desk sheet's furniture is type's furniture; the cells that differ are the
//                ones his figure covers in type; tuck f0 is idle cell for cell, and tuck's later
//                frames change no painted cell at or right of x 34 (the desk, keyboard and
//                monitor), so only the chair's cells and the cells it moves into or uncovers change
//
// The data block below is written by the drawing workbench (export-check-data.mjs) from the arm
// pieces the frames are built from: HEADS holds each frame's allow-list as row runs, ARMS each
// raised arm as row specs "y x0-x1L" (L a palette letter) with the pose's shoulder joint (or one
// per frame, `anchors`, when the pose changes body: pickup kneels then stands). When a frame is redrawn, regenerate
// the block or edit the rows by hand; a frame that is not listed is not checked for its head/arm.
import justin, { desk } from "./justin.js";
import truffle from "./truffle.js";
import luibot from "./luibot.js";
import luibuilder from "./luibuilder.js";
import { coffee, shoeRack, shoeboxes, chicken, cow, sheep } from "./props.js";

const EXPECTED_HANDS = { idle: 2, walk: 1, sit: 1, sleep: 1, sip: 2, hat: 2, "arms-up": 2, carry: 2, type: 2, pet: 1, "pet-low": 1, wave: 2, press: 2, grab: 2, pat: 2, pull: 1, nod: 2, pickup: 1, throw: 2 };
const SKIN = "sdr"; // the skin letters in justin.js

// ---- DATA START ----
const HEADS = [ // [action, frame, reference action, its frame, dy, dx, allow "y:x0-x1,..;..", note]
  ["idle",1,"idle",0,0,0,"20:13-14,20-21;21:13-14,20-21","blink lids"],
  ["idle",2,"idle",0,0,0,"",""],
  ["sip",0,"idle",0,0,0,"",""],
  ["sip",1,"idle",0,0,0,"23:21-31;24:19-31;25:21-31;26:21-31;27:21-31;28:21-31;29:21-31","cup and hand, shortened smile"],
  ["hat",0,"idle",0,0,0,"19:35-41;20:33-41;21:33-41;22:33-41;23:31-41;24:30-41;25:29-41;26:28-40;27:24-38;28:24-37;29:24-37","arm piece + outline, dipped brim"],
  ["hat",1,"idle",0,0,0,"18:34-40;19:32-40;20:32-40;21:32-40;22:32-40;23:31-40;24:30-40;25:29-39;26:28-39;27:24-38;28:24-37;29:24-37","arm piece + outline, dipped brim"],
  ["hat",2,"idle",0,1,0,"0:0-41;1:0-41;2:0-41;3:0-41;4:0-41;5:0-41;6:0-41;7:0-41;8:0-41;9:0-41;10:0-41;11:0-41;12:0-41;13:0-41;14:0-41;15:0-41;16:0-41;17:0-41;18:0-41;19:0-41;20:0-41;21:0-41;22:0-41;23:0-41;24:0-41;25:0-41;26:0-41;27:0-41;28:0-41;29:0-41;30:0-41;31:0-41;32:0-41;33:0-41","arm piece + outline, dipped brim, head nodded"],
  ["hat",3,"idle",0,2,0,"0:0-41;1:0-41;2:0-41;3:0-41;4:0-41;5:0-41;6:0-41;7:0-41;8:0-41;9:0-41;10:0-41;11:0-41;12:0-41;13:0-41;14:0-41;15:0-41;16:0-41;17:0-41;18:0-41;19:0-41;20:0-41;21:0-41;22:0-41;23:0-41;24:0-41;25:0-41;26:0-41;27:0-41;28:0-41;29:0-41;30:0-41;31:0-41;32:0-41;33:0-41","arm piece + outline, dipped brim, head nodded"],
  ["arms-up",0,"idle",0,0,10,"18:5-11,44-50;19:5-13,42-50;20:5-13,42-50;21:5-13,42-50;22:5-13,42-50;23:5-14,41-50;24:5-15,40-50;25:6-16,39-49;26:6-17,38-49;27:7-21,34-48;28:8-21,34-47;29:8-21,34-47","both arm pieces + outline"],
  ["arms-up",1,"idle",0,0,10,"22:3-9,46-52;23:3-11,44-52;24:3-15,40-52;25:3-16,39-52;26:3-17,38-52;27:3-21,34-52;28:3-21,34-52;29:4-21,34-51","both arm pieces + outline"],
  ["carry",0,"idle",0,0,0,"","boxes and arms"],
  ["carry",1,"idle",0,0,0,"","boxes and arms"],
  ["wave",0,"idle",0,0,10,"18:5-11;19:5-13;20:5-13;21:5-13;22:5-13;23:5-14;24:5-15;25:6-16;26:6-17;27:7-21;28:8-21;29:8-21","arm piece + outline"],
  ["wave",1,"idle",0,0,10,"19:4-10;20:4-12;21:4-12;22:4-12;23:4-13;24:4-15;25:4-16;26:5-17;27:6-21;28:8-21;29:8-21","arm piece + outline"],
  ["wave",2,"idle",0,0,10,"22:3-9;23:3-11;24:3-15;25:3-16;26:3-17;27:3-21;28:3-21;29:4-21","arm piece + outline"],
  ["wave",3,"idle",0,0,10,"19:4-10;20:4-12;21:4-12;22:4-12;23:4-13;24:4-15;25:4-16;26:5-17;27:6-21;28:8-21;29:8-21","arm piece + outline"],
  ["press",0,"idle",0,0,11,"23:5-13;24:5-13;25:5-13;26:5-16;27:5-19;28:7-24;29:7-24","arm piece + outline"],
  ["press",1,"idle",0,0,11,"21:5-13;22:5-13;23:5-13;24:5-15;25:5-15;26:7-16;27:7-19;28:8-24;29:8-24","arm piece + outline"],
  ["pat",0,"idle",0,0,12,"26:3-10;27:3-11;28:3-12,16-25;29:3-25","arm piece + outline"],
  ["pat",1,"idle",0,0,12,"23:5-12;24:5-13;25:5-13;26:5-13;27:5-13;28:5-14,16-25;29:7-25","arm piece + outline"],
  ["pat",2,"idle",0,0,12,"26:3-10;27:3-11;28:3-12,16-25;29:3-25","arm piece + outline"],
  ["pull",0,"walk",0,-1,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",1,"walk",0,0,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",2,"walk",0,-1,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",3,"walk",0,0,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",4,"walk",0,-1,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",5,"walk",0,0,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",6,"walk",0,-1,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["pull",7,"walk",0,0,0,"26:20-25;27:20-25;28:20-29;29:12-18,20-29","walk's bob; arm piece + outline"],
  ["nod",0,"idle",0,1,0,"26:0-35;27:0-35;28:0-35;29:0-35;30:0-35;31:0-35;32:0-35;33:0-35","head and hat dipped; hood, neck and collar rows"],
  ["nod",1,"idle",0,2,0,"26:0-35;27:0-35;28:0-35;29:0-35;30:0-35;31:0-35;32:0-35;33:0-35","head and hat dipped; hood, neck and collar rows"],
  ["pickup",0,"walk",0,9,7,"37:25-34;38:15-36","pet kneel six rows down; tucked neck, hood row, pieces + outline"],
  ["pickup",1,"walk",0,9,7,"37:25-34;38:15-36","pet kneel six rows down; tucked neck, hood row, pieces + outline"],
  ["pickup",2,"walk",0,0,7,"","walk 0 at x 7; arm piece + outline"],
  ["throw",0,"idle",0,0,0,"","arm piece + outline"],
  ["throw",1,"idle",0,0,0,"","arm piece + outline"],
  ["throw",2,"idle",0,0,0,"19:36-42;20:34-42;21:34-42;22:34-42;23:32-42;24:30-42;25:29-42;26:28-41;27:24-39;28:24-37;29:24-37","arm piece + outline"],
  ["throw",3,"idle",0,0,0,"22:36-42;23:34-42;24:30-42;25:29-42;26:28-42;27:24-42;28:24-42;29:24-40","arm piece + outline"],
  ["throw",4,"idle",0,0,0,"","arm piece + outline"],
  ["grab",0,"idle",0,0,11,"22:6-15;23:6-15;24:6-15;25:6-15;26:0-15;27:0-15;28:0-24;29:0-24","arm piece + outline"],
  ["grab",1,"idle",0,0,11,"24:4-9;25:3-10;26:0-11;27:0-12;28:0-12,15-24;29:0-12,15-24","arm piece + outline"],
  ["grab",2,"idle",0,0,11,"18:4-11;19:0-11;20:0-13;21:0-13;22:0-13;23:0-13;24:0-15;25:0-15;26:0-16;27:0-17;28:0-24;29:0-24","arm piece + outline"],
  ["grab",3,"idle",0,0,11,"","arm piece + outline"],
  ["grab",4,"idle",0,0,11,"","arm piece + outline"],
  ["walk",1,"walk",0,-1,0,"","bob"],
  ["walk",2,"walk",0,0,0,"",""],
  ["walk",3,"walk",0,-1,0,"","bob"],
  ["sit",0,"walk",0,-2,0,"",""],
  ["sit",1,"walk",0,-2,0,"17:26-27;18:26-27","blink lid"],
  ["type",0,"walk",0,-2,0,"18:50-55;19:50-55;20:50-55;21:50-55;22:50-55;23:50-55;24:50-55;25:50-55;26:6-9,50-55;27:6-9,50-55;28:6-9,50-55;29:6-9,22-29,50-55;30:6-9,22-29,50-55;31:6-9,22-29,50-55;32:6-9,22-29,35-46,50-55;33:6-9,22-46,50-55;34:6-9,22-46,50-55;35:6-9,22-46,50-55;36:6-9,22-46,50-55;37:6-9,22-46,50-55;38:6-9,22-47,51-54;39:6-9,22-47,51-54;40:6-9,34-47,51-54;41:6-9,34-63;42:6-32,34-63;43:6-32,34-63;44:6-32,34-63;45:6-32,34-63;46:6-32,34-63;47:6-32,38-41,59-62;48:6-32,38-41,59-62;49:6-32,38-41,59-62;50:6-33,38-41,59-62;51:6-33,38-41,59-62;52:6-33,38-41,59-62;53:6-33,38-41,59-62;54:7-10,18-21,24-33,38-41,59-62;55:7-10,18-21,24-33,38-41,59-62;56:7-10,18-21,24-35,38-41,59-62;57:7-10,18-21,24-35,38-41,59-62;58:7-10,18-21,24-35,38-41,59-62;59:7-10,18-21,24-35,38-41,59-62;60:7-10,18-21,24-35,38-41,59-62;61:7-10,18-21,24-35,38-41,59-62","the scene's cells"],
  ["type",1,"walk",0,-2,0,"18:50-55;19:50-55;20:50-55;21:50-55;22:50-55;23:50-55;24:50-55;25:50-55;26:6-9,50-55;27:6-9,50-55;28:6-9,50-55;29:6-9,22-29,50-55;30:6-9,22-29,50-55;31:6-9,22-29,50-55;32:6-9,22-29,35-46,50-55;33:6-9,22-46,50-55;34:6-9,22-46,50-55;35:6-9,22-46,50-55;36:6-9,22-46,50-55;37:6-9,22-46,50-55;38:6-9,22-47,51-54;39:6-9,22-47,51-54;40:6-9,34-47,51-54;41:6-9,34-63;42:6-32,34-63;43:6-32,34-63;44:6-32,34-63;45:6-32,34-63;46:6-32,34-63;47:6-32,38-41,59-62;48:6-32,38-41,59-62;49:6-32,38-41,59-62;50:6-33,38-41,59-62;51:6-33,38-41,59-62;52:6-33,38-41,59-62;53:6-33,38-41,59-62;54:7-10,18-21,24-33,38-41,59-62;55:7-10,18-21,24-33,38-41,59-62;56:7-10,18-21,24-35,38-41,59-62;57:7-10,18-21,24-35,38-41,59-62;58:7-10,18-21,24-35,38-41,59-62;59:7-10,18-21,24-35,38-41,59-62;60:7-10,18-21,24-35,38-41,59-62;61:7-10,18-21,24-35,38-41,59-62","the scene's cells"],
  ["type",2,"walk",0,-2,0,"18:50-55;19:50-55;20:50-55;21:50-55;22:50-55;23:50-55;24:50-55;25:50-55;26:6-9,50-55;27:6-9,50-55;28:6-9,50-55;29:6-9,22-29,50-55;30:6-9,22-29,50-55;31:6-9,22-29,50-55;32:6-9,22-29,35-46,50-55;33:6-9,22-46,50-55;34:6-9,22-46,50-55;35:6-9,22-46,50-55;36:6-9,22-46,50-55;37:6-9,22-46,50-55;38:6-9,22-47,51-54;39:6-9,22-47,51-54;40:6-9,34-47,51-54;41:6-9,34-63;42:6-32,34-63;43:6-32,34-63;44:6-32,34-63;45:6-32,34-63;46:6-32,34-63;47:6-32,38-41,59-62;48:6-32,38-41,59-62;49:6-32,38-41,59-62;50:6-33,38-41,59-62;51:6-33,38-41,59-62;52:6-33,38-41,59-62;53:6-33,38-41,59-62;54:7-10,18-21,24-33,38-41,59-62;55:7-10,18-21,24-33,38-41,59-62;56:7-10,18-21,24-35,38-41,59-62;57:7-10,18-21,24-35,38-41,59-62;58:7-10,18-21,24-35,38-41,59-62;59:7-10,18-21,24-35,38-41,59-62;60:7-10,18-21,24-35,38-41,59-62;61:7-10,18-21,24-35,38-41,59-62","the scene's cells"],
  ["pet",0,"walk",0,3,7,"31:25-43;32:15-43","tucked neck, hood row, pieces + outline"],
  ["pet",1,"walk",0,3,7,"30:32-47;31:25-47;32:15-47","tucked neck, hood row, pieces + outline"],
  ["pet",2,"walk",0,3,7,"31:25-43;32:15-43","tucked neck, hood row, pieces + outline"],
  ["pet-low",0,"walk",0,3,7,"31:25-34;32:15-36","tucked neck, hood row, pieces + outline"],
  ["pet-low",1,"walk",0,3,7,"31:25-34;32:15-36","tucked neck, hood row, pieces + outline"],
  ["pet-low",2,"walk",0,3,7,"31:25-34;32:15-36","tucked neck, hood row, pieces + outline"],
];
const ARMS = { // per pose: canvas width, the shoulder joint, and per frame the arm piece's rows as "y x0-x1L ..." (L = palette letter)
  "hat": { W: 42, anchor: [28,31], frames: [
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","25 33-36O","24 36-38s","23 35-39s","22 35s 37-39s","21 37-39s"],
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","25 33-36O","24 34-37O","23 35-37s","22 34-38s","21 34s 36-38s","20 36-38s"],
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","25 32-35O","24 33-36O","23 33-36O","22 32-35s","21 32-35s","20 32-35s","19 32s 34-35s"],
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","25 32-35O","24 32-35O","23 32-35O","18 30-32s","19 29-33s","20 30-33s","21 30-33s","22 30-33s"],
  ] },
  "arms-up": { W: 56, anchor: [17,31], frames: [
    ["32 17-19O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","25 9-12O","24 8-11O","20 7-9s","21 7-9s 11s","22 7-11s","23 8-10s","32 36-38O","31 38-40O","30 38-42O","29 39-43O 36k","28 40-44O","27 41-45O","26 42-45O","25 43-46O","24 44-47O","20 46-48s","21 46-48s 44s","22 44-48s","23 45-47s"],
    ["32 17-19O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","27 10-14O","24 5-7s","25 5-7s 9s","26 5-9s","27 6-8s","32 36-38O","31 38-40O","30 38-42O","29 39-43O 36k","28 40-44O","27 41-45O","26 42-45O","27 41-45O","24 48-50s","25 48-50s 46s","26 46-50s","27 47-49s"],
  ] },
  "pet": { W: 51, anchor: [30,33], frames: [
    ["33 27-41O","34 28-41O","35 30-41O 42-45s","36 34-41O 42-45s"],
    ["32 34-41O 42-45s","33 27-41O 42-45s","34 28-38O","35 30-33O"],
    ["33 27-41O","34 28-41O","35 30-41O 42-45s","36 34-41O 42-45s"],
  ] },
  "pet-low": { W: 51, anchor: [30,33], frames: [
    ["33 27-32O","34 28-34O","35 30-36O","36 32-38O","37 34-39O","38 36-40O","39 37-41O","40 38-41O","41 39-42O","42 40-43s","43 40-43s"],
    ["33 27-32O","34 28-34O","35 30-36O","36 32-38O","37 34-39O","38 33-37O","39 34-38O","40 35-38O","41 36-39O","42 36-40O","43 37-40s","44 37-40s"],
    ["33 27-32O","34 28-34O","35 30-36O","36 32-38O","37 34-39O","38 36-40O","39 37-41O","40 38-41O","41 39-42O","42 40-43s","43 40-43s"],
  ] },
  "press": { W: 47, anchor: [18,31], frames: [
    ["30 17-22O","31 17-22O","32 21O","29 12-17O","28 10-14O","25 7-11s","26 9-11s","27 9-11s"],
    ["30 17-22O","31 17-22O","32 21O","29 12-17O","28 11-14O","27 10-13O","26 10-13O","23 7-11s","24 9-11s","25 9-11s"],
  ] },
  "pat": { W: 48, anchor: [19,31], frames: [
    ["30 18-23O","31 16-23O","32 14-19O 22O","33 12-17O","34 12-15O","32 10-13O","31 9-11O","30 8-10O","29 5-9s","28 5-8s"],
    ["30 18-23O","31 16-23O","32 14-19O 22O","33 12-17O","34 12-15O","32 11-13O","31 10-12O","30 10-12O","29 9-11O","28 9-11O","27 9-11O","26 7-11s","25 7-10s"],
    ["30 18-23O","31 16-23O","32 14-19O 22O","33 12-17O","34 12-15O","32 10-13O","31 9-11O","30 8-10O","29 5-9s","28 5-8s"],
  ] },
  "pull": { W: 36, anchor: [13,31], frames: [
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
    ["31 14-16O","32 14-17O","33 15-22O","34 16-20O","32 21-23O","31 22-23O","30 24-27s","31 24-27s","32 24-27s","33 24-27s","28 22-23k"],
  ] },
  "pickup": { W: 51, anchor: [30,39], anchors: [[30,39],[30,39],[20,31]], frames: [
    ["39 27-32O","40 28-34O","41 30-36O","42 32-38O","43 34-39O","44 33-37O","45 34-38O","46 35-38O","47 36-39O","48 36-40O","49 37-40O","50 37-40s","51 37-40s"],
    ["39 27-32O","40 28-34O","41 30-36O","42 32-38O","43 34-39O","44 34-38O","45 35-39O","46 36-39O","47 37-40O","48 37-40s","49 37-40s"],
    ["32 21-23O","33 22-25O","34 24-27O","35 26-29O","36 28-31O","37 30-33s","38 30-33s"],
  ] },
  "throw": { W: 44, anchor: [28,31], frames: [
    [],
    ["32 25-29O","33 26-30O","34 27-31O","35 28-32O","36 28-32O","37 29-33O","38 29-33O","39 30-33O","40 30-33s","41 30-33s","42 30-33s","43 30-33s"],
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","25 34-37O","24 37-39s","23 36-40s","22 36s 38-40s","21 38-40s"],
    ["32 25-29O","31 28-30O","30 28-32O","29 29-33O 26k","28 30-34O","27 31-35O","26 32-35O","27 31-35O","27 36-38s","26 36-40s","25 36s 38-40s","24 38-40s"],
    [],
  ] },
  "carry": { W: 36, anchor: [7,31], frames: [
    ["32 6-9O","33 6-9O","34 6-9O","35 6-9O","36 6-9O","37 6-9O","38 6-9O","39 6-9O","40 6-9O","41 6-9O","42 6-9s","43 6-9s","44 6-9s","45 6-9s"],
    ["32 6-9O","33 6-9O","34 6-9O","35 6-9O","36 6-9O","37 6-9O","38 6-9O","39 6-9O","40 6-9O","41 6-9s","42 6-9s","43 6-9s","44 6-9s"],
  ] },
  "grab": { W: 47, anchor: [18,31], frames: [
    ["30 17-22O","31 17-22O","32 21O","28 2-7k","29 2k 3-6o 7k","30 2k 3-6c 7k","31 2k 3-6c 7k","32 2-7k","24 8-11s 13s","25 8-13s","26 8-13s","27 9-13s","28 9-12O","29 9-12O","30 10-13O 17-22O","31 10-13O 17-22O","32 11-14O","33 12-15O","34 13-16O","32 16-20O 21O","33 15-18O","34 14-17O","35 13-16O"],
    ["30 17-22O","31 17-22O","32 21O","28 2-7k","29 2k 3-6o 7k","30 2k 3-6c 7k","31 2k 3-6c 7k","32 2-7k","26 6-7s","27 5-8s","28 8-9s","29 8-10s","30 8-10s 17-22O","31 8-10s 17-22O","32 9-12O","33 10-13O","34 11-14O","32 16-20O 21O","33 15-18O","34 14-17O","35 13-16O"],
    ["30 17-22O","31 17-22O","32 21O","20 6-9s","21 2-5k 6-9s","22 2-8k 9-11s","23 2-3k 4-7o 8k 9-11s","24 2-3k 4-7c 8k 9-11s","25 2-3k 4-7c 8k 9-11s","26 2-8k 10-13O","27 2-8k 10-13O","28 11-14O","29 12-15O","30 13-22O","31 14-22O"],
    ["32 16-21O","33 17-20O","34 17-20O","35 17-20O","36 17-20O","34 17-20O 23k 24-27o 28k","35 17-20O 23k 24-27c 28k","36 17-20O 23k 24-27c 28k","37 16-22O 23-28s","38 16-22O 23-28s","39 16-22O 23-28s"],
    ["32 16-21O","33 17-20O","34 17-20O","35 17-20O","36 17-20O","34 25-28s","35 25-28s","36 21-24O 25-28s","37 17-24O","38 16-22O"],
  ] },
  "wave": { W: 46, anchor: [17,31], frames: [
    ["32 16-20O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","25 9-12O","24 8-11O","20 7-9s","21 7-9s 11s","22 7-11s","23 8-10s"],
    ["32 16-20O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","25 8-11O","21 6-8s","22 6-8s 10s","23 6-10s","24 7-9s"],
    ["32 16-20O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","27 10-14O","24 5-7s","25 5-7s 9s","26 5-9s","27 6-8s"],
    ["32 16-20O","31 15-17O","30 13-17O","29 12-16O 19k","28 11-15O","27 10-14O","26 10-13O","25 8-11O","21 6-8s","22 6-8s 10s","23 6-10s","24 7-9s"],
  ] },
};
const CARRY_BOXES_AT = [10,31]; // props.js shoeboxes' canvas in carry's, every frame
// ---- DATA END ----

const sheets = { justin, desk, truffle, luibot, luibuilder, coffee, shoeRack, shoeboxes, chicken, cow, sheep };
let failed = 0;
const report = (sheet, check, problems, okText) => {
  const ok = problems.length === 0;
  if (!ok) failed += 1;
  console.log(`${sheet.padEnd(10)} ${check.padEnd(11)} ${ok ? "ok  " : "FAIL"} ${ok ? okText : problems.length + " " + (problems.length === 1 ? "problem" : "problems") + ": " + problems.slice(0, 4).join("; ") + (problems.length > 4 ? "; ..." : "")}`);
};
const outfitsOf = (sheet) => (sheet.outfits && Object.keys(sheet.outfits).length ? Object.keys(sheet.outfits) : ["default"]);
const paletteFor = (sheet, outfit) => ({ ...sheet.palette, ...(sheet.outfits?.[outfit] ?? {}) });
const frames = (sheet) => Object.entries(sheet.actions).flatMap(([name, a]) => a.frames.map((f, i) => [`${name}[${i}]`, f]));
const cells = (spec, W) => { // "x0-x1L x2L ..." -> [[x, letter], ...] (the workbench's row spec)
  const out = [];
  for (const seg of spec.trim().split(/\s+/)) { const m = seg.match(/^(\d+)(?:-(\d+))?(.)$/); if (!m) throw new Error("bad spec " + seg); for (let x = +m[1]; x <= +(m[2] ?? m[1]); x++) if (x < W) out.push([x, m[3]]); }
  return out;
};
const runCells = (runs) => { const s = new Set(); if (!runs) return s; for (const row of runs.split(";")) { const [y, xs] = row.split(":"); for (const r of xs.split(",")) { const [a, b] = r.split("-").map(Number); for (let x = a; x <= (b ?? a); x++) s.add(`${x},${y}`); } } return s; };

// closure, holes, sealed: the sheets drawn under the closed-outline rule (Truffle and the props draw
// steam, sleep marks and 1px details by their own rules); frames and feet: every sheet
const OUTLINED = ["justin", "desk"];
for (const [name, sheet] of Object.entries(sheets)) {
  for (const outfit of OUTLINED.includes(name) ? outfitsOf(sheet) : []) {
    const pal = paletteFor(sheet, outfit), ink = new Set([sheet.palette.k, pal.J].filter(Boolean)), tag = outfit === "default" ? "" : " " + outfit;
    const leaks = [], holes = [], sealed = [];
    for (const [label, f] of frames(sheet)) {
      const h = f.length, w = f[0].length;
      const vis = (x, y) => x >= 0 && y >= 0 && x < w && y < h && pal[f[y][x]] != null;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!vis(x, y) || ink.has(pal[f[y][x]])) continue;
        let leak = false;
        for (let dy = -1; dy <= 1 && !leak; dy++) for (let dx = -1; dx <= 1; dx++) if (!vis(x + dx, y + dy)) { leak = true; break; }
        if (leak) leaks.push(`${label} (${x},${y})`);
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].every(([dx, dy]) => vis(x + dx, y + dy) && ink.has(pal[f[y + dy][x + dx]]))) sealed.push(`${label} (${x},${y})`);
      }
      // transparent pockets not reachable from the border
      const seen = new Set(), st = [];
      const push = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h && !vis(x, y) && !seen.has(y * w + x)) { seen.add(y * w + x); st.push([x, y]); } };
      for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); } for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
      while (st.length) { const [x, y] = st.pop(); push(x + 1, y); push(x - 1, y); push(x, y + 1); push(x, y - 1); }
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!vis(x, y) && !seen.has(y * w + x)) {
        const q = [[x, y]]; seen.add(y * w + x); let n = 0;
        while (q.length) { const [cx, cy] = q.pop(); n++; for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) if (nx >= 0 && ny >= 0 && nx < w && ny < h && !vis(nx, ny) && !seen.has(ny * w + nx)) { seen.add(ny * w + nx); q.push([nx, ny]); } }
        if (n < 4) holes.push(`${label} ${n}px at (${x},${y})`);
      }
    }
    report(name, "closure" + tag, leaks, "every fill cell is enclosed");
    report(name, "holes" + tag, holes, "no sealed speck");
    report(name, "sealed" + tag, sealed, "no cell boxed in by ink");
  }
  report(name, "frames", Object.entries(sheet.actions).flatMap(([a, { frames: fs }]) => fs.slice(1).map((f, i) => (f.join("\n") === fs[i].join("\n") ? `${a}[${i}] = ${a}[${i + 1}]` : null)).filter(Boolean)), "consecutive frames differ");
  report(name, "feet", frames(sheet).filter(([, f]) => !/[^.]/.test(f[f.length - 1])).map(([l]) => l), "the bottom row of every frame is painted");
}

// heads, hands, arm length, fill-join: Justin
{
  const heads = [];
  for (const [action, i, refAction, refI, dy, dx, runs, note] of HEADS) {
    const f = justin.actions[action]?.frames[i], ref = justin.actions[refAction].frames[refI];
    if (!f) { heads.push(`${action}[${i}] missing`); continue; }
    const allow = runCells(runs), bad = [];
    for (let ry = 0; ry <= 29; ry++) for (let x = 0; x <= 35; x++) {
      const y = ry + dy, fx = x + dx; if (y < 0 || y >= f.length) continue;
      const got = f[y][fx] ?? ".";
      if (got !== ref[ry][x] && !allow.has(`${fx},${y}`)) bad.push(`(${fx},${y})`);
    }
    if (bad.length) heads.push(`${action}[${i}] vs ${refAction}[${refI}] ${bad.length} cells not in its allow-list (${note}): ${bad.slice(0, 3).join(" ")}`);
  }
  report("justin", "heads", heads, `${HEADS.length} frames carry the shared head cell for cell`);

  const hands = [];
  for (const [label, f] of frames(justin)) {
    const action = label.replace(/\[\d+\]$/, ""), h = f.length, w = f[0].length, seen = new Set(), sizes = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!SKIN.includes(f[y][x]) || seen.has(y * w + x)) continue;
      let n = 0; const st = [[x, y]]; seen.add(y * w + x);
      while (st.length) { const [cx, cy] = st.pop(); n++; for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) if (nx >= 0 && ny >= 0 && nx < w && ny < h && SKIN.includes(f[ny][nx]) && !seen.has(ny * w + nx)) { seen.add(ny * w + nx); st.push([nx, ny]); } }
      sizes.push(n);
    }
    sizes.sort((a, b) => b - a);
    const rest = sizes.slice(1), got = rest.filter((n) => n >= 6).length, slivers = rest.filter((n) => n < 6).length;
    if (got !== EXPECTED_HANDS[action] || slivers) hands.push(`${label} ${got} hands (expected ${EXPECTED_HANDS[action]})${slivers ? `, ${slivers} skin slivers under 6px` : ""}`);
  }
  report("justin", "hands", hands, "face plus the expected hands in every frame");

  // arm length: geodesic through the piece's cells (8-connected) from the cell nearest the shoulder joint to the farthest skin cell
  const armLength = (piece, W, anchor) => {
    const all = piece.flatMap((row) => { const [y, ...spec] = row.split(" "); return cells(spec.join(" "), W).map(([x, c]) => [x, +y, c]); });
    const key = ([x, y]) => `${x},${y}`, fill = new Map(all.map((c) => [key(c), c]));
    let start = null, best = Infinity;
    for (const c of all) { const d = Math.hypot(c[0] - anchor[0], c[1] - anchor[1]); if (d < best) { best = d; start = c; } }
    const dist = new Map([[key(start), best]]), queue = [start];
    while (queue.length) {
      queue.sort((a, b) => dist.get(key(a)) - dist.get(key(b))); const c = queue.shift(), d = dist.get(key(c));
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const n = fill.get(`${c[0] + dx},${c[1] + dy}`); if (!n) continue; const nd = d + Math.hypot(dx, dy); if (nd < (dist.get(key(n)) ?? Infinity)) { dist.set(key(n), nd); queue.push(n); } }
    }
    let far = 0; for (const c of all) if (SKIN.includes(c[2])) far = Math.max(far, dist.get(key(c)) ?? 0);
    return far;
  };
  const idleArm = []; for (let y = 32; y <= 45; y++) idleArm.push(`${y} 6-9${y >= 44 ? "s" : "O"}`);
  const TARGET_REACHING = new Set(["press", "grab", "pet", "pet-low", "pat", "pull", "pickup"]); // the arm reaches a target at a set distance
  const idleLen = armLength(idleArm, 36, [7, 31]), most = Math.round(idleLen) + 1, least = Math.round(idleLen) - 2, off = [], notes = [];
  for (const [pose, { W, anchor, anchors, frames: pieces }] of Object.entries(ARMS)) pieces.forEach((piece, i) => {
    if (!piece.length || !justin.actions[pose]) return;
    const len = armLength(piece, W, anchors?.[i] ?? anchor), r = Math.round(len), top = TARGET_REACHING.has(pose) ? most + 1 : most;
    notes.push(`${pose}[${i}] ${len.toFixed(1)}`);
    if (r > top || r < least) off.push(`${pose}[${i}] ${len.toFixed(1)} ${r > top ? ">" : "<"} ${r > top ? top : least}`);
  });
  report("justin", "arm length", off, `idle ${idleLen.toFixed(1)}, ${least} to ${most} (${most + 1} reaching a target); ${notes.join(", ")}`);

  const floats = [];
  for (const outfit of outfitsOf(justin)) {
    const pal = paletteFor(justin, outfit), ink = new Set([justin.palette.k, pal.J].filter(Boolean));
    for (const [pose, { W, frames: pieces }] of Object.entries(ARMS)) pieces.forEach((piece, i) => {
      if (!piece.length || !justin.actions[pose]) return;
      const f = justin.actions[pose].frames[i], h = f.length, w = f[0].length, comp = Array.from({ length: h }, () => Array(w).fill(-1)), comps = [];
      const vis = (x, y) => x >= 0 && y >= 0 && x < w && y < h && pal[f[y][x]] != null && !ink.has(pal[f[y][x]]);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        if (!vis(x, y) || comp[y][x] >= 0) continue;
        const id = comps.length, st = [[x, y]]; comp[y][x] = id; let n = 0, shirt = false;
        while (st.length) { const [cx, cy] = st.pop(); n++; if (f[cy][cx] === "S") shirt = true; for (const [nx, ny] of [[cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]]) if (vis(nx, ny) && comp[ny][nx] < 0) { comp[ny][nx] = id; st.push([nx, ny]); } }
        comps.push({ id, n, shirt });
      }
      const torso = comps.filter((c) => c.shirt).sort((p, q) => q.n - p.n)[0];
      if (!torso) return; // no shirt showing (carry: hanging arms beside the boxes), the rule is for raised sleeves
      const off = piece.flatMap((row) => { const [y, ...spec] = row.split(" "); return cells(spec.join(" "), W).filter(([x, c]) => "OPG".includes(c) && vis(x, +y) && comp[+y][x] !== torso?.id).map(([x]) => `(${x},${y})`); });
      if (off.length) floats.push(`${outfit} ${pose}[${i}] ${off.length} sleeve cells float, e.g. ${off.slice(0, 3).join(" ")}`);
    });
  }
  report("justin", "fill-join", floats, "every raised sleeve joins the torso with the ink removed");
}

// carry boxes
{
  const P = shoeboxes.actions.idle.frames[0], [bx, by] = CARRY_BOXES_AT, bad = [];
  justin.actions.carry.frames.forEach((f, i) => P.forEach((row, y) => [...row].forEach((c, x) => { if (c !== "." && f[y + by]?.[x + bx] !== c) bad.push(`f${i} (${x + bx},${y + by}) ${f[y + by]?.[x + bx]} vs ${c}`); })));
  report("justin", "carry boxes", bad, `shoeboxes at (${bx},${by}) cell for cell in ${justin.actions.carry.frames.length} frames`);
}

// desk vs type
{
  const d = desk.actions.idle.frames[0], tf = justin.actions.type.frames[0], body = "sdrhiwmOPSGNDApqfvlnJHkyzYb", bad = [];
  let same = 0, differ = 0;
  d.forEach((row, y) => [...row].forEach((c, x) => { if (c === ".") return; const tc = tf[y][x]; if (tc === c) same++; else if (tc === "." || !body.includes(tc)) bad.push(`(${x},${y}) ${c} vs ${tc}`); else differ++; }));
  report("desk", "vs type", bad, `${same} furniture cells identical, ${differ} under his figure`);
  const DESK_FROM_X = 34, tuck = desk.actions.tuck.frames, tuckBad = [];
  if (tuck.length < 3) tuckBad.push(`${tuck.length} frames`);
  if (tuck[0].join("\n") !== d.join("\n")) tuckBad.push("f0 is not idle");
  tuck.slice(1).forEach((f, i) => f.forEach((row, y) => [...row].forEach((c, x) => { const c0 = tuck[0][y][x]; if (c !== c0 && x >= DESK_FROM_X && c0 !== ".") tuckBad.push(`f${i + 1} (${x},${y}) ${c0} -> ${c}`); })));
  const moved = tuck.slice(1).map((f) => f.reduce((n, row, y) => n + [...row].filter((c, x) => c !== tuck[0][y][x]).length, 0));
  report("desk", "tuck", tuckBad, `f0 is idle; the ${tuck.length - 1} later frames change ${moved.join("/")} cells, all the chair's`);
}

console.log(failed ? `${failed} checks FAILED` : "all checks pass");
process.exit(failed ? 1 : 0);
