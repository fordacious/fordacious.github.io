function Model () {
	this.metalDensity = 8;
	this.rockDensity  = 3;
	this.iceDensity   = 1;
	this.gasDensity   = 0.5;
	
	
	this.gasMass   = 0;
	this.iceMass   = 0;
	this.rockMass  = 0;
	this.metalMass = 0;

	this.maximumMassMe = 2210;

	//Planet 
	this.G = 6.673e-11;  

	// Gas
	this.K = 1.3806503e-23;
	this.AMU = 1.66053886e-27;

	// Star
	this.LS = 3.839e26;
	this.AU = 1.49598e11;
	this.sigma = 5.67e-8;
	
	this.planetMassMe = 0;
	
	
	//getter vars
	this._starMass = 0;
	this._orbitalRadius = 1;
	this._luminosity = 0;
	
}

//fixed
Model.prototype.getMetalVolume = function () {
	
	var value = (4/3)*Math.PI*Math.pow(this.getMetalRadius(),3);
	return value;
}

//fixed
Model.prototype.getRockVolume = function () {
	var value = (4/3)*Math.PI*Math.pow(this.getRockRadius(),3)-this.getMetalVolume();
	return value;
}

//fixed
Model.prototype.getIceVolume = function () {
	var value = (4/3)*Math.PI*Math.pow(this.getIceRadius(),3)-this.getRockVolume()-this.getMetalVolume();
	return value;
}

//fixed
Model.prototype.getGasVolume = function () {
	var value = (4/3)*Math.PI*Math.pow(this.getGasRadius(),3)-this.getIceVolume()-this.getRockVolume()-this.getMetalVolume();
	return value;
}

//fixed
Model.prototype.getMetalMassPercentage = function () { 
	return (this.metalMass/this.getTotalMass())*100; 
}
//fixed
Model.prototype.getRockMassPercentage = function () { 
	return (this.rockMass/this.getTotalMass())*100; 
}
//fixed
Model.prototype.getIceMassPercentage = function () { 
	return (this.iceMass/this.getTotalMass())*100; 
}
//fixed
Model.prototype.getGasMassPercentage = function () { 
	return (this.gasMass/this.getTotalMass())*100; 
}

//fixed
Model.prototype.getGasVolumePercentage = function () { 
	return (this.getGasVolume()/this.getTotalVolume())*100; 
}
//fixed
Model.prototype.getIceVolumePercentage = function () { 
	return (this.getIceVolume()/this.getTotalVolume())*100; 
}
//fixed
Model.prototype.getRockVolumePercentage = function () { 
	return (this.getRockVolume()/this.getTotalVolume())*100; 
}
//fixed
Model.prototype.getMetalVolumePercentage = function () { 
	return (this.getMetalVolume()/this.getTotalVolume())*100; 
}

//fixed
Model.prototype.getTotalVolume = function () {
	return this.getMetalVolume()+this.getRockVolume()+this.getIceVolume()+this.getGasVolume();
}

//fixed
Model.prototype.getMetalRadius = function () {

	var value = (3*this.metalMass) /( 4*Math.PI*this.metalDensity )   
	value = Math.pow(value,(1/3));
	
	return value;
	
}

//fixed
Model.prototype.getRockRadius = function () {
	
	var value =  (3*this.rockMass) /(4*Math.PI*this.rockDensity)  +Math.pow(this.getMetalRadius(),3)
	value = Math.pow(value,(1/3));
	return value;
	
}

//fixed
Model.prototype.getIceRadius = function () {
	
	var value =  (3*this.iceMass) /(4*Math.PI*this.iceDensity)  +Math.pow(this.getRockRadius(),3)
	value = Math.pow(value,(1/3));
	return value;
}

//fixed
Model.prototype.getGasRadius = function () {
	
	var value =  (3*this.gasMass) /(4*Math.PI*this.gasDensity)  +Math.pow(this.getIceRadius(),3);
	value = Math.pow(value,(1/3));
	return value;
}

//fixed
Model.prototype.getRadiusRe = function () {
	return this.getGasRadius()/6.38e8;
}

//fixed
Model.prototype.getRadiusRj = function () {
	return this.getGasRadius()/6.9911e9;
}

//fixed
Model.prototype.getMassMe = function () {
	return this.getTotalMass()/5.9742e27;
}

