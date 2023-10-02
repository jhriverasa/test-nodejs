const fetch = require("node-fetch");
const {
  SWAPI_BASE_URL,
  SWAPI_PLANETS_RESOURCE,
  SWAPI_PEOPLE_RESOURCE,
  //SWAPI_PLANETS_COUNT,
  //SWAPI_PEOPLE_COUNT,
} = require("../../server/constants");

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

// Get single ID from URL
const getIdFromSWAPIId = (swapiURL) => {
  //This function transforms a url to ID, this is useful cause
  // Ids are returned from SWAPI in the following format:
  //{ SomeId: "https://swapi.dev/api/{RESOURCE}/{ID}/"}

  return swapiURL.slice(0, -1).split("/").pop();
};

// Gets Planet data from SWAPI and returns formatted data
const getPlanetDataFromSWAPI = async (planetId) => {
  const planetDataFromSWAPI = await genericRequest(
    SWAPI_BASE_URL + SWAPI_PLANETS_RESOURCE + `${planetId}/`
  );
  const name = planetDataFromSWAPI.name;
  const gravity = getFloatGravity(planetDataFromSWAPI.gravity);

  return { name, gravity };
};

// Gets People data from SWAPI and returns formatted data
const getPeopleDataFromSWAPI = async (peopleId) => {
  const peopleDataFromSWAPI = await genericRequest(
    SWAPI_BASE_URL + SWAPI_PEOPLE_RESOURCE + `${peopleId}/`
  );
  let {
    name,
    mass,
    height,
    homeworld_name,
    homeworld: homeworld_id,
  } = peopleDataFromSWAPI;

  name = name;
  mass = getIntMass(mass);
  height = getIntHeight(height);
  homeworld_name = homeworld_name;
  homeworld_id = getIdFromSWAPIId(homeworld_id);

  return { name, mass, height, homeworld_name, homeworld_id };
};

module.exports = {
  getWeightOnPlanet,
  genericRequest,
  getFloatGravity,
  getIntMass,
  getIntHeight,
  getIdFromSWAPIId,
  getPlanetDataFromSWAPI,
  getPeopleDataFromSWAPI,
};
