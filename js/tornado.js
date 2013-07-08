var camera, scene, renderer, controls;
var geometry, string, material, material2;
var sideview = true;

var elements = new Array();

init();
animate();

function makeCube(depth) {
    var cube = new THREE.CubeGeometry(20, 20, 20);
    var mesh = new THREE.Mesh(cube, material);
    var centerX = ((window.innerWidth-150) / 2);
    var centerY = ((window.innerHeight-150) / 2);
    mesh.position.x = Math.round(Math.random()*(window.innerWidth - 300)) - centerX;
    mesh.position.y = Math.round(Math.random()*(window.innerHeight - 300)) - centerY;
    mesh.position.z = depth * 40 - 1000;
    geometry.vertices.push(new THREE.Vector3(mesh.position.x, mesh.position.y, mesh.position.z));
    return mesh;
}

function init() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 2000;
    scene = new THREE.Scene();
    
    material = new THREE.MeshBasicMaterial({color: 0xffffff});
    material2 = new THREE.LineBasicMaterial({color: 0xff00ff});
    geometry = new THREE.Geometry();
    
    
    for (var i=0; i<50; i++){
        var newcube = makeCube(i);
        elements.push(newcube);
        scene.add(newcube);
    }
    string = new THREE.Line(geometry, material2);
    scene.add(string);
    
    controls = new THREE.OrbitControls(camera);
    controls.maxPolarAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 2;
    controls.userRotate = false;
    document.addEventListener('keydown', toggleView, false);
    
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight, 10000);
    document.body.appendChild(renderer.domElement);
}

function toggleView(event) {
    if(event.keyCode == 65){
        if(sideview){
            sideview = false;
        }else{
            sideview = true;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    for (var i=0; i<elements.length; i++){
        var thisCG = camera;
    }
    if(sideview){
        camera.position.x += (0 - camera.position.x) * 0.1;
        camera.position.z += (2000 - camera.position.z) * 0.1;
    }else{
        camera.position.x += (2000 - camera.position.x) * 0.1;
        camera.position.z += (0 - camera.position.z) * 0.1;
    }
    controls.update();
    renderer.render(scene, camera);
}

