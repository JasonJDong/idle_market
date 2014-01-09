angular.module('datetimeFilters', []).
	filter('datetimeFormat', function() {
  		return function(datetime) {
        var formatDate = function(oDate, fmt_str, is_24) {
            fmt_str = fmt_str.replace("YYYY", oDate.getFullYear());
            fmt_str = fmt_str.replace("YY", String(oDate.getFullYear()).substr(2))
            var month = oDate.getMonth() + 1;
            fmt_str = fmt_str.replace("MM", month.toString().length == 1 ? "0" + month : month); 
            fmt_str = fmt_str.replace("DD", oDate.getDate().toString().length == 1 ? "0"+ oDate.getDate(): oDate.getDate());
            if (is_24) {
              fmt_str = fmt_str.replace("hh", oDate.getHours());
            }else{
              var hour = oDate.getHours();
              var hours_12 = hour % 12
              hours_12 = hours_12 != 0 ? hours_12 : 12 
              fmt_str = fmt_str.replace("hh", hours_12.toString().length == 1 ? "0"+ hours_12: hours_12)
              fmt_str += hour >= 12 ? " PM" : " AM";
            }
            fmt_str = fmt_str.replace("mm", oDate.getMinutes().toString().length == 1 ? "0"+ oDate.getMinutes(): oDate.getMinutes());
            fmt_str = fmt_str.replace("ss", oDate.getSeconds().toString().length == 1 ? "0"+ oDate.getSeconds(): oDate.getSeconds());
            return fmt_str;
        }

        var date = new Date(datetime);
        return formatDate(date, 'YYYY-MM-DD hh:mm:ss', true);
   		}
   	});