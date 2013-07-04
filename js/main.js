
var camera, scene, renderer;
var geometry, material;

var elements = new Array();

init();
animate();

// create a cube and put it in a random x,y position
function makeCube() {

    var cube = new THREE.CubeGeometry( 50, 50, 50);
    var mesh = new THREE.Mesh( cube, material );

    var centerX = ((window.innerWidth-150) / 2);
    var centerY = ((window.innerHeight-150) / 2);

    mesh.position.x = Math.round(Math.random()*( window.innerWidth - 300 )) - centerX;
    mesh.position.y = Math.round(Math.random()*( window.innerHeight - 300)) - centerY;

    return mesh;
}

function init() {

    camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.z = 1000;

    scene = new THREE.Scene();

    material = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );

    for (var i = 0; i < Math.random()*100; i++)
    {
        var newcube = makeCube();
        elements.push( newcube );
        scene.add( newcube );
    }

    renderer = new THREE.CanvasRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight, 10000 );

    document.body.appendChild( renderer.domElement );

}

function animate() {

    // note: three.js includes requestAnimationFrame shim
    requestAnimationFrame( animate );

    for ( var i = 0; i < elements.length; i++)
    {
        var thisCG = elements[i];
        thisCG.rotation.x += 0.01;
        thisCG.rotation.y += 0.02;
    }

    renderer.render( scene, camera );

}

