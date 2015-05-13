
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
    var map = new daum.maps.Map(map_div, def_map_options); //���� ���� �� ��ü ����

    // current route pts
    var route_path = [];

    // current route map polyline
    var cur_route = new daum.maps.Polyline({
        map: this.map,
        path: this.route_path, // ���� �����ϴ� ��ǥ�迭 �Դϴ�
        strokeWeight: 2, // ���� �β� �Դϴ�
        strokeColor: '#FFAE00', // ���� �����Դϴ�
        strokeOpacity: 1, // ���� ������ �Դϴ� 1���� 0 ������ ���̸� 0�� �������� �����մϴ�
        strokeStyle: 'solid' // ���� ��Ÿ���Դϴ�
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
