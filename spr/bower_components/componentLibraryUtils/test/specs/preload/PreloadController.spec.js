define(function(require) {

    var PreloadController = require('preload/PreloadController');
    var sinon = require('sinon');
    var $ = require('jquery');
    var SceneManager = require('SceneManager');

    describe('PreloadController', function(){
        var underTest;

        describe('start', function(){
            var preloader;

            beforeEach(function(){
                sinon.stub(SceneManager, "startScene");

                preloader = {};

                underTest = new PreloadController();
                underTest.preloader = preloader;
                underTest.sceneId = 'a';
            });

            afterEach(function(){
                SceneManager.startScene.restore();
            });

            describe('args are not given', function(){


                it('should throw if preloader is not given', function(){
                    underTest.preloader = null;
                    underTest.sceneId = "sceneId";
                    expect(function(){ underTest.start(); }).to.throw('preloader must be given');
                });

                it('should throw if sceneId is not given', function(){
                    underTest.sceneId = null;
                    underTest.preloader = "preloader";
                    expect(function(){ underTest.start(); }).to.throw('sceneId must be given');
                });

                it('should check if preloadDraw implements setTargetProgress', function(){
                    underTest.sceneId = "sceneId";
                    underTest.preloader = "preloader";
                    underTest.preloadDraw = "preloadDraw";
                    expect(function(){ underTest.start(); }).to.throw('preloadDraw must implement setTargetProgress');
                });
            });

            describe('when preloadDraw is not given', function(){
                it('should not throw an error because it\'s trying to update the preloadDraw', function(){

                    expect(function(){ underTest.start(); }).to.not.throw();
                    expect(function(){ $(preloader).trigger('preloadProgress'); }).to.not.throw();
                });

                it('should listen to the preloader for the complete event to start the scene', function(){
                    underTest.start();

                    $(preloader).trigger('preloadCompleted');

                    expect(SceneManager.startScene.callCount).to.equal(1);
                });
            });

            describe('when preloadDraw is given', function(){
                var preloadDraw;

                beforeEach(function(){
                    preloadDraw = {
                        setTargetProgress: sinon.stub()
                    };

                    underTest.preloadDraw = preloadDraw;
                });

                it('should call setTargetProgess to update the drawing', function(){
                    preloader.pctCompleted = 0.3;
                    underTest.start();

                    preloader.pctCompleted = 0.7;
                    $(preloader).trigger('preloadProgress');

                    expect(preloadDraw.setTargetProgress.callCount).to.equal(2);
                    expect(preloadDraw.setTargetProgress.getCall(0).args[0]).to.equal(30);
                    expect(preloadDraw.setTargetProgress.getCall(1).args[0]).to.equal(70);
                });

                it('should listen to the preloadDraw for the completed even and not the preloader to start the scene', function(){
                    underTest.start();
                    $(preloader).trigger('preloadCompleted');

                    expect(SceneManager.startScene.callCount).to.equal(0);

                    $(preloadDraw).trigger('completed');

                    expect(SceneManager.startScene.callCount).to.equal(1);
                });
            });
        });
    });
});