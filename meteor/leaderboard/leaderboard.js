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

//    Template.cubegraphs.rendered = function(){
//        var context = cubism.context().step(6e4).size(400).stop();
//        d3.select("#cube-area svg").append("div")
//            .attr("class","rule")
//            .call(context.rule());
//        d3.select("#cube-area svg").append("p").text("hello cubism");
//    }

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
            .attr("r",0)
            .transition()
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

}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(function () {
    if (Envs.find().count() === 0) {
      // do nothing, wait for MIRA to register
    }
  });
}

