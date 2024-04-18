var generator = new ColorfulBackgroundGenerator();

// This adds 3 layers to the generator
// The parameters are: degree[0-360],
//                     h[0-360], 
//                     s[0-1], 
//                     l[0-1],
//                     posColor[0-100], 
//                     posTransparency[0-100]
// The lowest layer (at the bottom) in the css is the first added layer.
generator.addLayer(new ColorfulBackgroundLayer({degree: 50, h: 35, s: 0.95, l: 45, posColor: 100})); // bottom layer
generator.addLayer(new ColorfulBackgroundLayer({degree: 140, h: 220, s: 0.9, l: 0.7, posColor: 30, posTransparency: 80}));
generator.addLayer(new ColorfulBackgroundLayer({degree: 210, h: 340, s: 0.9, l: 0.65, posColor: 10, posTransparency: 55})); // top layer

// Print the css style.
var element = document.getElementById("code");
element.innerHTML = generator.getCSSAsText();