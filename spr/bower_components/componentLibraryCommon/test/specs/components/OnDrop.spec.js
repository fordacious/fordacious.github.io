define(function (require) {
    var $ = require('jquery');
    var sinon = require('sinon');
    var OnDrop = require('components/OnDrop');
    var Droppable = require('components/Droppable');

    var ExtendedModel = require('ExtendedModel');

    var Model = ExtendedModel.extend({});

    describe('OnDrop Behavior', function (){
        var underTest, droppable, targetModel, droppedEntity, targetComponentName, targetFunctionName;

        beforeEach(function () {
            underTest = new OnDrop();

            targetModel = new Model();
            droppedEntity = {
                'component': { 'func': function () {}}
            };

            droppable = new Droppable();
            underTest.droppable = droppable;
            targetComponentName = 'component';
            underTest.targetComponentName = targetComponentName;
            targetFunctionName = 'func';
            underTest.targetFunctionName = targetFunctionName;
        });

        it('should execute specified function on specified entity and model when draggable is dropped on specified droppable', function () {
            var stub = sinon.stub(droppedEntity[targetComponentName], targetFunctionName);
            underTest.start();
            expect(stub.callCount).to.equal(0);
            $(droppable).trigger('drop', [droppedEntity]);
            expect(stub.callCount).to.equal(1);
            expect(stub.calledWithExactly(droppedEntity)).to.equal(true);
        });
    });
});