var camera, scene, renderer, controls, stats;
var label, projector, vector;
var env, agt;
var environments = new Array();
var agents = new Array();
var labels = new Array();

var originX = window.innerWidth / 2;
var originY = window.innerHeight / 2;
var environmentSize = 50;
var universeSize = 1000;

init();
animate();

function init(){
    //camera and scene
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
    camera.position.z = 3000;
    scene = new THREE.Scene();

    //content
    for(var i=0; i<8; i++){
        addEnvironment();
        for(var j=0; j<20; j++){
            addAgent(i);
        }
    }

    //controls and ui
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    controls = new THREE.TrackballControls(camera);

    //renderer
    renderer = new THREE.CanvasRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight, 10000);
    document.body.appendChild(renderer.domElement);
}

function animate(){
    requestAnimationFrame(animate);
    //update labels
    for(var i=0; i<labels.length; i++){
        var cur = labels[i];
        var env = environments[i];
        vector = new THREE.Vector3();
        projector = new THREE.Projector();
        projector.projectVector( vector.getPositionFromMatrix( env.matrixWorld ), camera );
        vector.x = ( vector.x * originX ) + originX;
        vector.y = - ( vector.y * originY ) + originY;
        cur.style.left = vector.x + 'px';
        cur.style.top = vector.y - environmentSize + 'px';
    }
    //update everything else
    controls.update();
    renderer.render(scene, camera);
    stats.update();
}

function addEnvironment(){
    //sphere
    env = new THREE.Mesh(new THREE.SphereGeometry(environmentSize, 16, 16), new THREE.MeshBasicMaterial({color: 0xffffff, wireframe: false, overdraw: true, fog: true}));
    env.position.x = randomBounds(-universeSize, universeSize);
    env.position.y = randomBounds(-universeSize, universeSize);
    env.position.z = randomBounds(-universeSize, universeSize);
    env.material.opacity = 0;
    environments.push(env);
    scene.add(env);
    //label
    label = document.createElement('div');
    label.innerHTML = '&#9674 ENV' + environments.length;
    label.id = 'environmentLabel';
    labels.push(label);
    document.body.appendChild(label);
}

function addAgent(env){
    agt = new THREE.Mesh(new THREE.SphereGeometry(4, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff, overdraw: true, fog: true}));
    var destination = environments[env];
    agt.position.x = destination.position.x + randomBounds(-environmentSize, environmentSize);
    agt.position.y = destination.position.y + randomBounds(-environmentSize, environmentSize);
    agt.position.z = destination.position.z + randomBounds(-environmentSize, environmentSize);
    agents.push(agt, env);
    scene.add(agt);
}

function randomBounds(low, high){
    return Math.floor(Math.random() * (high - low)) + low;
}


