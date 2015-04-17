ChartData = (function() {

	function ChartData() {
		this.DEFAULT_ORIGINAL_UNITS = 1000;

		this.hUnits = this.DEFAULT_ORIGINAL_UNITS;
		this.heUnits = this.DEFAULT_ORIGINAL_UNITS;;
		this.ch4Units = this.DEFAULT_ORIGINAL_UNITS;;
		this.nh3Units = this.DEFAULT_ORIGINAL_UNITS;;
		this.h2oUnits = this.DEFAULT_ORIGINAL_UNITS;;
		this.n2Units = this.DEFAULT_ORIGINAL_UNITS;;
		this.o2Units = this.DEFAULT_ORIGINAL_UNITS;;
		this.co2Units = this.DEFAULT_ORIGINAL_UNITS;;
		this.xeUnits = this.DEFAULT_ORIGINAL_UNITS;;

		this.H_AMU = 2;
		this.HE_AMU = 4;
		this.CH4_AMU = 16;
		this.NH3_AMU = 17;
		this.H2O_AMU = 18;
		this.N2_AMU = 28;
		this.O2_AMU = 32;
		this.CO2_AMU = 44;
		this.XE_AMU = 131;
		
		this.gasUnitCoefficient = 1;
		
		this.model = new Model();
		
		this.totalGasUnitsPrevious
		this.totalGasUnitsPresent
		this.gasUnitCoefficient;
		this.gasLossCoefficient;
	}

	ChartData.prototype.reset = function () {
		this.hUnits   = this.DEFAULT_ORIGINAL_UNITS;
		this.heUnits  = this.DEFAULT_ORIGINAL_UNITS;
		this.ch4Units = this.DEFAULT_ORIGINAL_UNITS;
		this.nh3Units = this.DEFAULT_ORIGINAL_UNITS;
		this.h2oUnits = this.DEFAULT_ORIGINAL_UNITS;
		this.n2Units  = this.DEFAULT_ORIGINAL_UNITS;
		this.o2Units  = this.DEFAULT_ORIGINAL_UNITS;
		this.co2Units = this.DEFAULT_ORIGINAL_UNITS;
		this.xeUnits  = this.DEFAULT_ORIGINAL_UNITS;
		
		this.gasUnitCoefficient = 1;
	}


	ChartData.prototype.getHlossFactor = function () {
		return this.model.calcLossFactor(this.H_AMU); 
	}
	ChartData.prototype.getHCurPercent = function () { return ((this.hUnits/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getHelossFactor = function () { return this.model.calcLossFactor(this.HE_AMU); }
	ChartData.prototype.getHeCurPercent = function () { return ((this.heUnits/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getCH4lossFactor = function () { return this.model.calcLossFactor(this.CH4_AMU); }
	ChartData.prototype.getCH4CurPercent = function () { return ((this.ch4Units/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getNH3lossFactor = function () { return this.model.calcLossFactor(this.NH3_AMU); }
	ChartData.prototype.getNH3CurPercent = function () { return ((this.nh3Units/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getH2OlossFactor = function () { return this.model.calcLossFactor(this.H2O_AMU); }
	ChartData.prototype.getH2OCurPercent = function () { return ((this.h2oUnits/this.DEFAULT_ORIGINAL_UNITS)*100)}

	ChartData.prototype.getN2lossFactor = function () { return this.model.calcLossFactor(this.N2_AMU); }
	ChartData.prototype.getN2CurPercent = function () { return((this.n2Units/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getO2lossFactor = function () { return this.model.calcLossFactor(this.O2_AMU); }
	ChartData.prototype.getO2CurPercent = function () { return ((this.o2Units/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getCO2lossFactor = function () { return this.model.calcLossFactor(this.CO2_AMU); }
	ChartData.prototype.getCO2CurPercent = function () { return ((this.co2Units/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.getXelossFactor = function () { return this.model.calcLossFactor(this.XE_AMU); }
	ChartData.prototype.getXeCurPercent = function () { return ((this.xeUnits/this.DEFAULT_ORIGINAL_UNITS)*100); }

	ChartData.prototype.reportGasContent = function() {
		return this.hUnits + this.heUnits + this.ch4Units + this.nh3Units + this.h2oUnits + this.n2Units + this.o2Units + this.co2Units + this.xeUnits;
	}
	// calculating portion in units, actually decoupled from the height of the bar (not very smart, doing calculations twice)
	ChartData.prototype.calcPortions = function () {
		this.totalGasUnitsPrevious = this.hUnits + this.heUnits + this.ch4Units + this.nh3Units + this.h2oUnits + this.n2Units + this.o2Units + this.co2Units + this.xeUnits;
		
		this.hUnits   = this.hUnits-(this.hUnits*this.getHlossFactor())
		this.heUnits  = this.heUnits-(this.heUnits*this.getHelossFactor());
		this.ch4Units = this.ch4Units-(this.ch4Units*this.getCH4lossFactor());
		this.nh3Units = this.nh3Units-(this.nh3Units*this.getNH3lossFactor());
		this.h2oUnits = this.h2oUnits-(this.h2oUnits*this.getH2OlossFactor());
		this.n2Units  = this.n2Units-(this.n2Units*this.getN2lossFactor());
		this.o2Units  = this.o2Units-(this.o2Units*this.getO2lossFactor());
		this.co2Units = this.co2Units-(this.co2Units*this.getCO2lossFactor());
		this.xeUnits  = this.xeUnits-(this.xeUnits*this.getXelossFactor());
		
		//var lossFactor:Number = HlossFactor;
		
		this.totalGasUnitsPresent = this.hUnits + this.heUnits + this.ch4Units + this.nh3Units + this.h2oUnits + this.n2Units + this.o2Units + this.co2Units + this.xeUnits;
		//print("Access total gas units lost: " + (this.totalGasUnitsPresent - this.totalGasUnitsPrevious));
		this.gasUnitCoefficient = this.totalGasUnitsPresent / (9 * this.DEFAULT_ORIGINAL_UNITS);
		this.gasLossCoefficient = (this.totalGasUnitsPresent - this.totalGasUnitsPrevious) / (9 * this.DEFAULT_ORIGINAL_UNITS);
	}
	
	return ChartData;

})();