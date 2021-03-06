
import { SceneDesc } from './render';
import { SceneGroup } from '../viewer';

const id = "sm64ds";
const name = "Super Mario 64 DS";
const sceneDescs = [
    "Princess Peach's Castle",
    new SceneDesc(1, "Outdoor Gardens"),
    new SceneDesc(2, "Main Foyer"),
    new SceneDesc(4, "Basement"),
    new SceneDesc(5, "Upstairs"),
    new SceneDesc(3, "Courtyard"),
    new SceneDesc(50, "Playroom"),
    "Levels",
    new SceneDesc(6, 'Bob-omb Battlefield'),
    new SceneDesc(7, "Whomp's Fortress"),
    new SceneDesc(8, 'Jolly Roger Bay'),
    new SceneDesc(9, 'Jolly Roger Bay - Inside the Ship'),
    new SceneDesc(10, 'Cool, Cool Mountain'),
    new SceneDesc(11, 'Cool, Cool Mountain - Inside the Slide'),
    new SceneDesc(12, "Big Boo's Haunt"),
    new SceneDesc(13, 'Hazy Maze Cave'),
    new SceneDesc(14, 'Lethal Lava Land'),
    new SceneDesc(15, 'Lethal Lava Land - Inside the Volcano'),
    new SceneDesc(16, 'Shifting Sand Land'),
    new SceneDesc(17, 'Shifting Sand Land - Inside the Pyramid'),
    new SceneDesc(18, 'Dire, Dire Docks'),
    new SceneDesc(19, "Snowman's Land"),
    new SceneDesc(20, "Snowman's Land - Inside the Igloo"),
    new SceneDesc(21, 'Wet-Dry World'),
    new SceneDesc(22, 'Tall Tall Mountain'),
    new SceneDesc(23, 'Tall Tall Mountain - Inside the Slide'),
    new SceneDesc(25, 'Tiny-Huge Island - Tiny'),
    new SceneDesc(24, 'Tiny-Huge Island - Huge'),
    new SceneDesc(26, "Tiny-Huge Island - Inside Wiggler's Cavern"),
    new SceneDesc(27, 'Tick Tock Clock'),
    new SceneDesc(28, 'Rainbow Ride'),
    "Bowser Levels",
    new SceneDesc(35, 'Bowser in the Dark World'),
    new SceneDesc(36, 'Bowser in the Dark World - Boss Arena'),
    new SceneDesc(37, 'Bowser in the Fire Sea'),
    new SceneDesc(38, 'Bowser in the Fire Sea - Boss Arena'),
    new SceneDesc(39, 'Bowser in the Sky'),
    new SceneDesc(40, 'Bowser in the Sky - Boss Arena'),
    "Secret Levels",
    new SceneDesc(29, 'The Princess\'s Secret Slide'),
    new SceneDesc(30, 'The Secret Aquarium'),
    new SceneDesc(34, 'Wing Mario over the Rainbow'),
    new SceneDesc(31, 'Tower of the Wing Cap'),
    new SceneDesc(32, 'Vanish Cap Under the Moat'),
    new SceneDesc(33, 'Cavern of the Metal Cap'),
    "Extra DS Levels",
    new SceneDesc(46, 'Big Boo Battle'),
    new SceneDesc(47, 'Big Boo Battle - Boss Arena'),
    new SceneDesc(44, 'Goomboss Battle'),
    new SceneDesc(45, 'Goomboss Battle - Boss Arena'),
    new SceneDesc(48, 'Chief Chilly Challenge'),
    new SceneDesc(49, 'Chief Chilly Challenge - Boss Arena'),
    "VS Maps",
    new SceneDesc(42, 'The Secret of Battle Fort'),
    new SceneDesc(43, 'Sunshine Isles'),
    new SceneDesc(51, 'Castle Gardens'),
    "Unused Test Maps",
    new SceneDesc(0,  'Test Map A'),
    new SceneDesc(41, 'Test Map B'),
];

export const sceneGroup: SceneGroup = { id, name, sceneDescs };
