
function PRObj(drawer, time, url, lat, lon) {

    // params
    
    this.drawer = drawer;
    this.time = time;
    this.url = url;
    this.lat = lat;
    this.lon = lon;
    this.position = null;
    this.marker = null;

    this.set_position = function(new_pos) {
        this.position = new_pos;
        if (this.marker) {
            this.marker.setMap(null);
            this.marker = null;
        }

        this.marker = new google.maps.Marker({
            position: this.position,
            map: this.drawer.map,
        });
        this.marker.setMap(this.drawer.map);

        var obj = this;
    }

    this.update_marker_pos = function() {
        this.position = this.marker.getPosition();
        this.drawer.mapRefresh();
    }

    this.set_position({lat:this.lat, lng:this.lon});
}

function PRObjList(drawer) {
    this.drawer = drawer;
    
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
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0; i < this.rList.length; i++) {
            bounds.extend(this.rList[i].position);
        }
        this.drawer.map.fitBounds(bounds);
    }

    this.getTimeSpan = function() {
        if (this.rList && this.rList.length > 0) {
            var st = this.rList[0].time.getTime();
            var ed = this.rList[this.rList.length - 1].time.getTime();
            return (ed - st);
        }

        return new Date(0);
    }

    this.add = function(time, url, lat, lon) {
        var nobj = new PRObj(this.drawer, time, url, lat, lon);

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
    }


    this.filterRoutePos = function(f_times) {

        if (this.rList.length < 3)
            return;

        for (var i = 0; i <= (this.rList.length - 3); i++) {

            var p1 = this.rList[i];
            var p2 = this.rList[i + 1];
            var p3 = this.rList[i + 2];

            var pl1 = new google.maps.Polyline({ path: [p1.position, p2.position] });
            var pl2 = new google.maps.Polyline({ path: [p2.position, p3.position] });
            var pl3 = new google.maps.Polyline({ path: [p1.position, p3.position] });

            var rl = google.maps.geometry.spherical.computeLength(pl1.getPath()) + google.maps.geometry.spherical.computeLength(pl2.getPath());
            var sl = google.maps.geometry.spherical.computeLength(pl3.getPath());

            console.log('i = ' + i + ' / rl = ' + rl + ' / sl = ' + sl);

            if (rl > (sl * f_times)) {
                var nlat = (p1.position.lat + p3.position.lat) / 2.0;
                var nlon = (p1.position.lng + p3.position.lng) / 2.0;
                p2.set_position(new google.maps.LatLng(nlat, nlon));
                console.log('filter outliared position from index ' + (i + 1) + ' to ' + nlat + ',' + nlon);
            }
        }

    }
    
}

function PRMapDrawer(div, lat, lon, level) {

    // function dms to num
    this.dms_to_num = function(dms) {
        var num = dms[0].numerator + dms[1].numerator / (60 * dms[1].denominator) + dms[2].numerator / (3600 * dms[2].denominator);
        return num;
    }

    this.exif_date_to_js_date = function(time) {
        var dt = time.split(' ');
        var dp = dt[0].split(':');
        var tp = dt[1].split(':');

        return new Date(parseInt(dp[0]), parseInt(dp[1]), parseInt(dp[2]), parseInt(tp[0]), parseInt(tp[1]), parseInt(tp[2]));
    }

    this.timespan_string_hms = function(ts) {
        var tsi = Math.floor(ts);
        var h = Math.floor(tsi / 3600000);
        if (h > 0) tsi -= h * 3600000;
        var m = Math.floor(tsi / 60000);
        if (m > 0) tsi -= m * 60000;
        var s = Math.floor(tsi / 1000);
        var str = '';
        if (h > 0) str += h + 'H ';
        if (m > 0) str += m + 'M ';
        str += s + 'S';
        return str;
    }

    // map div object
    this.map_div = div;
    var def_map_options = {};
    if (lat && lon)
        def_map_options['center'] = new google.maps.LatLng(lat, lon);
    if (level)
        def_map_options['zoom'] = level;

    // create daum map object
    this.map = new google.maps.Map(this.map_div, def_map_options); //지도 생성 및 객체 리턴

    // create pr obj list
    this.pr_objs = new PRObjList(this);

    // current route map polyline
    this.cur_route = new google.maps.Polyline({
        map: this.map,
        path: this.pr_objs.getRoutePath(), // 선을 구성하는 좌표배열 입니다
        strokeWeight: 2, // 선의 두께 입니다
        strokeColor: '#FFAE00', // 선의 색깔입니다
        strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
        strokeStyle: 'solid' // 선의 스타일입니다
    });

    this.mapRefresh = function() {
        this.cur_route.setPath(this.pr_objs.getRoutePath());
        this.cur_route.setMap(this.map);
    }

    this.addPhotoRoute = function(exif_time, url, latDMS, lonDMS) {

        if (exif_time && latDMS && lonDMS) {
            this.pr_objs.add(this.exif_date_to_js_date(exif_time), url, this.dms_to_num(latDMS), this.dms_to_num(lonDMS));
        }
        else {
            alert('invalid photo exif - time or lat/lon');
        }

        this.mapRefresh();
    }

    this.mapPanTo = function(latDMS, lonDMS) {
        this.map.panTo(new daum.maps.LatLng(this.dms_to_num(latDMS), this.dms_to_num(lonDMS)));
    }

    this.getRouteDistance = function() {
        return google.maps.geometry.spherical.computeLength(this.cur_route.getPath());
    }

    this.getRouteTimeSpan = function() {
        return this.pr_objs.getTimeSpan();
    }

    this.getRouteInfoHTML = function() {
        var html = '';
        html += 'Total Distance = ' + this.getRouteDistance() + ' M';
        html += '<br />';
        var ts = this.getRouteTimeSpan();
        html += 'Totle Time Span = ' + this.timespan_string_hms(ts);

        return html;
    }

    this.setRouteBounds = function() {
        this.pr_objs.setRouteBounds();
    }

    this.filterRoute = function() {
        this.pr_objs.filterRoutePos(10);
        this.mapRefresh();
    }
    
    // map event handlers - click
    //daum.maps.event.addListener(map, 'click', function(mouseEvent) {
    //    var latlng = mouseEvent.latLng;
    //    add_route(latlng);
    //});


    var drag_obj = null;
    this.startDragMarker = function (obj) {
        drag_obj = obj;
    }
    
    this.endDragMarker = function (obj) {
        if (drag_obj) {
            obj.update_marker_pos();
        }
    }
}
