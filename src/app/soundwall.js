/*global requestAnimationFrame */

var Three = require('../lib/three.min');

var Wall = require('./wall');
var Lights = require('./lights');
var Controls = require('./controls');

var create = function(sceneWidth, sceneHeight) {

    'use strict';

    var config = {
        cameraDistance: 200,
        tilesize: 5,
        sizeBuffer: 4,
        animationSpeed: 0.1
    };

    var scene = new Three.Scene();
    var camera = new Three.PerspectiveCamera(
        75,
        sceneWidth / sceneHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, config.cameraDistance);
    var vFOV = camera.fov * Math.PI / 180;
    var height = 2 * Math.tan( vFOV / 2 ) * config.cameraDistance; // visible height
    var width = height * camera.aspect; // visible width


    var wallWidth = Math.ceil(width / config.tilesize) + config.sizeBuffer;
    var wallHeight = Math.ceil(height / config.tilesize) + config.sizeBuffer;

    var wall = Wall.createWall(wallWidth, wallHeight, config.tilesize);
    scene.add(wall.mesh);

    var renderer = new Three.WebGLRenderer();
    renderer.setSize( sceneWidth, sceneHeight );

    scene.add(Lights.createDirectional(0xffaaff,1));

    scene.add(Lights.createAmbient(0x001100));

    var render = function (t) {
        requestAnimationFrame(function () {
            render(t + config.animationSpeed);
        });
        renderer.render(scene, camera);
        wall.animate(t);
    };

    var raycaster = new Three.Raycaster();
    var mouse = new Three.Vector2();
    var click = function (xVal, yVal) {
        var xPos, yPos, p;
        mouse.x = (xVal * 2) - 1;
        mouse.y = -(yVal * 2) + 1;
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( [wall.mesh] );
        if (intersects.length > 0) {
            p = intersects[0].face.a;
            xPos = Math.floor(p / wall.points.yPoints);
            yPos = p % wall.points.yPoints;
            wall.createRipple(xPos, yPos);
        }
    };

    var resize = function (newWidth, newHeight) {
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize( newWidth, newHeight );
    };

    return {
        click: click,
        resize: resize,
        domElement: renderer.domElement,
        render: render
    };

};

module.exports = {
    create: create
};

