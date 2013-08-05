var camera, scene, renderer, controls, stats;
var label, projector, vector;
var env, agt, i, cur, focus;
var destination, sender, receiver, path, connection, pulse;
var selector, selectionVector, selectionRay, intersects;

var environments = [];
var agents = [];
var labels = [];
var connections = [];
var pulses = [];

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
    //delEnvironment(5);
    sendMessage(3, 26);
    sendMessage(80, 46);
    sendMessage(32, 95);
    sendMessage(20, 40);
    sendMessage(102, 118);
    sendMessage(40, 70);
    sendMessage(10, 50);
    delAgent(27);
    sendMessage(27, 28);

    //controls
    controls = new THREE.TrackballControls(camera);
    selector = new THREE.Projector();
    document.addEventListener('mousedown', globalMouseDown, false);;
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
    i = labels.length;
    while(i--){
        cur = labels[i];
        if(cur != null){
            var env = environments[i];
            vector = new THREE.Vector3();
            projector = new THREE.Projector();
            projector.projectVector(vector.getPositionFromMatrix(env.matrixWorld), camera);
            vector.x = (vector.x * originX) + originX;
            vector.y = -(vector.y * originY) + originY;
            cur.style.left = vector.x + 'px';
            cur.style.top = vector.y - environmentSize + 'px';
        }
    }
    //update pulses
    i = pulses.length;
    while(i--){
        cur = pulses[i];
        if(cur != null){
            if(Math.abs(cur.sinkX - cur.position.x) < 1){
                cur.position.x = cur.sourceX;
                cur.position.y = cur.sourceY;
                cur.position.z = cur.sourceZ;
            }
            cur.position.x += (cur.sinkX - cur.position.x) * 0.1;
            cur.position.y += (cur.sinkY - cur.position.y) * 0.1;
            cur.position.z += (cur.sinkZ - cur.position.z) * 0.1;
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
    env.agtChildren = [];
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
    cur = environments[num - 1];
    for(var i=0; i<cur.agtChildren.length; i++){
        scene.remove(agents[cur.agtChildren[i]]);
        agents[cur.agtChildren[i]] = null;
        cur.agtChildren[i] = null;
    }
    scene.remove(cur);
    cur = null;
    environments[num - 1] = null;
    document.body.removeChild(labels[num - 1]);
    labels[num - 1] = null;
}

function addAgent(env){
    agt = new THREE.Mesh(new THREE.SphereGeometry(4, 1, 1), new THREE.MeshBasicMaterial({color: 0xffffff, overdraw: true}));
    destination = environments[env];
    agt.position.x = destination.position.x + randomBounds(-environmentSize, environmentSize);
    agt.position.y = destination.position.y + randomBounds(-environmentSize, environmentSize);
    agt.position.z = destination.position.z + randomBounds(-environmentSize, environmentSize);
    agt.envParent = destination;
    agt.outgoing = [];
    agt.incoming = [];
    agents.push(agt);
    destination.agtChildren.push(agents.length - 1);
    scene.add(agt);
}

function delAgent(num){
    cur = agents[num - 1];
    scene.remove(cur);
    agents[num - 1] = null;
}

function sendMessage(snd, rcv){
    //line
    sender = agents[snd - 1];
    if(sender == null){console.log("sender does not exist"); return;};
    receiver = agents[rcv - 1];
    if(receiver == null){console.log("receiver does not exist"); return;};
    path = new THREE.Geometry;
    path.vertices.push(new THREE.Vector3(sender.position.x, sender.position.y, sender.position.z));
    path.vertices.push(new THREE.Vector3(receiver.position.x, receiver.position.y, receiver.position.z));
    path.vertices[0].vertexColors = 0xcccccc;
    connection = new THREE.Line(path, new THREE.LineBasicMaterial());
    sender.outgoing.push(connection);
    receiver.incoming.push(connection);
    connections.push(connection);
    scene.add(connection);
    //pulse
    pulse = new THREE.Mesh(new THREE.CylinderGeometry(2, 3, 3), new THREE.MeshBasicMaterial({color: 0xffffff, overdraw:true}));
    pulse.position.x = pulse.sourceX = sender.position.x;
    pulse.position.y = pulse.sourceY = sender.position.y;
    pulse.position.z = pulse.sourceZ = sender.position.z;
    pulse.sinkX = receiver.position.x;
    pulse.sinkY = receiver.position.y;
    pulse.sinkZ = receiver.position.z;
    pulses.push(pulse);
    scene.add(pulse);
}

function globalResize(event){
    //camera.aspect = window.innerWidth / window.innerHeight;
    //camera.updateProjectionMatrix();
    //renderer.setSize(window.innerWidth, window.innerHeight);
}

function globalMouseDown(event){
    event.preventDefault();
    selectionVector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    selector.unprojectVector(selectionVector, camera);
    selectionRay = new THREE.Raycaster(camera.position, selectionVector.sub(camera.position).normalize());
    intersects = selectionRay.intersectObjects(environments);
    if(intersects.length > 0){
        focus = intersects[0].object;
        scopePoint(focus.position.x, focus.position.y, focus.position.z);
    }
}

/*function globalMouseMove(event){
    event.preventDefault();
    var selectionVector = new THREE.Vector3((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1, 0.5);
    selector.unprojectVector(selectionVector, camera);
    var selectionRay = new THREE.Raycaster(camera.position, selectionVector.sub(camera.position).normalize());
    var intersects = selectionRay.intersectObjects(agents);
    if(intersects.length > 0){
        var focus = intersects[0].object;
        for(var i=0; i<focus.outgoing.length; i++){
            focus.outgoing[i].material = new THREE.LineBasicMaterial({color: 0xFFE83D});
        }
        for(var i=0; i<focus.incoming.length; i++){
            focus.incoming[i].material = new THREE.LineBasicMaterial({color: 0x3DDBFF});
        }
    }
}*/

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
    cur = environments[num];
    if(cur != null){
        controls.target = new THREE.Vector3(cur.position.x, cur.position.y, cur.position.z);
    }
}


