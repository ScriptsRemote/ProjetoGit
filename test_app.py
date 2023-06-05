import streamlit as st
import plotly.express as px
import pandas as pd

# Carrega os dados do CSV
df = pd.read_csv('dados.csv')

# Define os estados disponíveis no arquivo CSV
estados_disponiveis = df['Estado'].unique()

# Define os meses disponíveis no ano de 2023
meses_disponiveis = pd.date_range(start='2023-01-01', end='2023-12-31', freq='M').strftime('%b')

# Layout da aplicação
st.title('Dashboard de Dados')

# Gráfico de Temperatura
st.header('Gráfico de Temperatura')
estado = st.selectbox('Selecione um estado', estados_disponiveis)
data_temperatura = df[df['Estado'] == estado]
fig_temperatura = px.line(data_temperatura, x='Data', y='Temperatura', title='Temperatura por Data', symbol='Temperatura')
st.plotly_chart(fig_temperatura)

# Gráfico de NDVI
st.header('Gráfico de NDVI')
mes = st.selectbox('Selecione um mês', meses_disponiveis)
data_ndvi = df[df['Data'].str.startswith(mes)]
fig_ndvi = px.line(data_ndvi, x='Data', y='NDVI', title='NDVI por Data', symbol='NDVI')
st.plotly_chart(fig_ndvi)

