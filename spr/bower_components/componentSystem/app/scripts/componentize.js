define(function() {

    function setAllPropertiesOn(component, setup) {
        for(var s in setup) {
            component[s] = setup[s];
        }
    }

    function createComponent(Component, setup, id) {
        var component = new Component();
        component.entity = this;
        this.components[id] = component;

        if(component.start){ this.notStartedComponents[id] = component; }
        else if(component.update){ this.updatableComponents[id] = component; }

        if(setup){ setAllPropertiesOn(component, setup); }
        if(component.initialize) { component.initialize(); }
        return component;
    }

    function validateComponentName(name){
        return name === '' || this[name] === null || this[name] === undefined;
    }

    function getComponent(type) {
        var id;
        for(id in this.components) {
            if(this.components[id] instanceof type) { return this.components[id]; }
        }
        return null;
    }

    function getComponents(type) {
        var result = [], id;
        for(id in this.components) {
            if(!(this.components[id] instanceof type)) { continue; }
            result.push(this.components[id]);
        }
        return result;
    }

    function removeComponent(component) {
        if(component.destroy) {
            component.destroy();
        }
        var id;
        for(id in this.components) {
            if(this.components[id] === component) {
                delete this.components[id];
                break;
            }
        }
        delete this.notStartedComponents[id];
        delete this.updatableComponents[id];

        if(component.componentName){ delete component.entity[component.componentName]; }
        component.entity = null;
    }

    function removeAllComponents(){
        var id;
        for(id in this.components) {
            this.removeComponent(this.components[id]);
        }
    }

    function _removeChild(child, id, doNotDestory){
        delete this.children[id];
        child.parent = null;
        if(!doNotDestory){ child.destroy(); }
    }

    function removeChild(child, doNotDestroy){
        if(child.parent !== this){ return; }

        for(var id in this.children) {
            if(this.children[id] === child){
                _removeChild.call(this, child, id, doNotDestroy);
            }
        }
    }

    function removeAllChildren(){
        for(var id in this.children) {
            _removeChild.call(this, this.children[id], id);
        }
    }

    function hasComponent(type) {
        return this.getComponent(type) !== null;
    }

    function runComponents(state) {
        this.runComponentsStart(state);
        this.runComponentsUpdate(state);
    }

    function runComponentsStart(state) {
        var id, component;
        for(id in this.notStartedComponents) {
            component = this.notStartedComponents[id];
            component.start(state);
            if(component.destroyed){ continue; }
            if(component.update){ this.updatableComponents[id] = component; }
            delete this.notStartedComponents[id];
        }
    }

    function runComponentsUpdate(state) {
        for(var id in this.updatableComponents) {
            this.updatableComponents[id].update(state);
        }
    }

    return function(entity, entityID, callbacks) {
        entity.notStartedComponents = {};
        entity.updatableComponents = {};
        entity.components = {};
        entity.children = {};
        callbacks = callbacks || {};

        var entityComponentID = 0;
        var entityDestroyed = false;
        Object.defineProperty(entity, 'destroyed', {
            get : function() { return entityDestroyed; }
        });

        Object.defineProperty(entity, 'UID', {
            get: function() { return entityID; }
        });

        entity.addComponent = function() {
            var componentName, Component, setup;
            if(arguments.length === 1){
                componentName = '';
                Component = arguments[0];
                setup = {};
            }
            if(arguments.length === 2){
                componentName = '';
                Component = arguments[0];
                setup = arguments[1];
            }
            else if(arguments.length === 3){
                componentName = arguments[0];
                Component = arguments[1];
                setup = arguments[2];
            }

            if(!validateComponentName.call(this)) { throw new Error(componentName + " already exists on entity."); }

            var component = createComponent.call(this, Component, setup, entityComponentID++);
            Object.defineProperty(component, 'componentName', {'configurable': false, 'enumerable': false, 'writable': false, 'value': componentName});

            if(componentName !== ''){ this[componentName] = component; }
            return component;
        };
        entity.destroy = function() {
            if(entityDestroyed){ return; }

            this.removeAllComponents();
            this.removeAllChildren();
            entityDestroyed = true;
        };

        entity.addChild = function(name, child){
            if(child.parent === this){ return; }
            if(child.parent){ child.parent.removeChild(child, true); }

            if(this === child){ throw new Error ("Entity can not add itself as a child"); }
            var parent = this.parent;
            while(parent){
                if(parent === child){ throw new Error ('Child can not be added because it already exists in the parenting chain'); }
                parent = parent.parent;
            }

            this.children[name] = child;
            child.parent = this;

            if(callbacks.updateChildName){ callbacks.updateChildName(child, name); }
        };

        entity.getComponent = getComponent;
        entity.getComponents = getComponents;
        entity.removeComponent = removeComponent;
        entity.removeAllComponents = removeAllComponents;
        entity.removeChild = removeChild;
        entity.removeAllChildren = removeAllChildren;
        entity.hasComponent = hasComponent;
        entity.runComponents = runComponents;
        entity.runComponentsStart = runComponentsStart;
        entity.runComponentsUpdate = runComponentsUpdate;
    };
});