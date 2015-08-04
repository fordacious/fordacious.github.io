/*global window, sinon, setTimeout, clearTimeout*/
define(function(require) {

    var Transporter = require('api/snapshot/Transporter').Transporter;
    var SimCapiValue = require('api/snapshot/SimCapiValue');
    var SimCapiMessage = require('api/snapshot/SimCapiMessage');
    var SharedSimData = require('api/snapshot/SharedSimData');
    require('sinon');

    describe('Transporter', function() {

        var requestToken = 'requestToken';
        var authToken = 'testToken';
        var transporter = null;
        var sandbox = null;
        var clock = null;

        beforeEach(function() {
            sandbox = sinon.sandbox.create();

            // mock out event registration on the window
            sandbox.stub(window, 'addEventListener', function(eventType, callback) {
                expect(eventType).to.be('message');
                expect(callback).to.be.ok();
            });

            transporter = new Transporter({
                requestToken: requestToken
            });

            clock = sinon.useFakeTimers();
        });

        afterEach(function() {
            sandbox.restore();
            clock.restore();
        });

        /*
         * Helper to mock out PostMessage on the window object.
         */
        var mockPostMessage = function(assertCallback) {
            sandbox.stub(transporter, 'sendMessage', assertCallback);
        };

        /*
         * Helper to perform fake handshake between sim/viewer
         */
        var doHandShake = function() {
            var config = SharedSimData.getInstance();
            config.setLessonId('1');
            config.setQuestionId('qid');
            config.setServicesBaseUrl('someurl');

            // create a handshakeResponse message
            var handshakeResponse = new SimCapiMessage({
                type: SimCapiMessage.TYPES.HANDSHAKE_RESPONSE,
                handshake: {
                    requestToken: requestToken,
                    authToken: authToken,
                    config: config
                }
            });

            // process handshake response so it remembers the auth token
            transporter.capiMessageHandler(handshakeResponse);
        };

        /*
         *   Helper to test timeouts
         */
        var throttle = function(callback, timeAmount) {
            var timer;

            return function() {
                clearTimeout(timer);
                var args = [].slice.call(arguments);
                timer = setTimeout(function() {
                    callback.apply(this, args);
                }, timeAmount);
            };
        };

        describe('HANDSHAKE_REQUEST', function() {

            it('should send a requestHandshake when trying to send ON_READY notification', function() {

                // mock out handshake request upon initialization
                mockPostMessage(function(message) {
                    // verify that the handshake request has a request token
                    expect(message.type).to.be(SimCapiMessage.TYPES.HANDSHAKE_REQUEST);
                    expect(message.handshake.requestToken).to.be(requestToken);
                    expect(message.handshake.authToken).to.be(null);
                });

                transporter.notifyOnReady();

                expect(transporter.sendMessage.called).to.be(true);
            });

            it('should call the initial setup complete listeners when running locally', function() {
                var completeStub = sinon.stub();
                transporter.addInitialSetupCompleteListener(completeStub);

                transporter.notifyOnReady();

                expect(completeStub.called, 'initial setup complete listener called').to.equal(true);
            });

            it('should not call initial setup complete listeners when a message that isn\'t on is sent', function() {
                var completeStub = sinon.stub();
                transporter.addInitialSetupCompleteListener(completeStub);

                transporter.notifyValueChange();

                expect(completeStub.called, 'initial setup complete listener called').to.equal(false);
            });
        });

        describe('CONFIG_CHANGE', function() {

            beforeEach(function() {
                doHandShake();

                // verify old config
                var config = transporter.getConfig();
                expect(config.getData().lessonId).to.be('1');
                expect(config.getData().questionId).to.be('qid');
                expect(config.getData().servicesBaseUrl).to.be('someurl');
            });

            var updateConfig = function(token) {
                // update config
                var newConfig = SharedSimData.getInstance();
                newConfig.setLessonId('2');
                newConfig.setQuestionId('newqid');
                newConfig.setServicesBaseUrl('newurl');

                // process change event
                var configChangeMessage = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.CONFIG_CHANGE,
                    handshake: {
                        authToken: token,
                        config: newConfig
                    }
                });
                transporter.capiMessageHandler(configChangeMessage);
            };

            it('should ignore CONFIG_CHANGE when authToken does not match', function() {
                updateConfig('bad token');

                // verify that the config has changed
                var config = transporter.getConfig();
                expect(config.getData().lessonId).to.be('2');
                expect(config.getData().questionId).to.be('newqid');
                expect(config.getData().servicesBaseUrl).to.be('newurl');
            });

            it('should update CONFIG_CHANGE when authToken matches', function() {
                updateConfig(authToken);

                // verify that the config has changed
                var config = transporter.getConfig();
                expect(config.getData().lessonId).to.be('2');
                expect(config.getData().questionId).to.be('newqid');
                expect(config.getData().servicesBaseUrl).to.be('newurl');
            });

        });

        describe('HANDSHAKE_RESPONSE', function() {

            it('should ignore HANDSHAKE_RESPONSE when requestToken does not match', function() {

                // create a handshakeResponse message with a different request token
                var handshakeResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.HANDSHAKE_RESPONSE,
                    handshake: {
                        requestToken: 'bad request token',
                        authToken: authToken
                    }
                });

                // mock out postMessage for ON_READY. This shouldn't be called
                mockPostMessage(function() {});

                transporter.capiMessageHandler(handshakeResponse);

                // verify that the message was not called
                expect(transporter.sendMessage.called).to.be(false);
            });

        });

        describe('ON_READY', function() {

            it('should send ON_READY followed by a VALUE_CHANGE message when told', function() {

                doHandShake();

                var invoked = 0;
                var gotOnReady = -1;
                var gotValueChange = -1;

                var throttled = throttle(function() {
                    expect(gotOnReady < gotValueChange).to.be(true);
                }, 25);

                // mock out postMessage for ON_READY message
                mockPostMessage(function(message) {
                    // remember the order that we recieved messages
                    switch (message.type) {
                        case SimCapiMessage.TYPES.ON_READY:
                            gotOnReady = ++invoked;
                            break;
                        case SimCapiMessage.TYPES.VALUE_CHANGE:
                            gotValueChange = ++invoked;
                            break;
                    }

                    // verify that the tokens are remembered
                    expect(message.handshake.requestToken).to.be(requestToken);
                    expect(message.handshake.authToken).to.be(authToken);
                });

                transporter.notifyOnReady();
                throttled();

                clock.tick(25);

                // verify that a message was sent
                expect(transporter.sendMessage.called).to.be(true);
                expect(gotValueChange === 2).to.be(true);
            });

            it('should remember pending ON_READY notification and send it after a succesfull HANDSHAKE_RESPONSE', function() {

                var invoked = 0;
                var gotOnReady = -1;
                var gotValueChange = -1;

                transporter.getHandshake().authToken = null;

                var throttled = throttle(function() {
                    expect(gotOnReady < gotValueChange).to.be(true);
                }, 25);

                // mock out postMessage for ON_READY message
                mockPostMessage(function(message) {
                    // remember the order that we recieved messages
                    switch (message.type) {
                        case SimCapiMessage.TYPES.ON_READY:
                            gotOnReady = ++invoked;
                            break;
                        case SimCapiMessage.TYPES.VALUE_CHANGE:
                            gotValueChange = ++invoked;
                            break;
                    }
                });

                transporter.notifyOnReady();

                // verify that the notification was not sent
                expect(gotOnReady === gotValueChange).to.be(true);

                // create a handshakeResponse message
                var handshakeResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.HANDSHAKE_RESPONSE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: authToken
                    }
                });

                // process handshake response so it sends the pending notificaiton
                transporter.capiMessageHandler(handshakeResponse);

                throttled();

                clock.tick(25);

                // verify that a message was sent
                expect(transporter.sendMessage.called).to.be(true);
                expect(gotValueChange === 2).to.be(true);
            });

        });

        describe('VALUE_CHANGE', function() {

            var outgoingMap = null;

            beforeEach(function() {

                outgoingMap = {
                    // create three attributes (float, string and boolean types) with expected
                    // updates of:
                    // attr1 -> value1
                    // attr2 -> value2
                    // attr3 -> value3
                    // values 1-3 are NOT the current values.
                    // @see createAttr for more details
                    'these.are.fake.objects.attr1': createAttr(SimCapiValue.TYPES.NUMBER, false, 'attr1', 0.222),
                    attr2: createAttr(SimCapiValue.TYPES.STRING, false, 'attr2', 'value2'),
                    attr3: createAttr(SimCapiValue.TYPES.BOOLEAN, false, 'attr3', true),
                    attr4: createAttr(SimCapiValue.TYPES.BOOLEAN, false, 'attr4', false)
                };

                // create a new instance with outgoingMap parameters
                transporter = new Transporter({
                    requestToken: requestToken,
                    authToken: authToken,
                    outgoingMap: outgoingMap
                });

                transporter.removeAllChangeListeners();

            });

            // helper to create entries in outgoing map. expectedKey and expectedValue represent
            // expected updates. Eg, the value of expectedKey changes to expectedValue.
            var createAttr = function(type, readonly, expectedKey, expectedValue) {
                return new SimCapiValue({
                    type: type,
                    readonly: readonly,
                    key: expectedKey,
                    value: expectedValue
                });
            };

            /*
             * create a value change message that performs the following changes:
             * attr1 -> value1
             * attr2 -> value2
             * attr3 -> value3
             */
            var createGoodValueChangeMessage = function() {
                return new SimCapiMessage({
                    type: SimCapiMessage.TYPES.VALUE_CHANGE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: authToken
                    },

                    // create two attribute changes as mentioned above
                    values: {
                        'these.are.fake.objects.attr1': new SimCapiValue({
                            key: 'attr1',
                            type: SimCapiValue.TYPES.NUMBER,
                            value: 0.5
                        }),
                        'attr2': new SimCapiValue({
                            key: 'attr2',
                            type: SimCapiValue.TYPES.STRING,
                            value: 'value2'
                        }),
                        'attr3': new SimCapiValue({
                            key: 'attr3',
                            type: SimCapiValue.TYPES.BOOLEAN,
                            value: false
                        }),
                        'attr4': new SimCapiValue({
                            key: 'attr4',
                            type: SimCapiValue.TYPES.BOOLEAN,
                            value: false
                        })
                    }
                });
            };

            it('should attempt to update the model when a VALUE_CHANGE message is recieved', function() {

                var valueChangeMsg = createGoodValueChangeMessage();

                var failed = true;
                transporter.addChangeListener(function() {
                    failed = false;
                });

                transporter.capiMessageHandler(valueChangeMsg);

                expect(failed).to.be(false);
            });

            it('should give false when a Boolean false VALUE_CHANGE is recieved', function() {

                var expectedValueChangeMsg = transporter.createValueChangeMsg();

                expect(expectedValueChangeMsg.values['these.are.fake.objects.attr1'].value).to.be(0.222);
                expect(expectedValueChangeMsg.values.attr2.value).to.be('value2');
                expect(expectedValueChangeMsg.values.attr3.value).to.be(true);
                expect(expectedValueChangeMsg.values.attr4.value).to.be(false);
            });

            it('should ignore VALUE_CHANGE message if values is undefined', function() {

                // create a bad value change message with values = undefined
                var badValueChangeMsg = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.VALUE_CHANGE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: authToken
                    },
                    values: undefined
                });

                var failed = false;
                transporter.addChangeListener(function(values) {
                    failed = true;
                });


                transporter.capiMessageHandler(badValueChangeMsg);

                // verify that nothing was updated
                expect(failed).to.be(false);
            });

            it('should ignore VALUE_CHANGE when authToken does not match', function() {

                // create a bad value change message with values = undefined
                var badValueChangeMsg = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.VALUE_CHANGE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: 'bad auth token'
                    },
                    values: undefined
                });

                var failed = false;
                transporter.addChangeListener(function(values) {
                    failed = true;
                });

                transporter.capiMessageHandler(badValueChangeMsg);

                // verify that nothing was updated
                expect(failed).to.be(false);
            });

            it('should not update readonly values', function() {

                var valueChangeMsg = createGoodValueChangeMessage();

                // change attr2 to be readonly
                outgoingMap.attr2.readonly = true;

                transporter.addChangeListener(function(values) {
                    //verify that two attrs get updated
                    expect(values.length).to.be(2);
                });

                transporter.capiMessageHandler(valueChangeMsg);

            });

        });

        describe('VALUE_CHANGE_REQUEST', function() {

            // process change event
            var valueChangeRequestMessage = new SimCapiMessage({
                type: SimCapiMessage.TYPES.VALUE_CHANGE_REQUEST,
                handshake: {
                    authToken: authToken
                }
            });

            it('should send value change notification', function() {
                doHandShake();
                sandbox.stub(transporter, 'notifyValueChange', function() {});
                transporter.capiMessageHandler(valueChangeRequestMessage);
                expect(transporter.notifyValueChange.called).to.be(true);
            });

        });

        describe('CHECK_*', function() {
            var checkResponseMessage = new SimCapiMessage({
                type: SimCapiMessage.TYPES.CHECK_COMPLETE_RESPONSE,
                handshake: {
                    authToken: authToken
                }
            });

            it('should trigger check completion callback', function() {
                doHandShake();
                var onComplete = sandbox.stub();

                // trigger check
                transporter.triggerCheck({
                    complete: onComplete
                });

                transporter.capiMessageHandler(checkResponseMessage);
                expect(onComplete.called).to.be(true);
            });

            it('should not throw when it’s called with a different context', function() {
                doHandShake();
                var onComplete = sandbox.stub();
                var otherObject = {
                    triggerCheck: transporter.triggerCheck
                };
                var hasThrown = false;
                try {
                    otherObject.triggerCheck({
                        complete: onComplete
                    });
                } catch (err) {
                    hasThrown = true;
                }

                expect(hasThrown).to.equal(false);
            });
        });

        describe('GET_DATA_REQUEST', function() {

            it('should place a get data request in pendingQueue', function() {

                mockPostMessage(function() {});

                transporter.getDataRequest('sim', 'key');

                expect(transporter.sendMessage.called).to.be(false);
            });

            it('should send a get data request', function() {
                doHandShake();
                // mock out handshake request upon initialization
                mockPostMessage(function(message) {
                    // verify that the handshake request has a request token
                    expect(message.type).to.be(SimCapiMessage.TYPES.GET_DATA_REQUEST);
                    expect(message.handshake.authToken).to.be("testToken");
                });

                transporter.getDataRequest('sim', 'key');

                expect(transporter.sendMessage.called).to.be(true);
            });

            it('should throw an error if simId or key is not given', function() {
                var failed = true;
                var failed2 = true;
                try {
                    transporter.getDataRequest(undefined, 'key');
                } catch (err) {
                    failed = false;
                }

                try {
                    transporter.getDataRequest('simId', undefined);
                } catch (err) {
                    failed2 = false;
                }

                expect(failed).to.be(false);
                expect(failed2).to.be(false);

            });

        });

        describe('GET_DATA_RESPONSE', function() {
            it('should receive a get data response of success', function() {
                transporter.getDataRequest('sim', 'key', function(tData) {
                    expect(tData.key).to.equal('key');
                });

                doHandShake();
                var getDataResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.GET_DATA_RESPONSE,
                    handshake: {
                        authToken: authToken
                    },
                    values: {
                        responseType: "success",
                        simId: 'sim',
                        key: 'key'
                    }
                });

                transporter.capiMessageHandler(getDataResponse);
            });

            it('should receive a get data response of error', function() {
                var error = sinon.stub();
                transporter.getDataRequest('sim', 'key', function() {}, error);

                doHandShake();
                var getDataResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.GET_DATA_RESPONSE,
                    handshake: {
                        authToken: authToken
                    },
                    values: {
                        responseType: "error",
                        simId: 'sim',
                        key: 'key'
                    }
                });

                transporter.capiMessageHandler(getDataResponse);
                expect(error.called).to.equal(true);
            });
        });

        describe('SET_DATA_REQUEST', function() {

            it('should place a set data request in pendingQueue', function() {

                mockPostMessage(function() {});

                transporter.getDataRequest('sim', 'key', 'value');

                expect(transporter.sendMessage.called).to.be(false);
            });

            it('should send a set data request', function() {
                doHandShake();
                // mock out handshake request upon initialization
                mockPostMessage(function(message) {
                    // verify that the handshake request has a request token
                    expect(message.type).to.be(SimCapiMessage.TYPES.SET_DATA_REQUEST);
                    expect(message.handshake.authToken).to.be("testToken");
                });

                transporter.setDataRequest('sim', 'key', 'value');

                expect(transporter.sendMessage.called).to.be(true);
            });

            it('should throw an error if simId or key is not given', function() {
                var failed = true;
                var failed2 = true;
                try {
                    transporter.getDataRequest(undefined, 'key');
                } catch (err) {
                    failed = false;
                }

                try {
                    transporter.getDataRequest('simId', undefined);
                } catch (err) {
                    failed2 = false;
                }

                expect(failed).to.be(false);
                expect(failed2).to.be(false);

            });

        });

        describe('SET_DATA_RESPONSE', function() {
            it('should receive a set data response of success', function() {
                transporter.setDataRequest('sim', 'key', 'value', function(tData) {
                    expect(tData.key).to.equal('key');
                });

                doHandShake();
                var setDataResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.SET_DATA_RESPONSE,
                    handshake: {
                        authToken: authToken
                    },
                    values: {
                        responseType: "success",
                        simId: 'sim',
                        key: 'key',
                        value: 'value'
                    }
                });

                transporter.capiMessageHandler(setDataResponse);
            });

            it('should receive a set data response of error', function() {
                var error = sinon.stub();
                transporter.setDataRequest('sim', 'key', 'value', function() {}, error);

                doHandShake();
                var setDataResponse = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.SET_DATA_RESPONSE,
                    handshake: {
                        authToken: authToken
                    },
                    values: {
                        responseType: "error",
                        simId: 'sim',
                        key: 'key'
                    }
                });

                transporter.capiMessageHandler(setDataResponse);
                expect(error.called).to.equal(true);
            });
        });

        describe('SET_VALUE', function() {
            var message;
            beforeEach(function() {
                message = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.VALUE_CHANGE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: authToken
                    },
                    values: {
                        'attr1': new SimCapiValue({
                            key: 'attr1',
                            type: SimCapiValue.TYPES.NUMBER,
                            value: 0.5
                        })
                    }
                });

                doHandShake();
            });

            it('should apply the value from a message sent before the set of the value in the transporter', function() {

                sandbox.stub(transporter, 'notifyValueChange', function() {});

                transporter.capiMessageHandler(message);

                var exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.NUMBER,
                    value: 10
                });

                transporter.expose(exposedProperty);

                expect(exposedProperty.value).to.equal(0.5);

                //setting the value again shouldn't set the value to 0.5
                exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.NUMBER,
                    value: 15
                });

                transporter.setValue(exposedProperty);

                expect(exposedProperty.value).to.equal(15);
            });

        });

        describe('INITIAL_SETUP_COMPLETE', function() {
            var message;
            beforeEach(function() {
                message = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.INITIAL_SETUP_COMPLETE,
                    handshake: {
                        requestToken: requestToken,
                        authToken: authToken
                    }
                });

                doHandShake();
            });

            it('should call every registered handler', function() {
                var first = sinon.stub(),
                    second = sinon.stub();
                transporter.addInitialSetupCompleteListener(first);
                transporter.addInitialSetupCompleteListener(second);

                transporter.capiMessageHandler(message);

                expect(first.called, 'first listener called').to.equal(true);
                expect(second.called, 'second listener called').to.equal(true);
            });

            it('should not call anything if the handlers are removed', function() {
                var stubListener = sinon.stub();
                transporter.addInitialSetupCompleteListener(stubListener);

                transporter.removeAllInitialSetupCompleteListeners();
                transporter.capiMessageHandler(message);

                expect(stubListener.called, 'listener called').to.equal(false);
            });

            it('should do nothing if the auth token is wrong', function() {
                message.handshake.authToken = 42;
                var stubListener = sinon.stub();
                transporter.addInitialSetupCompleteListener(stubListener);

                transporter.capiMessageHandler(message);

                expect(stubListener.called, 'listener called').to.equal(false);
            });

            it('should not call listeners if another message is received', function() {
                var stubListener = sinon.stub();
                transporter.addInitialSetupCompleteListener(stubListener);

                transporter.capiMessageHandler(message);
                transporter.capiMessageHandler(message);

                expect(stubListener.callCount).to.equal(1);
            });

            describe('adding listeners', function() {
                it('should throw after initial setup has been completed', function() {
                    transporter.capiMessageHandler(message);

                    expect(function() {
                        transporter.addInitialSetupCompleteListener(sinon.stub());
                    }).to.throwException();
                });
            });
        });

        describe('EXPOSING_VALUE_AGAIN', function() {
            it('should apply the existing value if a property has been exposed before', function() {
                sandbox.stub(transporter, 'notifyValueChange', function() {});

                var exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.NUMBER,
                    value: 10
                });

                transporter.expose(exposedProperty);

                expect(exposedProperty.value).to.equal(10);

                //exposing the value again should keep the value at the existing one
                exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.NUMBER,
                    value: 15
                });

                transporter.expose(exposedProperty);

                expect(exposedProperty.value).to.equal(10);
            });
            it('should have consistent behaviour even if that value is false', function() {
                sandbox.stub(transporter, 'notifyValueChange', function() {});

                var exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.BOOLEAN,
                    value: false
                });

                transporter.expose(exposedProperty);

                expect(exposedProperty.value).to.equal(false);

                //exposing the value again should keep the value at the existing one
                exposedProperty = new SimCapiValue({
                    key: 'attr1',
                    type: SimCapiValue.TYPES.BOOLEAN,
                    value: true
                });

                transporter.expose(exposedProperty);

                expect(exposedProperty.value).to.equal(false);
            });
        });
    });
});
