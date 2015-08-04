/*global console*/
define (function(require){

    var Backbone = require('backbone');

    function bindLogic(object1, propertyName1, object2, propertyName2)
    {
        return function () {
            if(object1.get(propertyName1) !== object2.get(propertyName2)){
                object2.set(propertyName2, object1.get(propertyName1));
            }
            else if(object1.get(propertyName1)  instanceof Array){
                if(object1.get(propertyName1).length !== object2.get(propertyName2).length){
                    object2.set(propertyName2, object1.get(propertyName1));
                }
            }
        };
    }



    function bind(object1, propertyName1)
    {
        var obj = null;

        if(object1 instanceof Backbone.Model){
            obj = { 
                withThis : function(object2, propertyName2)
                {

                    if(object2 instanceof Backbone.Model){
                        propertyName2 = propertyName2 || propertyName1;

                        object1.on('change:'+propertyName1, bindLogic(object1, propertyName1, object2, propertyName2));

                        object2.on('change:'+propertyName2, bindLogic(object2, propertyName2, object1, propertyName1));

                        object2.set(propertyName2, object1.get(propertyName1));

                    }
                    else{
                        throw new Error ("Binding can not be completed. Object2 is not of type Backbone.Model");
                    }
                }
            };
        }
        else{
            throw new Error ("Binding can not be initiated. Object1 is not of type Backbone.Model");
        }

        return obj;
    }

    return bind;
    
});