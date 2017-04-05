'use strict';
const Joi = require('joi')
var piGlow = require('piglow');
var PiGlowBackendMock = piGlow.BackendMock;
var piGlowInterface = piGlow.piGlowInterface;

var myMock = new PiGlowBackendMock();
var piFace = piGlowInterface(myMock);


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
            piFace.ring_0 = 255;
            reply({ message: request.payload })
        }
    });

    server.route({
        method: 'PUT',
        path: '/led/{arm}/{slot}',
        handler: function (request, reply) {
            piFace.attributes
        }
    });

    server.route({
        method: 'PUT',
        path: '/ring/{slot}',
        handler: function (request, reply) {
            // TODO: handle on, off, toggle
            piFace["ring_" + request.params.slot] = request.payload;
            reply();
        },
        config: {
            payload: {
                override: "text/plain"
            },
            validate: {
                params: {
                    slot: Joi.number().min(0).max(5)
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
