var nowtime = dayjs.dayjs().format("YYYY-MM-DD HH:mm:00");
// var nowtime = "2023-02-18 19:30:00" ;
var endtime = dayjs.dayjs().add(30, 'minute').format("YYYY-MM-DD HH:mm:00");
// var endtime = "2023-02-18 19:59:00" ;
Logger.log(nowtime + " ~ " + endtime)

var ss = SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('spreadSheetId'));

function fetchSchedule() {
  let response = UrlFetchApp.fetch("https://www.nijisanji.jp/streams").getContentText("utf-8");
  let parseRaw = Parser.data(response).from('<script id="__NEXT_DATA__" type="application/json">').to('</script>').iterate();
  let parse = JSON.parse(parseRaw)
  return parse
}

function saveSchedule() {
  const object = fetchSchedule();
  var amount = Object.keys(object["props"]["pageProps"]["streams"]).length; 
  var streams = object["props"]["pageProps"]["streams"];
  for (var i = 0; i < amount; i++) {
    Logger.log("")
    var title = streams[i]["title"];
    var yt_url = streams[i]["url"]
    var yt_bc_start = streams[i]["start-at"]
    var yt_bc_thumburl = streams[i]["thumbnail-url"]
    var yt_bc_liver0 = streams[i]["youtube-channel"]["name"]
    var yt_bc_description = streams[i]["description"]

    Logger.log(title, yt_url)

    var sheet = ss.getSheetByName(2434);

    var formattedtime_fromcell_rownumber_int = i
    var formattedtime_fromcell_rownumber = formattedtime_fromcell_rownumber_int + 2;
    var formattedtime_fromcell = "C" + formattedtime_fromcell_rownumber;

    var formattedtime = "=DATEVALUE(MID(" + formattedtime_fromcell + ",1,10)) + TIMEVALUE(MID(" + formattedtime_fromcell + ",12,8))"
    var formattedtag1 = "=VLOOKUP(E" + formattedtime_fromcell_rownumber + ",bctag!$A$1:$C$150,2,FALSE)"
    var formattedtag2 = "=VLOOKUP(E" + formattedtime_fromcell_rownumber + ",bctag!$A$1:$C$150,3,FALSE)"
    sheet.appendRow([title, yt_url, yt_bc_start, yt_bc_thumburl, yt_bc_liver0, formattedtime, formattedtag1, formattedtag2]);

    var title = "";
    var yt_url = "";
    var yt_bc_start = "";
    var yt_bc_thumburl = "";
    var yt_bc_liver0 = "";
    var formattedtime = "";
    var formattedtag1 = "";
    var formattedtag2 = "";
  }
}

function setQuery() {
  var sheet = ss.getSheetByName('query'); //　シートを取得
  sheet.insertRows(1, 2)
  var query_reset_row_amount = sheet.getMaxRows()
  sheet.deleteRows(2, query_reset_row_amount - 1);
  var a1 = sheet.getRange("A1"); //　使っていないセルを取得
  var query_where = "=QUERY('2434'!A1:H500, \"select * where F >= datetime \'" + nowtime + "\' and F <= datetime \'" + endtime + "\'\",-1)";
  a1.setFormula(query_where); //　関数を設定して演算
}

function createNote() {
  var sheet = ss.getSheetByName('query'); //　シートを取得
  var data = sheet.getDataRange().getValues();
  Logger.log(data);

  console.log(Object.keys(data).length); //項目数取得
  var amount = Object.keys(data).length; //項目数代入

  if (amount == 1) {
    Logger.log("Broadcast is none")
    return i
  }

  for (var i = 1; i < amount; i++) {
    var smon = data[i][2].substr(5, 2) + "月";
    var sday = data[i][2].substr(8, 2) + "日";
    var time = data[i][2].substr(11, 2) + ":" + data[i][2].substr(14, 2);
    var title = "『" + data[i][0] + "』";
    var liver = "ライバー ; " + data[i][4] + " 他";
    if (data[i][7] != '#N/A'){
      var livershort = "#" + data[i][7]
    } else {
      var livershort = ""
    }
    if (data[i][6] != '#N/A'){
      var hashtag = data[i][6];
    } else {
      var hashtag = ''
    }
    var url = data[i][1];

    var thumbnailUrl = data[i][3];
    var contents = `【#にじさんじ / ${sday}${time}〜】\n\n${title}\n\n${liver}\n\n${url}\n\n${livershort} ${hashtag}`;
    var imageid = saveImage(thumbnailUrl, title)
    Logger.log(postData(contents, imageid))
  }
}

function postData(content, imageid) {
  var url = 'https://misskey.io/api/notes/create';  
  var payload = {
    "i" : PropertiesService.getScriptProperties().getProperty('misskeyApi'),
    "text": content,
    "visibility": "public",
    "fileIds": [imageid]
  };  
  var options = {
    "method" : "POST",
    "payload" : JSON.stringify(payload),
    "contentType": "application/json",
  };
  var response = UrlFetchApp.fetch(url, options);
  return response
}

function saveImage(imageurl, comment) {
  try {
    var url = 'https://misskey.io/api/drive/files/upload-from-url'
    var payload = {
      "i" : PropertiesService.getScriptProperties().getProperty('misskeyApi'),  
      "url": imageurl,
      "comment" : comment,
      "marker": comment,
      "force": true
    }
    var options = {
      "method" : "POST",
      "payload" : JSON.stringify(payload),
      "contentType": "application/json",
      "muteHttpExceptions" : true,
    };
      var response = UrlFetchApp.fetch(url, options);
  } catch (e) {
    Logger.log(e)
  }
  Utilities.sleep(3000)
  var id = searchImage()
  return id 
}

function searchImage() {
  try {
  var url = 'https://misskey.io/api/drive/stream'
    var payload = {
      "i" : PropertiesService.getScriptProperties().getProperty('misskeyApi'),
      "limit": 1
    }
    var options = {
    "method" : "POST",
    "payload" : JSON.stringify(payload),
    "contentType": "application/json",
    "muteHttpExceptions" : true,
    };
      var response = UrlFetchApp.fetch(url, options);
  } catch (e) {
      Logger.log(e)
  }
  array = JSON.parse(response)
  return array[0]["id"]
}

function resetSpreadSheet() {
  var sheet = ss.getSheets()[0];
  sheet.appendRow([0]);
  sheet.appendRow([1]);
  // そのシートの行数を取得しログに出力
  Logger.log(sheet.getMaxRows());
  var row_amount = sheet.getMaxRows()
  // シートのリセット
  sheet.deleteRows(2, row_amount - 1);
}

function debug() {
  Logger.log(searchImage())
}

function misskeyNiji() {
  setQuery()
  Utilities.sleep(5000)
  createNote()
}

function updateNiji(){
  resetSpreadSheet()
  saveSchedule()
}
