
function PRObj(map, time, url, lat, lon) {

    // params
    
    this.map = map;
    this.time = time;
    this.url = url;
    this.lat = lat;
    this.lon = lon;
    this.position = new daum.maps.LatLng(this.lat, this.lon);

    // create marker
    this.marker = new daum.maps.Marker({
        position: this.position
    });
    this.marker.setMap(this.map);

}

function PRObjList(pmap) {
    this.map = pmap;
    
    this.rList = new Array;

    this.getRoutePath = function() {
        var pathList = new Array;
        for (var i = 0; i < this.rList.length; i++) {
            console.log('add route path : ' + this.rList[i].time + ' / ' + this.rList[i].position);
            pathList.push(this.rList[i].position);
        }

        return pathList;
    }

    this.setRouteBounds = function() {
        var bounds = new daum.maps.LatLngBounds();
        for (var i = 0; i < this.rList.length; i++) {
            bounds.extend(this.rList[i].position);
        }
        this.map.setBounds(bounds);
    }

    this.add = function(time, url, lat, lon) {
        var nobj = new PRObj(this.map, time, url, lat, lon);

        var inserted = false;
        for (var i = 0; i < this.rList.length; i++) {
            if (nobj.time < this.rList[i].time) {
                this.rList.splice(i, 0, nobj);
                console.log('add new route on ' + i + ' count = ' + this.rList.length);
                inserted = true;
                break;
            }
        }

        if (!inserted) {
            this.rList.push(nobj);
            console.log('add new route on last (count = ' + this.rList.length);
        }
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
    this.map_div = div;
    var def_map_options = {};
    if (lat && lon)
        def_map_options['center'] = new daum.maps.LatLng(lat, lon);
    if (level)
        def_map_options['level'] = level;

    // create daum map object
    this.map = new daum.maps.Map(this.map_div, def_map_options); //지도 생성 및 객체 리턴

    // create pr obj list
    this.pr_objs = new PRObjList(this.map);

    // current route map polyline
    this.cur_route = new daum.maps.Polyline({
        map: this.map,
        path: this.pr_objs.getRoutePath(), // 선을 구성하는 좌표배열 입니다
        strokeWeight: 2, // 선의 두께 입니다
        strokeColor: '#FFAE00', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
    });


    this.addPhotoRoute = function(exif_time, url, latDMS, lonDMS) {

        if (exif_time && latDMS && lonDMS) {
            this.pr_objs.add(this.exif_date_to_js_date(exif_time), url, this.dms_to_num(latDMS), this.dms_to_num(lonDMS));
        }
        else {
            alert('invalid photo exif - time or lat/lon');
        }

        this.cur_route.setPath(this.pr_objs.getRoutePath());
        this.cur_route.setMap(this.map);
    };

    this.mapPanTo = function(latDMS, lonDMS) {
        this.map.panTo(new daum.maps.LatLng(this.dms_to_num(latDMS), this.dms_to_num(lonDMS)));
    };

    this.getRouteDistance = function() {
        return this.cur_route.getLength();
    };

    this.setRouteBounds = function() {
        this.pr_objs.setRouteBounds();
    }
    
    // map event handlers - click
    //daum.maps.event.addListener(map, 'click', function(mouseEvent) {
    //    var latlng = mouseEvent.latLng;
    //    add_route(latlng);
    //});

    
}
