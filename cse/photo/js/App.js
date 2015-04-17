
	Cheddar.init({
		width :630,
		height:500,
		clear :true
	});
	
	var stage = Cheddar.stage;
	var mouse = Cheddar.mouse;
	
	Cheddar.updateRate = 30;
	Cheddar.frameRate = 24
	
	var tipRack = stage.addChild(new DisplayImage("assets/tipRack.png"));
	tipRack.x = 475.05 - 30;
	tipRack.y = 123.15 + 30;
	addGlowFunc(tipRack)
	
	var holderBack = stage.addChild(new DisplayImage("assets/pipette/holderBack.png"))
	holderBack.x = 494.15 + 75 - 40;
	holderBack.y = 99.35 + 33;
	addGlowFunc(holderBack)
	
	var bin = stage.addChild(new DisplayImage("assets/bin.png"));
	bin.x = 618.9 - 25;
	bin.y = 105.85 + 30;
	bin.scaleX = bin.scaleY = 0.4
	addGlowFunc(bin)
	
	var lightBase = stage.addChild(new DisplayImage("assets/lamp/base.png"));
	var dial = stage.addChild(new DisplayImage("assets/lamp/dial.png"));
	addGlowFunc(dial)
	lightBase.x = 453;
	lightBase.y = 405;
	lightBase.scaleX = lightBase.scaleY = 0.85
	dial.x = 443
	dial.y = 410;
	
	var oe = stage.addChild(new DisplayObject())
	oe.substances = [];
	var body = oe.addChild(new DisplayImage("assets/oxygenElectrode/body.png"));
	var wheel = oe.addChild(new Sprite("assets/oxygenElectrode/wheel", 39))
	oe.x = 302.75;
	oe.y = 314.2 + 100;
	var cover = oe.addChild(new DisplayImage("assets/oxygenElectrode/cover.png"));
	wheel.x = cover.x = 60
	wheel.y = cover.y = 16
	var nozzle = oe.addChild(new Sprite("assets/oxygenElectrode/nozzle", 25));
	nozzle.stop();
	nozzle.addFrameCallback(1,function(){nozzle.stop()});
	nozzle.x = 60
	nozzle.y = -86
	//
	addGlowFunc(oe)
	
	var lamp = stage.addChild(new DisplayImage("assets/lamp/lamp.png"));
	var light = stage.addChild(new DisplayImage("assets/lamp/light.png"));
	lamp.x = 430
	lamp.y = 315;
	light.x = 430-58 - 5
	light.y = 315 +53 + 10
	
	var lightIntensity = 0;
	
	dial.on("prerender", function (E) {
		dial.rotation = lightIntensity / 100 * 294;
	})
	
	light.on("prerender", function (E) {
		light.alpha = lightIntensity / 100;
	});
	
	dial.on("click", function (E) {
		lightIntensity = lightIntensity == 0 ? 100 : 0
	})
	
	var rackBack = stage.addChild(new DisplayImage("assets/rack/back.png"));
	var bicarb = stage.addChild(new DisplayImage("assets/tube.png"));
	addGlowFunc(bicarb)
	var water = stage.addChild(new DisplayImage("assets/tube.png"));
	addGlowFunc(water)
	var rackFront = stage.addChild(new DisplayImage("assets/rack/front.png"));
	rackBack.x = rackFront.x = 320;
	rackBack.y = rackFront.y = 148;
	bicarb.x = 275
	water.x = 360
	bicarb.y = water.y = 135
	
	var leaves = stage.addChild(new DisplayImage("assets/leaves.png"));
	addGlowFunc(leaves);
	leaves.on("click", function () {
		var d = window.showModalDialog("leavesPanel.html","leaves:1:100", 
		"dialogWidth:410px; dialogHeight:210px; center:yes; resizable:no; status:no;");
		if (d == "cancelled" || parseInt(d) == 0) {
			return;
		}
		oe.substances.push({name:"leaves", amount:((d*100)|0)/100})
	})
	leaves.on("mouseover", function (E) {
		if (!apparatusInHand) {
			document.body.style.cursor = "pointer";
		}
	});
	leaves.on("mouseout", function (E) {
		if (!apparatusInHand) {
			document.body.style.cursor = "auto";
		}
	});
	leaves.x = 170;
	leaves.y = 103;
	
	var pipette = stage.addChild(new Sprite("assets/pipette/anim", 10));
	pipette.stop();
	pipette.addFrameCallback(6,function () { pipette.stop() });
	pipette.addFrameCallback(1,function () { pipette.stop() });
	pipette.x = pipette.ox = pipette.targetX = 509.90 + 50 - 40;
	pipette.y = pipette.oy = pipette.targetY = 92.05
	pipette.clean = true;
	pipette.tipOn = false;
	pipette.substance = null;
	addGlowFunc(pipette);
	
	var tip = pipette.addChild(new DisplayImage("assets/tip.png"));
	tip.y = 60;
	tip.x = 3
	tip.visible = false;
	
	var holderFront = stage.addChild(new DisplayImage("assets/pipette/holderFront.png"))
	holderFront.x = 502.55 + 63 - 40;
	holderFront.y = 99.35 + 8;
	
	var onButton = stage.addChild(new Button("assets/button"));
	onButton.x = onButton.y = 200
	onButton.scaleX = 0.5
	var t = onButton.addChild(new Text("on"));
	var ontext = t;
	t.x = -19
	t.y = 7
	t.scaleX = 1/onButton.scaleX
	onButton.on("click", function (E) {
		running = true;
	});
	var offButton = stage.addChild(new Button("assets/selectedButton"));
	offButton.x = offButton.y = 200
	offButton.scaleX = 0.5
	var t = offButton.addChild(new Text("off"));
	t.x = -19
	t.y = 7
	t.scaleX = 1/offButton.scaleX
	offButton.visible = false;
	offButton.on("click", function (E) {
		running = false;
	});
	
	var running = false;
	var apparatusInHand = null;
	
	function pickUpApparatus (a) {
		if (!selectNoApparatus && apparatusInHand == null) {
			apparatusInHand = a;
		}
	}
	
	function dropApparatus () {
		apparatusInHand = null;
		selectNoApparatus = true;
	}
	
	stage.on("mousemove", function (E) {
		if (!apparatusInHand) {
			return;
		}
		setApparatusToMouse();
	})
	
	stage.on("mouseup", function (E) {
		selectNoApparatus = false;
	});
	
	var selectNoApparatus = false;
	
	stage.on ("mousedown", function () {
		if (!apparatusInHand) {
			return;
		}
		if (apparatusInHand == pipette) {
			var tipp = getTipPoint();
			if (pipette.tipOn == false && tipRack.hitTest(tipp)) {
				tip.visible = true;
				pipette.tipOn = true;
			} 
			if (holderBack.hitTest(tipp)) {
				pipette.targetX = pipette.ox;
				pipette.targetY = pipette.oy;
				dropApparatus();
			} 
			if (bin.hitTest(tipp)) {
				pipette.tipOn = false;
				pipette.clean = true;
				tip.visible = false;
			}
			if (pipette.clean && pipette.tipOn && water.hitTest(tipp)) {
				var d = window.showModalDialog("pipettePanel.html","water:1:100", 
				"dialogWidth:410px; dialogHeight:210px; center:yes; resizable:no; status:no;");
				if (d == "cancelled" || parseInt(d) == 0) {
					return;
				}
				alert("pipette filled with " + ((d*100)|0)/100 + " ml of water");
				pipette.clean = false;
				pipette.substance = "water"
				pipette.amount = ((d*100)|0)/100;
				pipette.gotoAndPlay(2)
			}
			if (pipette.clean && pipette.tipOn && bicarb.hitTest(tipp)) {
				if (d == "cancelled" || parseInt(d) == 0) {
					return;
				}
				var d = window.showModalDialog("pipettePanel.html","bicarb:1:100", 
				"dialogWidth:410px; dialogHeight:210px; center:yes; resizable:no; status:no;");
				alert("pipette filled with " + ((d*100)|0)/100 + " ml of bicarb");
				pipette.clean = false;
				pipette.substance = "bicarb"
				pipette.amount = ((d*100)|0)/100;
				pipette.gotoAndPlay(2)
			}
			if (pipette.substance != null && oe.hitTest(tipp)) {
				nozzle.play();
				oe.substances.push({name:pipette.substance, amount:pipette.amount})
				pipette.substance = null
				pipette.amount = 0;
				pipette.gotoAndPlay(7);
			}
		}
	})
	
	pipette.on("click", function (e) {
		pickUpApparatus(pipette);
	})

	var isDragging = false;

	pipette.on("touchstart", function (e) {
		setMouseToTouch(e)
		if (pipette.hitTest(mouse)) {
			isDragging = true;
			pickUpApparatus(pipette);
			setApparatusToMouse()
		}
	})

	pipette.on("touchmove", function (e) {
		setMouseToTouch(e)
		if (apparatusInHand) {
			if (isDragging) {
				setApparatusToMouse()

				var tipp = getTipPoint();
				if (holderBack.hitTest(tipp)) {
					pipette.targetX = pipette.ox;
					pipette.targetY = pipette.oy;
				}

			}
		}
	})

	pipette.on("touchend", function (e) {
		if (isDragging) {
			stage.dispatchEvents("mousedown", e);
			stage.dispatchEvents("mouseup", e);
			setApparatusToMouse()
			isDragging = false;
		}
		if (apparatusInHand && apparatusInHand == pipette) {
			var tipp = getTipPoint();
			if (!tipRack.hitTest(tipp) && !bin.hitTest(tipp)) {
				apparatusInHand = null;
				pipette.targetX = pipette.ox;
				pipette.targetY = pipette.oy;
			}
		}
	})

	stage.on("touchend", function (e) {
		if (!apparatusInHand || !apparatusInHand.hitTest(mouse)) {

			var simulatedEvent = document.createEvent("MouseEvent");
			simulatedEvent.initMouseEvent("mouseup", true, true, Cheddar.canvas, 1, 
							  mouse.x, mouse.y, 
							  mouse.x, mouse.y, false, 
							  false, false, false, 0, null);
			stage.onmousedown(simulatedEvent);
			stage.onmouseup(simulatedEvent);
		}
	})

	function setMouseToTouch (e) {
		mouse.x = event.changedTouches[0].pageX;
		mouse.y = event.changedTouches[0].pageY;
	}

	function setApparatusToMouse () {
		apparatusInHand.targetX = mouse.x ;
		apparatusInHand.targetY = mouse.y + apparatusInHand.height / 4;
	}

	function getTipPoint () {
		return {x:pipette.targetX, y:pipette.targetY + pipette.height / 2}
	}	
	
	function addGlowFunc (apparatus) {
		apparatus.on("prerender", function (context) {
			if (apparatusInHand == null && apparatus.hitTest(mouse)) {
				context.shadowColor =  "rgba(70, 255, 70, 10)";
				context.shadowBlur = 3;
				document.body.style.cursor = "pointer";
				context.shadowOffsetX = 1
				context.shadowOffsetY = 1
			} else {
				context.shadowBlur = 0;
				if (apparatusInHand == null) {
					document.body.style.cursor = "auto";
				} else {
					document.body.style.cursor = "none";
				}
			}
		})
	}
	
	oe.on("click", function () {
		trace("contents")
		for (var i = 0 ; i < oe.substances.length; i ++) {
			trace(oe.substances[i].name + ": " + oe.substances[i].amount)
		}
	});
	
	stage.on("enterframe", function (e) {

		pipette.x += (pipette.targetX - pipette.x) / 2
		pipette.y += (pipette.targetY - pipette.y) / 2

		onButton.visible = !running;
		offButton.visible = !onButton.visible;
		if (running) {
			wheel.play();
		} else {
			wheel.stop();
		}
	})
