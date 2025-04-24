## 🌾 Rice Field Monitoring in Niigata, Japan Using Google Earth Engine
This repository provides a Google Earth Engine (GEE) script for rice field monitoring and classification in Niigata, Japan, using a combination of Sentinel-2 NDVI and Sentinel-1 VH backscatter data from 2019 to 2020.

## 📌 Project Overview
The project performs time-series analysis and clustering of satellite-derived vegetation and radar signals to:

Analyze monthly NDVI and VH trends over two years

Classify paddy fields using unsupervised K-Means clustering

Visualize rice patterns and binary maps for rice field identification

## 🛰️ Data Sources
Sentinel-2: NDVI (B8, B4)

Sentinel-1 (VH): Radar backscatter

FAO GAUL: Niigata administrative boundary

## 🔍 Methodology
Preprocess S1 and S2 image collections (monthly aggregation)

Calculate multi-band NDVI and VH time-series

Apply Weka K-Means clustering to identify rice field patterns

Generate binary maps and rice growth stage maps

Display results with custom charts and a GEE UI dashboard

## 📊 Outputs
NDVI & VH charts grouped by clusters

Cluster maps: raw, binary rice presence, growth pattern categories

Interactive UI for visualization and interpretation

## 📂 Repository Structure
bash
Copy
Edit
📁 /scripts
 └── Rice_Monitoring.js        # Main GEE script

📄 README.md                   # Project description and usage
## 🚀 How to Use
Open the script in the GEE Code Editor

Modify time range or region as needed

Run the script to visualize cluster maps and NDVI/VH trends

## 📜 License
Open for research and educational use.
Please cite the script if used in academic work.
