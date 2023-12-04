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
        [[[-51.272043422728736, -29.67307148140548],
          [-51.272043422728736, -30.25010343903321],
          [-50.39451046374436, -30.25010343903321],
          [-50.39451046374436, -29.67307148140548]]], null, false);
/***** End of imports. If edited, may not auto-convert in the playground. *****/
// Classificação de uso do solo a partir do MapBiomas
// https://brasil.mapbiomas.org/wp-content/uploads/sites/4/2023/08/Legenda-Colecao-8-LEGEND-CODE.pdf
// Neste exemplo, o foco é na separação da malha de área urbana do mapbiomas.

// Em resumo, este código:

// Carrega e processa dados do MapBiomas, focando na classe de uso do solo "área urbana".
// Define uma região de interesse.
// Cria uma coleção de imagens, mostrando a evolução da área urbana ao longo dos anos.
// Visualiza essa evolução em forma de GIF, adicionando texto e fundo das imagens do Sentinel-2.
// Exporta a animação para o Google Drive.

// Collection 8.0 até 2022
// Define o caminho para a coleção MapBiomas.
var mapbiomas = 'projects/mapbiomas-workspace/public/collection8/mapbiomas_collection80_integration_v1'
 
// Carrega a imagem da coleção MapBiomas.
var mapbiomas = ee.Image(mapbiomas)
print('Dado mapbiomas', mapbiomas)

// // Obtém os nomes das bandas da imagem.
var bands = mapbiomas.bandNames()
// // Converte os nomes das bandas em uma lista.
var mylist = ee.List(bands)
print('lista',mylist)
print('Banda 0',ee.String(ee.List(mapbiomas.bandNames()).get(0)))

// // Seleciona as bandas de interesse.
var mylist = ee.List(bands).slice(0,38,1);
// print('lista de bandas pos slice', mylist)
var mapbiomas = mapbiomas.select(mylist)
// // Define a paleta de cores para visualização.
var palettes = require('users/mapbiomas/modules:Palettes.js').get('classification8');
var vis = {
  palette: palettes,
  min: 0,
  max: 62
}
print('Paleta de cores',palettes)

// // Seleciona a banda de classificação de uso do solo para o ano de 2022.
var lulc = mapbiomas.select('classification_2022')
// Adiciona esta banda ao Mapa para visualização.
Map.addLayer(lulc, vis, 'Uso 2022', false)

// var lulc_1985 = mapbiomas.select('classification_1985')
// // Adiciona esta banda ao Mapa para visualização.
// Map.addLayer(lulc_1985, vis, 'Uso 1985', false)

// // Define a região de interesse (ROI).
var roi = ee.FeatureCollection('users/scriptsremoteambgeo/Bacias_RS_SEMA')
          .filter(ee.Filter.eq('Nome','GRAVATAI'))

// // Recorta a imagem pela região de interesse.
var mapbiomas_clip = lulc.clip(roi)
var mapbiomas_85 = mapbiomas.select('classification_1985').clip(roi)
// // Adiciona a imagem recortada ao mapa.
Map.addLayer(mapbiomas_85, vis, 'Uso 1985')
Map.addLayer(mapbiomas_clip, vis, 'Uso 2022')
Map.centerObject(roi, 10)

// // //////////////////////////////////////////////Loop collection////////////////////////////////////////////////////
// //Criando uma coleção sem saber os caminho mais fácil...

// // // Loop para criar uma coleção de imagens a partir das bandas do Mapbiomas.

// // Define listas de sequência numérica e anos.
var list = ee.List.sequence(0, 37, 1)
var years = ee.List.sequence(1985, 2022, 1)
print(years)

// // Função para processar cada banda, selecionando apenas a 
    // classe de interesse (área urbana) e definindo metadados.
var listImages = list.map(function(number) {
  var matchKey = ee.String(ee.List(mapbiomas.bandNames()).get(number))
  var image = ee.Image(mapbiomas).select(matchKey).eq(24).selfMask();
  
  return image.set('year', years.get(number))
              .set('data', matchKey.slice(-4))
              .set('system:time_start', ee.Date.fromYMD(years.get(number), 1, 1)).clip(roi)
});

print('lista de imagens', listImages)

// // // Cria uma coleção de imagens a partir da lista processada.
var imageCollection = ee.ImageCollection.fromImages(listImages)
print('Coleção de imagens', imageCollection)

// // /***********************************************Gif*********************************************/
var region = geometry
// // Carrega a coleção de imagens harmonizadas do Sentinel-2.
var collection = ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")

// // Filtra a coleção com base na data, região de interesse e porcentagem de nuvens.
var img = collection.filterDate('2022-01-01', '2023-09-11')
                    .filterBounds(roi)
                    .filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 1))
                    .sort('CLOUDY_PIXEL_PERCENTAGE')
                    .median()
                    .clip(roi)
                    
// // /********************************INSERINDO LEGENDA********************/
// // Importa módulos para criação de texto e estilo.
var text = require('users/gena/packages:text') 
var style = require('users/gena/packages:style')
var scale = 100 // TODO: compute scale from region width / 600 instead of fixing
// Define propriedades para a inserção de texto na imagem.
var textProperties = { fontSize: 32, textColor: 'ffffff' } //pode mudar a cor da fonte

// // Define locais de inserção de texto na imagem.
var pt = text.getLocation(region, 'right', '2%', '25%');
var titulo = text.getLocation(region, 'left', '2%', '2%')
var autor_titulo = text.getLocation(region, 'right', '80%', '35%') 

// Função para visualizar as imagens da coleção, adicionar texto e combinar imagens.
var collection_vis = imageCollection.map(function(image) {
  // Propriedades para a visualização do texto.
  var textVis = {
    fontType: 'Arial',
    fontSize: 32,
    textColor: 'ffffff',
    outlineColor: '000000',
    outlineWidth: 2.5,
    outlineOpacity: 0.6
  };
  
  // Adiciona texto às imagens.
  var label = text.draw(image.get('data'), pt, scale, textVis) //armazenando o ANO
  var Titulo = text.draw('Evolucao da Area Urbana na Bacia do rio Gravatai', titulo, scale, textVis)
  var Autor = text.draw('Autor: Fabiana', autor_titulo, scale, textVis)

  // Visualiza a imagem de fundo e a classe de interesse.
  var urban = image.visualize({palette: ['Crimson']})
  var background = img.visualize({'bands': ['B4', 'B3', 'B2'], 'min': 155, 'max': 2540, 'gamma': 1.65})
  
  // Combina as imagens e textos.
  return background.blend(urban).blend(label).blend(Titulo).blend(Autor);
});

// // Define a região para visualização.
var limite = img.geometry().bounds()

// // Define parâmetros de visualização.
var params = {
  region: region,
  dimensions: '800',
  framesPerSecond: 5
};

// // Cria uma animação (GIF) para visualização.
var animation = ui.Thumbnail({
  image: collection_vis,
  params: params,
  style: {position: 'top-center'}
});

print(animation);

// Exporta a animação para o Google Drive.
Export.video.toDrive({
  collection: collection_vis,
  description: 'Area_urbana',
  folder: 'Mentoria',
  fileNamePrefix: 'Area_urbana',
  framesPerSecond: 5,
  dimensions: 720,
  region: region,
  crs: 'EPSG:3857'
})
