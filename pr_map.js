
function PRObj(map, time, url, lat, lon) {

    // params
    
    this.map = map;
    this.time = time;
    this.url = url;
    this.lat = lat;
    this.lon = lon;

    // create marker
    this.marker = new daum.maps.Marker({
        position: new daum.maps.LatLng(this.lat, this.lon)
    });
    this.marker.setMap(this.map);

}

function PRObjList(pmap) {
    var map = pmap;
    var list = [];

    this.route_path = [new daum.maps.LatLng(37.000000, 127.3400000),
    new daum.maps.LatLng(37.003120, 127.3400200),
    new daum.maps.LatLng(37.003210, 127.3400300),  
    ];

    function update_route_path() {
        this.routh_path = [];
        for (var i = 0; i < list.length; i++) {
            this.routh_path.push(new daum.maps.LatLng(list[i].lat, list[i].lon));
        }        
    }

    function add_to_list(obj) {
        for (var i = 0; i < list.length; i++) {
            if (obj.time < list[i].time) {
                list.insert(i, obj);
                break;
            }
        }

        update_route_path();
    };

    this.add = function(time, url, lat, lon) {
        var nobj = new PRObj(map, time, url, lat, lon);
        add_to_list(nobj);
    };
}

function PRMapDrawer(div, lat, lon, level) {

    // function dms to num
    this.dms_to_num = function(dms) {
        var num = dms[0].numerator + dms[1].numerator / (60 * dms[1].denominator) + dms[2].numerator / (3600 * dms[2].denominator);
        return num;
    };

    this.exif_date_to_js_date = function(time) {
        var dt = time.split(' ');
        var dp = dt[0].split(':');
        var tp = dt[1].split(':');

        return new Date(parseInt(dp[0]), parseInt(dp[1]), parseInt(dp[2]), parseInt(tp[0]), parseInt(tp[1]), parseInt(tp[2]));
    };

    // map div object
    var map_div = div;
    var def_map_options = {};
    if (lat && lon)
        def_map_options['center'] = new daum.maps.LatLng(lat, lon);
    if (level)
        def_map_options['level'] = level;

    // create daum map object
    var map = new daum.maps.Map(map_div, def_map_options); //지도 생성 및 객체 리턴

    // create pr obj list
    var pr_objs = new PRObjList(map);

    // current route map polyline
    var cur_route = new daum.maps.Polyline({
        map: this.map,
        path: pr_objs.route_path, // 선을 구성하는 좌표배열 입니다
        strokeWeight: 2, // 선의 두께 입니다
        strokeColor: '#FFAE00', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
    });


    this.addPhotoRoute = function(exif_time, url, latDMS, lonDMS) {

        if (exif_time && latDMS && lonDMS) {
            pr_objs.add(this.exif_date_to_js_date(exif_time), url, this.dms_to_num(latDMS), this.dms_to_num(lonDMS));
        }
        else {
            alert('invalid photo exif - time or lat/lon');
        }

        cur_route.setPath(pr_objs.route_path);
        cur_route.setMap(map);
    };

    this.mapPanTo = function(latDMS, lonDMS) {
        map.panTo(new daum.maps.LatLng(this.dms_to_num(latDMS), this.dms_to_num(lonDMS)));
    };

    // map event handlers - click
    //daum.maps.event.addListener(map, 'click', function(mouseEvent) {
    //    var latlng = mouseEvent.latLng;
    //    add_route(latlng);
    //});

    
}
