(function() {
    const lat = 13.80722;
    const lng = -89.17917;
    const mapa = L.map('mapa').setView([lat, lng ], 13);
    let marker; 
    
    //Utilizar Provider y Geocoder 
    const geocodeService = L.esri.Geocoding.geocodeService();

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapa);

    // El pin 
    marker = new L.marker([lat, lng], {
        draggable: true,
        autoPan: true
    })
    .addTo(mapa)
    caches
    
    //detectar el movimiento del pin para lat y lng 
    marker.on('moveend', (e) =>{
        marker = e.target
        //Tomar los datos y guardarlos en la variable posicion 
        const posicion = marker.getLatLng();
        //Centrar el mapa con el pin, tomando los datos de posición
        mapa.panTo(new L.LatLng(posicion.lat, posicion.lng))

        //Obtener información de las calles al soltar el pin 
        geocodeService.reverse().latlng(posicion, 13).run((err,resul) =>{
            console.log(resul);
            marker.bindPopup(resul.address.LongLabel)
        })
    })

})()