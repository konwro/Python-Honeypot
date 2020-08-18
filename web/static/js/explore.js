/**
 * Load list of modules in a select list
 */
function load_module_options() {
  $.ajax({
    type: "GET",
    url: "/api/core/list/modules",
    data: {},
  }).done(function (res) {
    var tableHtml = '<option value=\"\"> All Modules </option>';
    for (var i = 0; i < res.length; i++) {
      var module_name = res[i];
      tableHtml += "<option value=" +
        module_name + ">"
        + module_name
        + "</option>";
    }
    $('#module_names').html(tableHtml);
  }).fail(function (jqXHR, textStatus, errorThrown) {
    document.getElementById('error_msg').innerHTML = jqXHR.responseText;
    if (errorThrown == "BAD REQUEST") {
    }
    if (errorThrown == "UNAUTHORIZED") {
    }
  });
}


// Get the file name of the export file
function get_export_fileName(file_type) {
  var d = new Date();
  var n = d.getTime();
  return 'Honeypot-data-' + file_type + '-' + n;
}


/**
 * Taken from https://storiknow.com/download-file-with-jquery-and-web-api-2-0-ihttpactionresult/
 * @param {*} xhr 
 * @param {*} blob 
 */
function download(xhr, blob) {
  var downloadLink = document.createElement('a');
  
  var url = window.URL || window.webkitURL;
  var downloadUrl = url.createObjectURL(blob);
  var fileName = '';
 
  // get the file name from the content disposition
  var disposition = xhr.getResponseHeader('Content-Disposition');
  if (disposition && disposition.indexOf('attachment') !== -1) {
      var filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
      var matches = filenameRegex.exec(disposition);
      if (matches != null && matches[1]) {
          fileName = matches[1].replace(/['"]/g, '');
      }
  }
  // Blob download logic taken from: https://stackoverflow.com/questions/16086162/handle-file-download-from-ajax-post
  if (typeof window.navigator.msSaveBlob !== 'undefined') {
    // IE workaround for "HTML7007" and "Access Denied" error.
    window.navigator.msSaveBlob(blob, fileName);
  } else {
      if (fileName) {
          if (typeof downloadLink.download === 'undefined') {
              window.location = downloadUrl;
          } else {
              downloadLink.href = downloadUrl;
              downloadLink.download = fileName;
              document.body.appendChild(downloadLink);
              downloadLink.click();
          }
      } else {
          window.location = downloadUrl;
      }

      setTimeout(function () {
            url.revokeObjectURL(downloadUrl);
        },
        100
      );
  }
}


/**
 * Call the API to get event data from the database
 * @param {*} api_endpoint : API endpoint URL
 * @param {*} column_list : List of Columns for the selected event type
 * @param {*} api_params  : GET parameters for the API call
 */
function call_events_api_endpoint(api_endpoint, column_list, api_params) {
  $(document).ready(function () {
    var table = $(api_params.datatable_id).dataTable({
      ajax: {
        type: "GET",
        url: api_endpoint,
        contentType: 'application/json; charset=utf-8',
        data: api_params,
        dataType: "json",
        dataSrc: ""
      },
      autoWidth: true,
      dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-2'B><'col-sm-12 col-md-4'i><'col-sm-12 col-md-6'p>>",
      buttons: [
        {
          extend: 'csv',
          filename: function () { return get_export_fileName('csv'); },
          className: "btn btn-info btn-sm"
        },
        {
          extend: 'excel',
          filename: function () { return get_export_fileName('excel'); },
          className: "btn btn-info btn-sm"
        }
      ],
      columns: column_list,
      destroy: true,
      order: [[0, 'desc']],
      sort: true,
      info: true,
      paging: true,
      oLanguage: {
        sStripClasses: "",
        sSearch: "",
        sSearchPlaceholder: "Search filter...",
        sInfo: "_START_ -_END_ of _TOTAL_",
        sLengthMenu: '<span>Rows per page:</span><select class="browser-default">' +
          '<option value="10">10</option>' +
          '<option value="20">20</option>' +
          '<option value="30">30</option>' +
          '<option value="40">40</option>' +
          '<option value="50">50</option>' +
          '<option value="-1">All</option>' +
          '</select></div>'
      },
      searching: true,
      responsive: true
    });
  });
}


/**
 * Call the API to get the list of Files stored in the database.
 * @param {*} api_endpoint 
 * @param {*} column_list 
 * @param {*} column_defs 
 * @param {*} api_params 
 */
function call_file_archive_api_endpoint(api_endpoint, column_list, api_params) {

  $(document).ready(function () {
    var table = $(api_params.datatable_id).DataTable({
      ajax: {
        type: "GET",
        url: api_endpoint,
        contentType: 'application/json; charset=utf-8',
        data: api_params,
        dataType: "json",
        dataSrc: ""
      },
      autoWidth: true,
      dom: "<'row'<'col-sm-12 col-md-6'l><'col-sm-12 col-md-6'f>>" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-6'i><'col-sm-12 col-md-6'p>>",
      columns: column_list,
      columnDefs: [
        {
          targets: [0],
          searchable: false,
          orderable: false,
          className : 'select-checkbox',
          checkboxes: {
            selectRow: true,
            stateSave: false
          }
       },
      ],
      retrieve : true,
      select: {
        style: 'single'
      },
      destroy: true,
      order: [[1, 'desc']],
      sort: true,
      info: true,
      paging: true,
      oLanguage: {
        sStripClasses: "",
        sSearch: "",
        sSearchPlaceholder: "Search filter...",
        sInfo: "_START_ -_END_ of _TOTAL_",
        sLengthMenu: '<span>Rows per page:</span><select class="browser-default">' +
          '<option value="10">10</option>' +
          '<option value="20">20</option>' +
          '<option value="30">30</option>' +
          '<option value="40">40</option>' +
          '<option value="50">50</option>' +
          '<option value="-1">All</option>' +
          '</select></div>'
      },
      searching: true,
      responsive: true
    });
    // Make the download button visible.
    document.getElementById("download-file-btn").hidden = false;
    
    // On click function for the download button
    $("#download-file-btn").on('click', function(e){
      var selected_row_data =  table.rows({ selected: true }).data();
      api_params = {
        "md5": selected_row_data[0]["md5"]
      }

      // Call the download-file API endpoint with the file ID
      $.ajax({
        type: "GET",
        url: "/api/pcap/download",
        data: api_params,
        xhrFields:{
          responseType: "arraybuffer"
        },
        success: function(result,status,xhr){
          var blob = new Blob([result],
            {
              type: xhr.getResponseHeader('Content-Type')
            });
          download(xhr, blob);
        },
        error: function (jqXHR, textStatus, errorThrown) {
          if (errorThrown == "BAD REQUEST") {
            alert(jqXHR.responseText)
          }
          if (errorThrown == "UNAUTHORIZED") {
            alert(jqXHR.responseText)
          }
        }
      });
    });
  });
}


/**
 * Load data to the table based on user selected filters.
 * @param {*} event_type 
 * @param {*} module_name 
 * @param {*} start_date 
 * @param {*} end_date 
 */
function load_data(api_endpoint, search_parameters) {
  if ($.fn.dataTable.isDataTable(search_parameters.datatable_id)) {
    $(search_parameters.datatable_id).DataTable().clear().destroy();
    $(search_parameters.datatable_id).empty();
  }
  var columns = [];
  var limit = 1000;
  console.log(api_endpoint);

  if (search_parameters.datatable_id == "#log-datatable") {
    // Define table columns based on selected event type
    if (search_parameters.event_type == "honeypot") {
      columns = [
        { data: 'date', defaultContent: '', title: "Date" },
        { data: 'ip_src', defaultContent: '', title: "Src IP" },
        { data: 'port_src', defaultContent: '', title: "Src Port" },
        { data: 'ip_dest', defaultContent: '', title: "Dest IP" },
        { data: 'port_dest', defaultContent: '', title: "Dest Port" },
        { data: 'module_name', defaultContent: '', title: "Module Name" },
        { data: 'machine_name', defaultContent: '', title: "Machine Name" },
        { data: 'country_ip_src', defaultContent: '', title: "Src Country" },
        { data: 'country_ip_dest', defaultContent: '', title: "Dest Country" }];
    }
    else if (search_parameters.event_type == "network") {
      columns = [
        { data: 'date', defaultContent: '', title: "Date" },
        { data: 'ip_src', defaultContent: '', title: "Src IP" },
        { data: 'port_src', defaultContent: '', title: "Src Port" },
        { data: 'ip_dest', defaultContent: '', title: "Dest IP" },
        { data: 'port_dest', defaultContent: '', title: "Dest Port" },
        { data: 'protocol', defaultContent: '', title: "Protocol" },
        { data: 'machine_name', defaultContent: '', title: "Machine Name" },
        { data: 'country_ip_src', defaultContent: '', title: "Src Country" },
        { data: 'country_ip_dest', defaultContent: '', title: "Dest Country" }];
    }
    else if (search_parameters.event_type == "credential") {
      columns = [
        { data: 'date', defaultContent: '', title: "Date" },
        { data: 'ip', defaultContent: '', title: "IP" },
        { data: 'module_name', defaultContent: '', title: "Module Name" },
        { data: 'username', defaultContent: '', title: "Username" },
        { data: 'password', defaultContent: '', title: "Password" },
        { data: 'machine_name', defaultContent: '', title: "Machine Name" },
        { data: 'country', defaultContent: '', title: "Country" }];
    }
    else if (search_parameters.event_type == "date") {
      columns = [
        { data: 'date', defaultContent: '', title: "Date" },
        { data: 'ip', defaultContent: '', title: "IP" },
        { data: 'module_name', defaultContent: '', title: "Module Name" },
        { data: 'data', defaultContent: '', title: "Data" },
        { data: 'machine_name', defaultContent: '', title: "Machine Name" },
        { data: 'country', defaultContent: '', title: "Country" }];
    }
    else if (search_parameters.event_type == "file") {
      columns = [
        { data: 'date', defaultContent: '', title: "Date" },
        { data: 'module_name', defaultContent: '', title: "Module Name" },
        { data: 'file_path', defaultContent: '', title: "File Path" },
        { data: 'status', defaultContent: '', title: "Status" },
        { data: 'machine_name', defaultContent: '', title: "Machine Name" },
        { data: 'is_directory', defaultContent: '', title: "Is Directory" }];
    }

    if (search_parameters.module_name == "") {
      delete search_parameters.module_name;
    }
    // Set API call parameters, delete datatable ID as it is not required in API call
    search_parameters.limit = limit;

    call_events_api_endpoint(api_endpoint, columns, search_parameters);
  }
  else if (search_parameters.datatable_id == "#file-datatable") {
    columns = [
      { data: null, defaultContent: ''},
      { data: 'date', defaultContent: '', title: "Generation Time"},
      { data: 'splitTimeout', defaultContent: '', title: "Split Timeout"},
      { data: 'filename', defaultContent: '', title: "Filename"},
      { data: 'length', defaultContent: '', title: "File Size"},
      { data: 'md5', defaultContent: '', title: "MD5"}
    ];
    search_parameters.limit = limit;

    call_file_archive_api_endpoint(api_endpoint, columns, search_parameters);
  }
}


/**
 * Function called when "search" button is clicked in the "Log explorer" display
 */
function search_database() {
  var api_endpoint = "/api/events/explore/" + $("select[name='event_type'] option:selected").val();
  var module_name = $("select[name='module_names'] option:selected").val();
  var start_date = $("#start_date").val();
  var end_date = $("#end_date").val();

  if (start_date == "" || end_date == "") {
    alert("Either Start Date or End date missing!");
  }
  else {
    if (start_date <= end_date) {
      load_data(
        api_endpoint,
        {
          datatable_id: "#log-datatable",
          event_type: event_type,
          module_name: module_name,
          date: start_date + '|' + end_date 
        }
      );
    }
    else {
      alert("Start date is greater than End date!")
    }
  }
}


/**
 * Function called when "search" button is clickec in the "File Archive" display
 */
function search_file_archive() {
  var api_endpoint = "/api/events/explore/pcap";
  var start_date = $("#archive_start_date").val();
  var end_date = $("#archive_end_date").val();
  if (start_date == ""|| end_date == "") {
    alert("Either Start Date or End date missing!");
  }
  else{
    if(start_date <= end_date){
      load_data(
        api_endpoint,
        {
          datatable_id: "#file-datatable",
          date: start_date + '|' + end_date
        }
      );
    }
    else {
      alert("Start date is greater than End date!")
    }
  }
}

/**
 * Form update based on event type selected
 */
function change_form() {
  var events_with_module = new Array(
    "honeypot",
    "credential",
    "file",
    "data"
  )
  var event_type = $("select[name='event_type'] option:selected").val();

  if (events_with_module.indexOf(event_type) > -1) {
    document.getElementById("module_names").disabled = false;
  }
  else {
    document.getElementById("module_names").selectedIndex = 0;
    document.getElementById("module_names").disabled = true;
  }

}

/**
 * Change layout based on user selection
 */
function get_layout(layout_type) {
  document.getElementById("data-plots").hidden = (layout_type=="data-plots") ? false : true;
  document.getElementById("log-explorer-form").hidden = (layout_type=="log-explorer") ? false : true;
  document.getElementById("log-explorer-table").hidden = (layout_type=="log-explorer") ? false : true;
  document.getElementById("file-archive-explorer").hidden = (layout_type=="file-explorer") ? false : true;
  document.getElementById("file-archive-explorer-table").hidden = (layout_type=="file-explorer") ? false : true;
}

load_module_options();