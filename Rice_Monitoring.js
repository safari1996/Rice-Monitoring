

var roi = ee.FeatureCollection('FAO/GAUL_SIMPLIFIED_500m/2015/level1')
  .filter(ee.Filter.eq('ADM1_NAME', 'Niigata'));
  
// Center the map on the ROI
Map.centerObject(roi, 8);

// Add the ROI as a layer to the map
Map.addLayer(roi, {color: 'FF0000'}, 'Niigata Province, Japan ROI');


//Date
var startDate = ee.Date('2019-01-01');
var endDate =  ee.Date('2020-12-31');

// Create image collection of S-2 imagery for the perdiod 2019-2020
var S2 = ee.ImageCollection('COPERNICUS/S2')
         //filter start and end date
         .filter(ee.Filter.date(startDate, endDate))
         .filterMetadata('CLOUDY_PIXEL_PERCENTAGE', 'less_than',100)
         //filter according to drawn boundary
         .filterBounds(roi)


print(S2.limit(10))
print(S2.aggregate_array('SPACECRAFT_NAME'))
// Function to calculate and add an NDVI band
var addNDVI = function(image) {
 return image.addBands(image.normalizedDifference(['B8', 'B4'] )); //'B8', 'B4'
};  
  
// Add NDVI band to image collection
var S2 = S2.map(addNDVI).select(['nd']);
print('S2',S2.limit(10)) ;
var NDVI=S2.select('nd');

// For month
var month = 1;

// Calculating number of intervals
var months = endDate.difference(startDate,'month').divide(month).toInt();
// Generating a sequence 
var sequence = ee.List.sequence(0, months); 
print(sequence)

var sequence_s1 = sequence.map(function(num){
    num = ee.Number(num);
    var Start_interval = startDate.advance(num.multiply(month), 'month');
  
    var End_interval = startDate.advance(num.add(1).multiply(month), 'month');
    var subset = NDVI.filterDate(Start_interval,End_interval);
    return subset.max().set('system:time_start',Start_interval);
});

print('sequence_s1',sequence_s1)
var byMonthYear = ee.ImageCollection.fromImages(sequence_s1);

print('byMonthYear',byMonthYear)
var multibandNDVI = byMonthYear.toBands().clip(roi);
print('multiband',multibandNDVI);



var bandsName=['2019-01','2019-02','2019-03','2019-04','2019-05','2019-06',
               '2019-07','2019-08','2019-09','2019-10','2019-11','2019-12',
               '2020-01','2020-02','2020-03','2020-04','2020-05','2020-06',
               '2020-07','2020-08','2020-09','2020-10','2020-11','2020-12']

var multiband1_ndvi = multibandNDVI.rename(bandsName).clip(roi);//(monList)//
//

//s1
var sentinel1_vh = ee.ImageCollection('COPERNICUS/S1_GRD')
  .filter(ee.Filter.listContains('transmitterReceiverPolarisation', 'VH'))
  .select('VH')
  .filter(ee.Filter.eq('instrumentMode', 'IW'))
  .filter(ee.Filter.eq('resolution_meters', 10))
  .filter(ee.Filter.date(startDate, endDate))
  .filter(ee.Filter.bounds(roi))

print('s1',sentinel1_vh);

// For month
var month = 1;

// Calculating number of intervals
var months = endDate.difference(startDate,'month').divide(month).toInt();
// Generating a sequence 
var sequence = ee.List.sequence(0, months); 
print(sequence)

var sequence_s1 = sequence.map(function(num){
    num = ee.Number(num);
    var Start_interval = startDate.advance(num.multiply(month), 'month');
  
    var End_interval = startDate.advance(num.add(1).multiply(month), 'month');
    var subset = sentinel1_vh.filterDate(Start_interval,End_interval);
    return subset.median().set('system:time_start',Start_interval);
});

print('sequence_s1',sequence_s1)
var byMonthYearS1 = ee.ImageCollection.fromImages(sequence_s1);
var multibands1 = byMonthYearS1.toBands().clip(roi);



var multibands1 = multibands1.rename(bandsName).clip(roi);//.rename(monLists1).clip(roi);//


//combined s1 and s2
var combinedband=multiband1_ndvi.addBands(multibands1);
print('combinedband',combinedband);





var training = combinedband.sample({
  region: roi,
  scale: 10,
  numPixels: 3000,
  tileScale:8,
 // geometries:true
  
});

//Map.addLayer(training,{},'points')
var clusterer = ee.Clusterer.wekaKMeans(20).train({
  features:training
  
});

// Cluster the input using the trained clusterer.
var result_cluster =combinedband.cluster(clusterer).byte();//combands
// print('result_s2',result_s2)
var clusters = [0, 1, 2, 3, 4,5,6,7,8,9,
10,11,12,13,14,15,16,17,18,19,
20,21,22,23,24,25,26,27,28,29];


var values0 =   [1, 2, 3, 4,5,
                 6,7,8,9,10,
                 11,12,13,14,15,
                 16,17,18,19,20,
                 21,22,23,24,25,26,27,28,29,30];
                 
