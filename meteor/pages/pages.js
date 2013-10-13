Envs = new Meteor.Collection("registry");
Agts = new Meteor.Collection("agentproperties");
CreatedAgts = new Meteor.Collection("createdagents");

Router.map(function() {
  this.route('home', {
    path: '/'});
  this.route('hello', {
    path: '/hello'});
  this.route('test', {
    path: '/test'});
});




if (Meteor.isClient) {

  Router.configure({
    layout: 'layout'
  });

  Template.hello.greeting = function () {
    return "Welcome to pages.";
  };

  Template.hello.events({
    'click input' : function () {
      // template data, if any, is available in 'this'
      if (typeof console !== 'undefined')
        console.log("You pressed the button");
    }
  });


    Template.home.env = function () {
        return Envs.find({}, {sort: {mira_label: 1}});
    };

    Template.home.selected_name = function () {
        var env = Envs.findOne(Session.get("selected_env"));
        return env && env.mira_label;
    };

    Template.env.selected = function () {
        return Session.equals("selected_env", this._id) ? "selected" : '';
    };

    Template.home.events(
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

  Template.testbody.rendered = function()
  {
    var w = window.innerWidth - 10;
  	var h = 200;
  	var color = d3.scale.category20();
    var svg = d3.select("#d3-area svg")
             	  .attr("width", w)
              	.attr("height", h);
    var g = svg.append("g");

    var data = [ {name:"env1", agts:3},
                 {name:"env2", agts:2},
                 {name:"env3", agts:7},
                 {name:"env4", agts:5}
                ];

    var circles = svg.selectAll("circle").data(data);

    var fillfunction = function(d){ if (d.name == "env2")
                                          {return "yellow"}
                                        else
                                          {return d3.rgb(180, 180, 180)}
                                     };
    var textfillfunction= function(d){ if (d.name == "env2")
                                          {return "black"}
                                        else
                                        {return "white"}
                                     };
    circles
            .attr("cx", function(d,i) { return i*50 + 50;})
            .attr("cy", h/2)
            .attr("fill", fillfunction)
            .attr("r", 20 );


        circles.enter().append("svg:circle")
            .attr("cx", function(d,i) { return i*50 + 50;})
            .attr("cy", h/2)
            .attr("fill", fillfunction)
            .attr("r",0)
            .transition()
            .attr("r", 20 );

        circles.exit().transition().attr("r",0).remove();

        var labels = svg.selectAll("text").data(data)
            .text(function(d){return d.name;})
            .attr("x", function(d,i) {return i*50 + 40;})
            .attr("y", h/2+4)
            .attr("font-family","sans-serif")
            .attr("font-size", "11px")
            .attr("fill", textfillfunction);


        labels.enter().append("text")
            .text(function(d){return d.name;})
            .attr("x", function(d,i) {return i*50 + 40;})
            .attr("y", h/2+4)
            .attr("font-family","sans-serif")
            .attr("font-size", "11px")
            .attr("fill", textfillfunction);

        labels.exit().remove();



  };



} //isclient

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}


