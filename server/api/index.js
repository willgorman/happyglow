'use strict';
const Joi = require('joi')
var piGlow = require('piglow');
var aniGlow = require('piglow-animations');   
var animation = aniGlow.animation;
var aniFace = aniGlow.piGlowInterface;
var PiGlowBackendMock = piGlow.BackendMock;
var PiGlowBackend = piGlow.Backend;
var PiGlowInterface = piGlow.piGlowInterface;

var myMock = new PiGlowBackendMock();
// var piFace = piGlowInterface(myMock);

var piGlowBackend = function() {
    if (process.arch === 'arm') {
        return new PiGlowBackend();
    } else {
        return new PiGlowBackendMock();
    }
}
var piFace = PiGlowInterface(piGlowBackend);

exports.register = function (server, options, next) {

    server.route({
        method: 'GET',
        path: '/',
        handler: function (request, reply) {

            reply({ message: 'Welcome to the plot device.' });
        }
    });

    server.route({
        method: 'POST',
        path: '/animation/{name}/event',
        handler: function (request, reply) {
            //lets hack
            animation({ interval: 10, debug: true }, piGlowBackend)
                .set().to(aniFace(['ring_0'])).after('0.1s')
                .set().to(aniFace(['ring_1'])).after('0.1s')
                .set().to(aniFace(['ring_2'])).after('0.1s')
                .fade().to(aniFace(['leg_0'])).after('1s').in('1s')
                .fade().to(aniFace(['leg_1'])).after('1s').in('1s')
                .fade().to(aniFace(['leg_2'])).after('1s').in('1s')
                .repeat(3)
                .start(function () {
                    console.log('i looped 3 times, now Im done.');
                });
            reply({ message: request.payload })
        }
    });

    server.route({
        method: 'PUT',
        path: '/led/{leg}/{led}',
        handler: function (request, reply) {
            piFace["l_" + request.params.leg + "_" + request.params.led] = request.payload;
            reply();
        },
        config: {
            payload: {
                override: "text/plain"
            },
            validate: {
                params: {
                    leg: Joi.number().min(0).max(2),
                    led: Joi.number().min(0).max(5)
                },
                payload: Joi.alternatives().try(
                    Joi.number().min(0).max(255),
                    Joi.only('on', 'off', 'toggle')
                )
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/leg/{leg}',
        handler: function (request, reply) {
            // TODO: handle on, off, toggle
            piFace["leg_" + request.params.leg] = request.payload;
            reply();
        },
        config: {
            payload: {
                override: "text/plain"
            },
            validate: {
                params: {
                    leg: Joi.number().min(0).max(2)
                },
                payload: Joi.alternatives().try(
                    Joi.number().min(0).max(255),
                    Joi.only('on', 'off', 'toggle')
                )
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/ring/{ring}',
        handler: function (request, reply) {
            // TODO: handle on, off, toggle
            piFace["ring_" + request.params.ring] = request.payload;
            reply();
        },
        config: {
            payload: {
                override: "text/plain"
            },
            validate: {
                params: {
                    ring: Joi.number().min(0).max(5)
                },
                payload: Joi.alternatives().try(
                    Joi.number().min(0).max(255),
                    Joi.only('on', 'off', 'toggle')
                )
            }
        }
    });

    server.route({
        method: 'PUT',
        path: '/color/{color}',
        handler: function (request, reply) {
            // TODO: handle on, off, toggle
            piFace[request.params.color] = request.payload;
            reply();
        },
        config: {
            payload: {
                override: "text/plain"
            },
            validate: {
                params: {
                    color: Joi.only('red', 'orange', 'yellow', 'green', 'blue', 'white')
                },
                payload: Joi.alternatives().try(
                    Joi.number().min(0).max(255),
                    Joi.only('on', 'off', 'toggle')
                )
            }
        }

    });

    next();
};


exports.register.attributes = {
    name: 'api'
};
