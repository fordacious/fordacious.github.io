function Vector (x,y,z) {
  this.x = x;
  this.y = y;
  this.z = z;

  this.normalize = function () {
    var l = Math.sqrt(Math.pow( this.x, 2) + Math.pow( this.y, 2) + Math.pow( this.z, 2));
    return new Vector(this.x / l, this.y / l, this.z / l);
  }
}


self.addEventListener('message', function(e) {

    var planetPos = e.data.planetPos;
    var lightPos = e.data.lightPos;
    var cameraPos = e.data.cameraPos;
    var otherPlanetPos = e.data.otherPlanetPos;
    var otherPlanetRadius = e.data.otherPlanetRadius;

    var cameraRotation = e.data.cameraRotation;
    var cameraEulerOrder = e.data.cameraEulerOrder;
    var data = e.data.data;

    var l = data.length;

    var radius = 60;

    var cameraPos = new Vector (cameraPos.x - planetPos.x, cameraPos.y - planetPos.y, cameraPos.z - planetPos.z);

    var lightPos = new Vector (lightPos.x - planetPos.x, lightPos.y - planetPos.y, lightPos.z - planetPos.z);

    var otherPlanetPos = new Vector (otherPlanetPos.x - planetPos.x, otherPlanetPos.y - planetPos.y, otherPlanetPos.z - planetPos.z);

    planetPos = new Vector(0,0,0);

    var p = new Vector(0,0,0); 

    var d;

      // resultant intensity
      var intensity = 1;

      var attenuation = 300;   

      var x;
      var y;    

      var distToLight  
      var pixelToLight
      var pixelToCamera
      var normalP2C
      var projectP2LonP2C

      var lightInPlanet = Math.sqrt( 

                    Math.pow( lightPos.x - planetPos.x , 2) + 
                    Math.pow( lightPos.y - planetPos.y , 2) +
                    Math.pow( lightPos.z - planetPos.z , 2)

                ) < 30;

      var pixelToCentre

      var lightToCentre = new Vector(planetPos.x - lightPos.x,planetPos.y - lightPos.y, planetPos.z - lightPos.z);

      var normalLightToCentre = lightToCentre.normalize();

      var projP2ConL2C
      var attenuationMultiplyer
      var pixelToOtherPlanet
      var originalP2L
      var projP2OPonP2LScalar
      var dist
      var lengthProjP2OPonP2L
      var lengthP2L
      var amount
      var m
      var redMultiplyer
      var greenMultiplyer
      var blueMultiplyer
      var amount
      var c
      var oldY

      var attenDiff;

      var minDistToLight = Infinity;
      var maxDistToLight = 0;
      var lightDistances = new Array(data.length/4);
      var i;
    
    for (i=0; i<l; i+=4) {
        if (data[i+3]) {
             
              // x and y in sprite of pixel
              x = ((i / 4) | 0) % radius;
              y = (((i / 4) | 0) / radius ) | 0;

              // plane of sprite from 0,0,-1 camera perspective
              p.x = Math.sin(Math.PI * (x - 30) / 60) * 30; 
              p.y = Math.sin(Math.PI * (y - 30) / 60) * 30;
              p.z = Math.sin((Math.PI / 2) * (x / 30)) * Math.sin((Math.PI / 2) * (y / 30)) * 30;

              /*if (p.z < lightPos.z) {
                intensity = 0;

                if (lightPos.z - p.z < attenuation) {
                    intensity = (attenuation-(lightPos.z - p.z))/attenuation
                }
              }*/

              //p.applyEuler( cameraRotation, cameraEulerOrder );

              distToLight = Math.sqrt( 

                    Math.pow( lightPos.x - p.x , 2) + 
                    Math.pow( lightPos.y - p.y , 2) +
                    Math.pow( lightPos.z - p.z , 2)

                );

              // if we're on a tablet, break here, as the
              // shadow calculations are very expensive
              //isIpad = true;
              /*if (isIpad) {

                  intensity = Math.max(1-distToLight / light.distance, 0) * 7 - 5

                  redMultiplyer   = light.color.r;
                  greenMultiplyer = light.color.g;
                  blueMultiplyer  = light.color.b;
                  amount = 3;
                  i -= 4;
                  for (c = 0; c < amount; c ++) {
                    i += 4;
                    oldY = y;
                    y = (((i / 4) | 0) / radius ) | 0;

                    if (oldY != y) {
                        i -= 4;
                        break;
                    }

                     data[i + 0] *= intensity * redMultiplyer;
                     data[i + 1] *= intensity * greenMultiplyer;
                      data[i + 2] *= intensity * blueMultiplyer;
                    }
                  continue;
              }*/

              // rotate this vector the same way the camera is rotated to
              // get the actual plane the camera sees

              pixelToLight = new Vector(lightPos.x - p.x, lightPos.y - p.y, lightPos.z - p.z);

              pixelToCamera = new Vector(cameraPos.x - p.x, cameraPos.y - p.y, cameraPos.z - p.z);

              normalP2C = pixelToCamera.normalize();


              // This can be calculated more efficiently as 
              // ((A . B) / (B . B)) * B
              projectP2LonP2C = pixelToLight.x * normalP2C.x + pixelToLight.y * normalP2C.y + pixelToLight.z * normalP2C.z

              pixelToCentre = new Vector(planetPos.x - p.x, -planetPos.y + p.y, planetPos.z - p.z);

              projP2ConL2C = pixelToCentre.x * normalLightToCentre.x + pixelToCentre.y * normalLightToCentre.y + pixelToCentre.z * normalLightToCentre.z

              attenuationMultiplyer = 1;

              if ((projP2ConL2C < 0) || lightInPlanet) {

                if (!lightInPlanet && projP2ConL2C > -attenuation) {
                    //attenuationMultiplyer = Math.max(Math.min(attenuationMultiplyer/Math.max(-projP2ConL2C, 1), 1), 0);

                    attenuationMultiplyer = 0;
                    //intensity = 0;
                } else {
                    attenuationMultiplyer = 0;
                }
              } else {
                //intensity = Math.max(1-distToLight / light.distance, 0) * 7 - 5
              }

            if (attenuationMultiplyer) {
                // for each other planet/moon
                // for now Im just going to consider the
                // other one, to make it easier

                // get other planet infinite plane from lights perspective
                // intersect vector from pixel to light with this plane
                // if it intersects and its distance is closer than the other planet's radius, set intensity to 0

                // project a vector from the pixel to centre of the other 
                // planet onto the pixel to light vector. The end of this
                // vector is a point on the plane. If the distance from
                // this point to the other planet's centre is less than the 
                // radius of the other planet, then the light ray 
                // intersected with the other planet on its way to us
                // intenuate by the distance from the planet

                pixelToOtherPlanet = new Vector (otherPlanetPos.x - planetPos.x, otherPlanetPos.y - planetPos.y, otherPlanetPos.z - planetPos.z);

                originalP2L = new Vector(pixelToLight.x, pixelToLight.y, pixelToLight.z);

                pixelToLight = pixelToLight.normalize();

                projP2OPonP2LScalar = pixelToOtherPlanet.x * pixelToLight.x + pixelToOtherPlanet.y * pixelToLight.y + pixelToOtherPlanet.z * pixelToLight.z

                projP2OPonP2L = new Vector(projP2OPonP2LScalar * pixelToLight.x, projP2OPonP2LScalar * pixelToLight.y, projP2OPonP2LScalar * pixelToLight.z);

                dist = Math.sqrt(

                        Math.pow(pixelToOtherPlanet.x - projP2OPonP2L.x, 2) +
                        Math.pow(pixelToOtherPlanet.y - projP2OPonP2L.y, 2) +
                        Math.pow(pixelToOtherPlanet.z - projP2OPonP2L.z, 2)

                    );

                lengthProjP2OPonP2L = Math.sqrt(

                        Math.pow(projP2OPonP2L.x, 2) +
                        Math.pow(projP2OPonP2L.y, 2) +
                        Math.pow(projP2OPonP2L.z, 2)

                    );

                lengthP2L = Math.sqrt(

                        Math.pow(originalP2L.x, 2) +
                        Math.pow(originalP2L.y, 2) +
                        Math.pow(originalP2L.z, 2)

                    );

                amount = 0;

                if (dist < otherPlanetRadius + amount && projP2ConL2C > amount && projP2OPonP2LScalar > -amount && lengthProjP2OPonP2L < lengthP2L + amount) {
                    

                    // attenuate by the distance from the planet
                    m = otherPlanetRadius - Math.min((otherPlanetRadius - dist) * 12, otherPlanetRadius);
                    if (attenuationMultiplyer != 1) {
                        console.log(attenuationMultiplyer)
                    }
                    attenuationMultiplyer = Math.max ( Math.min(attenuationMultiplyer * m/otherPlanetRadius, attenuationMultiplyer), 0 );
                    //attenuationMultiplyer = 0;
                }
              }

              redMultiplyer   = 255;
              greenMultiplyer = 255;
              blueMultiplyer  = 255;

              intensity = Math.max(intensity, 0);

              i-=4;
              // This is used to control the resolution of the shadows
              // for ipads, increase the c < X to lower the resolution
              // and boost framerate
              amount = false ? 4: 1;
              for (c = 0; c < amount; c ++) {
                i += 4;
                oldY = y;
                y = (((i / 4) | 0) / radius ) | 0;

                if (oldY != y) {
                    i -= 4;
                    break;
                }
                data[i + 0] *= (intensity * redMultiplyer)
                data[i + 1] *= (intensity * greenMultiplyer)
                data[i + 2] *= (intensity * blueMultiplyer)

                //shadowMap[i + 3] = attenuationMultiplyer;

                data[i + 0] *= attenuationMultiplyer
                data[i + 1] *= attenuationMultiplyer
                data[i + 2] *= attenuationMultiplyer

                if (attenuationMultiplyer) {
                    minDistToLight = Math.min(distToLight, minDistToLight);
                    maxDistToLight = Math.max(distToLight, maxDistToLight);

                    lightDistances[i/4] = (distToLight);
                }
              }
              
        }
        
    }
    for (var i=0; i<l; i+=4) {
        if (data[i+3] && lightDistances[i/4]) {

            var lightAtten = 1-(lightDistances[i/4] - minDistToLight) / (maxDistToLight - minDistToLight);

            data[i + 0] *= lightAtten;
            data[i + 0] += 0.05 * 255;
            data[i + 1] *= lightAtten;
            data[i + 1] += 0.05 * 255;
            data[i + 2] *= lightAtten;
            data[i + 2] += 0.05 * 255;
        }
    }

    self.postMessage(data);

}, false );