var assert = require('assert');

var restify = require('restify');

var client = restify.createStringClient({
  url: 'https://api.cosm.com'
});

var makeRequestHeaders = function() {
  return {
    'Agent':'cosm-datahub-helper/0.0.1',
    'Accept':'text/csv',
    'X-ApiKey': process.env['COSM_API_KEY'],
  },
}

var makeGetFeedRequest = function(feed_id, callback) {
  var options = {
    path: '/v2/feeds/'+feed_id,
    headers: makeRequestHeaders(),
  };

  client.get(options, function(err, req, res, data) {
    assert.ifError(err);
    callback(data);
  });
}

var makeGetFeedHistoryRequest = function(feed_id, qp, callback) {
  var options = {
    path: '/v2/feeds/'+feed_id,
    headers: makeRequestHeaders(),
    query: qp,
  };

  client.get(options, function(err, req, res, data) {
    assert.ifError(err);
    callback(data);
  });
}

var server = restify.createServer({
  name: 'cosm-datahub-helper',
  version: '0.0.1'
});
server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());

server.get('/feeds/:feed_id', function (req, res, next) {
  res.header('Content-Type', 'text/csv');
  makeGetFeedRequest(req.params['feed_id'], function (data) {
    res.send("datastream,timestamp,value\n"+data);
  });
  return next();
});

server.get('/feeds/:feed_id/simple_history', function (req, res, next) {
  var qp = {
    start: '2013-05-01T14:00:00Z',
    interval: 900,
    per_page: 1000,
  };
  res.header('Content-Type', 'text/csv');
  makeGetFeedHistoryRequest(req.params['feed_id'], qp, function (data) {
    res.send("datastream,timestamp,value\n"+data);
  });
  return next();
});

server.listen(process.env['PORT'], function () {
  console.log('%s listening at %s', server.name, server.url);
});
