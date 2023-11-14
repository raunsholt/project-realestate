// buildingText.js
export function generateBuildingText(buildingData, nearbyPlaces) {
  let insideArea = buildingData[0].BEBO_ARL;
  let rooms = buildingData[0].VAERELSE_ANT;
  let bathrooms = buildingData[0].AntBadevaerelser;
  let toilets = buildingData[0].AntVandskylToilleter;
  let build = buildingData[0].bygning.OPFOERELSE_AAR;
  let reBuild = buildingData[0].bygning.OMBYG_AAR;
  let heating = buildingData[0].bygning.VARMEINSTAL_KODE;
  let use = buildingData[0].ENH_ANVEND_KODE;
  let wall = buildingData[0].bygning.YDERVAEG_KODE;
  let roof = buildingData[0].bygning.TAG_KODE;

  let roofTypes = {
    "1": "Fladt tag",
    "2": "Tagpap",
    "3": "Fibercement",
    "4": "Cementsten",
    "5": "Tegl",
    "6": "Metalplader",
    "7": "Stråtag",
    "10": "Fibercement",
    "11": "PVC",
    "12": "Glas"
  };

  let wallTypes = {
    "1": "Mursten",
    "2": "Letbeton",
    "3": "Fibercement",
    "4": "Bindingsværk",
    "5": "Træbeklædning",
    "6": "Betonelementer",
    "8": "Metalplader",
    "10": "Fibercement",
    "11": "PVC",
    "12": "Glas"
  };

  let useTypes = {
    "110": "Stuehus til landbrugsejendom",
    "120": "Parcelhus",
    "130": "Rækkehus",
    "140": "Lejlighed",
    "510": "Sommerhus",
    "540": "Kolonihave"
  };

  let heatingTypes = {
    "1": "Fjernvarme",
    "2": "Centralvarme",
    "3": "Ovne",
    "5": "Varmepumpe",
    "6": "Centralvarme med to fyringsenheder",
    "7": "Elovne",
    "8": "Gasradiatorer",
    "9": "Ingen varmeinstallationer"
  };

  let buildingText = "";

  if (use !== null && useTypes.hasOwnProperty(use)) {
    use = useTypes[use];
    buildingText += "Boligtype: " + use + "\n";
  }

  if (insideArea !== null) {
    buildingText += "Boligareal: " + insideArea + "\n";
  }

  if (rooms !== null) {
    if (rooms <= 2) {
      buildingText += "Værelser i alt: " + rooms + "\n";
    } else {
      rooms = rooms - 1;
      buildingText += "Stue: 1" + "\n" + "Værelser: " + rooms + "\n";
    }
  }

  if (bathrooms !== null) {
    buildingText += "Badeværelser: " + bathrooms + "\n";
  }

  if (toilets !== null && toilets > bathrooms) {
    toilets = toilets - bathrooms;
    buildingText += "Toiletter: " + toilets + "\n";
  }

  if (build !== null) {
    buildingText += "Byggeår: " + build + "\n";
  }

  if (reBuild !== null && reBuild !== 0) {
    buildingText += "Ombygget: " + reBuild + "\n";
  }

  if (roof !== null && roofTypes.hasOwnProperty(roof)) {
    roof = roofTypes[roof];
    buildingText += "Tag: " + roof + "\n";
  }

  if (wall !== null && wallTypes.hasOwnProperty(wall)) {
    wall = wallTypes[wall];
    buildingText += "Ydervægge: " + wall + "\n";
  }

  if (heating !== null && heatingTypes.hasOwnProperty(heating)) {
    heating = heatingTypes[heating];
    buildingText += "Varme: " + heating + "\n";
  }

  if (nearbyPlaces) {
    buildingText += "\n" + "Nærområdet" + "\n";
}

if (nearbyPlaces) {
  for (const [type, placeInfo] of Object.entries(nearbyPlaces)) {
      buildingText += `${type}: ${placeInfo}\n`;
  }
}

  return buildingText;
}
