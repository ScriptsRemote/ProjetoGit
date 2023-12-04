/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = 
    /* color: #d63000 */
    /* shown: false */
    /* displayProperties: [
      {
        "type": "rectangle"
      }
    ] */
    ee.Geometry.Polygon(
        [[[-48.15844987358101, -15.695447803408827],
          [-48.15844987358101, -15.908192006742908],
          [-47.77667497123726, -15.908192006742908],
          [-47.77667497123726, -15.695447803408827]]], null, false),
    Vis = {"opacity":1,"bands":["SR_B4","SR_B3","SR_B2"],"min":8319,"max":13772,"gamma":1},
    vis2 = {"opacity":1,"bands":["ndvi"],"min":-0.034923337399959564,"max":0.40863341093063354,"palette":["ff5700","e7ff4a","00ff28"]};
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// //Como realizar a leitura de erros comuns

// //Clip em coleção
// var collection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
//                     .clip(geometry)
                    
//Solução 
// Função para recortar cada imagem na coleção
var clipFunction = function(image) {
  return image.clip(geometry);
};

// Clip em coleção
var collection = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                    .map(clipFunction)
                    .select('SR_B.*');

Map.addLayer(collection,Vis, 'RGB')                   

function ndvi(image){
  var indice = image.normalizedDifference(['SR_B5','SR_B4']).rename('ndvi')
  return image.addBands([indice])
}

//Aplicar funções em imagem
var cole_2 = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                    .map(clipFunction)
                    // .first();

var map_teste = cole_2.map(ndvi).select('ndvi')

Map.addLayer(map_teste, vis2, 'ndvi')
