# Run this app with `python app.py` and
# visit http://127.0.0.1:8050/ in your web browser.

# Run this app with `python app.py` and
# visit http://127.0.0.1:8050/ in your web browser.

from dash import Dash
import dash.html as html
import dash.dcc as dcc
from dash.dependencies import Input, Output
import plotly.express as px
import pandas as pd

# Carrega os dados do CSV
df = pd.read_csv('dados.csv')

# Cria a aplicação Dash
app = Dash(__name__)

# Define os estados disponíveis no arquivo CSV
estados_disponiveis = df['Estado'].unique()

# Define os meses disponíveis no ano de 2023
meses_disponiveis = pd.date_range(start='2023-01-01', end='2023-12-31', freq='M').strftime('%b')

# Layout da aplicação
app.layout = html.Div([
    html.H1('Dashboard de Dados'),
    html.Div([
        html.Div([
            html.H3('Gráfico de Temperatura'),
            dcc.Dropdown(
                id='estado-dropdown',
                options=[{'label': estado, 'value': estado} for estado in estados_disponiveis],
                value=estados_disponiveis[0]
            ),
            dcc.Graph(id='temperatura-graph')
        ], className='six columns'),

        html.Div([
            html.H3('Gráfico de NDVI'),
            dcc.Dropdown(
                id='mes-dropdown',
                options=[{'label': mes, 'value': mes} for mes in meses_disponiveis],
                value=meses_disponiveis[0]
            ),
            dcc.Graph(id='ndvi-graph')
        ], className='six columns')
    ], className='row')
])

# Callback para atualizar o gráfico de temperatura
@app.callback(
    Output('temperatura-graph', 'figure'),
    [Input('estado-dropdown', 'value')]
)
def update_temperatura_graph(estado):
    data = df[df['Estado'] == estado]
    fig = px.line(data, x='Data', y='Temperatura', title='Temperatura por Data', symbol='Temperatura')
    return fig

# Callback para atualizar o gráfico de NDVI
@app.callback(
    Output('ndvi-graph', 'figure'),
    [Input('mes-dropdown', 'value')]
)
def update_ndvi_graph(mes):
    data = df[df['Data'].str.startswith(mes)]
    fig = px.line(data, x='Data', y='NDVI', title='NDVI por Data', symbol='NDVI')
    return fig

if __name__ == '__main__':
    app.run_server(debug=True)
