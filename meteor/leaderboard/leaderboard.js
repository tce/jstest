// Set up a collection to contain mira environment information. On the server,
// it is backed by a MongoDB collection named "environment".

Envs = new Meteor.Collection("registry");
Agts = new Meteor.Collection("agentproperties");
CreatedAgts = new Meteor.Collection("createdagents");
if (Meteor.isClient) {

  Meteor.methods({
  // options should include: name, class, parameters
  createAgent: function (options) {
    check(options, {
      name: NonEmptyString,
      class: NonEmptyString,
      parameters: NonEmptyString
    });

    return CreatedAgents.insert({
      env: Session.get("selected_env"),
      name: options.name,
      class: options.class,
      parameters: options.parameters
    });
  }
  });



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

    Template.leaderboard.events(
      {
        'click input.inc': function ()
        {
            Envs.update(Session.get("selected_env"), {$inc: {numAgents: 5}});
        }
      },
      {
        'click input.addagent': function()
        {
          console.log("in addagent");
          Envs.update(Session.get("selected_env"), {$inc: {numAgents: 1}} );
        }
      });

    Template.env.events(
      {
        'click': function ()
        {
            Session.set("selected_env", this._id);
        }
      },
      {
        'click input.addagent': function()
        {
          Envs.update(Session.get("selected_env"), {$inc: {numAgents: 1}} );
        }
      });

    Template.agt.events({
      'click':function(){
        Session.set("selected_agt", this._id);
        console.log("selected agent");
        console.log(this._id);
      }
    });


      Template.agt.selected = function () {
        return Session.equals("selected_agt", this._id) ? "selected" : '';
    };




///////////////////////////////////////////////////////////////////////////////
// Create Party dialog

var openCreateDialog = function () {
  Session.set("showCreateDialog", true);
};

Template.leaderboard.showCreateDialog = function () {
  return Session.get("showCreateDialog");
};

Template.createDialog.events({
  'click .save': function (event, template) {
    var agtname = template.find(".agtname").value;
    var agtclass = template.find(".agtclass").value;
    var agtparameters = template.find(".agtparameters").value;

    if (agtname.length && agtclass.length) {
      Meteor.call('createAgent', {
        agtname: agtname,
        agtclass: agtclass,
        agtparameters: agtparameters
      }, function (error, party) {
        if (! error) {
            console.log("create the agent!!")
        }
      });
      Session.set("showCreateDialog", false);
    } else {
      Session.set("createError",
                  "It needs a title and a description, or why bother?");
    }
  },

  'click .cancel': function () {
    Session.set("showCreateDialog", false);
  }
});

Template.createDialog.error = function () {
  return Session.get("createError");
};














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
	var w = window.innerWidth - 10;
	var h = window.innerHeight - 10;
	var radius = h*0.6;
	var color = d3.scale.category20();
	var rings = d3.scale.category20c();
        var svg = d3.select("#constellation-area svg")
	.attr("width", w)
	.attr("height", h);
        var g = svg.append("g");
	var g = svg.append("g")
	.attr("transform","translate(" + w/2 + "," + h/2 + ")");
	var environments = [];
	var sectors = [0];
	var segments = [];

	var arc = d3.svg.arc();

	setInterval(function(){
		var cur;
		var n = 0;
		var region;
		var layers = 0;
		for(var i=0; i<environments.length; i++){
		    if(environments[i].ippath.length > layers){
			layers = environments[i].ippath.length;
		    }
		}
		console.log(layers);
		for(layer=0; layer<layers; layer++){
		    cur = environments[n].ippath[layer];
		    region = (radius * 0.65) + 17 * (5 - (layer + 1));
		    segments[n] = g.append("path")
			.datum({innerRadius: region, outerRadius: region*1.04, startAngle: Math.PI/2, endAngle: Math.PI/2})
			.style("fill",rings(n))
			.attr("d",arc);
		    var start = Math.PI/2;
		    var end = Math.PI/2;
		    for(var j=0; j<environments.length; j++){
			if(cur != environments[j].ippath[layer]){
			    end = sectors[j] + Math.PI/2;
			    segments[n].transition().duration(2000).call(arcTween, end);
			    cur = environments[j].ippath[layer];
			    start = end;
			    n++;
			    segments[n] = g.append("path")
				.datum({innerRadius: region, outerRadius: region*1.04, startAngle: start, endAngle: end})
				.style("fill",rings(n))
				.attr("d",arc);
			}
		    }
		    end = sectors[j] + Math.PI/2;
		    segments[n].transition().duration(2000).call(arcTween, end);
		    n++;
		}
	    },1000);

	function arcTween(transition, newAngle) {
	    transition.attrTween("d",function(d){
		    var interpolate = d3.interpolate(d.endAngle, newAngle);
		    return function(t) {
			d.endAngle = interpolate(t);
			return arc(d);
		    }
		})
		}

	function graph() {
	    var force = d3.layout.force();
	    var nodes = force.nodes();
	    var links = force.links();

	    this.addEnvironment = function(name, ip) {
		var ippath = ip.split(".");
		ippath.splice(ippath.length-1,1);
		for(var i=0; i<environments.length; i++){
		    for(var j=0; j<ippath.length; j++){
			if(ippath[j] > environments[i].ippath[j]){
			    break;
			}else
			    if(ippath[j] < environments[i].ippath[j]){
				environments.splice(i,0,{"id": name, "ippath": ippath, "agents": []});
				return;
			    }
		    }
		}
		environments.push({"id": name, "ippath": ippath, "agents": []});
	    }

	    this.addAgent = function(id, env) {
		if(typeof env != "number"){
		    env = findEnvironmentIndex(env) + 1;
		};
		nodes.push({"id": id, "env": env, "ind": environments[env].agents.length + 1});
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
		.data(environments);

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

			var monVal = 0;

			var k = e.alpha * 0.1;
			nodes.forEach(function(o,i) {
				o.x += (w / 2 + Math.cos(sectors[o.env] + (o.ind / environments[o.env].agents.length) * (sectors[o.env+1] - sectors[o.env])) * (radius - monVal) - o.x) * k;
				o.y += (h / 2 + Math.sin(sectors[o.env] + (o.ind / environments[o.env].agents.length) * (sectors[o.env+1] - sectors[o.env])) * (radius - monVal) - o.y) * k;
			    });

			node    .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")"; });

			label   .attr("x",function(d,i){ return w/2 + Math.cos((sectors[i] + sectors[i+1]) / 2) * (radius * 0.6) })
			    .attr("y",function(d,i){ return h/2 + Math.sin((sectors[i] + sectors[i+1]) / 2) * (radius * 0.6) })
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

	graph.addEnvironment("first","172.16.2.101");
	graph.addEnvironment("second","172.16.1.101");
	graph.addEnvironment("third","172.16.2.102");
	graph.addEnvironment("fourth","172.16.1.102");
	graph.addEnvironment("fifth","200.1");

	for(var i=0; i<21; i++){
	    graph.addAgent(i,"first");
	}

	for(var i=21; i<28; i++){
	    graph.addAgent(i,"second");
	}

	for(var i=28; i<100; i++){
	    graph.addAgent(i,"third");
	}

	for(var i=100; i<150; i++){
	    graph.addAgent(i,"fourth");
	}

	graph.addAgent("green guy","fifth");

	console.log(environments);

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

