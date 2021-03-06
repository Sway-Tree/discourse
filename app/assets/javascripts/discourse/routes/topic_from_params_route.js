/**
  This route is used for retrieving a topic based on params

  @class TopicFromParamsRoute
  @extends Discourse.Route
  @namespace Discourse
  @module Discourse
**/
Discourse.TopicFromParamsRoute = Discourse.Route.extend({
  abc: 'asdfasdf',

  setupController: function(controller, params) {
    params = params || {};
    params.track_visit = true;

    var topic = this.modelFor('topic'),
        postStream = topic.get('postStream'),
        queryParams = Discourse.URL.get('queryParams');

    if (queryParams) {
      // Set summary on the postStream if present
      postStream.set('summary', Em.get(queryParams, 'filter') === 'summary');

      // Set any username filters on the postStream
      var userFilters = Em.get(queryParams, 'username_filters') || Em.get(queryParams, 'username_filters[]');
      if (userFilters) {
        if (typeof userFilters === "string") { userFilters = [userFilters]; }
        userFilters.forEach(function (username) {
          postStream.get('userFilters').add(username);
        });
      }
    }

    var topicController = this.controllerFor('topic'),
        composerController = this.controllerFor('composer');

    postStream.refresh(params).then(function () {
      // The post we requested might not exist. Let's find the closest post
      var closest = postStream.closestPostNumberFor(params.nearPost) || 1;

      topicController.setProperties({
        currentPost: closest,
        progressPosition: closest,
        enteredAt: new Date().getTime().toString(),
        highlightOnInsert: closest
      });

      Discourse.TopicView.jumpToPost(closest);

      if (topic.present('draft')) {
        composerController.open({
          draft: Discourse.Draft.getLocal(topic.get('draft_key'), topic.get('draft')),
          draftKey: topic.get('draft_key'),
          draftSequence: topic.get('draft_sequence'),
          topic: topic,
          ignoreIfChanged: true
        });
      }
    });
  }

});

Discourse.TopicFromParamsNearRoute = Discourse.TopicFromParamsRoute;