//fixed
Model.prototype.getMassMj = function () {
	return this.getTotalMass()/1.8986e30;
}

//fixed
Model.prototype.getPlanetMassMj = function () {
	return this.planetMassMe*0.003146634;
}

//fixed
Model.prototype.getStarMass = function () { 
	return this._starMass; 
}

//fixed
Model.prototype.setStarMass = function (n) {
	this._starMass = n;
	this.setLuminosity(Math.pow(this._starMass,3.5));
}

//fixed
Model.prototype.getOrbitalRadius = function () { 
	return this._orbitalRadius; 
}
//fixed
Model.prototype.setOrbitalRadius = function (n) {
	this._orbitalRadius = n;
}

//fixed
Model.prototype.getTotalMass = function () {
	var total = this.gasMass+this.iceMass+this.rockMass+this.metalMass;
	return total;
}

//fixed
Model.prototype.getTotalDensity = function () { 
	var toReturn = 0;
	if (this.getTotalMass() != 0) {
		toReturn = this.getTotalMass()/(4/3*Math.PI*Math.pow(this.getGasRadius(),3))
	}
	return toReturn;
}	  

//fixed
Model.prototype.getEscapeVelocity = function () {
	return this.calcEscapeVelocity((this.planetMassMe*5.9742e24),(this.getPlanetRadius()/100))
}

//fixed
Model.prototype.getPlanetRadius = function () {
	var r;
	
	// in grams
	var mass = this.planetMassMe*5.9742e27;
	r = Math.pow( (((3/4)*mass) / (this.rockDensity * Math.PI)) , (1/3));
	
	return r;
}

//fixed
Model.prototype.getLuminosity = function () { 
	return this._luminosity; 
}
//fixed
Model.prototype.setLuminosity = function (l) {
	this._luminosity = l
}

//fixed
Model.prototype.getMaxwell = function (ve,m,t) {
	
	var mkg = m*this.AMU;
	var innerLeft = Math.pow((mkg/(2*Math.PI*t*K)),1.5);
	var lLeft = 4*Math.PI*Math.pow(ve,2)*innerLeft;
	
	var innerRight = (-mkg*Math.pow(ve,2))/(2*K*t);
	var lRight = Math.exp(innerRight);
	
	var result = lLeft*lRight;
	
	return result;
}

//fixed
Model.prototype.calcA = function (m,t) {
	var mkg = m*this.AMU;
	var innerLeft = Math.pow((mkg/(2*Math.PI*t*this.K)),1.5);
	return 4*Math.PI*innerLeft;
}

//fixed
Model.prototype.calcB = function (m,t) {
	var mkg = m*this.AMU;
	var val = mkg/(2*this.K*t);
	return val;
}

//fixed
Model.prototype.integralZeroInfinity = function (molecularMass) {
	var a = this.calcA(molecularMass,this.getTemperature());
	var b = this.calcB(molecularMass,this.getTemperature());
	return ((Math.sqrt(Math.PI)*a)/(4*Math.pow(b,1.5)));
}

//fixed
Model.prototype.calcIntegralZeroToX = function (molecularMass) {
	var ve = this.getEscapeVelocity();
	var a = this.calcA(molecularMass,this.getTemperature());
	var b = this.calcB(molecularMass,this.getTemperature());
	var returnValue = a*(Math.sqrt(Math.PI)*ErrorFunction.erf(Math.sqrt(b)*ve)/(4*Math.pow(b,1.5))-(ve*Math.exp(-1*b*Math.pow(ve,2)))/(2*b))
	return returnValue;
}

//fixed
Model.prototype.calcLossFactor = function (molecularMass) {
	return this.integralZeroInfinity(molecularMass) - this.calcIntegralZeroToX(molecularMass);
}

//fixed
Model.prototype.calcEscapeVelocity = function (pm, pr) {
	return (Math.sqrt(2*this.G*(pm/pr)))/4;
}

//fixed
Model.prototype.getTemperature = function () {
	return this.calcTemperature();
}

//fixed
Model.prototype.calcTemperature = function () {
	return Math.pow(((this.getLuminosity()*this.LS)/(16*Math.PI*this.sigma*Math.pow((this.getOrbitalRadius()*this.AU),2))),0.25);
}
