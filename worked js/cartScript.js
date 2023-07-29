if (typeof $ != 'undefined') {

}else{  
(function () {
    function loadScript(url, callback) {
        var script = document.createElement("script")
        script.type = "text/javascript";
        if (script.readyState) { //IE
            script.onreadystatechange = function () {
                if (script.readyState == "loaded" || script.readyState == "complete") {
                    script.onreadystatechange = null;
                    callback();
                }
            };
        } else { //Others
            script.onload = function () {
                callback();
            };
        }
        script.src = url;
        document.getElementsByTagName("head")[0].appendChild(script);
    }
    loadScript("https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function () {
        jQuery('.section__content .section__content__column:nth-child(1)').append("<address class='address'><div>Delivery Day: "+getCookie('delivery_day')+"</div><div>Delivery Time: "+getCookie('delivery_time')+"</div><div>Location: "+getCookie('location')+"</div><div>Additional Info: "+getCookie('additional_info')+"</div></address>");
    });
    })();
}

$(document).ready(function () {
  
  if (window.location.pathname == '/cart') {
    var attributes = ' <div class="form-group appcartform"> <h3 style="text-align: center;" id="delivery-note"></h3> <p class="cart-attribute__field radio-block"> <label>Select Method of Delivery</label> <br> <input type="radio" name="attributes[Select Method]" value="Delivery" class="method-delivery" required="required"> <span class="method-delivery">Delivery</span> <br class="method-delivery"> <input type="radio" name="attributes[Select Method]" value="Pickup" class="method-pickup" required="required"> <span class="method-pickup">Pickup</span> <br class="method-pickup"> </p> <p class="cart-attribute__field"> <label for="delivery-day" style="display:block;">Select Day</label> <input class="datepicker form-control" id="delivery-day" type="text" name="attributes[Delivery/Shipping Day]" required="required"> </p> <p class="cart-attribute__field timepicker-block"> <label for="delivery-time" style="display:block;">Select Time (Preferred)</label> <select id="delivery-time" name="attributes[Delivery/Shipping Time]" class="form-control timepicker" required="required"> </select> </p> <p class="cart-attribute__field location-block"> <label for="location">Location</label> <select id="location" name="attributes[Location]" class="form-control" required > </select> </p> <p class="cart-attribute__field"> <label for="additional-info">Additional Info</label> <textarea id="additional-info" name="attributes[Additional Info]" class="form-control" /> </p> </div> ';
    
//    var scripts = '<script src="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/picker.js"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/themes/default.css"> <script src="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/picker.date.js"></script><script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.0/moment.min.js"></script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/themes/default.date.css"> <link rel="stylesheet" href="https://app.smartconnext.com/public/css/style.css">';
    var scripts = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/themes/default.css"> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/pickadate.js/3.5.6/compressed/themes/default.date.css"> <link rel="stylesheet" href="https://app.smartconnext.com/public/css/style.css">';

    var checkit = $('#laststepCartForm').length;
    if(checkit > 0) {
      $("#laststepCartForm").append(attributes);
      $(".appcartform").append(scripts);
    } else {
      $("form[action='/cart']").after(attributes);
      $(".appcartform").after(scripts);
    }

    setTimeout(function() {
      $('#delivery-day').val(getCookie('delivery_day'));
      $("#delivery-time").val(getCookie("delivery_time")).change();
      $("#location").val(getCookie("location")).change();
      $('#additional-info').val(getCookie('additional_info'));
    }, 2000);



    $("form").removeAttr('novalidate');

    $.ajax({
      method: "GET",
      url: "https://app.smartconnext.com/cart-rules/feed?shop=" + window.Shopify.Checkout.apiHost,
      success: function (response) {
        $('.datepicker,.timepicker').attr('required','required');
        $('#delivery-note').append(response.delivery_note);
        if(response.delivery_service == "Delivery") {
          $('.radio-block input.method-delivery').prop('checked', true);
          $('.radio-block input.method-pickup').prop('checked', false);
          $('.radio-block').hide();
          $('.appcartform').prepend("<p class='cart-attribute__field'><label>Select Day and Time for Delivery</label></p>");
        } else if (response.delivery_service == "Pickup") {
          $('.radio-block input.method-delivery').prop('checked', false);
          $('.radio-block input.method-pickup').prop('checked', true);
          $('.radio-block').hide();
          $('.appcartform').prepend("<p class='cart-attribute__field'><label>Select Day and Time for Pickup</label></p>");
        } else {
          $('.method-pickup,.method-delivery').attr('required','required');
        }
        shippingMethod(response.delivery_service);
      }
    });

    // Check which Delivery Method is selected
    $(".radio-block input[type='radio']").on('click', function () {
      var clickedValue = $(this).val();
      shippingMethod(clickedValue);
    });

    function shippingMethod(method) {
      $('.timepicker-block').show();
      $('#delivery-day').val("");
      if (method == "Delivery") {
        $('.location-block').show();
        timeslots('delivery');
        sessionStorage.setItem('method','delivery');
      } else if(method == "Pickup") {
        $('.location-block').hide();
        timeslots('all');
        sessionStorage.setItem('method','pickup');
        
        // Set the default value to be -1
        $(".timepicker").val('-1');
      } else {
        $('.radio-block').show();
      }
    }
    
    // Set Blackout Days in the Datepicker
    $.ajax({
      method: "GET",
      url: "https://app.smartconnext.com/blackout-days/feed?shop=" + window.Shopify.Checkout.apiHost,
      success: function (response) {
        var dateset = [];

        response.forEach(function (element) {
          var fulldate = element.start;
          var splitdate = fulldate.split("-");
          splitdate[1] = parseInt(splitdate[1]) - 1;
          dateset.push(splitdate);
        });

        $.ajax({
          method: "GET",
          url: "https://app.smartconnext.com/offset-days/feed?shop=" + window.Shopify.Checkout.apiHost,
          success: function (response) {
            // Set Offset

            if (response > 0) {
              var currentDate = moment().format('YYYY,M,D');
              var offsetDate = moment().add(response - 1, "days").format('YYYY,M,D');
              
              dateset.push({
                from: new Date(currentDate),
                to: new Date(offsetDate)
              });
            }
            console.log(dateset);
            $(".datepicker").pickadate({
              format: 'yyyy-mm-dd',
              disable: dateset,
              min: true,
              onClose: function () {
                var check = sessionStorage.getItem('method');
                if(check == 'pickup') {
                  timeslots(this.component.item.select.day);
                }
              }
            });            
            setTimeout(function (){
              $(".datepicker").removeAttr('readonly');
            },1000);
          }
        });
      }
    });

    $('.cart__continue').click(function(event){
      event.preventDefault();
      var delivery_day = $('#delivery-day').val();
      setCookie('delivery_day', delivery_day, 5);
      var delivery_time = $('#delivery-time').val();
      setCookie('delivery_time', delivery_time, 5);
      var location = $('#location').val();
      setCookie('location', location, 5);
      var additional_info = $('#additional-info').val();
      setCookie('additional_info', additional_info, 5);
      window.location.replace("/collections/all");
    });

    $('.cart__submit').hover(function(event){
      var delivery_day = $('#delivery-day').val();
      setCookie('delivery_day', delivery_day, 5);
      var delivery_time = $('#delivery-time').val();
      setCookie('delivery_time', delivery_time, 5);
      var location = $('#location').val();
      setCookie('location', location, 5);
      var additional_info = $('#additional-info').val();
      setCookie('additional_info', additional_info, 5);
      console.log("<address class='address'><div>Delivery Day: "+getCookie('delivery_day')+"</div><div>Delivery Time: "+getCookie('delivery_time')+"</div><div>Location: "+getCookie('location')+"</div><div>Additional Info: "+getCookie('additional_info')+"</div></address>");
    });

    function timeslots(day) {
      $(".timepicker").html('');
      if (day == "delivery") {
//        $(".timepicker").append('<option type="" disabled > Select a Time for Delivery </option>');
//        $("#location").append('<option type="" disabled> Select a Location for Delivery </option>');
        $.ajax({
          method: "GET",
          url: "https://app.smartconnext.com/cart-rules/feed?shop=" + window.Shopify.Checkout.apiHost,
          success: function (response) {
            var periods = response.delivery_periods.split(",");
            periods.forEach(function (element){
              $(".timepicker").append('<option value="'+ $.trim(element) +'">'+ element +'</option>');
            });
            var locations = response.delivery_locations.split(",");
            locations.forEach(function (element){
              $("#location").append('<option value="'+ $.trim(element) +'">'+ element +'</option>');
            });
            
            // Set the default value to be -1
            $(".timepicker").val('-1');
            $("#location").val('-1').prop('required', true);
          }
        });
      } else {
        $.ajax({
          method: "GET",
          url: "//app.smartconnext.com/time-slots/feed?shop=" + window.Shopify.Checkout.apiHost + "&day=" + day,
          success: function (response) {
            var timedata = JSON.parse(response);
            var timeset = [];
            if (day == 'all') {
              $(".timepicker").append('<option type=""> Select a Time for Delivery </option> <optgroup label="Sunday" class="sunday"> </optgroup> <optgroup label="Monday" class="monday"> </optgroup> <optgroup label="Tuesday" class="tuesday"> </optgroup> <optgroup label="Wednesday" class="wednesday"> </optgroup> <optgroup label="Thurday" class="thursday"> </optgroup> <optgroup label="Friday" class="friday"> </optgroup> <optgroup label="Saturday" class="saturday"> </optgroup>');
              timedata.forEach(function (element) {
                if (element.day == 0) {
                  $(".timepicker .sunday").append("<option type='Sunday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 1) {
                  $(".timepicker .monday").append("<option type='Monday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 2) {
                  $(".timepicker .tuesday").append("<option type='Tuesday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 3) {
                  $(".timepicker .wednesday").append("<option type='Wednesday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 4) {
                  $(".timepicker .thursday").append("<option type='Thursday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 5) {
                  $(".timepicker .friday").append("<option type='Friday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 6) {
                  $(".timepicker .saturday").append("<option type='Saturday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                }
              });
            } else {
              $(".timepicker").append('<option type=""> Select a Time for Delivery </option>');
              timedata.forEach(function (element) {
                if (element.day == 0) {
                  $(".timepicker").append("<option type='Sunday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 1) {
                  $(".timepicker").append("<option type='Monday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 2) {
                  $(".timepicker").append("<option type='Tuesday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 3) {
                  $(".timepicker").append("<option type='Wednesday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 4) {
                  $(".timepicker").append("<option type='Thursday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 5) {
                  $(".timepicker").append("<option type='Friday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                } else if (element.day == 6) {
                  $(".timepicker").append("<option type='Saturday: " + element.hour + ".00'> " + element.hour + ".00 </option>");
                }
              });
            }
            
            // Set the default value to be -1
            $(".timepicker").val('-1');
            $("#location").val('-1').prop('required', false);            
          }
        });
      }
    }
  }
});


    function setCookie(cname, cvalue, exmin) {
      var d = new Date();
      d.setTime(d.getTime() + (exmin * 60 * 60 * 1000));
      var expires = "expires="+d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(';');
      for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
          c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
          return c.substring(name.length, c.length);
        }
      }
      return "";
    }
