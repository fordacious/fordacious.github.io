/*global window, document, sinon, iframe1, iframe2, iframe3*/
define(function(require) {

    var $ = require('jquery');
    var _ = require('underscore');
    var SimCapiHandler = require('api/snapshot/SimCapiHandler');
    var SimCapiMessage = require('api/snapshot/SimCapiMessage');
    var SharedSimData = require('api/snapshot/SharedSimData');
    var SimCapiValue = require('api/snapshot/SimCapiValue');
    var SnapshotSegment = require('api/snapshot/SnapshotSegment');
    require('sinon');

    $(document).ready(function() {
        describe('SimCapiHandler', function() {

            var $container = null;
            var handler = null;
            var sandbox = null;

            beforeEach(function() {
                sandbox = sinon.sandbox.create();

                $container = $(
                    '<div>' +
                    '<iframe id="iframe1"></iframe>' +
                    '<iframe id="iframe2"></iframe>' +
                    '<iframe id="iframe3" style="display:none"></iframe>' + // this should be ignored in the search
                    '<iframe id="iframe4" data-qid="q:1"></iframe>' +
                    '<iframe id="iframe4" data-qid="q:2"></iframe>' +
                    '</div>'
                );

                // add iframes to the dom
                $('body').append($container);

                // stub out event registration
                sandbox.stub(window, 'addEventListener', function(type, callback) {
                    expect(type).to.be('message');
                    expect(callback).to.be.ok();
                });

                handler = new SimCapiHandler({
                    $container: $container,
                    ignoreHidden: true,
                    callback: {
                        check: function() {}
                    }
                });

                // make sure it doesn't send any messages to iframe3 because it has display:none
                mockPostMessage('#iframe3', function() {
                    expect(false).to.be(true);
                });
            });

            afterEach(function() {
                sandbox.restore();

                // remove from the dom
                $container.remove();
            });

            // Helper to mock postMessage event
            var mockPostMessage = function(assertCallback) {
                var callback = function(message, id) {
                    expect(id).not.to.be('iframe3');
                    assertCallback(message, id);
                };

                if (handler.sendMessage.hasOwnProperty('restore')) {
                    handler.sendMessage.restore();
                }
                sandbox.stub(handler, 'sendMessage', callback);
            };
            var mockSendMessageToFrame = function(assertCallback) {
                if (handler.sendMessage.hasOwnProperty('restore')) {
                    handler.sendMessage.restore();
                }
                var callback = function(message, id) {
                    expect(id).not.to.be('iframe3');
                    assertCallback(message, id);
                };

                if (handler.sendMessageToFrame.hasOwnProperty('restore')) {
                    handler.sendMessageToFrame.restore();
                }
                sandbox.stub(handler, 'sendMessageToFrame', callback);
            };

            it('should broadcast a reply to an HANDSHAKE_REQUEST message with a HANDSHAKE_RESPONSE', function() {
                // create a handshakerequest
                var message = new SimCapiMessage();
                message.type = SimCapiMessage.TYPES.HANDSHAKE_REQUEST;
                message.handshake = {
                    requestToken: 'token1'
                };

                // remember tokens for each frame so we can check that they are different
                var iframe1Token = null;
                var iframe2Token = null;
                var iframe4q1Token = null;
                var iframe4q2Token = null;

                // mock out postMessage for all iframe windows
                mockPostMessage(function(response, id) {
                    expect(response.type).to.be(SimCapiMessage.TYPES.HANDSHAKE_RESPONSE);
                    expect(response.handshake.requestToken).to.be('token1');

                    // remember which token is assigned to which frame
                    iframe1Token = id === 'iframe1' ? response.handshake.authToken : iframe1Token;
                    iframe2Token = id === 'iframe2' ? response.handshake.authToken : iframe2Token;
                    iframe4q1Token = id === 'q:1|iframe4' ? response.handshake.authToken : iframe4q1Token;
                    iframe4q2Token = id === 'q:2|iframe4' ? response.handshake.authToken : iframe4q2Token;
                });

                handler.capiMessageHandler(message);

                // verify that all iframe tokens are different
                expect(iframe1Token).to.be.ok();
                expect(iframe2Token).to.be.ok();
                expect(iframe4q1Token).to.be.ok();
                expect(iframe4q2Token).to.be.ok();
                var tokens = [iframe1Token, iframe2Token, iframe4q1Token, iframe4q2Token];
                expect(_.uniq(tokens).length).to.be(4);
                expect(handler.sendMessage.callCount).to.be(4);
            });

            /*
             * Helper to setup handshake to an iframe
             */
            var setupHandshake = function(iframeid, token) {
                // setup a handshake
                var handshakeMsg = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.HANDSHAKE_REQUEST,
                    handshake: {
                        requestToken: token,
                        authToken: null
                    }
                });

                var authToken = null;

                // mock the postMessage so we can remember the authToken
                mockPostMessage(function(response, id) {
                    authToken = id === iframeid ? response.handshake.authToken : authToken;
                });

                handler.capiMessageHandler(handshakeMsg);

                return authToken;
            };

            /*
             * Helper to fake that the sim is ready
             */
            var setupOnReady = function(authToken) {
                // create an ON_READY messages
                var onReadyMsg = new SimCapiMessage({
                    type: SimCapiMessage.TYPES.ON_READY,
                    handshake: {
                        requestToken: null,
                        authToken: authToken
                    }
                });

                handler.capiMessageHandler(onReadyMsg);
            };

            describe('notifyCheckCompleteResponse', function() {
                beforeEach(function() {
                    setupHandshake('iframe1', 'token1');
                    setupHandshake('iframe2', 'token2');
                });

                it('should remember pending check request', function() {
                    var message = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.CHECK_REQUEST,
                        handshake: {
                            authToken: 'token1'
                        }
                    });
                    handler.capiMessageHandler(message);
                    message.handshake.authToken = 'token2';
                    handler.capiMessageHandler(message);

                    mockPostMessage(function(response, id) {
                        expect(response.type).to.be(SimCapiMessage.TYPES.CHECK_COMPLETE_RESPONSE);
                        expect(response.handshake.authToken === 'token1' || response.handshake.authToken === 'token2').to.be(true);
                    });

                    handler.notifyCheckCompleteResponse();
                    expect(handler.sendMessage.callCount).to.be(2);

                    // should clear the pending queue and not send anything else
                    handler.notifyCheckCompleteResponse();
                    expect(handler.sendMessage.callCount).to.be(2);
                });
            });

            describe('notifyCheckStartResponse', function() {

                beforeEach(function() {
                    setupHandshake('iframe1', 'token1');
                    setupHandshake('iframe2', 'token2');
                    setupHandshake('q:1|iframe4', 'token4q1');
                    setupHandshake('q:2|iframe4', 'token4q2');
                });

                it('should notify all sims that check was clicked', function() {

                    mockPostMessage(function(response, id) {
                        expect(response.type).to.be(SimCapiMessage.TYPES.CHECK_START_RESPONSE);
                        expect(response.handshake.authToken === handler.getToken('iframe1') ||
                            response.handshake.authToken === handler.getToken('iframe2') ||
                            response.handshake.authToken === handler.getToken('q:1|iframe4') ||
                            response.handshake.authToken === handler.getToken('q:2|iframe4')).to.be(true);
                    });

                    handler.notifyCheckStartResponse();

                    expect(handler.sendMessage.callCount).to.be(4);
                });

                it('should remember what sims are waiting for a check response', function() {

                    mockPostMessage(function(response, id) {
                        expect(response.type === SimCapiMessage.TYPES.CHECK_START_RESPONSE || response.type === SimCapiMessage.TYPES.CHECK_COMPLETE_RESPONSE).to.be(true);
                        expect(response.handshake.authToken === handler.getToken('iframe1') ||
                            response.handshake.authToken === handler.getToken('iframe2') ||
                            response.handshake.authToken === handler.getToken('q:1|iframe4') ||
                            response.handshake.authToken === handler.getToken('q:2|iframe4')).to.be(true);
                    });

                    handler.notifyCheckStartResponse();

                    expect(handler.sendMessage.callCount).to.be(4);

                    handler.notifyCheckCompleteResponse();

                    expect(handler.sendMessage.callCount).to.be(8);
                });
            });

            describe('notifyConfigChange', function() {

                var authToken = null;

                beforeEach(function() {
                    authToken = setupHandshake('iframe1', 'token1');
                    setupOnReady(authToken);
                });

                it('should broadcast a CONFIG_CHANGE message', function() {
                    mockPostMessage(function(response, id) {
                        expect(response.type).to.be(SimCapiMessage.TYPES.CONFIG_CHANGE);
                        expect(response.handshake.authToken).to.be(authToken);

                        var exectedConfig = SharedSimData.getInstance().getData();
                        expect(response.handshake.config.lessonId).to.be(exectedConfig.lessonId);
                        expect(response.handshake.config.questionId).to.be(exectedConfig.questionId);
                        expect(response.handshake.config.baseUrl).to.be(exectedConfig.baseUrl);
                        expect(id).to.be('iframe1');
                    });

                    handler.notifyConfigChange();

                    expect(handler.sendMessage.callCount).to.be(1);
                });
            });

            describe('getSnapshot', function() {

                var authToken = null;

                beforeEach(function() {
                    // create handshake
                    authToken = setupHandshake('iframe1', 'token1');
                });

                it('should return the snapshot remembered from a VALUE_CHANGE event', function() {

                    // create a VALUE_CHANGE message with three values
                    var valueChangeMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            value1: new SimCapiValue({
                                key: 'value1',
                                value: 'value1'
                            }),
                            value2: new SimCapiValue({
                                key: 'value2',
                                value: 'value2'
                            }),
                            value3: new SimCapiValue({
                                key: 'value3',
                                value: 'value3'
                            })
                        }
                    });

                    // send the message to the handler
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the snapshot from the handler
                    var snapshot = handler.getSnapshot(new SnapshotSegment('stage.iframe1'));

                    // verify the snapshot contains three values that were sent in the VALUE_CHANGE message
                    expect(_.size(snapshot)).to.be(3);
                    expect(snapshot['iframe1.value1']).to.be('value1');
                    expect(snapshot['iframe1.value2']).to.be('value2');
                    expect(snapshot['iframe1.value3']).to.be('value3');

                });

                it('should return the descriptors remembered from a VALUE_CHANGE event', function() {

                    // create a VALUE_CHANGE message with three values
                    var valueChangeMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            value1: new SimCapiValue({
                                key: 'value1',
                                value: 'value1'
                            }),
                            value2: new SimCapiValue({
                                key: 'value2',
                                value: 'value2'
                            }),
                            value3: new SimCapiValue({
                                key: 'value3',
                                value: 'value3'
                            })
                        }
                    });

                    // send the message to the handler
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the snapshot from the handler
                    var descriptors = handler.getDescriptors(new SnapshotSegment('stage.iframe1.'));

                    // verify the snapshot contains three values that were sent in the VALUE_CHANGE message
                    expect(_.size(descriptors)).to.be(3);
                    expect(descriptors['iframe1.value1']).to.be(valueChangeMsg.values.value1);
                    expect(descriptors['iframe1.value2']).to.be(valueChangeMsg.values.value2);
                    expect(descriptors['iframe1.value3']).to.be(valueChangeMsg.values.value3);

                });

                it('should overwrite snapshot with the latest values retrieve from VALUE_CHANGE', function() {

                    // create a VALUE_CHANGE message with one value
                    var valueChangeMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            value1: new SimCapiValue({
                                key: 'value1',
                                value: 'value1'
                            })
                        }
                    });

                    // send the message to the handler
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the snapshot from the handler
                    var snapshot = handler.getSnapshot(new SnapshotSegment('stage.iframe1'));

                    // verify the snapshot contains one value
                    expect(_.size(snapshot)).to.be(1);
                    expect(snapshot['iframe1.value1']).to.be('value1');

                    // create another VALUE_CHANGE message with three values, one of which overrides value1
                    valueChangeMsg.values.value1 = new SimCapiValue({
                        key: 'value1',
                        value: 'changed1'
                    });
                    valueChangeMsg.values.value2 = new SimCapiValue({
                        key: 'value2',
                        value: 'value2'
                    });
                    valueChangeMsg.values.value3 = new SimCapiValue({
                        key: 'value3',
                        value: 'value3'
                    });

                    // send the update message
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the updated snapshot
                    snapshot = handler.getSnapshot(new SnapshotSegment('stage.iframe1'));

                    // verify that the update has taken affect
                    expect(_.size(snapshot)).to.be(3);
                    expect(snapshot['iframe1.value1']).to.be('changed1');
                    expect(snapshot['iframe1.value2']).to.be('value2');
                    expect(snapshot['iframe1.value3']).to.be('value3');

                });

                it('should remove snapshot null values from a VALUE_CHANGE event', function() {
                    // create a VALUE_CHANGE message with three values
                    var valueChangeMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            value1: new SimCapiValue({
                                key: 'value1',
                                value: 'value1'
                            }),
                            value2: null,
                            value3: null
                        }
                    });

                    // send the message to the handler
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the snapshot from the handler
                    var snapshot = handler.getSnapshot(new SnapshotSegment('stage.iframe1'));

                    expect(_.size(snapshot)).to.be(1);
                    expect(snapshot['iframe1.value1']).to.be('value1');
                    expect(snapshot['iframe1.value2']).to.be(undefined);
                    expect(snapshot['iframe1.value3']).to.be(undefined);
                });

                it('should remove descriptor null values from a VALUE_CHANGE event', function() {
                    // create a VALUE_CHANGE message with three values
                    var valueChangeMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            value1: new SimCapiValue({
                                key: 'value1',
                                value: 'value1'
                            }),
                            value2: null,
                            value3: null
                        }
                    });

                    // send the message to the handler
                    handler.capiMessageHandler(valueChangeMsg);

                    // retrieve the snapshot from the handler
                    var descriptors = handler.getDescriptors(new SnapshotSegment('stage.iframe1.'));

                    // verify the snapshot contains three values that were sent in the VALUE_CHANGE message
                    expect(_.size(descriptors)).to.be(1);
                    expect(descriptors['iframe1.value1']).to.be(valueChangeMsg.values.value1);
                    expect(descriptors['iframe1.value2']).to.be(undefined);
                    expect(descriptors['iframe1.value3']).to.be(undefined);
                });

            });

            describe('removeIFrame', function() {

                beforeEach(function() {
                    var authToken = setupHandshake('iframe1', 'token1');
                    setupOnReady(authToken);
                    authToken = setupHandshake('q:1|iframe4', 'token4');
                    setupOnReady(authToken);
                });

                it('should remove knowledge of the given sim', function() {
                    var calls = 0;
                    mockSendMessageToFrame(function() {
                        ++calls;
                    });

                    // send a snapshot to check if the iframe is known
                    var segment = new SnapshotSegment('stage.iframe1.value', '1');
                    handler.setSnapshot([segment]);
                    expect(calls).to.be(1);

                    // remove knowledge of the sim and send another snapshot
                    handler.removeIFrame('iframe1');
                    handler.setSnapshot([segment]);

                    // should not send a message to the sim because it's no longer known
                    expect(calls).to.be(1);

                    // verify that the snapshots and descriptors for that sim are deleted
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(0);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(0);
                });

                it('should remove knowledge of a sim with QID data', function() {
                    var calls = 0;
                    mockSendMessageToFrame(function() {
                        ++calls;
                    });

                    // send a snapshot to check if the iframe is known
                    var segment = new SnapshotSegment('stage.iframe4.value', '1');
                    handler.setSnapshot([segment], 'q:1');
                    expect(calls).to.be(1);

                    // remove knowledge of the sim and send another snapshot
                    handler.removeIFrame('iframe4', 'q:1');
                    handler.setSnapshot([segment]);

                    // should not send a message to the sim because it's no longer known
                    expect(calls).to.be(1);

                    // verify that the snapshots and descriptors for that sim are deleted
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(0);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(0);
                });

            });

            describe('resetSnapshotForIframe', function() {

                var buildSnapshotSimCapiMessage = function(authToken) {
                    var message = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    message.values['variable1'] = new SimCapiValue({
                        key: 'variable1',
                        type: SimCapiValue.TYPES.STRING,
                        value: '1'
                    });

                    message.values['variable2'] = new SimCapiValue({
                        key: 'variable2',
                        type: SimCapiValue.TYPES.STRING,
                        value: '2'
                    });

                    return message;
                };

                it('should remove knowledge of the given sim', function() {
                    // set the iframe snapshot
                    var segment = new SnapshotSegment('stage.iframe1', '');

                    var authToken = setupHandshake('iframe1', 'token1');
                    setupOnReady(authToken);

                    var message = buildSnapshotSimCapiMessage(authToken);
                    handler.capiMessageHandler(message);

                    // remove knowledge of the sim and send another snapshot
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(2);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(2);
                    handler.resetSnapshotForIframe('iframe1');

                    // should not no longer have any snapshot segments associated with that iframe
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(0);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(0);
                });

                it('should remove knowledge of a sim with QID data', function() {
                    // set the iframe snapshot
                    var segment = new SnapshotSegment('stage.iframe4', '');

                    var authToken = setupHandshake('q:2|iframe4', 'token4');
                    setupOnReady(authToken);

                    var message = buildSnapshotSimCapiMessage(authToken);
                    handler.capiMessageHandler(message);

                    // remove knowledge of the sim and send another snapshot
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(2);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(2);
                    handler.resetSnapshotForIframe('q:2|iframe4');

                    // should not no longer have any snapshot segments associated with that iframe
                    expect(Object.keys(handler.getSnapshot(segment)).length).to.be(0);
                    expect(Object.keys(handler.getDescriptors(segment)).length).to.be(0);
                });


            });

            describe('setSnapshot', function() {

                it('should keep things pending until an ON_READY message has been received', function() {

                    // create handshake
                    var authToken = setupHandshake('iframe1', 'token1');

                    var calls = 0;
                    mockSendMessageToFrame(function() {
                        ++calls;
                    });

                    // force a pending messages
                    var segment = new SnapshotSegment('stage.iframe1.value', '1');
                    handler.setSnapshot([segment]);

                    // a quicker way of checking if the mock is invoked.
                    expect(calls, 'message sent to iframe').to.be(0);

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    var invoked = 0;
                    mockPostMessage(function(response, iframeid) {
                        // verify snapshot that is sent to the iframe
                        expect(response.type).to.be(SimCapiMessage.TYPES.VALUE_CHANGE);
                        expect(response.handshake.authToken).to.be(authToken);
                        expect(_.size(response.values)).to.be(1);
                        expect(response.values['value'].value).to.be('1');
                        expect(response.values['value'].type).to.be(SimCapiValue.TYPES.STRING);

                        expect(iframeid).to.be('iframe1');

                        invoked++;
                    });

                    handler.capiMessageHandler(onReadyMsg);

                    // a quicker way of checking if the mock is invoked.
                    expect(invoked).to.be(1);
                });

                it('should NOT send snapshot immediately when a handshake has been established', function() {
                    // create handshake
                    setupHandshake('iframe2', 'token1');
                    handler.sendMessage.restore();

                    var calls = 0;
                    mockSendMessageToFrame(function() {
                        ++calls;
                    });

                    var segment = new SnapshotSegment('stage.iframe2.value2', '1');
                    handler.setSnapshot([segment]);

                    // a quicker way of checking if the mock is invoked.
                    expect(calls, 'message sent').to.be(0);
                });

                it('should send snapshot immediately when ON_READY has been established', function() {
                    // create handshake
                    var authToken = setupHandshake('iframe2', 'token1');

                    var invoked = 0;
                    mockPostMessage(function(response, iframeid) {
                        // verify snapshot that is sent to the iframe
                        expect(response.type).to.be(SimCapiMessage.TYPES.VALUE_CHANGE);
                        expect(response.handshake.authToken).to.be(authToken);
                        expect(_.size(response.values)).to.be(1);
                        expect(response.values['value2'].value).to.be('1');
                        expect(response.values['value2'].type).to.be(SimCapiValue.TYPES.STRING);

                        expect(iframeid).to.be('iframe2');

                        invoked++;
                    });

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    var segment = new SnapshotSegment('stage.iframe2.value2', '1');
                    handler.setSnapshot([segment]);

                    handler.capiMessageHandler(onReadyMsg);

                    // a quicker way of checking if the mock is invoked.
                    expect(invoked).to.be(1);
                });

                it('should send the snapshot with the correct auth token if the handshake happens later than the snapshot', function() {
                    var sentMessage;
                    mockSendMessageToFrame(function(message, frameid) {
                        sentMessage = message;
                    });

                    var segment = new SnapshotSegment('stage.iframe2.value2', '1');
                    handler.setSnapshot([segment]);

                    // create handshake
                    var authToken = setupHandshake('iframe2', 'token1');
                    handler.sendMessage.restore();

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    handler.capiMessageHandler(onReadyMsg);

                    expect(sentMessage.handshake.authToken).to.equal(authToken);
                });

                it('should send snapshot when a second ON_READY is received', function() {
                    // create handshake
                    var authToken = setupHandshake('iframe1', 'token1');
                    var authToken2 = setupHandshake('iframe2', 'token2');

                    mockSendMessageToFrame(function() {});

                    // force a pending messages
                    var segment = new SnapshotSegment('stage.iframe1.value', '1');
                    handler.setSnapshot([segment]);
                    segment = new SnapshotSegment('stage.iframe2.value', '2');
                    handler.setSnapshot([segment]);

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    var invoked = 0;
                    mockPostMessage(function(response, iframeid) {
                        expect(_.size(response.values)).to.be(1);
                        expect(response.values['value'].value).to.be('1');
                        expect(iframeid).to.be('iframe1');

                        invoked++;
                    });

                    handler.capiMessageHandler(onReadyMsg);

                    // a quicker way of checking if the mock is invoked.
                    expect(invoked).to.be(1);

                    mockPostMessage(function(response, iframeid) {
                        expect(_.size(response.values)).to.be(1);
                        expect(response.values['value'].value).to.be('2');
                        expect(iframeid).to.be('iframe2');

                        invoked++;
                    });
                    onReadyMsg.handshake.authToken = authToken2;
                    handler.capiMessageHandler(onReadyMsg);

                    expect(invoked).to.be(2);
                });

                it('should not send the same snapshot if a second on ready occurs', function() {
                    var authToken = setupHandshake('iframe1', 'token1');

                    var invoked = 0;
                    mockSendMessageToFrame(function(response, iframeid) {
                        invoked++;
                    });

                    // force a pending messages
                    var segment = new SnapshotSegment('stage.iframe1.value', '1');
                    handler.setSnapshot([segment]);

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    handler.capiMessageHandler(onReadyMsg);
                    handler.capiMessageHandler(onReadyMsg);

                    // a quicker way of checking if the mock is invoked.
                    expect(invoked).to.be(1);
                });

                it('should handle multiple snapshots in a single call', function() {
                    // create handshake
                    var authToken = setupHandshake('iframe2', 'token1');

                    var invoked = 0;
                    mockPostMessage(function(response, iframeid) {
                        // verify snapshot that is sent to the iframe
                        expect(response.type).to.be(SimCapiMessage.TYPES.VALUE_CHANGE);
                        expect(response.handshake.authToken).to.be(authToken);
                        expect(_.size(response.values)).to.be(3);

                        expect(iframeid).to.be('iframe2');

                        invoked++;
                    });

                    // create an ON_READY messages
                    var onReadyMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.ON_READY,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        }
                    });

                    handler.capiMessageHandler(onReadyMsg);

                    handler.setSnapshot([new SnapshotSegment('stage.iframe2.value1', '1'),
                        new SnapshotSegment('stage.iframe2.value2', '2'),
                        new SnapshotSegment('stage.iframe2.value3', '3')
                    ]);

                    // a quicker way of checking if the mock is invoked.
                    expect(invoked).to.be(1);
                });
            });

            describe("get data request", function() {
                it('should response to a get data request', function() {

                    // create handshake
                    var authToken = setupHandshake('iframe2', 'token1');

                    handler = new SimCapiHandler({
                        $container: $container,
                        ignoreHidden: true,
                        callback: {
                            check: function() {},
                            onGetDataRequest: function(options) {
                                expect(options.key).to.equal("test");
                                options.onSuccess(5);
                            }
                        }
                    });

                    // create a get data request
                    var getDataRequestMsg = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.GET_DATA_REQUEST,
                        handshake: {
                            requestToken: null,
                            authToken: authToken
                        },
                        values: {
                            key: 'test'
                        }
                    });

                    handler.capiMessageHandler(getDataRequestMsg);
                });
            });

            describe('sendMessage', function() {
                it('should not delete the token for a given iframe even if it is invisible', function() {
                    // create handshake
                    var authToken1 = setupHandshake('iframe1', 'token1');
                    var authToken2 = setupHandshake('iframe2', 'token2');

                    $container.find('#iframe2').css('display', 'none');

                    handler.sendMessage.restore();
                    handler.sendMessage(new SimCapiMessage(), 'iframe2');

                    expect(handler.getToken('iframe1')).to.be(authToken1);
                    expect(handler.getToken('iframe2')).to.be(authToken2);
                });
            });

            describe('notifyInitializationComplete', function() {
                var itShouldSendAMessageForInitComplete = function(simName, iframeId, questionId) {
                    it('should send a message for initialization complete for ' + simName, function() {
                        // create handshake
                        var authToken;
                        if (questionId) {
                            authToken = setupHandshake(questionId + '|' + iframeId, 'token1');
                        } else {
                            authToken = setupHandshake(iframeId, 'token1');
                        }

                        var lastPostedMessage = '';
                        mockPostMessage(function(response) {
                            // verify snapshot that is sent to the iframe
                            lastPostedMessage = response.type;
                            if (response.type === SimCapiMessage.TYPES.INITIAL_SETUP_COMPLETE) {
                                expect(response.handshake.authToken).to.be(authToken);
                            }
                        });

                        setupOnReady(authToken);

                        if (questionId) {
                            handler.notifyInitializationComplete(iframeId, questionId);
                        } else {
                            handler.notifyInitializationComplete(iframeId);
                        }

                        expect(lastPostedMessage).to.be(SimCapiMessage.TYPES.INITIAL_SETUP_COMPLETE);
                    });
                };

                itShouldSendAMessageForInitComplete('a sim', 'iframe1');
                itShouldSendAMessageForInitComplete('a sim with QID data', 'iframe4', 'q:1');

                var itShouldQueueTheInitCompleteToBeSentAfterReady = function(simName, iframeId, questionId) {
                    it('should queue the initialization complete to be sent after ready for ' + simName, function() {
                        // create handshake
                        var authToken;
                        if (questionId) {
                            authToken = setupHandshake(questionId + '|' + iframeId, 'token1');
                        } else {
                            authToken = setupHandshake(iframeId, 'token1');
                        }

                        handler.sendMessage.restore();

                        if (questionId) {
                            handler.notifyInitializationComplete(iframeId, questionId);
                        } else {
                            handler.notifyInitializationComplete(iframeId);
                        }

                        var initialSetupCompleteSent = false;
                        mockPostMessage(function(response, iframeid) {
                            if (response.type === SimCapiMessage.TYPES.INITIAL_SETUP_COMPLETE) {
                                initialSetupCompleteSent = true;
                            }
                        });

                        setupOnReady(authToken);

                        expect(initialSetupCompleteSent, 'setup complete sent').to.equal(true);
                    });
                };

                itShouldQueueTheInitCompleteToBeSentAfterReady('a sim', 'iframe2');
                itShouldQueueTheInitCompleteToBeSentAfterReady('a sim with QID data', 'iframe4', 'q:2');
            });
        });
    });
});
