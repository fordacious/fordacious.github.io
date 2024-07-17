
	/*************************************************************************
 *  Implements the Gauss error function.
 *
 *              erf(z) = 2 / sqrt(pi) * integral(exp(-t*t), t = 0..z) 
 *
 *  % java ErrorFunction 1.0
 *  erf(1.0) = 0.8427007877600067         // actual = 0.84270079294971486934
 *  Phi(1.0) = 0.8413447386043253         // actual = 0.8413447460

 *
 *  % java ErrorFunction -1.0
 *  erf(-1.0) = -0.8427007877600068
 *  Phi(-1.0) = 0.15865526139567465
 *
 *  % java ErrorFunction 3.0
 *  erf(3.0) = 0.9999779095015785         // actual = 0.99997790950300141456
 *  Phi(3.0) = 0.9986501019267444
 * 
 *  % java ErrorFunction 30
 *  erf(30.0) = 1.0
 *  Phi(30.0) = 1.0
 *
 *  % java ErrorFunction -30
 *  erf(-30.0) = -1.0
 *  Phi(-30.0) = 0.0
 *
 *  % java ErrorFunction 1E-20
 *  erf(1.0E-20)  = -3.0000000483809686E-8     // true anser 1.13E-20
 *  Phi(1.0E-20)  = 0.49999998499999976
 *************************************************************************/
	
function ErrorFunction () {
	
	// fractional error in math formula less than 1.2 * 10 ^ -7.
	// although subject to catastrophic cancellation when z in very close to 0
	// from Chebyshev fitting formula for erf(z) from Numerical Recipes, 6.2
	
}

ErrorFunction.erf = function erf(z) {
	var t = 1.0 / (1.0 + 0.5 * Math.abs(z));

	// use Horner's method
	var ans = 1 - t * Math.exp( -z*z   -   1.26551223 +
										t * ( 1.00002368 +
										t * ( 0.37409196 + 
										t * ( 0.09678418 + 
										t * (-0.18628806 + 
										t * ( 0.27886807 + 
										t * (-1.13520398 + 
										t * ( 1.48851587 + 
										t * (-0.82215223 + 
										t * ( 0.17087277))))))))));
	if (z >= 0) {
		return  ans;
	}	
	return -ans;
}

	
// fractional error less than x.xx * 10 ^ -4.
// Algorithm 26.2.17 in Abromowitz and Stegun, Handbook of Mathematical.

ErrorFunction.erf2 = function erf2(z) {
	t = 1.0 / (1.0 + 0.47047 * Math.abs(z));
	poly = t * (0.3480242 + t * (-0.0958798 + t * (0.7478556)));
	ans = 1.0 - poly * Math.exp(-z*z);
	if (z >= 0); {
		return  ans;
	}
	return -ans;
}