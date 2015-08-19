/*globals expect*/
define(function(require){

	var NumberFormatter = require('sim-common/helpers/NumberFormatter');

	var times = [
        {time: 0, formattingResult:"00:00"},
        {time: 13, formattingResult:"00:13"},
        {time: 123, formattingResult:"02:03"},
        {time: 1234, formattingResult:"20:34"},
        {time: 755, formattingResult:"12:35"},
        {time: 73.23, formattingResult:"01:13"},
        {time: -12, formattingResult:"00:00"}
    ];

	describe('NumberFormatter', function(){
		describe('ShortFormat', function(){
			describe('TimeFormat', function () {
				it('should format time correctly (default = mm:ss)', function () {
					for (var i = 0; i < times.length; i++) {
						expect(NumberFormatter.TimeFormat(times[i].time)).to.equal(times[i].formattingResult);
					}
				});
			});
			describe('when number is between -999 and 999', function(){
				it('should return the number', function(){
					expect(NumberFormatter.ShortFormat(0)).to.equal(0);
					expect(NumberFormatter.ShortFormat(999)).to.equal(999);
					expect(NumberFormatter.ShortFormat(10.2)).to.equal(10.2);
					expect(NumberFormatter.ShortFormat(-999)).to.equal(-999);
				});
				it('should return maximum of 2 decimals', function(){
					expect(NumberFormatter.ShortFormat(10.2)).to.equal(10.2);
					expect(NumberFormatter.ShortFormat(10.22)).to.equal(10.22);
					expect(NumberFormatter.ShortFormat(10.222)).to.equal(10.22);
				});
			});
			describe('when number is greater then 999 or lower than -999', function(){
				it('should return a number with a maximum of three digits', function(){
					expect(NumberFormatter.ShortFormat(1000)).to.equal('1K');
					expect(NumberFormatter.ShortFormat(1100)).to.equal('1.1K');
					expect(NumberFormatter.ShortFormat(1110)).to.equal('1.11K');
					expect(NumberFormatter.ShortFormat(1111)).to.equal('1.11K');
					expect(NumberFormatter.ShortFormat(10000)).to.equal('10K');
					expect(NumberFormatter.ShortFormat(11000)).to.equal('11K');
					expect(NumberFormatter.ShortFormat(11100)).to.equal('11.1K');
					expect(NumberFormatter.ShortFormat(11110)).to.equal('11.1K');

					expect(NumberFormatter.ShortFormat(-1111)).to.equal('-1.11K');
					expect(NumberFormatter.ShortFormat(-11110)).to.equal('-11.1K');
				});
			});
			describe('when the passed value is not a number', function(){
				it('should convert it into a number if possible', function(){
					expect(NumberFormatter.ShortFormat('-1111')).to.equal('-1.11K');
					expect(NumberFormatter.ShortFormat('-1111SomeText')).to.equal('-1.11K');
					expect(NumberFormatter.ShortFormat('-11SomeText11')).to.equal(-11);
				});
				it('should return NaN when the number conversion is not possible', function(){
					expect(isNaN(NumberFormatter.ShortFormat('SomeText'))).to.equal(true);
					expect(isNaN(NumberFormatter.ShortFormat(true))).to.equal(true);
					expect(isNaN(NumberFormatter.ShortFormat(undefined))).to.equal(true);
					expect(isNaN(NumberFormatter.ShortFormat([]))).to.equal(true);
					expect(isNaN(NumberFormatter.ShortFormat({}))).to.equal(true);
				});
			});
			describe('when number is between -1000 and -99999', function(){
				it('should return a short number prefixed by the letter K', function(){
					expect(NumberFormatter.ShortFormat(-1000)).to.equal('-1K');
					expect(NumberFormatter.ShortFormat(-99999)).to.equal('-99.9K');
				});
			});
			describe('when number is between -100000 and -99999999', function(){
				it('should return a short number prefixed by the letter M', function(){
					expect(NumberFormatter.ShortFormat(-100000)).to.equal('-0.1M');
					expect(NumberFormatter.ShortFormat(-99999999)).to.equal('-99.9M');
				});
			});
			describe('when number is between -100000000 and -99999999999', function(){
				it('should return a short number prefixed by the letter B', function(){
					expect(NumberFormatter.ShortFormat(-100000000)).to.equal('-0.1B');
					expect(NumberFormatter.ShortFormat(-99999999999)).to.equal('-99.9B');
				});
			});
			describe('when number is between -100000000000 and -99999999999999', function(){
				it('should return a short number prefixed by the letter T', function(){
					expect(NumberFormatter.ShortFormat(-100000000000)).to.equal('-0.1T');
					expect(NumberFormatter.ShortFormat(-99999999999999)).to.equal('-99.9T');
				});
			});
			describe('when number is between 1000 and 999999', function(){
				it('should return a short number prefixed by the letter K', function(){
					expect(NumberFormatter.ShortFormat(1000)).to.equal('1K');
					expect(NumberFormatter.ShortFormat(99999)).to.equal('99.9K');
				});
			});
			describe('when number is between 100000 and 99999999', function(){
				it('should return a short number prefixed by the letter M', function(){
					expect(NumberFormatter.ShortFormat(100000)).to.equal('0.1M');
					expect(NumberFormatter.ShortFormat(99999999)).to.equal('99.9M');
				});
			});
			describe('when number is between 100000000 and 9999999999', function(){
				it('should return a short number prefixed by the letter B', function(){
					expect(NumberFormatter.ShortFormat(100000000)).to.equal('0.1B');
					expect(NumberFormatter.ShortFormat(99999999999)).to.equal('99.9B');
				});
			});
			describe('when number is between 100000000000 and 99999999999999', function(){
				it('should return a short number prefixed by the letter T', function(){
					expect(NumberFormatter.ShortFormat(100000000000)).to.equal('0.1T');
					expect(NumberFormatter.ShortFormat(99999999999999)).to.equal('99.9T');
				});
			});

		});
	});
});