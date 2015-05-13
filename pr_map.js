
function PRObj(url, time, lat, lon) {

}

function PRObjList(pmap) {
    var map = pmap;

    this.add = function(time, url, lon, lat) {
        
    };
    
}

function PRMapDrawer(div, lat, lon, level) {

    // map div object
    var map_div = div;
    var def_map_options = {};
    if (lat && lon)
        def_map_options['center'] = new daum.maps.LatLng(lat, lon);
    if (level)
        def_map_options['level'] = level;

    // create daum map object
    var map = new daum.maps.Map(map_div, def_map_options); //지도 생성 및 객체 리턴

    // current route pts
    var route_path = [];

    // current route map polyline
    var cur_route = new daum.maps.Polyline({
        map: this.map,
        path: this.route_path, // 선을 구성하는 좌표배열 입니다
        strokeWeight: 2, // 선의 두께 입니다
        strokeColor: '#FFAE00', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
    });


    // function add route position
    var add_route = function(latlng) {
        route_path.push(latlng);
        cur_route.setPath(route_path);
    };

    // function dms to num
    var dms_to_num = function(dms) {
        var num = dms[0].numerator + dms[1].numerator / (60 * dms[1].denominator) + dms[2].numerator / (3600 * dms[2].denominator);
        return num;
    };

    // public function addRouteLatLon
    this.addRouteLatLon = function(lat, lon) {
        var latlng = new daum.maps.LatLng(lat, lon);
        add_route(latlng);
    };

    // public function addRouteLatLonDMS
    this.addRouteLatLonDMS = function(latDMS, lonDMS) {
        var lat = dms_to_num(latDMS);
        var lon = dms_to_num(lonDMS);
        this.addRouteLatLon(lat, lon);
    };

    var pr_objs = new PRObjList(map);

    this.addPhotoRoute = function(time, url, latDMS, lonDMS) {
        pr_objs.add(time, url, latDMS, lonDMS);
    };



    // map event handlers - click
    //daum.maps.event.addListener(map, 'click', function(mouseEvent) {
    //    var latlng = mouseEvent.latLng;
    //    add_route(latlng);
    //});

    
}
