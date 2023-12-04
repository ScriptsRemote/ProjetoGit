/**** Start of imports. If edited, may not auto-convert in the playground. ****/
var geometry = /* color: #98ff00 */ee.Geometry.Point([-34.914304297182845, -8.066895560459477]);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
//Compreender erros maiores sobre as coleções

//Seleciona a área
var roi = geometry
//Filtra os dados 
var col = ee.ImageCollection("LANDSAT/LC08/C02/T1_L2")
                        .filterBounds(roi)
                        .filterDate('2023-01-01','2023-09-01')
                        .filter(ee.Filter.lt('CLOUD_COVER',0.1))

//Leia o erro, você não tem imagens
Map.addLayer(col, {bands:['SR_B4','SR_B3','SR_B2'],min:0,max:1200},'Rgb')
// print(col.size())

var ndvi = col.first().normalizedDifference(['SR_B5','SR_B4']).rename('ndvi')
Map.addLayer(ndvi, {min: -1, max: 1, palette: ['red', 'white', 'green']}, 'NDVI');


