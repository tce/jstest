var camera, scene, renderer, controls, stats;
var label, projector, vector, selector;
var env, agt;
var environments = [];
var agents = [];
var labels = [];

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
    delEnvironment(5);

    //controls
    controls = new THREE.TrackballControls(camera);
    selector = new THREE.Projector();
    document.addEventListener('mousedown', globalMouseDown, false);
    document.addEventListener('keydown', globalKeyDown, false);
    window.addEventListener('resize', globalResize, false);

    //stats
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

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
            if(cur != null){
            var env = environments[i];
            vector = new THREE.Vector3();
            projector = new THREE.Projector();
            projector.projectVector( vector.getPositionFromMatrix( env.matrixWorld ), camera );
            vector.x = ( vector.x * originX ) + originX;
            vector.y = - ( vector.y * originY ) + originY;
            cur.style.left = vector.x + 'px';
            cur.style.top = vector.y - environmentSize + 'px';
        }
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
    env.agentChildren = [];
    environments.push(env);
    scene.add(env);
    //label
    label = document.createElement('div');
    label.innerHTML = '&#9674 ENV' + environments.length;
    label.id = 'environmentLabel';
    labels.push(label);
    document.body.appendChild(label);
}

function delEnvironment(num){
    var cur = environments[num - 1];
    for(var i=0; i<cur.agentChildren.length; i++){
        scene.remove(cur.agentChildren[i]);
    }
    scene.remove(cur);
    cur = null;
    environments[num - 1] = null;
    document.body.removeChild(labels[num - 1]);
    labels[num - 1] = null;
}

function addAgent(env){
    agt = new THREE.Mesh(new THREE.SphereGeometry(4, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff, overdraw: true, fog: true}));
    var destination = environments[env];
    agt.position.x = destination.position.x + randomBounds(-environmentSize, environmentSize);
    agt.position.y = destination.position.y + randomBounds(-environmentSize, environmentSize);
    agt.position.z = destination.position.z + randomBounds(-environmentSize, environmentSize);
    agents.push(agt);
    destination.agentChildren.push(agt);
    scene.add(agt);
}

function globalResize(event){
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function globalMouseDown(event){
    event.preventDefault();
    var selectionVector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    selector.unprojectVector(selectionVector, camera);
    var selectionRay = new THREE.Raycaster(camera.position, selectionVector.sub(camera.position).normalize());
    var intersects = selectionRay.intersectObjects(environments);
    if(intersects.length > 0){
        var focus = intersects[0].object;
        scopePoint(focus.position.x, focus.position.y, focus.position.z);
    }
}

function globalKeyDown(event){
    switch(event.keyCode){
        case 48: scopePoint(0, 0, 0); break;
        case 49: scopeEnvironment(0); break;
        case 50: scopeEnvironment(1); break;
        case 51: scopeEnvironment(2); break;
        case 52: scopeEnvironment(3); break;
        case 53: scopeEnvironment(4); break;
        case 54: scopeEnvironment(5); break;
        case 55: scopeEnvironment(6); break;
        case 56: scopeEnvironment(7); break;
        case 57: scopeEnvironment(8); break;
    }
}

function randomBounds(low, high){
    return Math.floor(Math.random() * (high - low)) + low;
}

function scopePoint(x, y, z){
    controls.target = new THREE.Vector3(x, y, z);
}

function scopeEnvironment(num){
    var cur = environments[num];
    if(cur != null){
        controls.target = new THREE.Vector3(cur.position.x, cur.position.y, cur.position.z);
    }
}


