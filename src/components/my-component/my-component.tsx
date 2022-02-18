import { Component, Element, h, Host } from '@stencil/core';
import maplibregl from 'maplibre-gl';
import { Deck } from '@deck.gl/core';
import { GeoJsonLayer, ArcLayer } from '@deck.gl/layers';

const AIR_PORTS =
    'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_airports.geojson';

const INITIAL_VIEW_STATE = {
    latitude: 51.47,
    longitude: 0.45,
    zoom: 4,
    bearing: 0,
    pitch: 30
};
@Component({
    tag: 'my-component',
    styleUrl: 'my-component.css',
    shadow: true,
})
export class MyComponent {
    @Element() el: HTMLElement;
    public map: maplibregl.Map;
    public deckMap: Deck;

    componentDidRender() {
        this.map = new maplibregl.Map({
            container: this.el.shadowRoot.getElementById('static-map-container'),
            style: 'https://demotiles.maplibre.org/style.json', // stylesheet location
            center: [-74.5, 40], // starting position [lng, lat]
            zoom: 9 // starting zoom});
        });
        this.deckMap = new Deck({
            canvas: this.el.shadowRoot.querySelector('#deck-canvas'),
            width: '100%',
            height: '100%',
            initialViewState: INITIAL_VIEW_STATE,
            controller: true,
            onViewStateChange: ({ viewState }) => {
                this.map.jumpTo({
                    center: [viewState.longitude, viewState.latitude],
                    zoom: viewState.zoom,
                    bearing: viewState.bearing,
                    pitch: viewState.pitch
                });
            },
            layers: [
                new GeoJsonLayer({
                    id: 'airports',
                    data: AIR_PORTS,
                    // Styles
                    filled: true,
                    pointRadiusMinPixels: 2,
                    pointRadiusScale: 2000,
                    getPointRadius: f => 11 - f.properties.scalerank,
                    getFillColor: [200, 0, 80, 180],
                    // Interactive props
                    pickable: true,
                    autoHighlight: true,
                    onClick: info =>
                        // eslint-disable-next-line
                        info.object && alert(`${info.object.properties.name} (${info.object.properties.abbrev})`)
                }),
                new ArcLayer({
                    id: 'arcs',
                    data: AIR_PORTS,
                    dataTransform: d => d.features.filter(f => f.properties.scalerank < 4),
                    // Styles
                    getSourcePosition: f => [-0.4531566, 51.4709959], // London
                    getTargetPosition: f => f.geometry.coordinates,
                    getSourceColor: [0, 128, 200],
                    getTargetColor: [200, 0, 80],
                    getWidth: 1
                })
            ]
        });
    }
    render() {
        return (
            <Host>
                <div id="static-map-container"></div>
                <canvas id="deck-canvas"></canvas>
            </Host>
        );
    }
}
