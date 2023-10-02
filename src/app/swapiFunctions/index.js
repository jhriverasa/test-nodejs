const fetch = require("node-fetch");

//* GIVEN FUNCTIONS *//

// Computes weight of some person based on his/her mass and gravity in some planet
const getWeightOnPlanet = (mass, gravity) => {
  return mass * gravity;
};

// node-fetch wrapper
const genericRequest = async (url, method, body, logging = false) => {
  let options = {
    method: method,
  };
  if (body) {
    options.body = body;
  }
  const response = await fetch(url, options);
  const data = await response.json();
  if (logging) {
    console.log(data);
  }
  return data;
};

//* ADITIONAL FUNCTIONS *//

//Get a standardized (Float) version of gravity from SWAPI.
//-1.0 if gravity is unknown
const getFloatGravity = (gravityFromSWAPI) => {
  /* According to SWAPI there are a total of 60 planets,
       their gravity follow different formats:
      - "unknown"
      - "N/A"
      - "1 standard"
      - "1.1"
      - "1.5 (surface), 1 standard (Cloud City)"
    */
  let standardizedGravity;
  switch (gravityFromSWAPI) {
    case "unknown":
      standardizedGravity = -1.0;
      break;
    case "N/A":
      standardizedGravity = -1.0;
      break;
    case "1.5 (surface), 1 standard (Cloud City)":
      // only one planet has this format, so we can decide to pick one or another (surface/cloud city).
      standardizedGravity = 1;
      break;
    default:
      // At this point we have two possibilities a float number as string
      // like "2.5" or the number + space + "standard"
      const nAsString = gravityFromSWAPI.split(" ")[0];
      standardizedGravity = parseFloat(nAsString);
      break;
  }

  return standardizedGravity;
};

//Get a standardized (Int) version of mass from SWAPI.
//-1 if mass is unknown
const getIntMass = (massFromSWAPI) => {
  /* According to SWAPI there are a total of 82 people,
       their mass follow different formats:
      - "77" -> 77kg
      - "unknown"
      - "1,358" -> 1358kg
      - "78.2" -> 78.2kg
    */
  let standardizedMass;
  if (massFromSWAPI === "unknown") {
    standardizedMass = -1;
  } else {
    standardizedMass = parseInt(massFromSWAPI.replace(",", ""));
  }

  return standardizedMass;
};

//Get a standardized (Int) version of height from SWAPI.
//-1 if height is unknown
const getIntHeight = (heightFromSWAPI) => {
  // Since height data contains a couple of "unknown" values can also be standardized to int
  // using the getIntMass function
  return getIntMass(heightFromSWAPI);
};

module.exports = {
  getWeightOnPlanet,
  genericRequest,
  getFloatGravity,
  getIntMass,
  getIntHeight,
};
