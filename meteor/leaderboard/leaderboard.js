// Set up a collection to contain mira environment information. On the server,
// it is backed by a MongoDB collection named "environment".

Envs = new Meteor.Collection("registry");
Agts = new Meteor.Collection("agentproperties");

if (Meteor.isClient) {
    Template.leaderboard.env = function () {
        return Envs.find({}, {sort: {mira_label: 1}});
    };

    Template.leaderboard.selected_name = function () {
        var env = Envs.findOne(Session.get("selected_env"));
        return env && env.mira_label;
    };

    Template.env.selected = function () {
        return Session.equals("selected_env", this._id) ? "selected" : '';
    };

    Template.leaderboard.events({
        'click input.inc': function () {
            Envs.update(Session.get("selected_env"), {$inc: {numAgents: 5}});
        }
    });

    Template.env.events({
        'click': function () {
            Session.set("selected_env", this._id);
        }
    });

    // the leaderboard agt's will be those items in the Agts collection that have
    // "containedin": the selected environment
    Template.leaderboard.agt = function(){
        var agtHostId = Envs.findOne(Session.get("selected_env")).prop_key_env_id;
        console.log(agtHostId);
//        return Agts.find({prop_key_agt_host_env_id: agtHostId},{sort: {agent_name:1}})
        var agtsInEnv = Agts.find({prop_key_agt_host_env_id: agtHostId},{sort: {agent_name:1}});
        return agtsInEnv;
    }

    Template.cubegraphs.rendered = function(){
       // var context = cubism.context().step(6e4).size(400).stop();
        //d3.select("#cube-area svg").append("div")
//            .attr("class","rule");
//            .call(context.rule());
        d3.select("#cube-area svg").append("p").text("hello cubism");
    }

    Template.mainbody.rendered = function(){

        var width = 600;
        var height = 150;

        var svg = d3.select("#d3-area svg")
            .attr("width", width)
            .attr("height", height);

        var selectedvar = Envs.findOne(Session.get("selected_env"));
        console.log(selectedvar);

        var selectedEnv = selectedvar && selectedvar.mira_label;

        console.log(selectedEnv);
        var data = Envs.find({}, {sort: {numAgents: -1, mira_label: 1}}).fetch();
        var agtdata = selectedvar && Agts.find({prop_key_agt_host_env_id: selectedvar.prop_key_env_id},{sort: {agent_name:1}});
        var environmentAgents = selectedvar && selectedvar.agtlist;
        console.log(environmentAgents);


        // draw the circles for the MIRA environments

        var circles = svg.selectAll("circle").data(data);

        circles
            .attr("cx", function(d,i) { return i*50 + 50;})
            .attr("cy", height/2)
            .attr("fill", function(d){ if (d.mira_label == selectedEnv)
            {return "yellow"}
            else
            {return d3.rgb(180, 180, 180)}})
            .attr("r", 20 );


        circles.enter().append("svg:circle")
            .attr("cx", function(d,i) { return i*50 + 50;})
            .attr("cy", height/2)
            .attr("fill", function(d){ if (d.mira_label == selectedEnv)
            {return "yellow"}
            else
            {return d3.rgb(180, 180, 180)}})
            .attr("r",0)
            .transition()
            .attr("r", 20 );


        circles.exit().transition().attr("r",0).remove();

        var labels = svg.selectAll("text").data(data)
            .text(function(d){return d.mira_label;})
            .attr("x", function(d,i) {return i*50 + 40;})
            .attr("y", height/2+4)
            .attr("font-family","sans-serif")
            .attr("font-size", "11px")
            .attr("fill", function(d){ if (d.mira_label == selectedEnv) {return "black"} else {return "white"}});


        labels.enter().append("text")
            .text(function(d){return d.mira_label;})
            .attr("x", function(d,i) {return i*50 + 40;})
            .attr("y", height/2+4)
            .attr("font-family","sans-serif")
            .attr("font-size", "11px")
            .attr("fill", function(d){ if (d.mira_label == selectedEnv) {return "black"} else {return "white"}});

        labels.exit().remove();


        //
    }

    Template.constellation.rendered = function()
    {
        var w = window.innerWidth - 60;
        var h = window.innerHeight - 60;
        var color = d3.scale.category20();
        var svg = d3.select("#constellation-area svg")
                .attr("width", w)
                .attr("height", h);
        var g = svg.append("g");
        var environments = [];
        var sectors = [0];

        function graph() {
            var force = d3.layout.force();
            var nodes = force.nodes();
            var links = force.links();

            this.addEnvironment = function(id, ip) {
                for(var i=0; i<environments.length; i++){
                    if(ip < environments[i].ip){
                        environments.splice(i,0,{"id": id, "ip": ip, "agents": []});
                        return;
                    }
                }
                environments.push({"id": id, "ip": ip, "agents": []});
            }

            this.addAgent = function(id, env) {
                if(typeof env != "number"){
                    env = findEnvironmentIndex(env) + 1;
                };
                nodes.push({"id": id, "env": env, "ith": environments[env].agents.length + 1});
                environments[env].agents.push(findAgent(id));
                update();
            }

            this.removeAgent = function(id) {
                var i = 0;
                var n = findAgent(id);
                while(i < links.length){
                    if ((links[i]['source'] == n) || (links[i]['target'] == n)) links.splice(i, 1);
                    else i++;
                }
                nodes.splice(findAgentIndex(id), 1);
                update();
            }

            this.addLink = function(source, target, value) {
                links.push({"source": findAgent(source), "target": findAgent(target), "value": value});
                update();
            }

            var findEnvironmentIndex = function(id) {
                for (var i in environments) {if (environments[i]["id"] === id) return i-1};
            }

            var findAgent = function(id) {
                for(var i in nodes){ if(nodes[i]["id"] === id) return nodes[i]};
            }

            var findAgentIndex = function(id) {
                for (var i in nodes) {if (nodes[i]["id"] === id) return i};
            }

            var update = function () {
                var link = g.selectAll(".link")
                        .data(links, function(d) { return d.source.id + "&" + d.target.id; });

                link.enter().insert("line")
                        .attr("id",function(d){return d.source.id + "&" + d.target.id;})
                        .attr("stroke",function(d){
                            return color(findAgentIndex(d.source.id));
                        })
                        .attr("stroke-width",1)
                        .attr("class","link");

                link.transition().delay(function(d){ return d.value }).remove(); //optional remove on timer

                link.exit().remove();

                var node = svg.selectAll(".node")
                        .data(nodes, function(d){ return d.id });

                var nodeEnter = node.enter().append("g")
                        .attr("class", "node")
                        .call(force.drag);

                nodeEnter.append("rect")
                        .attr("width",2)
                        .attr("height",2)
                        .attr("x",0)
                        .attr("y",0)
                        .attr("fill",function(d,i){ return color(d.env) })
                        .attr("id", function(d){ return "Node;" + d.id });

                node.exit().remove();

                for(var i=1; i<=environments.length; i++){
                    sectors[i] = 0;
                    for(var j=0; j<i; j++){
                        sectors[i] += environments[j].agents.length;
                    }
                }
                for(var i=1; i<sectors.length; i++){
                    sectors[i] = sectors[i] / nodes.length * 2 * Math.PI;
                }

                var label = svg.selectAll(".label")
                        .data(environments, function(d,i){ return i });

                label.enter().append("text")
                        .text(function(d,i){ return "♦ENV" + i })
                        .attr("class","label")
                        .attr("fill",function(d,i){ return color(i) })
                        .attr("text-anchor","middle")
                        .style("font-size","10px");

                label.exit().remove();

                force.on("tick", function(e) {
                    link    .attr("x1", function(d) { return d.source.x; })
                            .attr("y1", function(d) { return d.source.y; })
                            .attr("x2", function(d) { return d.target.x; })
                            .attr("y2", function(d) { return d.target.y; });

                    var monitoredValue = 500;

                    var k = e.alpha * 0.1;
                    nodes.forEach(function(o,i) {
                        o.x += (w / 2 + Math.cos(sectors[o.env] + (o.ith / environments[o.env].agents.length) * (sectors[o.env+1] - sectors[o.env])) * monitoredValue - o.x) * k;
                        o.y += (h / 2 + Math.sin(sectors[o.env] + (o.ith / environments[o.env].agents.length) * (sectors[o.env+1] - sectors[o.env])) * monitoredValue - o.y) * k;
                    });

                    node    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });

                    label   .attr("x",function(d,i){ return w/2 + Math.cos((sectors[i] + sectors[i+1]) / 2) * 300 })
                            .attr("y",function(d,i){ return h/2 + Math.sin((sectors[i] + sectors[i+1]) / 2) * 300 })
                });


                force
                        .linkStrength(0)
                        .linkDistance(50)
                        .charge(-2)
                        .size([w,h])
                        .start();
            }
            update();
        }

        var graph = new graph();

        graph.addEnvironment("blue",3); //normally id and parent ip would be easily extracted from same string, like .101 <-- --> 172.16.1
        graph.addEnvironment("light",2);
        graph.addEnvironment("orange",2);
        graph.addEnvironment("tan",1);

        for(var i=0; i<21; i++){
            graph.addAgent(i,"blue");
        }

        for(var i=21; i<28; i++){
            graph.addAgent(i,"light");
        }

        for(var i=28; i<100; i++){
            graph.addAgent(i,"orange");
        }

        for(var i=100; i<150; i++){
            graph.addAgent(i,"tan");
        }

    }

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Envs.find().count() === 0) {
      // do nothing, wait for MIRA to register
    }
  });
}