var values1 =   [0, 0, 0, 1,0,
                1,0,1,0,0,
                0,0,1,0,0,
                1,1,0,0,0,
                0,0,0,0,0,
                0,0,0,0,0];
/*                
var values1 =   [0, 0, 0, 0,1,
                0,1,0,1,0,
                0,0,0,1,0,
                0,1,1,0,0,
                0,0,0,0,0,
                0,0,0,0,0];                
 */               
var values2 =    [0, 0, 0, 2,0,
                3,0,4,0,0,
                0,0,1,0,0,
                2,3,0,0,0,
                0,0,0,4,0,
                0,0,0,0,0];
/*                
var values2 =    [0, 0, 0, 0, 2,0,
                3,0,4,0,0,
                0,0,1,0,0,
                2,3,0,0,0,
                0,0,0,4,0,
                0,0,0,0];
 */               
                

//var result_cluster = result_cluster.remap(clusters,values0);
var remapped_cluster = result_cluster.rename('remapped');// .remap(clusters, values0).byte().clip(roi);//.updateMask(slope.lt(slope_th))
var remapped_cluster1=remapped_cluster.remap(values0,values1);
var remapped_cluster1=remapped_cluster1.updateMask(remapped_cluster1);
var remapped_cluster2=remapped_cluster.remap(values0,values2).updateMask(remapped_cluster1);
//




///
var comb_ndvi_cluster=multiband1_ndvi.addBands(remapped_cluster);
print("comb_ndvi_cluster",comb_ndvi_cluster);
// Define chart customization options.
var options = {
  lineWidth: 1,
  pointSize: 2,
  hAxis: {title: 'Year-Month'},
  vAxis: {title: 'NDVI'},
  title: 'Sentinel-2 NDVI spectra in classified regions'
};

// Make the chart, set the options.
var chart_class_ndvi = ui.Chart.image.byClass(
    comb_ndvi_cluster, 'remapped', roi, ee.Reducer.median(), 500)//, classNames, wavelengths)
    .setOptions(options)
    .setChartType('ScatterChart');

// Print the chart.
//print(chart_class_ndvi);

//
var comb_vh_cluster=multibands1.addBands(remapped_cluster);
print("comb_vh_cluster",comb_vh_cluster);
// Define chart customization options.
var options = {
  lineWidth: 1,
  pointSize: 2,
  hAxis: {title: 'Year-Month'},
  vAxis: {title: 'VH'},
  title: 'Senetinel-1 VH spectra in classified regions'
};

// Make the chart, set the options.
var chart_class_vh = ui.Chart.image.byClass(
    comb_vh_cluster, 'remapped', roi, ee.Reducer.median(), 500)//, classNames, wavelengths)
    .setOptions(options)
    .setChartType('ScatterChart');

// Print the chart.
//print(chart_class_vh);




Map.addLayer(multiband1_ndvi ,  {min: 0.2, max: 0.8}, 'NDVI',0);
Map.addLayer(multibands1 ,  {min: -25, max: -10}, 'VH',0);

Map.addLayer(remapped_cluster.randomVisualizer(), {}, 're_groups_s2',0);
Map.addLayer(remapped_cluster1, {min:1,max:1,palette:['white','red']}, 'binary_rice',1);
Map.addLayer(remapped_cluster2.randomVisualizer(), {}, 'pattern_rice',1);  
 
 
 
 ///
 ///

// Create a panel next to the map
var panel = ui.Panel({style:{width: '550px'}});
ui.root.add(panel);

 // value: 'SENTINEL-2 NDVI & SENTINEL-1 VH Explorer',
 var label1 = ui.Label({
  value: 'SENTINEL-2 NDVI & SENTINEL-1 VH Explorer: Paddy Clustering',
   style: {
    //fontSize: '20px',
    color: 'white',
    backgroundColor :'blue',
   // border: '1px solid black',
   // fontWeight: 'bold',
    padding: '5px',
   margin: '12px 0px 0px 8px', fontWeight: 'bold', fontSize: '14px', border: '1px solid black', 
   padding: '5px 5px 5px 5px',
  }
//  style: {
 //   fontSize: '16px',
 //   color: 'red',
   // fontWeight: 'bold',
  //  padding: '5px',
 // }
});


 var label2 = ui.Label({
  value: 'Rice Monitoring',
  style: {
    fontSize: '16px',
    color: 'red',
   // fontWeight: 'bold',
    padding: '5px',
  }
});


var affiliationLabel= ui.Label('Instructions',{fontWeight: 'bold',padding: '3px',});
var affiliation= ui.Label(
  "Program of Crop Science\n"
  , {whiteSpace:'pre',padding: '5px',fontSize: '16px',
    color: 'red',
   // fontWeight: 'bold',
    }
  
);


var affiliationPanel = ui.Panel([affiliationLabel,affiliation]);
var affiliationPanel = ui.Panel([affiliation]);


 
 panel.add(label1);
 panel.add(label2);
 panel.add(affiliationPanel);
 panel.add(chart_class_ndvi);
 panel.add(chart_class_vh);
 
  




