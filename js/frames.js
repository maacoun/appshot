// Device frame definitions
// Frame images from Facebook Design (https://design.facebook.com/toolsandresources/devices/)
// Licensed under Creative Commons Attribution 4.0 (CC BY 4.0)
//
// Screen coordinates measured from alpha-channel analysis of each frame PNG.
// screen.x/y/w/h are fractions of the frame image dimensions.

const FRAMES = {
  iphone13: {
    label: 'iPhone 13',
    frameW: 1570, frameH: 2932,
    screen: { x: 0.1274, y: 0.1030, w: 0.7446, h: 0.8284 },
    colors: [
      { id: 'midnight',  label: 'Midnight',  hex: '#1c1c1e' },
      { id: 'starlight', label: 'Starlight', hex: '#f2ece3' },
      { id: 'blue',      label: 'Blue',      hex: '#2e6b8e' },
      { id: 'pink',      label: 'Pink',      hex: '#f5c6c8' },
      { id: 'red',       label: 'Red',       hex: '#c3002f' },
    ],
    path: id => `frames/iphone13-${id}.png`,
  },
  ipad: {
    label: 'iPad',
    frameW: 1920, frameH: 2710,
    screen: { x: 0.0781, y: 0.1015, w: 0.8432, h: 0.7967 },
    colors: [
      { id: 'gold',       label: 'Gold',       hex: '#e2c37a' },
      { id: 'silver',     label: 'Silver',     hex: '#c8c8c8' },
      { id: 'space-grey', label: 'Space Grey', hex: '#6b6b6b' },
    ],
    path: id => `frames/ipad-${id}.png`,
  },
};
