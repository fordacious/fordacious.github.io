/*global window */
define([
    'underscore',
    'jquery',
    'check',
    'api/snapshot/SimCapiMessage',
    'api/snapshot/SimCapiValue',
    'api/snapshot/SnapshotSegment',
    'api/snapshot/SharedSimData',
    'api/snapshot/util/uuid'
], function(_, $, check, SimCapiMessage, SimCapiValue, SnapshotSegment, SharedSimData, uuid) {

    var SimCapiHandler = function(options) {

        var $container = options.$container;
        var ignoreHidden = options.ignoreHidden || false;
        var self = this;

        options.callback = options.callback || {};
        var callback = {
            check: options.callback.check,
            onSnapshotChange: options.callback.onSnapshotChange,
            onGetDataRequest: options.callback.onGetDataRequest,
            onSetDataRequest: options.callback.onSetDataRequest
        };

        var tokenToId = {}; // token -> compositeId
        var idToToken = {}; // compositeId -> token
        var isReady = {}; // token -> true/false

        var getCompositeId = function(iframeId, questionId) {
            if (questionId) {
                return questionId + '|' + iframeId;
            }
            return iframeId;
        };
        var getIFrameIdFromComposite = function(compositeId) {
            if (compositeId.indexOf('|') === -1) {
                return compositeId;
            }
            return compositeId.split('|')[1];
        };
        var getQuestionIdFromComposite = function(compositeId) {
            if (compositeId.indexOf('|') === -1) {
                return null;
            }
            return compositeId.split('|')[0];
        };

        // Most up to date state of iframe capi values;
        var snapshot = {};
        // Most up to date descriptors of iframe properties.
        var descriptors = {};

        /*
         * Transporter versions:
         * 0.70 - Fixed: adapter unexpose removing incorrect capi property
         * 0.69 - Fixed: unexpose not removing capi properties from snapshot
         * 0.68 - Added ability for users of SimCapiHandler to target a particular instance
         *        of an iframe (among several with the same iframe ID) by using questionId data
         *        in the DOM elements.
         * 0.67 - Added public method to clear the snapshot and descriptors for an iframe
         *      - Fixed bug where the snapshot wouldn't get deleted when the iframe was removed
         * 0.66 - Switch underscore to lodash
         * 0.65 - Added Array Point type
         * 0.64 - Added MathExpression as a type
         *        Validation checks on the sim side will ensure that it's the same on the platform side
         *        Capi properties can be write only now
         * 0.63 - When exposing a property after the first time the default value will overwritten
         * 0.62 - Add ability to save lesson attempt
         * 0.61 - Bug fix with Check start Event
         * 0.6  - Added Check Start Event
         * 0.59 - Enums are finally implemented.
         * 0.58 - Applies capi properties received before the expose.
         * 0.55 - Added initial setup complete event, true pending message queue, Do not delete tokens for invisible iframes
         * 0.54 - Upgraded jquery dependency.
         * 0.53 - Minor fix so no object can be passed to triggerCheck.
         * 0.52 - Throttles the notifying of value changes.
         * 0.51 - Bug fix for the adapters
         * 0.5  - Added get/set data
         * 0.4  - Added check events
         * 0.3  - Minor changes
         * 0.2  - Rewrite of the client slide implementation
         * 0.1  - Added support for SimCapiMessage.TYPES.VALUE_CHANGE_REQUEST message allowing the handler to provoke the sim into sending all of its properties.
         */
        var idToSimVersion = {}; // compositeId -> version of Sim Capi used by iframe

        /*
         * A queue of messages to be sent to sims.
         * Messages are added to this when the sim is not ready.
         * Queues are iframe specific
         */
        var pendingMessages = {};

        /*
         * A set of tokens that are pending on check responses
         */
        var pendingCheckResponses = {};

        var windowEventHandler = function(event) {
            var message;
            try {
                message = JSON.parse(event.data);
                self.capiMessageHandler(message);
            } catch (error) {
                // do nothing if data is not json
            }
        };

        // attach event listener to postMessages
        window.addEventListener('message', windowEventHandler);

        /*
         * A router to call appropriate functions for handling different types of CapiMessages.
         */
        this.capiMessageHandler = function(message) {
            switch (message.type) {
                case SimCapiMessage.TYPES.HANDSHAKE_REQUEST:
                    replyToHandshake(message.handshake);
                    break;
                case SimCapiMessage.TYPES.ON_READY:
                    handleOnReadyMessage(message);
                    break;
                case SimCapiMessage.TYPES.VALUE_CHANGE:
                    updateSnapshot(message.handshake.authToken, message.values);
                    break;
                case SimCapiMessage.TYPES.CHECK_REQUEST:
                    handleCheckTrigger(message);
                    break;
                case SimCapiMessage.TYPES.GET_DATA_REQUEST:
                    handleGetData(message);
                    break;
                case SimCapiMessage.TYPES.SET_DATA_REQUEST:
                    handleSetData(message);
                    break;
            }
        };

        /*
         * @since 0.5
         * Handles the set data
         */
        var handleGetData = function(message) {
            // create a message
            var reponseMessage = new SimCapiMessage();
            reponseMessage.type = SimCapiMessage.TYPES.GET_DATA_RESPONSE;
            reponseMessage.handshake = {
                authToken: message.handshake.authToken,
                config: SharedSimData.getInstance().getData()
            };

            if (callback.onGetDataRequest) {
                callback.onGetDataRequest({
                    key: message.values.key,
                    simId: message.values.simId,
                    onSuccess: function(key, value, exists) {
                        //broadcast response
                        reponseMessage.values = {
                            simId: message.values.simId,
                            key: message.values.key,
                            value: value,
                            exists: exists,
                            responseType: "success"
                        };

                        self.sendMessage(reponseMessage, tokenToId[message.handshake.authToken]);
                    },
                    onError: function(error) {
                        //broadcast response
                        reponseMessage.values = {
                            simId: message.values.simId,
                            key: message.values.key,
                            error: error,
                            responseType: "error"
                        };

                        self.sendMessage(reponseMessage, tokenToId[message.handshake.authToken]);
                    }
                });
            }
        };

        /*
         * @since 0.5
         * Handles the set data
         */
        var handleSetData = function(message) {
            var reponseMessage = new SimCapiMessage();
            reponseMessage.type = SimCapiMessage.TYPES.SET_DATA_RESPONSE;
            reponseMessage.handshake = {
                authToken: message.handshake.authToken,
                config: SharedSimData.getInstance().getData()
            };

            if (callback.onSetDataRequest) {
                callback.onSetDataRequest({
                    key: message.values.key,
                    value: message.values.value,
                    simId: message.values.simId,
                    onSuccess: function() {
                        //broadcast response
                        reponseMessage.values = {
                            simId: message.values.simId,
                            key: message.values.key,
                            value: message.values.value,
                            responseType: "success"
                        };

                        self.sendMessage(reponseMessage, tokenToId[message.handshake.authToken]);
                    },
                    onError: function(error) {
                        //broadcast response
                        reponseMessage.values = {
                            simId: message.values.simId,
                            key: message.values.key,
                            error: error,
                            responseType: "error"
                        };

                        self.sendMessage(reponseMessage, tokenToId[message.handshake.authToken]);
                    }
                });
            }
        };

        /*
         * @since 0.4
         * Handles the check trigger
         */
        var handleCheckTrigger = function(message) {
            pendingCheckResponses[message.handshake.authToken] = true;

            // only trigger check event when we aren't waiting for a response
            if (Object.keys(pendingCheckResponses).length >= 1) {
                if (callback.check) {
                    callback.check();
                }
            }
        };

        /*
         * @since 0.6
         * Replaced notifyCheckResponse
         * Notify clients that check has been completed
         */
        this.notifyCheckCompleteResponse = function() {
            // create a message
            var message = new SimCapiMessage();
            message.type = SimCapiMessage.TYPES.CHECK_COMPLETE_RESPONSE;
            message.handshake = {
                // Config object is used to pass relevant information to the sim
                // like the lesson id, etc.
                config: SharedSimData.getInstance().getData()
            };

            // reset the pending check responses
            var remainingResponses = pendingCheckResponses;
            pendingCheckResponses = {};

            // broadcast check complete response to each sim
            _.each(remainingResponses, function(value, authToken) {
                message.handshake.authToken = authToken;
                self.sendMessage(message, tokenToId[authToken]);
            });
        };

        /*
         * @since 0.6
         * Notify clients that check has been clicked
         */
        this.notifyCheckStartResponse = function() {
            //create message
            var message = new SimCapiMessage();
            message.type = SimCapiMessage.TYPES.CHECK_START_RESPONSE;
            message.handshake = {
                config: SharedSimData.getInstance().getData()
            };

            // broadcast check start response to each sim
            _.each(idToToken, function(authToken, compositeId) {
                message.handshake.authToken = authToken;

                pendingCheckResponses[message.handshake.authToken] = true;

                self.sendMessage(message, compositeId);
            });
        };

        /*
         * Update the snapshot with new values recieved from the appropriate iframe.
         */
        var updateSnapshot = function(authToken, values) {
            if (authToken && tokenToId[authToken]) {

                var iframeId = getIFrameIdFromComposite(tokenToId[authToken]);

                // enumerate through all value changes and update accordingly
                _.each(values, function(simCapiValue, key) {
                    if (simCapiValue === null) {
                        delete snapshot[iframeId + '.' + key];
                        delete descriptors[iframeId + '.' + key];
                    } else {
                        snapshot[iframeId + '.' + key] = simCapiValue.value;
                        descriptors[iframeId + '.' + key] = simCapiValue;
                    }
                });

                // this is used in the platform to do work when things change
                if (callback.onSnapshotChange) {
                    callback.onSnapshotChange();
                }
            }
        };

        var handleOnReadyMessage = function(message) {
            if (message && message.handshake && message.handshake.authToken &&
                tokenToId[message.handshake.authToken]) {

                isReady[message.handshake.authToken] = true;
                sendPendingMessages(tokenToId[message.handshake.authToken]);
            }
        };

        /*
         * Filter and send any pending apply snapshots that has not been sent to
         * the given iframe associated with the given authToken.
         */
        var sendPendingMessages = function(id) {
            _.each(pendingMessages[id], function(message) {
                self.sendMessage(message, id);
            });
            delete pendingMessages[id];
        };

        /*
         * Broadcast a handshake reply to all iframes. Only the iframe with the
         * same requestToken should accept the message. Other iframes should ignore
         * any HANDSHAKE_RESPONSE that has a different response.
         */
        var replyToHandshake = function(handshake) {
            if (handshake.requestToken) {

                var frames = $container.find('iframe');
                if (ignoreHidden) {
                    frames = $container.find('iframe:visible');
                }

                // go through all iframes and send a reply if needed
                _.each(frames, function(iframe, index) {
                    var $iframe = $(iframe);

                    var id;
                    if ($iframe.data('qid')) { // platform HTML viewer adds this, platform author doesn't
                        id = getCompositeId($iframe.attr('id'), $iframe.data('qid'));
                    } else {
                        id = getCompositeId($iframe.attr('id'));
                    }

                    if (!idToToken[id]) {
                        // generate a token for the iframe if we haven't already
                        var token = uuid();
                        tokenToId[token] = id;
                        idToToken[id] = token;
                        isReady[token] = false;
                        idToSimVersion[id] = handshake.version ? handshake.version : 0;
                    }

                    // create handshake response message
                    var response = new SimCapiMessage();
                    response.type = SimCapiMessage.TYPES.HANDSHAKE_RESPONSE;
                    response.handshake = {
                        requestToken: handshake.requestToken,
                        authToken: idToToken[id],
                        // Config object is used to pass relevant information to the sim
                        // like the 'real' authToken (from AELP_WS cookie), the lesson id, etc.
                        config: SharedSimData.getInstance().getData()
                    };

                    // send the response
                    self.sendMessage(response, id);
                });
            }
        };

        var matchesPath = function(target, path) {
            if (target.length <= path.length) {
                // e.g. targetPath = ['iframe', 'propertyA']; anything starting with iframe.propertyA.* will be added
                for (var i = 0; i < target.length; i++) {
                    if (target[i].length > 0 && target[i] !== path[i]) {
                        return false;
                    }
                }

                return true;
            }

            return false;
        };

        // clears the state machine
        this.resetState = function() {
            this.resetSnapshot();
            tokenToId = {};
            idToToken = {};
            isReady = {};
            idToSimVersion = {};
        };

        this.resetSnapshot = function() {
            snapshot = {};
            descriptors = {};
        };

        // Delete the given iframe from the list of known sims.
        this.removeIFrame = function(iframeId, questionId) {
            var compositeId = getCompositeId(iframeId, questionId);
            var token = idToToken[compositeId];

            delete tokenToId[token];
            delete idToToken[compositeId];
            delete isReady[token];
            delete idToSimVersion[compositeId];
            self.resetSnapshotForIframe(compositeId);
        };

        this.resetSnapshotForIframe = function(compositeId) {
            var iframeId = getIFrameIdFromComposite(compositeId);

            _.each(snapshot, function(value, fullpath) {
                if (fullpath.indexOf(iframeId + '.') !== -1) {
                    delete snapshot[fullpath];
                    delete descriptors[fullpath];
                }
            });
        };

        /*
         * Send the snapshot.
         * @param snapshotSegments is an array of SnapshotSegments
         */
        this.setSnapshot = function(snapshotSegments, questionId) {

            check(snapshotSegments).isArray();

            // a map of (iframeid, CapiMessage)
            var messages = {};

            _.each(snapshotSegments, function(segment, index) {

                check(segment).isOfType(SnapshotSegment);

                // the id of the iframe is the second element in the snapshot path.
                // eg stage.iframe1.blah
                var iframeId = segment.path[1];

                // map each segment to separate iframe windows.
                if (!messages[iframeId]) {
                    messages[iframeId] = new SimCapiMessage({
                        type: SimCapiMessage.TYPES.VALUE_CHANGE,
                        handshake: {
                            requestToken: null,
                            authToken: idToToken[getCompositeId(iframeId, questionId)]
                        }
                    });
                }

                var variable = _.drop(segment.path, 2).join('.');
                messages[iframeId].values[variable] = new SimCapiValue({
                    key: variable,
                    type: SimCapiValue.TYPES.STRING,
                    value: segment.value
                });
            });

            // send message to each respective iframes
            $.each(messages, function(iframeId, message) {
                self.sendMessage(message, getCompositeId(iframeId, questionId));
            });
        };

        // can't mock postMessage in ie9 so we wrap it and mock the wrap :D
        this.sendMessage = function(message, compositeId) {
            var token = idToToken[compositeId];
            if (message.type !== SimCapiMessage.TYPES.HANDSHAKE_RESPONSE && !isReady[token]) {
                if (!pendingMessages[compositeId]) {
                    pendingMessages[compositeId] = [];
                }
                pendingMessages[compositeId].push(message);
                return;
            }

            if (!message.handshake.authToken) {
                message.handshake.authToken = idToToken[compositeId];
            }
            if (!this.sendMessageToFrame(message, compositeId)) {
                self.resetSnapshotForIframe(compositeId);
            }
        };

        // NOTE: Do not try to stub window.postMessage due to IE9 not allowing it
        // Tests should run in all supported browsers
        // This method should almost never be used directly, use send message instead.
        this.sendMessageToFrame = function(message, compositeId) {
            var questionId = getQuestionIdFromComposite(compositeId);
            var iframeId = getIFrameIdFromComposite(compositeId);

            var frame = $container.find('#' + iframeId)[0];
            // ignore hidden is set by the platform HTML viewer, and should be set by anything else
            // that wants to target a specific iframe with QID data
            if (ignoreHidden) {
                var $frames = $container.find('iframe#' + iframeId).filter(':visible');

                if (questionId !== null) {
                    frame = $frames.filter(function() {
                        return $(this).data('qid') === questionId;
                    })[0];
                } else {
                    frame = $frames[0];
                }
            }

            if (!frame) {
                return false;
            }

            frame.contentWindow.postMessage(JSON.stringify(message), '*');
            return true;
        };

        /*
         * Returns the snapshot for the given path.
         */
        this.getSnapshot = function(snapshotSegment) {
            check(snapshotSegment).isOfType(SnapshotSegment);

            var result = {};

            // target path looks something like this : iframeid[.var]*
            var targetPath = _.rest(snapshotSegment.path);

            // filter paths which are contained or equal to the targetPath. eg, iframe1.stuff is
            // contained in iframe1
            _.each(snapshot, function(value, path) {
                if (matchesPath(targetPath, path.split('.'))) {
                    result[path] = value;
                }
            });

            return result;
        };

        /*
         * Returns descriptors for the properties that match the given path.
         * A descriptor is a SimCapiValue.
         */
        this.getDescriptors = function(snapshotSegment) {
            check(snapshotSegment).isOfType(SnapshotSegment);

            var result = {};

            // target path looks something like this : iframeid
            var targetPath = _.rest(snapshotSegment.path);

            // filter paths which are contained or equal to the targetPath. eg, iframe1.stuff is
            // contained in iframe1
            _.each(descriptors, function(value, path) {
                if (matchesPath(targetPath, path.split('.'))) {
                    result[path] = value;
                }
            });

            return result;
        };

        /*
         * Requests value change message
         * @since 0.1
         */
        this.requestValueChange = function(compositeId) {
            if (!(idToSimVersion[compositeId] && idToSimVersion[compositeId] >= 0.1)) {
                throw new Error("Method requestValueChange is not supported by sim");
            }

            // create a message
            var message = new SimCapiMessage();
            message.type = SimCapiMessage.TYPES.VALUE_CHANGE_REQUEST;
            message.handshake = {
                authToken: idToToken[compositeId],
                // Config object is used to pass relevant information to the sim
                // like the 'real' authToken (from AELP_WS cookie), the lesson id, etc.
                config: SharedSimData.getInstance().getData()
            };

            this.sendMessage(message, compositeId);
        };

        /*
         * Notify clients that configuration is updated. (eg. the question has changed)
         */
        this.notifyConfigChange = function() {
            _.each(isReady, _.bind(function(ready, token) {
                if (ready) {
                    // create handshake response message
                    var message = new SimCapiMessage();
                    message.type = SimCapiMessage.TYPES.CONFIG_CHANGE;
                    message.handshake = {
                        authToken: token,
                        // Config object is used to pass relevant information to the sim
                        // like the 'real' authToken (from AELP_WS cookie), the lesson id, etc.
                        config: SharedSimData.getInstance().getData()
                    };

                    this.sendMessage(message, tokenToId[token]);
                }
            }, this));
        };

        /*
         * @since 0.55
         * Notify clients that initial setup has been completely sent to them
         */
        this.notifyInitializationComplete = function(iframeId, questionId) {
            var compositeId = getCompositeId(iframeId, questionId);
            var message = new SimCapiMessage();
            message.type = SimCapiMessage.TYPES.INITIAL_SETUP_COMPLETE;
            message.handshake = {
                authToken: idToToken[compositeId]
            };

            this.sendMessage(message, compositeId);
        };

        /*
         * Get the version of Transporter for a given iframe.
         */
        this.getTransporterVersion = function(compositeId) {
            return idToSimVersion[compositeId];
        };

        /*
         * Get the token for a given iframe. Used in unit tests.
         */
        this.getToken = function(compositeId) {
            return idToToken[compositeId];
        };
    };

    return SimCapiHandler;

});
