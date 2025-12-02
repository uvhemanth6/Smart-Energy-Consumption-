# Smart Energy Consumption Prediction

## Objective
The goal of this project is to predict energy consumption for buildings based on submeter readings and weather data. We aim to build a robust machine learning pipeline that not only predicts future consumption but also classifies it as High, Normal, or Low to provide actionable insights for energy management.

## Dataset
The project uses two main datasets:
1.  **Building Submeter Consumption**: Contains power readings (current, voltage, power, power factor) and consumption data.
2.  **Weather Data**: Contains weather metrics like temperature, humidity, and wind speed.
links: https://www.kaggle.com/datasets/pythonafroz/solar-power-generation-and-energy-consumption-data


## Pipeline Steps
1.  **Data Loading**: Load and inspect raw CSV files.
2.  **Preprocessing**: 
    - Convert timestamps to datetime objects.
    - Merge datasets on `timestamp` and `campus_id`.
    - Handle missing values.
    - Extract temporal features (hour, day, month).
3.  **Visualization**: Analyze distributions and correlations.
4.  **Modeling**: Train Linear Regression, Decision Tree, and Random Forest models.
5.  **Optimization**: Tune Hyperparameters for the Random Forest model using GridSearchCV.
6.  **Evaluation**: Compare models using R² and RMSE; visualize feature importance.
7.  **Usage Classification**: Logic to classify current usage against historical averages.

## How to Run
1.  Ensure `building_submeter_consumption.csv` and `weather_data.csv` are in the `data/` directory.
2.  Open `notebooks/smart_energy_full_pipeline.ipynb`.
3.  Run all cells to execute the pipeline.
