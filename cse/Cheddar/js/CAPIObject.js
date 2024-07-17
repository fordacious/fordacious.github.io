CAPIObject = (function() {

	function CAPIObject(n, source_object, property) {
		//if it is non-terminal, it has children
		var children = new Array();
		var _this = this;
		//always has a name
		var valid = true;
		if (!n) {
			trace ("need to give all CAPIObjects names")
			valid = false;
		}
		var name = n;
		//if it is terminal, it has a value
		if (source_object && property) {
			var value = source_object[property];
			var source = source_object;
		}
		
		this.addObject = function (cObject) {
			children.push(cObject);
		}
		
		this.removeObject = function (cObject) {
			var newChildren = [];
			for (var i=0; i<children.length; i++) {
				if (children[i] != cObject) {
					newChildren.push(children[i]);
				}
			}
			children = newChildren;
		}
		
		this.update = function () {
			if (children.length == 0) {
				value = source[property];
			}
		}
		
		//return json form of this object and its children
		/*
			{
				"name":"[{
						"child1name":"child1value"
					  },{
						"child2name":"[{
											"child3name":{
											              "child3object":"prop1",
														  "child3object":"prop2"
														  }
									   }]"
					  }]"
			}
		*/
		this.toJson = function () {
			this.update()
			if (children.length == 0) {
				//is terminal
				return '{"' + name + '":"'+jsonify(value)+'"}'
			} else {
				var retStr = '{"'+name+'":"[';
				for (var i=0; i < children.length; i++) {
					retStr += children[i].toJson();
				}
				return retStr + ']"}'
			}
		}
		
		function jsonify (obj) {
			//TODO
			//return json form of object
			//if (typeof [1] == typeof obj) {
			//	return "["+obj.toString()+"]"
			//}
			return JSON.stringify(obj);
		}
		
		//communicates with smartsparrow servers
		this.send = function (url) {
			
		}
		
		this.CAPIOBJET  = "cObject"
		this.OBJECT     = "object"
		this.BOOLEAN    = "boolean"
		this.STRING     = "string"
		this.NUMBER     = "number"
		this.ARRAY      = "array"
	}

	return CAPIObject;

})();