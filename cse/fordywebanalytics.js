var xmlhttp = new XMLHttpRequest();
     xmlhttp.onreadystatechange = function() {
        //if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
           // console.log(xmlhttp);
        //}
    }
    xmlhttp.open("GET", "http://54.214.207.163:8000?sourceAddress=" + window.location.href + "&userAgent=" + window.navigator.userAgent, true);
   // xmlhttp.open("GET", "http://54.214.207.163:8000?sourceAddress=localhost", true);
    xmlhttp.send();
